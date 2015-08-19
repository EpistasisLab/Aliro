/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var os = require("os");
var fs = require("fs");
var spawnSync = require("child_process").spawnSync;
var http = require("http");
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
    address: process.env.ADDRESS + ":" + process.env.PORT,
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
  specs.gpus = [];
  var lspci = spawnSync("lspci", []);
  var grep = spawnSync("grep", ["-i", "vga"], {input: lspci.stdout});
  var gpuStrings = grep.stdout.toString().split("\n");
  for (var i = 0; i < gpuStrings.length - 1; i++) {
    specs.gpus.push(gpuStrings[i].replace(/.*controller: /g, ""));
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

/* HTTP Server */
var server = http.createServer(app); // Create HTTP server
server.listen(process.env.PORT); // Listen for connections
