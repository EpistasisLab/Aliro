require("../env"); // Load configuration variables
var db = require("../db").db;

//return a list of datasets for each user
exports.responder = function(user,req,res) {
        query = {};
        if(user['username'] != 'pmlb') {
           query['username'] =  user['username'];
        }
        if(req.params.id) {
          query['_id'] = db.ObjectID(req.params.id);
        }
        db.datasets.find(query).toArrayAsync()
            .then((results) => {
                resultsList = [];
                //        success(results);
                for (var i = 0; i < results.length; i++) {
                    var validation = results[i];
                    if (!("ai" in validation)) {
                        validation['ai'] = false;
                    }
                    validation['has_metadata'] = true;
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
                res.send(resultsList);
                //  success(returnDummyDatasetsList());
            })
            .catch((err) => {
                fail(err);
            });

}
