const bookCollectionPrefix = "/domain/position/book/";
const bookCollectionMatch = bookCollectionPrefix + "*";


function get(context, params) {
  var output = {
    "books": []
  };

  var resultsArray = cts.collectionMatch(bookCollectionMatch).toArray();
  for (var i in resultsArray) {
    output.books.push(fn.substringAfter(resultsArray[i], bookCollectionPrefix));
  }

  return output;
};


exports.GET = get;
