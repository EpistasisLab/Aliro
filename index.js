require("dotenv").load(); // Load configuration variables
var http = require("http");
var express = require("express");
var WebSocketServer = require("ws").Server;
var db = require("./db");

var app = express();
app.use(express.static(__dirname + "/public", {index: false, maxAge: '1d'})); // Static directory
app.set("view engine", "jade"); // Jade template engine

// Show list of experiments
app.get("/", function(req, res) {
  db.listExperiments(function(result) {
    res.render("index", {title: "FGLab", experiments: result});
  });
});

// Show live logs
app.get("/logs", function(req, res) {
  res.render("logs", {title: "FGLab"});
});

// Error handler
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err); // Delegate to Express' default error handling
  }
  res.status(500);
  res.send("Error: " + err);
});

// Create HTTP server
var server = http.createServer(app);
server.listen(process.env.PORT); // Listen for connections

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
