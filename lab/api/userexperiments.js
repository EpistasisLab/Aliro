var db = require("../db").db;
var api = require("./default");

var format_experiments = function(experiments, algorithms, datasets) {
    ret_experiments = []

    // array empty or does not exist
    if (experiments === undefined || experiments.length == 0 || experiments == {}) {
        console.warn(`empty experiments sent to format_experiments(${JSON.stringify(experiments)}, ${algorithms}, ${datasets})`)
        //return ret_experiments
    }

    for (var _id in experiments) {
        experiment = experiments[_id];
        // temporary fix
        try {
            experiment['_id'] = experiment['_id'];
        }
        catch(e) {
            console.warn(`exception in format_experiments(${JSON.stringify(experiments)}, ${JSON.stringify(algorithms)}, ${JSON.stringify(datasets)}) exception: ${e}`)
            //return ret_experiments
            throw e
        }
        experiment['status'] = experiment['_status'];
        experiment['started'] = experiment['_started'];
        experiment['finished'] = experiment['_finished'];
        experiment['notification'] = experiment['notification'];
        experiment['prediction_type'] = experiment['_prediction_type'];
        if (datasets[experiment['_dataset_id']]) {
            experiment['dataset_name'] = datasets[experiment['_dataset_id']]['name'];
            experiment['dataset_id'] = experiment['_dataset_id'];
            experiment['dataset_files'] = datasets[experiment['_dataset_id']]['files'];
            for (file in datasets[experiment['_dataset_id']]['files']) {
                file_id = datasets[experiment['_dataset_id']]['files'][file]['_id'];
            }
        }
        if (experiment['files']) {
            experiment['experiment_files'] = experiment['files'];
        }
            experiment['params'] = experiment['_options'];
        if (experiment['_project_id'] && algorithms[experiment['_project_id']]) {
            experiment['algorithm'] = algorithms[experiment['_project_id']]['name']
        } else {
            experiment['algorithm'] = '';
        }
        if (experiment['_scores']) {
          experiment['scores'] = experiment['_scores'];
        } else {
            experiment['scores'] = '';
        }
        experiment['launched_by'] = experiment['username'];
        ret_experiments.push(experiment);
    }
    return (ret_experiments);
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
        if (users) {
            retArray = []
            var user = users[0];
            var algorithms = api.convert_to_dict(user['algorithms']);
            var experiments = api.convert_to_dict(user['experiments']);
            if (params['id']) {
                var experiment = experiments[params['id']];
                experiments = {};
                experiments[params['id']] = experiment;
            }
            var datasets = api.convert_to_dict(user['datasets']);
            //var keyed_experiments = api.group_on_key(experiments, '_dataset_id') // HW - seems unused?
            var formatted_experiments = format_experiments(experiments, algorithms, datasets);
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

        } else {
            res.send([]);
        }

        }
    );
}
