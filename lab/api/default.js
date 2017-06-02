require("../env"); // Load configuration variables
var db = require("../db").db;
var user_collections = ['users', 'experiments', 'datasets'];
var global_collections = ['projects'];
var fs = require("fs");
//helper function for searching and formatting results
var convert_to_dict = function(array) {
    var new_array = {};
    for (var i = 0; i < array.length; i++) {
        var entry = array[i];
        var _id = entry['_id'];
        new_array[_id] = entry;
    }
    return(new_array);
}
exports.convert_to_dict = convert_to_dict;
var group_on_key = function(array,key) {
    var new_array = {};
    for (old_key in  array) {
        var entry = array[old_key];
        var _id = entry[key];
        if (new_array[_id] === undefined) {
          new_array[_id] = [];
        }
        new_array[_id].push(entry);
    }
    return(new_array);
}
exports.group_on_key = group_on_key;
var annotate_dataset = function(dataset) {
               var validation = dataset;
                var pending = 0;
                var running = 0;
                var finished = 0;
                var failed = 0;
                var best_accuracy_score = 0;
                var best_experiment_id;
                var best_experiment_name;
                if (dataset['experiments']) {
                    experiments = dataset['experiments']
                    for (var j = 0; j < experiments.length; j++) {
                        var experiment = experiments[j];
                        var _status = experiment['status'];
                        var _scores = experiment['_scores'];
                        if (_scores !== undefined && _scores['accuracy_score'] >= best_accuracy_score) {
                            best_accuracy_score = _scores['accuracy_score']
                            best_experiment_id = experiment['_id']
                            best_experiment_name = experiment['algorithm']['name']
                        }

                        if (_status == 'pending') {
                            pending += 1;
                        } else if (_status == 'running') {
                            running += 1;
                        } else {
                            finished += 1;
                            if (_status == 'failed') {
                                failed += 1;
                            }
                        }
                    }
                }
                if (!("ai" in dataset) || (validation['ai'] == null)) {
                    validation['ai'] = false;
                } else {
                   if (validation['ai'] == 'finished');
                    validation['ai'] = true;
                }

                validation['has_metadata'] = true;
                validation['experiments'] = {
                    pending: pending,
                    running: running,
                    finished: finished
                }
                validation['best_result'] = undefined;
                if (best_experiment_id) {
                    validation['best_result'] = {}
                    validation['best_result']['_id'] = best_experiment_id;
                    validation['best_result']['algorithm'] = best_experiment_name;
                    validation['best_result']['accuracy_score'] = best_accuracy_score;
                }
                validation['notifications'] = {
                    new: 0,
                    error: failed
                }

return(validation);
}
exports.annotate_dataset = annotate_dataset







exports.responder = function(req, res) {
    if (fs.existsSync('api/' + req.params.apipath + ".js")) {
        return(require("./" + req.params.apipath).responder(req,res));
    } else {
    return(responder(req, res));
    }
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
    for (param in params.match) {
      var val = params.match[param]
      query[param] = val;
    }

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
    params['match'] = {}
    //
    if (req.body !== undefined) {
        for (param in req.body) {
         var val = req.body[param];
         if(param =='date_start') {
          if (!isNaN(parseFloat(val) && isFinite(val))) {
            date_start = val
          }
         }
         if(param =='ai') {
           params['match']['ai'] = val;
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
