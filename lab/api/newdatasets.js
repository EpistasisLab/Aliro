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

        db.datasets.aggregate(
 [
        {
         $match: query
        },

 {
            $lookup:
            {
                from: "experiments",
                localField: "username",
                foreignField: "username",
                as: "experiments"
            }
        },
        {
  $group:
            {
                _id: "$_id",
                name: {$first: '$name'},
                username: {$first: '$username'},
                files: {$first: '$files'},
                ai: { $addToSet: "$ai" },
                experiments: { $addToSet: "$experiments" },
            }
        }




    ],
function(err,results) {
resultsList = [];
console.log(results);
                for (var i = 0; i < results.length; i++) {
                    var validation = results[i];
                    if (!("ai" in validation)) {
                        validation['ai'] = false;
                    }
                    validation['has_metadata'] = true;
                    validation['experimentsc'] = {
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

res.send(resultsList)

    }
         );
}
