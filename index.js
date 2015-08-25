/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var compression = require("compression");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var rp = require("request-promise");
var Promise = require("bluebird");
var msgpack = require("msgpack5")();
//var WebSocketServer = require("ws").Server;
var db = require("./db").db;

/* App instantiation */
var app = express();
var jsonParser = bodyParser.json({limit: '50mb'}); // Parses application/json
var upload = multer(); // Store files in memory as Buffer objects
app.use(compression()); // Compress all requests
app.use(favicon(__dirname + "/public/favicon.ico")); // Deal with favicon requests
app.use(express.static(__dirname + "/public", {index: false, maxAge: '1d'})); // Static directory
app.set("view engine", "jade"); // Jade template engine
app.use(morgan("tiny")); // Log requests

/* API */

// Get collection for all API endpoints
app.param("collection", function(req, res, next, collection) {
  req.collection = db.collection(collection);
  return next();
});

// Return all entries
app.get("/api/:collection", function(req, res, next) {
  req.collection.find({}, {sort: [["timestamp", 1]]}).toArrayAsync()
  .then(function(results) {
    res.send(results);
  })
  .catch(function(err) {
    next(err);
  });
});

// Create new entry
app.post("/api/:collection", jsonParser, function(req, res, next) {
  req.collection.insertAsync(req.body, {})
  .then(function(results) {
    res.send(results[0]);
  })
  .catch(function(err) {
    next(err);
  });
});

// Return single entry
app.get("/api/:collection/:id", function(req, res, next) {
  req.collection.findByIdAsync(req.params.id)
  .then(function(result) {
    res.send(result);
  })
  .catch(function(err) {
    next(err);
  });
});

// Update existing entry
app.put("/api/:collection/:id", jsonParser, function(req, res, next) {
  delete req.body._id; // Delete ID (will not update otherwise)
  req.collection.updateByIdAsync(req.params.id, {$set: req.body}, {safe: true, multi: false})
  .then(function(result) {
    // Update returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg : "error"});
  })
  .catch(function(err) {
    next(err);
  });
});

// Delete existing entry
app.delete("/api/:collection/:id", function(req, res, next) {
  req.collection.removeByIdAsync(req.params.id)
  .then(function(result) {
    // Remove returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg : "error"});
  })
  .catch(function(err) {
    next(err);
  });
});

/* Processing Routes */

// Constructs a project from an uploaded .json file
app.post("/new-project", upload.single("schema"), function(req, res, next) {
  // Extract file name
  var name = req.file.originalname.replace(".json", "");
  // Extract .json as object
  var schema = JSON.parse(req.file.buffer.toString());
  // Store
  db.projects.insertAsync({name: name, schema: schema}, {})
  .then(function(result) {
    res.send(result);
  })
  .catch(function(err) {
    next(err);
  });
});

// Constructs an experiment from the form
app.post("/new-experiment/:id", jsonParser, function(req, res, next) {
  // TODO Find available machine and concatenate machine ID
  var obj = req.body;
  var projP = db.projects.findByIdAsync(req.params.id); // Get project
  var expP = db.experiments.insertAsync({hyperparams: obj, project_id: db.toObjectID(req.params.id), machine: {}}, {}); // Create experiment
  var macP = db.machines.find({}, {sort: [["timestamp", 1]]}).toArrayAsync(); // TODO Replace with available machine
  Promise.all([projP, expP, macP])
  .then(function(results) {
    // Get objects
    var proj = results[0];
    var exp = results[1][0];
    var mac = results[2][0]; // TODO Stop using just first machine
    // Create message
    obj.id = exp._id.toString(); // TODO Consider if ID should be part of hyperparams
    var encBuffer = msgpack.encode(obj); // Encode in hex and create buffer
    // Send project
    rp({uri: mac.address + "/projects/" + req.params.id, method: "POST", body: encBuffer, headers: {"Content-Type": "application/octet-stream"}})
    .then(function(body) {
      res.send(body);
    })
    .catch(function(err) {
      res.status(501);
      res.send(err);
    });
  })
  .catch(function(err) {
    next(err);
  });
});

/* Rendering Routes */

// List projects and machines on homepage
app.get("/", function(req, res, next) {
  var projP = db.projects.find({}, {sort: [["name", -1]]}).toArrayAsync();
  var macP = db.machines.find({}, {sort: [["hostname", -1]]}).toArrayAsync();
  Promise.all([projP, macP])
  .then(function(results) {
    return res.render("index", {projects: results[0], machines: results[1]});
  })
  .catch(function(err) {
    return next(err);
  });
});

// Project page
app.get("/projects/:id", function(req, res, next) {
  var projP = db.projects.findByIdAsync(req.params.id);
  var expP = db.experiments.find({project_id: db.toObjectID(req.params.id)}, {sort: [["_id", -1]]}).toArrayAsync(); // Find experiments for this project
  Promise.all([projP, expP])
  .then(function(results) {
    var proj = results[0];
    var experiments = results[1];
    res.render("project", {project: proj, experiments: experiments});
  })
  .catch(function(err) {
    next(err);
  });
});

// Machine page
app.get("/machines/:id", function(req, res, next) {
  db.machines.findByIdAsync(req.params.id)
  .then(function(result) {
    res.render("machine", {machine: result});
  })
  .catch(function(err) {
    next(err);
  });
});

// Experiment page
app.get("/experiments/:id", function(req, res, next) {
  db.experiments.findByIdAsync(req.params.id)
  .then(function(result) {
    res.render("experiment", {experiment: result});
  })
  .catch(function(err) {
    next(err);
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
server.listen(process.env.FGLAB_PORT); // Listen for connections

/* WebSocket server */
// Add websocket server
/*
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
*/
