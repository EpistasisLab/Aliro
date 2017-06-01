require("../env"); // Load configuration variables
var db = require("../db").db;
var user_collections = ['users', 'experiments', 'datasets'];
var global_collections = ['projects'];
var fs = require("fs");

exports.responder = function(req, res) {
    if (fs.existsSync('api/' + req.params.apipath + ".js")) {
        responder = require("./" + req.params.apipath).responder;
    }
    return (responder(req, res));
}

//return a list of datasets for each user
var responder = function(req, res) {
    var params = retParams(req);
    var query = {};
    if (params['filter_on_user']) {
        query['username'] = params['username'];
    }
    if (params['id']) {
        query['_id'] = db.ObjectID(params['id']);
    }
    if (params['date_start']) {
        query['_finished'] = {"$gte": new Date(params['date_start'])}
    }
    db.collection(params['collection']).find(query).toArrayAsync()
        .then((results) => {

             res.set('Content-Type', 'application/json');
  res.write('[');
  var prevChunk = null;
  db.collection(params['collection']).find(query)
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





        })
        .catch((err) => {
            console.log(err);
        });

}
//format the request into a dict
var retParams = function(req) {
    //
    var params = {};
    var is_global = false;
    var is_ai  = false;
    var date_start  = false;
    var filter_on_user  = true;
    var _id = false;
    var limit = false;
    //
    if (req.body !== undefined) {
        for (param in req.body) {
         if(param =='date_start') {
          var val = req.body[param];
          if (!isNaN(parseFloat(val) && isFinite(val))) {
            date_start = val
          }
         }
    }
 }
    if (req.params.user['roles'] !== undefined && req.params.user['roles'].indexOf('ai')>=0) {
        is_ai = true;
    }

    if (req.params.apipath == 'preferences') {
        var collection = 'users';
    } else {
        var collection = req.params.apipath;
    }





    if (global_collections.indexOf(collection)>=0) {
        is_global = true;
    }
    if (req.params.id) {
     _id = req.params.id;
    }
    if(is_global || is_ai) {
      filter_on_user = false;
    }
    params['collection'] = collection;
    params['username'] = req.params.user.username;
    params['is_ai'] = is_ai;
    params['is_global'] = is_global;
    params['id'] = _id;
    params['filter_on_user'] = filter_on_user;
    params['limit'] = limit;
    params['date_start'] = date_start;
    return (params);
}
exports.params = retParams;
