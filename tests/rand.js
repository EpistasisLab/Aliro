var fs = require("mz/fs");

// Read and log out options
var opts = JSON.parse(process.argv[3]);
console.log(opts);

// Fills an Array with a random number
var randFill = function(arr) {
  return Array.apply(null, arr).map(Number.prototype.valueOf, Math.random());
};

// Save random results
var train = {
  losses: randFill(Array(10000)),
  freq: 1
};
fs.writeFile("train.json", JSON.stringify(train));
var val = {
  losses: randFill(Array(100)),
  freq: 100
};
fs.writeFile("val.json", JSON.stringify(val));
var test = {
  loss: Math.random(),
  score: Math.random()
};
fs.writeFile("test.json", JSON.stringify(test));
