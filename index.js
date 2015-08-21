/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var os = require("os");
var fs = require("fs");
var spawn= require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var http = require("http");
var url = require("url");
var bytes = require("bytes");
var express = require("express");
var morgan = require("morgan");
var request = require("request");

/* App instantiation */
var app = express();
app.use(morgan("tiny")); // Log requests

/* Machine specifications */
var specs = {};
try {
  // Attempt to read existing specs
  specs = JSON.parse(fs.readFileSync("specs.json", "utf-8"));
} catch (err) {
  specs = {
    address: process.env.FGMACHINE_URL,
    hostname: os.hostname(),
    os: {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release()
    },
    cpus: os.cpus().map(function(cpu) {return cpu.model;}),
    mem: bytes(os.totalmem()),
    gpus: []
  };
  // GPU models
  if (os.platform() === 'linux') {
    var lspci = spawnSync("lspci", []);
    var grep = spawnSync("grep", ["-i", "vga"], {input: lspci.stdout});
    var gpuStrings = grep.stdout.toString().split("\n");
    for (var i = 0; i < gpuStrings.length - 1; i++) {
      specs.gpus.push(gpuStrings[i].replace(/.*controller: /g, ""));
    }
  }

  // Register details
  request({uri: process.env.FGLAB_URL + "/api/machines", method: "POST", json: specs}, function(err, response, body) {
    if (err) {
      return console.log(err);
    }
    // Save ID and specs
    fs.writeFileSync("specs.json", JSON.stringify(body));
  });
}

/* Project specifications */
var projects = {};
try {
  // Attempt to read existing projects
  projects = JSON.parse(fs.readFileSync("projects.json", "utf-8") || "{}");
} catch (err) {
  console.log(err);
}

/* Global max capacity */
var maxCapacity = 1;

var getCapacity = function(projId) {
  var capacity = 0;
  if (projects[projId]) {
    capacity = Math.floor(maxCapacity / projects[projId].capacity);
  }
  return capacity;
};

/* Routes */
// Checks capacity
app.get("/projects/:id", function(req, res) {
  res.send({capacity: getCapacity(req.params.id)});
});

// Starts experiment
app.post("/projects/:id", function(req, res) {
  // Check if capacity still available
  if (getCapacity(req.params.id) === 0) {
    res.status(501);
    return res.send({error: "No capacity available"});
  }

  var project = projects[req.params.id];
  // Process args
  var args = [];
  args.push(project.file);
  args.push(project.option);
  args.push(req.body); // TODO Make sure ID is passed from server

  // Spawn experiment
  var experiment = spawn(project.command, args);
  maxCapacity -= project.capacity; // Reduce capacity of machine

  // Log stdout
  experiment.stdout.on("data", function(data) {
    console.log(data);
  });

  // Log errors
  experiment.stderr.on("data", function(data) {
    console.log("Error: " + data);
  });

  // TODO Consider how to kill experiments

  // Clean up
  experiment.on("exit", function(exitCode) {
    maxCapacity += project.capacity; // Add back capacity
    if (exitCode !== 0) {
      // TODO Error handling
    }
    // TODO Inform server finished/post results
  });
});

/* HTTP Server */
var server = http.createServer(app); // Create HTTP server
server.listen(url.parse(process.env.FGMACHINE_URL).port); // Listen for connections
