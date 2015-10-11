var Promise = require("bluebird");
var mongoskin = require("mongoskin");
var Grid = require("gridfs-stream");
var db;
if (!process.env.MONGODB_URI) {
  console.log("Error: No MongoDB instance specified");
  process.exit(1);
} else {
  // Connect to MongoDB
  db = mongoskin.db(process.env.MONGODB_URI, {native_parser: true});
  db.gfs = Grid(db, mongoskin);
}

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
