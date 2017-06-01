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

        db.users.aggregate(
 [
        {
         $match: query
        },
        {
            $unwind: "$algorithms"
        },
        {
            $lookup:
            {
                from: "datasets",
                localField: "username",
                foreignField: "username",
                as: "datasets"
            }
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
            $lookup:
            {
                from: "projects",
                localField: "algorithms",
                foreignField: "name",
                as: "algorithms"
            }
        },
        {
            $unwind: "$algorithms"
        },
        {
            $unwind: "$datasets"
        },
        {
            $unwind: "$experiments"
        },
        {
  $group:
            {
                _id: "$_id",
                algorithms: { $addToSet: "$algorithms" },
                datasets: { $addToSet: "$datasets" },
                experiments: { $addToSet: "$experiments" },
            }
        }
    ],
function(err,result) {
console.log(result);
res.send(result);

    }
         );
}
