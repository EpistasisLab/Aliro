var fs = require("mz/fs");
var path = require("path");
var _ = require("lodash");

console.log("Program started");
var t0 = process.hrtime(); // Start timer

// Read and log out options
var opts = {};
console.log("Optional parameter: " + process.argv[2]);
for (var i = 3; i < process.argv.length; i += 2) {
  opts[process.argv[i]] = process.argv[i + 1];
}
console.log("Options: ");
console.log(opts);


// Make results directory
if (!fs.existsSync("experiments")) {
  fs.mkdirSync("experiments");
}
fs.mkdirSync(path.join("experiments", opts._id));

// Store source code
fs.writeFileSync(path.join("experiments", opts._id, "source_code.js"), fs.readFileSync("./rand.js"));
// Store image
fs.writeFileSync(path.join("experiments", opts._id, "mnist.png"), fs.readFileSync("./mnist.png"));
// Store custom fields
fs.writeFileSync(path.join("experiments", opts._id, "notes.json"), JSON.stringify({"Notes": "This field is being used to store notes about the experiment.", "Version": "Node.js " + process.version}));


// Creates a linear scale
var linScale = function(numEls, step, start) {
  return _.map(Array(numEls), (val, ind) => {
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


// Calculate random training losses
console.log("Training started");
var train = {
  indices: linScale(100000, 1, 1),
  losses: randFill(100000)
};
console.log("Training finished");

// Calculate random validation losses
console.log("Validation started");
var val = {
  indices: linScale(1000, 100, 1),
  losses: randFill(1000),
  score: Math.random()
};
console.log("Validation finished");

// Calculate random training loss
console.log("Testing started");
var test = {
  loss: Math.random(),
  score: Math.random()
};
console.log("Testing finished");

// Store scores
fs.writeFileSync(path.join("experiments", opts._id, "scores.json"), JSON.stringify({_scores: {"Test Score": test.score, "Val Score": val.score}}));
// Store losses as a chart
var columnNames = ["train", "val", "x1", "x2"];
var chartData = {
  xs: {"train": "x1", "val": "x2"},
  columns: [train.losses, val.losses, train.indices, val.indices]
};
fs.writeFileSync(path.join("experiments", opts._id, "chart.json"), JSON.stringify({_charts: [{columnNames: columnNames, data: chartData, axis: {x: {label: {text: "Iteration"}}, y: {label: {text: "Loss"}}}}]}));

var t1 = process.hrtime(t0); // Finish timer
// Overwrite custom fields with timing
setTimeout(() => {
  fs.writeFileSync(path.join("experiments", opts._id, "notes.json"), JSON.stringify({"Notes": "This field is being used to store notes about the experiment.", "Version": "Node.js " + process.version, "Time Taken": t1[0] * 1e9 + t1[1] + "ns"}));
  // Send source code again to test overwriting
  fs.writeFileSync(path.join("experiments", opts._id, "source_code.js"), fs.readFileSync("./rand.js"));
}, 5000);

console.log("Program finished");
