/* Modules */
require("./env"); // Load configuration variables
var http = require("http");
var EventEmitter = require("events").EventEmitter;
var mediator = new EventEmitter();
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var compression = require("compression");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var rp = require("request-promise");
var Promise = require("bluebird");
//var WebSocketServer = require("ws").Server;
var db = require("./db").db;

/* App instantiation */
var app = express();
var jsonParser = bodyParser.json({limit: '100mb'}); // Parses application/json
var upload = multer(); // Store files in memory as Buffer objects
app.use(compression()); // Compress all Express requests
app.use(favicon(__dirname + "/public/favicon.ico")); // Deal with favicon requests
app.use(express.static(__dirname + "/public", {index: false, maxAge: '1d'})); // Static directory
app.use("/bower_components", express.static(__dirname + "/bower_components", {index: false, maxAge: '1d'})); // Bower components
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
  req.collection.find({}).toArrayAsync()
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
  .then(function(result) {
    res.status(201);
    res.send(result.ops[0]);
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
  req.collection.updateByIdAsync(req.params.id, {$set: req.body})
  .then(function(result) {
    // Update returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg: "error"});
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
    res.send((result === 1) ? {msg: "success"} : {msg: "error"});
  })
  .catch(function(err) {
    next(err);
  });
});

// Return all experiments for a project
app.get("/api/projects/:id/experiments", function(req, res, next) {
  db.experiments.find({_project_id: db.toObjectID(req.params.id)}).toArrayAsync() // Get experiments for project
  .then(function(result) {
    res.send(result);
  })
  .catch(function(err) {
    next(err);
  });
});

// Delete all experiments for a project
app.delete("/api/projects/:id/experiments", function(req, res, next) {
  db.experiments.removeAsync({_project_id: db.toObjectID(req.params.id)}) // Get experiments for project
  .then(function(result) {
    res.send(result);
  })
  .catch(function(err) {
    next(err);
  });
});

// Constructs a project from an uploaded .json file
app.post("/api/projects/schema", upload.single("schema"), function(req, res, next) {
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

var optionChecker = function(schema, obj) {
  for (var prop in schema) {
    var schemaField = schema[prop];
    var val = obj[prop];
    // Check field exists
    if (val === undefined) {
      return {error: "Field " + prop + " missing"};
    }
    // Check field is valid
    var type = schemaField.type;
    // int float bool string enum
    if (type === "int") {
      if (isNaN(val) ||  val % 1 !== 0) {
        return {error: "Field " + prop + " of type " + type + " is invalid"};
      }
    } else if (type === "float") {
      if (isNaN(val)) {
        return {error: "Field " + prop + " of type " + type + " is invalid"};
      }
    } else if (type === "bool") {
      if (val !== true && val !== false) {
        return {error: "Field " + prop + " of type " + type + " is invalid"};
      }
    } else if (type === "string") {
      if (val.length === 0) {
        return {error: "Field " + prop + " of type " + type + " is invalid"};
      }
    } else if (type === "enum") {
      if (schemaField.values.indexOf(val) === -1) {
        return {error: "Field " + prop + " of type " + type + " is invalid"};
      }
    }
  }
  return {success: "Options validated"};
};

var submitJob = function(projId, options) {
  return new Promise(function(resolve, reject) {
    db.machines.find({}, {address: 1}).toArrayAsync() // Get machine hostnames
    .then(function(machines) {
      var macsP = Array(machines.length);
      // Check machine capacities
      for (var i = 0; i < machines.length; i++) {
        macsP[i] = rp({uri: machines[i].address + "/projects/" + projId + "/capacity", method: "GET", data: null});
      }

      // Loop over reponses
      Promise.any(macsP)
      // First machine with capacity, so use
      .then(function(availableMac) {
        availableMac = JSON.parse(availableMac);

        // Create experiment
        db.experiments.insertAsync({_options: options, _project_id: db.toObjectID(projId), _machine_id: db.toObjectID(availableMac._id), _files: [], _status: "running"}, {})
        .then(function(exp) {
          options._id = exp.ops[0]._id.toString(); // Add experiment ID to sent options
          // Send project
          rp({uri: availableMac.address + "/projects/" + projId, method: "POST", json: options, gzip: true})
          .then(function(body) {
            resolve(body);
          })
          .catch(function() {
            db.experiments.removeByIdAsync(exp.ops[0]._id); // Delete failed experiment
            reject({error: "Experiment failed to run"});
          });
        })
        .catch(function(err) {
          reject(err);
        });
      })
      // No machines responded, therefore fail
      .catch(function() {
        reject({error: "No machine capacity available"});
      });
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

// Constructs an experiment from the form
app.post("/api/experiments/submit", jsonParser, function(req, res, next) {
  var projId = req.query.project;
  // Check project actually exists
  db.projects.findByIdAsync(projId, {schema: 1})
  .then(function(project) {
    if (project === null) {
      res.status(400);
      res.send({error: "Project ID " + projId + " does not exist"});
    } else {
      var obj = req.body;

      // Validate
      var validation = optionChecker(project.schema, obj);
      if (validation.error) {
        res.status(400);
        res.send(validation);
      } else {
        submitJob(projId, obj)
        .then(function(resp) {
          res.send(resp);
        })
        .catch(function(err) {
          // TODO Check comprehensiveness of error catching
          if (err.error === "No machine capacity available") {
            res.status(501);
            res.send(err);
          } else if (err.error === "Experiment failed to run") {
            res.status(500);
            res.send(err);
          } else {
            next(err);
          }
        });
      }
    }
  })
  .catch(function(err) {
    next(err);
  });
});

// Submit job with retry
var submitJobRetry = function(projId, options, retryT) {
  submitJob(projId, options)
  .then(function() {
    // TODO Keep track of batch jobs
  })
  .catch(function() {
    // Retry in a random 1s interval
    setTimeout(function() {
      submitJobRetry(projId, options, retryT);
    }, 1000*retryT*Math.random());
  });
};

// Constructs an optimiser from a list of options
app.post("/api/projects/optimisation", jsonParser, function(req, res, next) {
  var projId = req.query.project;
  var retryTimeout = parseInt(req.query.retry) || 60*60; // Default is an hour
  // Check project actually exists
  db.projects.findByIdAsync(projId, {schema: 1})
  .then(function(project) {
    if (project === null) {
      res.status(400);
      res.send({error: "Project ID " + projId + " does not exist"});
    } else {
      var expList = req.body;
      // Validate
      var validationList = [];
      for (var i = 0; i < expList.length; i++) {
       var validation = optionChecker(project.schema, expList[i]);
        if (validation.error) {
          validationList.push(validation);
        }
      }
      if (validationList.length > 0) {
        res.status(400);
        res.send(validationList[0]); // Send first validation error       
      } else {
        // Loop over jobs
        for (var j = 0; j < expList.length; j++) {
          submitJobRetry(projId, expList[j], retryTimeout);
        }
        res.send({status: "Started"});
      }
    }
  })
  .catch(function(err) {
    next(err);
  });
});

// Adds started time to experiment
app.put("/api/experiments/:id/started", function(req, res, next) {
  mediator.emit("experiments:" + req.params.id + ":started"); // Emit event

  db.experiments.updateByIdAsync(req.params.id, {$set: {_started: new Date()}})
  .then(function(result) {
    // Update returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg: "error"});
  })
  .catch(function(err) {
    next(err);
  });
});

// Adds finished time to experiment
app.put("/api/experiments/:id/finished", function(req, res, next) {
  mediator.emit("experiments:" + req.params.id + ":finished"); // Emit event

  db.experiments.updateByIdAsync(req.params.id, {$set: {_finished: new Date()}})
  .then(function(result) {
    // Update returns the count of affected objects
    res.send((result === 1) ? {msg: "success"} : {msg: "error"});
  })
  .catch(function(err) {
    next(err);
  });
});

// Processess files for an experiment
app.put("/api/experiments/:id/files", upload.array("_files"), function(req, res) {
  delete req.body._id; // Delete ID (will not update otherwise)
  var filesP = Array(req.files.length);

  for (var i = 0; i < req.files.length; i++) {
    var file = req.files[i];
    var fileId = new db.ObjectID(); // Create file ID
    // Open new file
    var gfs = new db.GridStore(db, fileId, file.originalname, "w", {content_type: file.mimetype, promiseLibrary: Promise});
    gfs.open(function(err, gfs) {
      if (err) {
        console.log(err);
      } else {
        // Write from buffer and flush to db
        gfs.write(file.buffer, true)
        .then(function(gfs) {
          // Save file reference
          filesP[i] = db.experiments.updateByIdAsync(req.params.id, {$push: {_files: {_id: gfs.fileId, filename: gfs.filename}}});
        })
        .catch(function(err) {
          console.log(err);
        });
      }
    });
  }

  // Check file promises
  Promise.all(filesP)
  .then(function() {
    res.send({message: "Files uploaded"});
  })
  .catch(function(err) {
    next(err);
  });
});

// Delete all files for an experiment
app.delete("/api/experiments/:id/files", function(req, res, next) {
  db.experiments.findByIdAsync(req.params.id, {_files: 1})
  .then(function(experiment) {
    var filesP = Array(experiment._files.length);

    for (var i = 0; i < experiment._files.length; i++) {
      var gfs = new db.GridStore(db, experiment._files[i]._id, "w", {promiseLibrary: Promise});
      filesP[i] = gfs.unlinkAsync();
    }

    // Check file promises
    Promise.all(filesP)
    .then(function() {
      res.send({message: "Files deleted"});
    })
    .catch(function(err) {
      console.log(err);
      next(err);
    });
  })
  .catch(function(err) {
    console.log(err);
    next(err);
  });
});

// Delete all files for a project
app.delete("/api/projects/:id/experiments/files", function(req, res, next) {
  db.experiments.find({_project_id: db.toObjectID(req.params.id)}).toArrayAsync() // Get experiments for project
  .then(function(experiments) {
    var numFiles = 0;
    for (var i = 0; i < experiments.length; i++) {
      numFiles += experiments[i]._files.length;
    }
    var filesP = Array(numFiles);

    // Loop over experiments
    var fileIndex = 0;
    for (var i = 0; i < experiments.length; i++) {
      var experiment = experiments[i];
      // Loop over files
      for (var j = 0; j < experiment._files.length; j++) {
        var gfs = new db.GridStore(db, experiment._files[j]._id, "w", {promiseLibrary: Promise});
        filesP[fileIndex++] = gfs.unlinkAsync();
      }
    }

    // Check file promises
    Promise.all(filesP)
    .then(function() {
      res.send({message: "Files deleted"});
    })
    .catch(function(err) {
      next(err);
    });
  })
  .catch(function(err) {
    next(err);
  });
});

// Registers webhooks
app.post("/api/webhooks/register", jsonParser, function(req, res, next) {
  // Parse webhook request
  var webhook = req.body;
  var url = webhook.url;
  var objects = webhook.objects;
  var event = webhook.event;
  var objId = webhook.id;

  // Use John Gruber's URL regex
  var urlRegEx = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)\S+(?:[^\s`!\[\]{};:'".,?«»“”‘’]))/ig;
  // Validate
  if (!url || !urlRegEx.test(url)) {
    res.status(400);
    return res.send({error: "Invalid or empty URL"});
  } else if (objects !== "experiments") {
    res.status(400);
    return res.send({error: "Object is not 'experiments'"});
  } else if (event !== "started" && event !== "finished") {
    res.status(400);
    return res.send({error: "Event is not 'started' or 'finished'"});
  } else if (!objId) {
    // TODO Check object exists
    res.status(400);
    return res.send({error: "No object ID provided"});
  }

  // Register with mediator
  mediator.once(objects + ":" + objId + ":" + event, function() {
    // Send webhook response
    rp({uri: webhook.url, method: "POST", json: webhook, gzip: true})
    .catch(function() {}); // Ignore failures from missing webhooks
  });
  res.status(201);
  return res.send({status: "Webhook registered: " + JSON.stringify(webhook)});
});

// Downloads file
app.get("/files/:id", function(req, res, next) {
  // Open file
  var gfs = new db.GridStore(db, db.toObjectID(req.params.id), "r", {promiseLibrary: Promise});
  gfs.open(function(err, gfs) {
    // Set read head pointer to beginning of file
    gfs.seek(0, function() {
      // Read entire file
      gfs.read()
      .then(function(file) {
        res.setHeader("Content-Disposition", "attachment; filename=" + gfs.filename); // Set as download
        res.setHeader("Content-Type", gfs.contentType); // MIME Type
        res.send(file.toString()); // Send file
      })
      .catch(function(err) {
        next(err); 
      });
    });
  });
});

/* Rendering Routes */

// List projects and machines on homepage
app.get("/", function(req, res, next) {
  var projP = db.projects.find({}, {name: 1}).sort({name: 1}).toArrayAsync(); // Get project names
  var macP = db.machines.find({}, {hostname: 1}).sort({hostname: 1}).toArrayAsync(); // Get machine hostnames
  Promise.all([projP, macP])
  .then(function(results) {
    return res.render("index", {projects: results[0], machines: results[1]});
  })
  .catch(function(err) {
    return next(err);
  });
});

// Project page (new experiment)
app.get("/projects/:id", function(req, res, next) {
  db.projects.findByIdAsync(req.params.id)
  .then(function(result) {
    res.render("project", {project: result});
  })
  .catch(function(err) {
    next(err);
  });
});

// Project page (optimisation)
app.get("/projects/:id/optimisation", function(req, res, next) {
  db.projects.findByIdAsync(req.params.id)
  .then(function(result) {
    res.render("optimisation", {project: result});
  })
  .catch(function(err) {
    next(err);
  });
});

// Project page (experiments)
app.get("/projects/:id/experiments", function(req, res, next) {
  var projP = db.projects.findByIdAsync(req.params.id);
  var expP = db.experiments.find({_project_id: db.toObjectID(req.params.id)}, {_scores: 1, _status: 1, _options: 1, _started: 1, _finished: 1}).toArrayAsync();
  Promise.all([projP, expP])
  .then(function(results) {
    res.render("experiments", {project: results[0], experiments: results[1]});
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
    var projP = db.projects.findByIdAsync(result._project_id, {name: 1}); // Find project name
    var macP = db.machines.findByIdAsync(result._machine_id, {hostname: 1, address: 1}); // Find machine hostname and address
    Promise.all([projP, macP]) 
    .then(function(results) {
      res.render("experiment", {experiment: result, project: results[0], machine: results[1]});
    })
    .catch(function(err) {
      next(err);
    });
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
if (!process.env.PORT) {
  console.log("Error: No port specified");
  process.exit(1);
} else {
  // Listen for connections
  server.listen(process.env.PORT, function() {
    console.log("Server listening on port " + process.env.PORT);
  });
}

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
