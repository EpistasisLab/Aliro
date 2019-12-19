var db = require("../db").db;
var api = require("./default");

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
                as: "user_datasets"
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
                path: "$user_datasets",
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
                    $addToSet: "$user_datasets"
                },
                experiments: {
                    $addToSet: "$experiments"
                },
            }
        }],
        function(err, users) {
            retArray = []
if (users) {
            var user = users[0];
            var algorithms = api.convert_to_dict(user['algorithms']);
            var experiments = api.convert_to_dict(user['experiments']);
            var keyed_experiments = api.group_on_key(experiments, '_dataset_id');
            var datasets = api.convert_to_dict(user['datasets']);
            if (params['id']) {
                var dataset = datasets[params['id']];
                datasets = {};
                datasets[params['id']] = dataset;
            }

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
                retArray.push(annotate_dataset(datasets[_id]));
            }
}
            res.send(retArray);

        }
    );
}
var annotate_dataset = function(dataset) {
    var validation = dataset;
    var pending = 0;
    var running = 0;
    var finished = 0;
    var failed = 0;
    var best_score = 0;
    var best_experiment_id;
    var best_experiment_name;
    if (dataset['experiments']) {
        experiments = dataset['experiments']
        for (var j = 0; j < experiments.length; j++) {
            var experiment = experiments[j];
            var _status = experiment['_status'];
            var _scores = experiment['_scores'];
            if (_scores !== undefined && _scores['exp_table_score'] >= best_score) {
                best_score = _scores['exp_table_score']
                best_experiment_id = experiment['_id']
                if (experiment['algorithm'] && experiment['algorithm']['name']) {
                    best_experiment_name = experiment['algorithm']['name']
                }

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
        validation['ai'] = 'off';
    } else if (dataset['ai'] == true) {
        validation['ai'] = 'on';
    } else if (dataset['ai'] == false) {
        validation['ai'] = 'off';
    } else {
        validation['ai'] = dataset['ai'];
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
        validation['best_result']['score'] = best_score;
    }
    validation['notifications'] = {
        new: 0,
        error: failed
    }

    return (validation);
}
exports.annotate_dataset = annotate_dataset
