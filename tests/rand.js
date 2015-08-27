var fs = require("mz/fs");

// Read and log out options
var opts = JSON.parse(process.argv[3]);
console.log(opts);

// Make results directory
fs.mkdirSync(opts.id);

// Fills an Array with a random number
var randFill = function(arr) {
  return Array.apply(null, arr).map(Number.prototype.valueOf, Math.random());
};

// Save random results
var train = {
  losses: randFill(Array(100000)),
  freq: 1
};
fs.writeFileSync(opts.id + "/train.json", JSON.stringify({train: train}));
var val = {
  losses: randFill(Array(1000)),
  freq: 100
};
fs.writeFileSync(opts.id + "/val.json", JSON.stringify({val: val}));
var test = {
  loss: Math.random(),
  score: Math.random()
};
fs.writeFileSync(opts.id + "/test.json", JSON.stringify({test: test}));
