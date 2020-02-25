var Promise = require("bluebird");
var mongoskin = require("mongoskin");
var db;
var mongouri;


if (process.env.DBMONGO_HOST && process.env.DBMONGO_PORT) {
	mongouri="mongodb://"+process.env.DBMONGO_HOST+":"+process.env.DBMONGO_PORT+"/FGLab";
} else if (process.env.MONGODB_URI) {
	mongouri=process.env.MONGODB_URI;
} else {
  	console.log("Error: No MongoDB instance specified");
  	process.exit(1);
}

// Connect to MongoDB
db = mongoskin.db(mongouri, {native_parser: true});

// Bind collections
db.bind("projects");
db.bind("machines");
db.bind("experiments");
db.bind("batches");
db.bind("users");
db.bind("datasets");
db.bind("settings");

// Promisify all methods
Object.keys(mongoskin).forEach((key) => {
  var value = mongoskin[key];
  if (typeof value === "function") {
    Promise.promisifyAll(value);
    Promise.promisifyAll(value.prototype);
  }
});
Promise.promisifyAll(mongoskin);

// Add helper methods to db
db.ObjectID = mongoskin.ObjectID;
db.toObjectID = mongoskin.helper.toObjectID;
db.GridStore = mongoskin.GridStore;

// TODO Make helper functions to contain GridFS in this file

module.exports.db = db;
