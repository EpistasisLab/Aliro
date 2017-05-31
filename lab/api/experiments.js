require("../env"); // Load configuration variables
var db = require("../db").db;
//return a list of datasets for each user
exports.responder = function(user,req,res) {
  username = user['username'];
  collection = req.params.apipath;
  query = {};
  if(username != 'pmlb') {
    query['username'] =  username;
  }
  if(req.params.id) {
    query['_id'] = db.ObjectID(req.params.id);
  }
console.log(collection);
  res.set('Content-Type', 'application/json');
  res.write('[');
  var prevChunk = null;
  db.collection(collection).find(query)
  .on('data', function onData(data) {
    if (prevChunk) {
      res.write(JSON.stringify(prevChunk) + ',');
    }
    prevChunk = data;
  })
  .on('end', function onEnd() {
    if (prevChunk) {
      res.write(JSON.stringify(prevChunk));
    }
    res.end(']');
  });

}
