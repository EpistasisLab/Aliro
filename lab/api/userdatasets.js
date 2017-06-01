require("../env"); // Load configuration variables
var db = require("../db").db;
var api = require("./default");

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
        if(req.body.ai) {
          query['ai'] = req.body.ai;
        }
        db.datasets.find(query).toArrayAsync()
            .then((results) => {
                resultsList = [];
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
            })
            .catch((err) => {
                fail(err);
            });

}
