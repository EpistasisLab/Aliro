var Promise = require("bluebird");
var mongoskin = require("mongoskin");
var db = mongoskin.db(process.env.MONGOLAB_URI, {native_parser: true}); // Connect to db

// Bind collections
db.bind("projects");
db.bind("machines");
db.bind("experiments");

// Promisify all methods
Object.keys(mongoskin).forEach(function(key) {
  var value = mongoskin[key];
  if (typeof value === "function") {
    Promise.promisifyAll(value);
    Promise.promisifyAll(value.prototype);
  }
});
Promise.promisifyAll(mongoskin);

// Add helper method to db
db.toObjectID = mongoskin.helper.toObjectID;

module.exports.db = db;
