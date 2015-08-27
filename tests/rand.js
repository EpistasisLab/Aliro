var fs = require("mz/fs");
var _ = require("lodash");

// Read and log out options
var opts = JSON.parse(process.argv[3]);
console.log(opts);

// Make results directory
fs.mkdirSync(opts.id);

// Creates an Array filled with random numbers
var randFill = function(numEls) {
  return _.map(Array(numEls), Math.random);
};

// Save random results
var train = {
  losses: randFill(1000000), // Creates huge array
  freq: 1
};
fs.writeFileSync(opts.id + "/train.json", JSON.stringify({train: train}));
var val = {
  losses: randFill(10000),
  freq: 100
};
fs.writeFileSync(opts.id + "/val.json", JSON.stringify({val: val}));
var test = {
  loss: Math.random(),
  score: Math.random()
};
fs.writeFileSync(opts.id + "/test.json", JSON.stringify({test: test}));
