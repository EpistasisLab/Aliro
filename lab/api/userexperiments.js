require("../env"); // Load configuration variables
var db = require("../db").db;
var api = require("./default");
var format_experiments = function(experiments,algorithms,datasets) {
ret_experiments = []
for (var _id in experiments) {
experiment = experiments[_id];
new_experiment = {};
new_experiment['_id'] = experiment['_id'];
new_experiment['status'] = experiment['_status'];
new_experiment['notification'] =  null;
new_experiment['accuracy_score'] =  null;
if(datasets[experiment['_dataset_id']]) {
new_experiment['dataset'] = datasets[experiment['_dataset_id']]['name'];
} else {
new_experiment['dataset'] = null;
}
//experiment['dataset'] = datasets[experiment['_dataset_id']]['name'];
new_experiment['algorithm'] = algorithms[experiment['_project_id']]['name']
new_experiment['params'] = experiment['_options'];
if(experiment['_scores']  && experiment['_scores']['accuracy_score']) {
new_experiment['accuracy_score'] = experiment['_scores']['accuracy_score'];
}
new_experiment['launched_by'] = experiment['username'];
//experiments[_id] = experiment;
ret_experiments.push(new_experiment);
}
return(ret_experiments);
}

//return a list of datasets for each user
exports.responder = function(req, res) {
    var params = api.params(req);
    var query = {};
    if (params['filter_on_user']) {
        query['username'] = params['username'];
    }
    if (params['id']) {
        //        query['_id'] = db.ObjectID(params['id']);
    }
    if (params['date_start']) {
        //        query['_finished'] = {"$gte": new Date(params['date_start'])}
    }

    db.users.aggregate(
        [{
            $match: query
        }, {
                "$unwind": {
                    path: "$algorithms",
                    preserveNullAndEmptyArrays: true
                }
        }, {
            $lookup: {
                from: "datasets",
                localField: "username",
                foreignField: "username",
                as: "datasets"
            }
        }, {
            $lookup: {
                from: "experiments",
                localField: "username",
                foreignField: "username",
                as: "experiments"
            }
        }, {
            $lookup: {
                from: "projects",
                localField: "algorithms",
                foreignField: "name",
                as: "algorithms"
            }
        }, {
                "$unwind": {
                    path: "$algorithms",
                    preserveNullAndEmptyArrays: true
                }
        }, {
                "$unwind": {
                    path: "$datasets",
                    preserveNullAndEmptyArrays: true
                }
        }, {
                "$unwind": {
                    path: "$experiments",
                    preserveNullAndEmptyArrays: true
                }
        }, {
            $group: {
                _id: "$_id",
                algorithms: {
                    $addToSet: "$algorithms"
                },
                datasets: {
                    $addToSet: "$datasets"
                },
                experiments: {
                    $addToSet: "$experiments"
                },
            }
        }],
        function(err, users) {
            retArray = []
            var user = users[0];
            var algorithms = api.convert_to_dict(user['algorithms']);
            var experiments = api.convert_to_dict(user['experiments']);
            var datasets = api.convert_to_dict(user['datasets']);
            var keyed_experiments = api.group_on_key(experiments, '_dataset_id')
            var formatted_experiments = format_experiments(experiments,algorithms,datasets);
/*
            var datasets = api.convert_to_dict(user['datasets']);
            for (_id in experiments) {
                var experiment = experiments[_id];
                var algorithm_id = experiment['_project_id']
                var algorithm = algorithms[algorithm_id]
                experiments[_id]['algorithm'] = algorithm;
            }
            for (_id in datasets) {
                if (keyed_experiments[_id] !== undefined) {
                    datasets[_id]['experiments'] = keyed_experiments[_id];
                }
                retArray.push(api.annotate_dataset(datasets[_id]));
            }
*/
            res.send(formatted_experiments);

        }
    );
}
