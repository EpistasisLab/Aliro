require("../env"); // Load configuration variables
var db = require("../db").db;
//return a list of datasets for each user
exports.responder = function(user,req,res) {
        query = {};
        if (!(user['roles']) || (!user['roles'].indexOf('ai'))) {
          query['username'] = user['username'];
        }
        if(req.params.id) {
          query['_id'] = db.ObjectID(req.params.id);
        }
console.log(query);
        db.collection('users').find(query).toArrayAsync()
            .then((results) => {
                res.send(results);
                //  success(returnDummyDatasetsList());
            })
            .catch((err) => {
                fail(err);
            });

}
