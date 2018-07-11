var Promise = require("bluebird");
var db = require("./db").db;
exports.validateParams = function(projId, options, datasetId, callback) {
    var prevExp = db.experiments.find({
        _dataset_id: db.toObjectID(datasetId),
        _project_id: db.toObjectID(projId),
        _options: options,
        _status: "success"
    }).toArrayAsync();
    Promise.all(prevExp)
        .then((results) => {
            if (results.length >= 1) {
                error = {
                    error: "already exists"
                };
                callback(error);
            } else {
                success = {
                    success: "Options validated"
                };
                callback(success);
            }
        })
        .catch((err) => {
            error = {
                error: err
            };
            callback(error);

        });

}
