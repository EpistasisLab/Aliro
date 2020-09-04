/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
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
