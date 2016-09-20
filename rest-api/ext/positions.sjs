
function get(context, params) {
  // Validate inputs.
  var book = getParameter("book", true);

  var output = {
    "book": book,
    "positions": []
  };

  var resultsArray = performSearch(book);
  for (var i in resultsArray) {
    var result = resultsArray[i];
    var summary = {"date":result.root.date,"position":result.root.position.cash};
    output.positions.push(summary);
  }

  context.outputTypes = ["application/json"];
  return output;
};

function performSearch(book) {
  var results = cts.search(
    cts.andQuery([
      cts.collectionQuery(["/type/position"]),
      cts.jsonPropertyValueQuery(
          "book",
          book)
       ]),
      cts.indexOrder(cts.elementReference(fn.QName("","date")))
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
 */
exports.GET = get;
