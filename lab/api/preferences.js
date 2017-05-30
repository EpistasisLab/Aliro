require("../env"); // Load configuration variables
var db = require("../db").db;
//return a list of datasets for each user
exports.handler = function(username,id) {
    return new Promise(function(success, fail) {
        query = {};
        if(username != 'pmlb') {
           query['username'] =  username;
        }
        if(id) {
         query['_id'] = db.ObjectID(id);
        }
        db.users.find(query)
            .toArrayAsync()
            .then((results) => {
                success(results);
                //  success(returnDummyExperimentsList());
            })
            .catch((err) => {
                fail(err);
            });
    });

}
