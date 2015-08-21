require("dotenv").config({silent: true}); // Load configuration variables
var fs = require("fs");
var request = require("request");

var args = process.argv.slice(2);
if (args.length !== 1) {
  console.log("Please specify the name of the project as one argument");
  return;
}

// Read project.proto file
try {
  var protoString = fs.readFileSync("projects/" + args[0] + ".proto", "utf-8");
  
  // Register project
  request({uri: process.env.FGLAB_URL + "/api/projects", method: "POST", json: {name: args[0], proto: protoString}}, function(err, response, body) {
    if (err) {
      return console.log(err);
    }
    console.log("Project " + args[0] + " registered successfully.");
  });
} catch(err) {
  console.log(err);
}
