var db = require("mongoskin").db(process.env.MONGOLAB_URI, {native_parser: true}); // Connect to db

db.bind("experiments"); // Register db.experiments collection

/*
// Returns list of experiments
exports.listExperiments = function(cb) {
  db.experiments.find().toArray(function(err, result) {
    if (err) {
      throw err;
    }
    cb(result); // Return results in callback
  });
};
*/

module.exports.db = db;
