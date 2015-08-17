var db = require("mongoskin").db(process.env.MONGODB_URI); // Connect to db

db.bind("experiments"); // Allow db.experiments. usage

// Returns list of experiments
exports.listExperiments = function(cb) {
  db.experiments.find().toArray(function(err, result) {
    if (err) {
      throw err;
    }
    cb(result); // Return results in callback
  });
};

// Inserts experiment
exports.insertExperiment = function(experiment, cb) {
  db.experiments.insert(experiment, function(err) {
    if (err) {
      throw err;
    }
    cb(); // Callback if successful
  });
};
