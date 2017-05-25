require("./env"); // Load configuration variables
var db = require("./db").db;

// test to make sure everything is working
var returnDummyDatasetsList = function() {
    var datasets = [{
        _id: '00000001',
        name: 'Gametes',
        has_metadata: true,
        ai: true,
        best_result: {
            algorithm: 'Linear Regression',
            accuracy_score: 0.82
        },
        experiments: {
            pending: 15,
            running: 2,
            finished: 267
        },
        notifications: {
            new: 5,
            error: 1
        }
    }, {
        _id: '00000002',
        name: 'Thyro_id',
        has_metadata: true,
        ai: false,
        best_result: {
            algorithm: 'Random Forest',
            accuracy_score: 0.42
        },
        experiments: {
            pending: 2,
            running: 5,
            finished: 15
        },
        notifications: {
            new: 0,
            error: 1
        }
    }, {
        _id: '00000003',
        name: 'Adults',
        has_metadata: true,
        ai: true,
        best_result: {
            algorithm: 'Gradient Boosting',
            accuracy_score: 0.94
        },
        experiments: {
            pending: 27,
            running: 20,
            finished: 462
        },
        notifications: {
            new: 11,
            error: 0
        }
    }, {
        _id: '00000004',
        name: 'Heart',
        has_metadata: true,
        ai: false,
        best_result: {
            algorithm: 'Support Vector Machine',
            accuracy_score: 0.33
        },
        experiments: {
            pending: 0,
            running: 0,
            finished: 26
        },
        notifications: {
            new: 0,
            error: 0
        }
    }, {
        _id: '00000005',
        name: 'Breast Cancer',
        ai: false,
        has_metadata: false,
        best_result: undefined,
        experiments: {
            pending: 0,
            running: 0,
            finished: 0
        },
        notifications: {
            new: 0,
            error: 0
        }
    }, {
        _id: '00000006',
        name: 'Hepatitis',
        ai: true,
        has_metadata: true,
        best_result: undefined,
        experiments: {
            pending: 0,
            running: 0,
            finished: 0
        },
        notifications: {
            new: 0,
            error: 0
        }
    }];
    return (datasets);
}

//return a list of datasets for each user
exports.returnUserDatasetsList = function(username) {
    return new Promise(function(success, fail) {
        db.datasets.find({
                username: username
            }).toArrayAsync()
            .then((results) => {
                resultsList = [];
                //        success(results);
                for (var i = 0; i < results.length; i++) {
                    var validation = results[i];
                    validation['has_metadata'] = true;
                    validation['ai'] = false;
                    validation['experiments'] = {
                        pending: 0,
                        running: 0,
                        finished: 0
                    }
                    validation['notifications'] = {
                        new: 0,
                        error: 0
                    }
                    resultsList.push(validation);
                }

                success(resultsList);
                //  success(returnDummyDatasetsList());
            })
            .catch((err) => {
                fail(err);
            });
    });

}
