var http = require("http");
var express = require("express");
var WebSocketServer = require("ws").Server;
var port = process.env.PORT || 5000;

var app = express();
app.use(express.static(__dirname + "/public")); // Static directory
app.set("view engine", "jade"); // Jade template engine

app.get("/", function(req, res) {
  res.render("index", {title: "FGLab"});
});

// Create HTTP server
var server = http.createServer(app);
server.listen(port); // Listen for connections

// Add websocket server
var wss = new WebSocketServer({server: server});

// Calls on connection from new client
wss.on("connection", function(ws) {
  console.log("Client opened connection");

  // Send one message
  ws.send("Connected to server");

  // Prints received messages
  ws.on("message", function(message) {
    console.log(message);
  });

  // Performs clean up if necessary
  ws.on("close", function() {
    console.log("Client closed connection");
  });
});
