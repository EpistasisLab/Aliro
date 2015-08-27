/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var os = require("os");
var fs = require("mz/fs");
var spawn= require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var http = require("http");
var url = require("url");
var bytes = require("bytes");
var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var rp = require("request-promise");
var chokidar = require("chokidar");

/* App instantiation */
var app = express();
var jsonParser = bodyParser.json({limit: "50mb"}); // Parses application/json
app.use(morgan("tiny")); // Log requests

/* Machine specifications */
var specs = {};
// Attempt to read existing specs
fs.readFile("specs.json", "utf-8")
.then(function(sp) {
  specs = JSON.parse(sp);
})
.catch(function() {
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
  rp({uri: process.env.FGLAB_URL + "/api/machines", method: "POST", json: specs, gzip: true})
  .then(function(body) {
    // Save ID and specs
    fs.writeFile("specs.json", JSON.stringify(body));
  })
  .catch(function(err) {
    console.log(err);
  })
});

/* Project specifications */
var projects = {};
// Attempt to read existing projects
fs.readFile("projects.json", "utf-8")
.then(function(proj) {
  projects = JSON.parse(proj || "{}");
})
.catch(function(err) {
  projects = {};
});

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
app.post("/projects/:id", jsonParser, function(req, res) {
  // Check if capacity still available
  if (getCapacity(req.params.id) === 0) {
    res.status(501);
    return res.send({error: "No capacity available"});
  }

  // Process args
  var experimentId = req.body.id;
  var project = projects[req.params.id];
  var args = [];
  args.push(project.file);
  args.push(project.option);
  args.push(JSON.stringify(req.body));

  // Spawn experiment
  var experiment = spawn(project.command, args, {cwd: project.cwd});
  maxCapacity -= project.capacity; // Reduce capacity of machine

  // PUTs JSON files
  var putFile = function(path) {
    if (path.match(/\.json$/)) { // Only pass JSON files
      fs.readFile(path, "utf-8")
      .then(function(results) {
        rp({uri: process.env.FGLAB_URL + "/api/experiments/" + experimentId, method: "PUT", json: JSON.parse(results), gzip: true});
      });
    }
  };

  // Set up file watching
  var watcher = chokidar.watch(project.results + "/" + experimentId, {ignored: /[\/\\]\./, ignoreInitial: true}); // Ignore dotfiles and existing files
  watcher.on("ready", function() {
    console.log("Watching for experiment " + experimentId + " results.");
  });
  // Send files as they are written
  watcher.on("add", putFile);
  watcher.on("change", putFile);

  // Log stdout
  experiment.stdout.on("data", function(data) {
    console.log(data.toString());
  });

  // Log errors
  experiment.stderr.on("data", function(data) {
    console.log("Error: " + data.toString());
  });

  // TODO Consider how to kill experiments

  // Clean up
  experiment.on("exit", function(exitCode) {
    maxCapacity += project.capacity; // Add back capacity
    if (exitCode !== 0) {
      // TODO Error handling
    }
    // Wait a minute to send all results
    setTimeout(function() {
      watcher.close(); // Close watcher
    }, 60000);
    // TODO Inform server finished/post results
  });
  res.send(req.body);
});

/* HTTP Server */
var server = http.createServer(app); // Create HTTP server
server.listen(url.parse(process.env.FGMACHINE_URL).port); // Listen for connections
