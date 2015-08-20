var request = require("request");

var args = process.argv.slice(2);
if (args.length !== 1) {
  console.log("Please specify the name of the project as one argument");
  return;
}

console.log("Reading file...");
