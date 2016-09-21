
function get(context, params) {
  // Validate inputs. Return error if book null
  var book = getParameter("book", true);
  var validEnd = getParameter("validEnd", false);
  if (!validEnd) {
    validEnd = "9999-12-31T11:59:59Z";
  }
  var systemEnd = getParameter("systemEnd", false);
  if (!systemEnd) {
    systemEnd = "9999-12-31T11:59:59Z";
  }

  var output = {
    "id": book,
    "positions": []
  };

  var resultsArray = performSearch(book, validEnd, systemEnd);
  if (resultsArray.length>0) {
    //take first result
    var result = resultsArray[0];
    output.name = result.root.name;
    output.positions = result.root.positions;
  }

  context.outputTypes = ["application/json"];
  return output;
};

function performSearch(book, validEnd, systemEnd) {
  var results = cts.search(
    cts.andQuery([
      cts.collectionQuery(["/domain/position/" + book]),
       cts.periodRangeQuery(
          "valid",
          "ISO_OVERLAPS",
          cts.period(xs.dateTime("1970-01-01T00:00:00Z"),
                     xs.dateTime(validEnd)))
       ,
       cts.periodRangeQuery(
          "system",
          "ISO_OVERLAPS",
          cts.period(xs.dateTime("1970-01-01T00:00:00Z"),
                     xs.dateTime(systemEnd)))
       ]),
       [cts.indexOrder(cts.elementReference(fn.QName("","systemStart")),  "descending"),
       cts.indexOrder(cts.elementReference(fn.QName("","validStart")),  "descending")]
      );
  return results.toArray();
}

function getParameter(parameterName, isFailifNotFound) {
    var parmaterValue = params[parameterName];
    if (!parmaterValue && isFailifNotFound) {
      var results = [];
      for (var pname in params) {
        if (params.hasOwnProperty(pname)) {
            results.push({name: pname, value: params[pname]});
        }
      }
      returnErrToClient(400, "Bad Request",
         "Parameter "+ parameterName + " not specified. Received Parameters: " + xdmp.toJsonString(params));
    }
    return parmaterValue;
}

function returnErrToClient(statusCode, statusMsg, body)
{
  fn.error(null, "RESTAPI-SRVEXERR",
           xdmp.arrayValues([statusCode, statusMsg, body]));
};


/**
 * @param {string} book: The book to search for
 * @param {dateTime} validEnd: The valid end time
 * @param {dateTime} systemEnd: The system end time
 */
exports.GET = get;
