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
  if(req.body.finishedafter && isNaN(parseFloat(req.body.finishedafter) && isFinite(req.body.finishedafter))) {
    max_date = req.body.finishedafter * 1000
    query['_finished'] = {"$gte": new Date(max_date)}
  }
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
