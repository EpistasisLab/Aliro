/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var compression = require("compression");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var WebSocketServer = require("ws").Server;
var db = require("./db").db;

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

// Get collection for all API endpoints
app.param("collection", function(req, res, next, collection) {
  req.collection = db.collection(collection);
  return next();
});

// Return all entries
app.get("/api/:collection", function(req, res, next) {
  req.collection.find({}, {sort: [["timestamp", 1]]}).toArray(function(err, results) {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
});

// Create new entry
app.post("/api/:collection", jsonParser, function(req, res, next) {
  req.collection.insert(req.body, {}, function(err, results) {
    if (err) {
      return next(err);
    }
    res.send(results[0]);
  });
});

// Return single entry
app.get("/api/:collection/:id", function(req, res, next) {
  req.collection.findById(req.params.id, function(err, result) {
    if (err) {
      return next(err);
    }
    res.send(result);
  });
});

// Update existing entry
app.put("/api/:collection/:id", jsonParser, function(req, res, next) {
  delete req.body._id; // Delete ID (will not update otherwise)
  req.collection.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, function(err, result) {
    if (err) {
      return next(err);
    }
    // Update returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg : "error"});
  });
});

// Delete existing entry
app.delete("/api/:collection/:id", function(req, res, next) {
  req.collection.removeById(req.params.id, function(err, result) {
    if (err) {
      return next(err);
    }
    // Remove returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg : "error"});
  });
});

// List experiments on homepage
app.get("/", function(req, res, next) {
  db.experiments.find({}, {sort: [["timestamp", 1]]}).toArray(function(err, results) {
    if (err) {
      return next(err);
    }
    res.render("index", {experiments: results});
  });
});

// List details of single experiment
app.get("/experiments/:id", function(req, res, next) {
  db.experiments.findById(req.params.id, function(err, result) {
    if (err) {
      return next(err);
    }
    res.render("experiment", {experiment: result});
  });
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

/* HTTP server */
var server = http.createServer(app); // Create HTTP server
server.listen(process.env.PORT); // Listen for connections

/* WebSocket server */
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
