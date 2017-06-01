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
        query['_id'] = db.ObjectID(params['id']);
    }
    if (params['date_start']) {
        query['_finished'] = {
            "$gte": new Date(params['date_start'])
        }
    }

    db.datasets.aggregate(
        [{
                $match: query
            },

            {
                $lookup: {
                    from: "experiments",
                    localField: "username",
                    foreignField: "username",
                    as: "experiments"
                }
            }, {
                "$unwind": "$experiments"
            }, {
                "$redact": {
                    $cond: [{
                            $or: [{
                                $eq: ["$experiments._dataset_id", null]
                            }, {
                                $eq: ["$_id", "$experiments._dataset_id"]
                            }]
                        },
                        "$$KEEP",
                        "$$PRUNE"
                    ]
                }
            }, {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: '$name'
                    },
                    username: {
                        $first: '$username'
                    },
                    files: {
                        $first: '$files'
                    },
                    ai: {
                        $first: "$ai"
                    },
                    experiments: {
                        $addToSet: "$experiments"
                    },
                }
            }




        ],
        function(err, results) {
            resultsList = [];
            for (var i = 0; i < results.length; i++) {

                var pending = 0;
                var running = 0;
                var finished = 0;
                var failed = 0;
                var best_accuracy_score = 0;
                var best_experiment_id;
                var best_experiment_name;
                experiments = results[i]['experiments'];
                for (var j = 0; j < experiments.length; j++) {
                    var experiment = experiments[j];
                    var _status = experiment['status'];
                    var _scores = experiment['_scores'];
                    console.log(experiment);
                    if (_scores !== undefined && _scores['accuracy_score'] >= best_accuracy_score) {
                        best_accuracy_score = _scores['accuracy_score']
                        best_experiment_id = experiment['_id']
                        best_experiment_name = experiment['name']
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
                var validation = results[i];
                if (!("ai" in validation) || (validation['ai'] == null)) {
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
                resultsList.push(validation);
            }

            res.send(resultsList)

        }
    );
}
