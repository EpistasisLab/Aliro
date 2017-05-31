require("../env"); // Load configuration variables
var db = require("../db").db;
var user_collections = ['users','experiments','datasets'];
var global_collections = ['projects'];

//return a list of datasets for each user
exports.responder = function(user,req,res) {
console.log(req.params);
        query = {};
        collection = req.params.apipath;
        user = user['username']
        if (collection in user_collections) {
          query['user'] = username;
        }
        if(req.params.id) {
          query['_id'] = db.ObjectID(req.params.id);
        }
        db.collection(req.params.apipath).find(query).toArrayAsync()
            .then((results) => {
                res.send(results);
                //  success(returnDummyDatasetsList());
            })
            .catch((err) => {
                fail(err);
            });

}
