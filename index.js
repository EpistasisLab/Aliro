/* Modules */
require("dotenv").config({silent: true}); // Load configuration variables
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var compression = require("compression");
var favicon = require("serve-favicon");
var morgan = require("morgan");
//var request = require("request");
var Promise = require("bluebird");
var ProtoBuf = require("protobufjs");
//var WebSocketServer = require("ws").Server;
var db = require("./db").db;

/* App instantiation */
var app = express();
//var urlencodedParser = bodyParser.urlencoded({extended: false, limit: '50mb'}); // Parses application/x-www-form-urlencoded
var jsonParser = bodyParser.json({limit: '50mb'}); // Parses application/json
var upload = multer(); // Store files in memory as Buffer objects
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

// Constructs a project from an uploaded .proto file
app.post("/new-project", upload.single("protofile"), function(req, res, next) {
  // Extract file name
  var name = req.file.originalname.replace(".proto", "");
  // Extract .proto as string
  var proto = req.file.buffer.toString();
  // Store
  db.projects.insertAsync({name: name, proto: proto}, {})
  .then(function() {
    res.send("New project successfully created - please return to the homepage.");
  })
  .catch(function(err) {
    next(err);
  });
});

// Gets HTML form input type for proto types
var getFormType = function(type) {
  if (type === "double" || type === "float" || type === "int32" || type === "int64" || type === "uint32" || type === "uint64" || type === "sint32" || type === "sint64" || type === "fixed32" || type === "fixed64" || type === "sfixed32" || type === "sfixed64") {
    return "number";
  } else if (type === "bool" || type === "string" || type === "bytes") {
    return "text";
  } else if (type === "enum") {
    return "select";
  } else if (type === "message") {
    return "fieldset";
  }
};

// Processes fields recursively
var procFields = function(builder, name, formFields) {
  // Use reflection
  var reflector = builder.lookup(name);
  var fields = reflector.getChildren(ProtoBuf.Reflect.Message.Field);

  while (fields.length !== 0) {
    var field = fields.shift(); // Get first field
    var fieldObj = {
      name: field.name,
      type: getFormType(field.type.name)
    };
    // Process enums
    if (fieldObj.type === "select") {
      var enums = field.resolvedType.children;
      var enumVals = [];
      enums.forEach(function(enumObj) {
        enumVals.push(enumObj.name);
      });
      fieldObj.values = enumVals;
    }
    // Process messages recursively
    if (fieldObj.type === "fieldset") {
      var messageName = field.resolvedType.name;
      procFields(builder, name + "." + messageName, formFields);
    } else {
      formFields.push(fieldObj);
    }
  }
  return formFields;
};

// Project page
app.get("/projects/:id", function(req, res, next) {
  db.projects.findByIdAsync(req.params.id)
  .then(function(result) {
    var builder = ProtoBuf.loadProto(result.proto);
    // Use reflection to construct form
    var formFields = procFields(builder, result.name, []);
    //var Project = processProto(result.name, result.proto);
    //var p = new Project();
    res.render("project", {project: result, form: formFields});
  })
  .catch(function(err) {
    next(err);
  });
});

// List experiments
app.get("/experiments", function(req, res, next) {
  db.experiments.find({}, {sort: [["timestamp", 1]]}).toArrayAsync()
  .then(function(results) {
    res.render("experiments", {experiments: results});
  })
  .catch(function(err) {
    next(err);
  });
});

// List details of single experiment
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
server.listen(process.env.PORT); // Listen for connections

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
