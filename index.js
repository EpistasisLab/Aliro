/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var http = require("http");
var express = require("express");
var morgan = require("morgan");

/* App instantiation */
var app = express();
app.use(morgan("tiny")); // Log requests

/* HTTP Server */
var server = http.createServer(app); // Create HTTP server
server.listen(process.env.PORT); // Listen for connections
