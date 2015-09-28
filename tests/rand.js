var fs = require("mz/fs");
var _ = require("lodash");

// Read and log out options
var opts = JSON.parse(process.argv[3]);
console.log(opts);

// Make results directory
fs.mkdirSync(opts._id);

// Creates a linear scale
var linScale = function(numEls, step, start) {
  return _.map(Array(numEls), function(val, ind) {
    return start + step*ind;
  });
};

// Creates an exponential decay curve with noise
var noisyExp = function(val, ind, coll) {
  var exp = Math.pow(0.9, ind/coll.length) - 0.9;
  return exp + exp*Math.random();
};
var randFill = function(numEls) {
  return _.map(Array(numEls), noisyExp);
};

// Save random results
var train = {
  indices: linScale(100000, 1, 1),
  losses: randFill(100000)
};
fs.writeFileSync(opts._id + "/train.json", JSON.stringify({_train: train}));
var val = {
  indices: linScale(1000, 100, 1),
  losses: randFill(1000),
  score: Math.random()
};
fs.writeFileSync(opts._id + "/val.json", JSON.stringify({_val: val}));
var test = {
  loss: Math.random(),
  score: Math.random()
};
fs.writeFileSync(opts._id + "/test.json", JSON.stringify({_test: test}));
fs.writeFileSync(opts._id + "/custom.json", JSON.stringify({"Custom Field": "This is a custom field"}));
