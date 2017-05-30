require("../env"); // Load configuration variables
var db = require("../db").db;

// test to make sure everything is working
//return a list of datasets for each user
exports.handler = function(username,id) {
    query = {};
    if(username != 'pmlb') {
       query['username'] =  username;
    }
    if(id) {
      query['_id'] = db.ObjectID(id);
    }

    return new Promise(function(success, fail) {
        db.projects.find(query)
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
