require("../env"); // Load configuration variables
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
            var keyed_experiments = api.group_on_key(experiments, '_dataset_id');
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
            res.send(retArray);

        }
    );
}
