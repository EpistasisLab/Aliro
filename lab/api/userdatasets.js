require("../env"); // Load configuration variables
var db = require("../db").db;
var api = require("./default");

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
//return a list of datasets for each user
exports.responder = function(req,res) {
   var params = api.params(req);
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

        db.users.aggregate(
 [
        {
         $match: query
        },
        {
            $unwind: "$algorithms"
        },
        {
            $lookup:
            {
                from: "datasets",
                localField: "username",
                foreignField: "username",
                as: "datasets"
            }
        },
        {
            $lookup:
            {
                from: "experiments",
                localField: "username",
                foreignField: "username",
                as: "experiments"
            }
        },
        {
            $lookup:
            {
                from: "projects",
                localField: "algorithms",
                foreignField: "name",
                as: "algorithms"
            }
        },
        {
            $unwind: "$algorithms"
        },
        {
            $unwind: "$datasets"
        },
        {
            $unwind: "$experiments"
        },
        {
  $group:
            {
                _id: "$_id",
                algorithms: { $addToSet: "$algorithms" },
                datasets: { $addToSet: "$datasets" },
                experiments: { $addToSet: "$experiments" },
            }
        }
    ],
function(err,users) {
retArray = []
var user = users[0];
var algorithms = convert_to_dict(user['algorithms']);
var experiments = convert_to_dict(user['experiments']);
var keyed_experiments = group_on_key(experiments,'_dataset_id');
var datasets = convert_to_dict(user['datasets']);
for (_id in experiments) {
    var experiment = experiments[_id];
    var algorithm_id = experiment['_project_id']
    var algorithm = algorithms[algorithm_id]
experiments[_id]['algorithm'] = algorithm;
}
for (_id in datasets) {
if(keyed_experiments[_id] !== undefined) {
//datasets[_id]['experiments'] = keyed_experiments[_id];
datasets[_id]['experiments'] = annotate_dataset(keyed_experiments[_id]);
}
retArray.push(annotate_dataset(datasets[_id]));
}
res.send(retArray);

    }
         );
}
