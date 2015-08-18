/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var compression = require("compression");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var WebSocketServer = require("ws").Server;
var db = require("./db");

/* App instantiation */
var app = express();
//var urlencodedParser = bodyParser.urlencoded({extended: false, limit: '50mb'}); // Parses application/x-www-form-urlencoded
var jsonParser = bodyParser.json({limit: '50mb'}); // Parses application/json
app.use(compression()); // Compress all requests
app.use(favicon(__dirname + "/public/favicon.ico")); // Deal with favicon requests
app.use(express.static(__dirname + "/public", {index: false, maxAge: '1d'})); // Static directory
app.set("view engine", "jade"); // Jade template engine
app.use(morgan("tiny")); // Log requests

/* Routes */

// Return all experiments
app.get("/api/experiments", function(req, res) {
  
  /*db.listExperiments(function(result) {
    res.render("index", {title: "FGLab", experiments: result});
  });*/
});

// Create new experiment
app.post("/api/experiments", jsonParser, function(req, res) {
  /*db.insertExperiment(req.body, function() {
    res.send("Inserted");
  });*/
});

// Return single experiment
app.get("/api/experiments/:id", function(req, res) {
  var id = req.id;
});

// Update existing experiment
app.put("/api/experiments/:id", jsonParser, function(req, res) {
  var id = req.id;
});

// Delete existing experiment
app.delete("/api/experiments/:id", function(req, res) {
  var id = req.id;
});


// Show live logs
app.get("/logs", function(req, res) {
  res.render("logs", {title: "FGLab"});
});

/* Errors */
// Error handler
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err); // Delegate to Express' default error handling
  }
  res.status(500);
  res.send("Error: " + err);
});

/* HTTP Server */
// Create HTTP server
var server = http.createServer(app);
server.listen(process.env.PORT); // Listen for connections

/* WebSocket Server */
// Add websocket server
var wss = new WebSocketServer({server: server});

// Call on connection from new client
wss.on("connection", function(ws) {
  console.log("Client opened connection");

  // Send one message
  ws.send("Connected to server");

  // Print received messages
  ws.on("message", function(message) {
    console.log(message);
  });

  // Perform clean up if necessary
  ws.on("close", function() {
    console.log("Client closed connection");
  });
});
