/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var os = require("os");
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
// Operating System details
specs.os = {
  type: os.type(),
  platform: os.platform(),
  arch: os.arch(),
  release: os.release()
};
// CPU models
specs.cpus = os.cpus().map(function(cpu) {return cpu.model;})
// Total RAM
specs.mem = bytes(os.totalmem());
// GPU models
specs.gpus = [];
var lspci = spawnSync("lspci", []);
var grep = spawnSync("grep", ["-i", "vga"], {input: lspci.stdout});
var gpuStrings = grep.stdout.toString().split("\n");
for (var i = 0; i < gpuStrings.length - 1; i++) {
  specs.gpus.push(gpuStrings[i].replace(/.*controller: /g, ""));
}

/* Registration */
/*
request({uri: process.env.FGLAB_URL + "/machines", method: "POST", json: specs}, function(err, response, body) {
  if (err) {
    return console.log(err);
  }
  console.log(body);
});
*/

/* HTTP Server */
var server = http.createServer(app); // Create HTTP server
server.listen(process.env.PORT); // Listen for connections
