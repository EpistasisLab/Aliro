/* Modules */
var http = require("http");
var path = require("path");
var EventEmitter = require("events").EventEmitter;
var mediator = new EventEmitter();
var _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var compression = require("compression");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var rp = require("request-promise");
var Promise = require("bluebird");
var socketServer = require("./socketServer").socketServer;
var emitEvent = require("./socketServer").emitEvent;
var WebSocketServer = require("ws").Server;
var db = require("./db").db;
var generateFeatures = require("./metafeatureGenerator").generateFeatures;
var Q = require("q");
var users = require("./users");
var fs = require("fs");
/* App instantiation */
var app = express();
var jsonParser = bodyParser.json({
    limit: '100mb'
}); // Parses application/json
var upload = multer(); // Store files in memory as Buffer objects
//app.set('superSecret',config.secret);
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(compression()); // Compress all Express requests
app.use(favicon(path.join(__dirname, "www/favicon.ico"))); // Deal with favicon requests
app.use(express.static(path.join(__dirname, "www"), {
    index: false,
    maxAge: '1d'
})); // Static directory
app.set('appPath', path.join(path.normalize(__dirname), '/www'));
app.use(express.static(app.get('appPath')));
app.use(morgan("tiny")); // Log requests

/* API */

// Registers webhooks
app.post("/api/v1/webhooks", jsonParser, (req, res) => {
    // Parse webhook request
    var webhook = req.body;
    var url = webhook.url;
    var objects = webhook.objects;
    var event = webhook.event;
    var objId = webhook.object_id;

    // Use John Gruber's URL regex
    var urlRegEx = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)\S+(?:[^\s`!\[\]{};:'".,?«»“”‘’]))/ig;
    // Validate
    if (!url || !urlRegEx.test(url)) {
        res.status(400);
        return res.send({
            error: "Invalid or empty URL"
        });
    } else if (objects !== "experiments") {
        res.status(400);
        return res.send({
            error: "Object is not 'experiments'"
        });
    } else if (event !== "started" && event !== "finished") {
        res.status(400);
        return res.send({
            error: "Event is not 'started' or 'finished'"
        });
    } else if (!objId) {
        // TODO Check object exists
        res.status(400);
        return res.send({
            error: "No object ID provided"
        });
    }

    // Register with mediator
    mediator.once(objects + ":" + objId + ":" + event, () => {
        // Send webhook response
        rp({
                uri: webhook.url,
                method: "POST",
                json: webhook,
                gzip: true
            })
            .catch(() => {}); // Ignore failures from missing webhooks
    });
    res.status(201);
    return res.send({
        status: "Registered",
        options: webhook
    });
});

// Downloads file
app.get("/api/v1/files/:id", (req, res, next) => {
    // Open file
    var gfs = new db.GridStore(db, db.toObjectID(req.params.id), "r", {
        promiseLibrary: Promise
    });
    gfs.open((err, gfs) => {
        if (!err) {
            // Set read head pointer to beginning of file
            gfs.seek(0, () => {
                // Read entire file
                gfs.read()
                    .then((file) => {
                        res.setHeader("Content-Disposition", "attachment; filename=" + gfs.filename); // Set as download
                        res.setHeader("Content-Type", gfs.metadata.contentType); // MIME Type
                        res.send(file); // Send file
                    })
                    .catch((err) => {
                        next(err);
                    });
            });
        } else {
            console.log('error loading file');
            console.log(req);
            console.log(err);
            res.send([]);
        }
    });
});

// Get file metafeatures
app.get("/api/v1/files/:id/metafeatures", (req, res, next) => {
    var metafeatures = db.datasets.findByIdAsync(req.params.id, {metafeatures: 1})
    res.send(metafeatures)
});


// Get collection for all API db-based endpoints
app.param("apipath", (req, res, next, apipath) => {
    req.responder = require("./api/default").responder;
    return next();
});
// Get collection for all API db-based endpoints
app.param("collection", (req, res, next, collection) => {
    req.collection = db.collection(collection);
    return next();
});
// List projects and machines in api
app.get("/api/v1/projects", (req, res, next) => {

    var projP = db.projects.find({}, {}).sort({
        name: 1
    }).toArrayAsync(); // Get project names
    Promise.all(projP)
        .then((results) => {
            return res.send(results);
        })
        .catch((err) => {
            return next(err);
        });
});
// List projects and machines in api
app.post("/api/v1/projects", (req, res, next) => {

    var projP = db.projects.find({}, {
        schema: 1
    }).sort({
        name: 1
    }).toArrayAsync(); // Get project names
    Promise.all(projP)
        .then((results) => {
            return res.send(results);
        })
        .catch((err) => {
            return next(err);
        });
});



/**
* Add datasets to the database.
* 
* @param _files - dataset files
* @param _metadata - json
*    dataset_id - optional.  If not provided, dataset_id is generated as the database primary key
*    name - file name
*    username - owner of the dataset
*
*/
app.put("/api/v1/datasets", upload.array("_files", "_metadata"), (req, res, next) => {
    // Retrieve list of files for experiment
    // Process files
    var metadata = JSON.parse(req.body._metadata);
    if (metadata['dataset_id'] !== undefined) {
        dataset_id = metadata['dataset_id'];
        var filesP = processDataset(req.files, dataset_id);        
        Promise.all(filesP)
            .then((results) => {
                res.send({
                    message: "Files uploaded",
                    dataset_id: dataset_id
                });
            })
            .catch((err) => {
                next(err);
            });
    } else {
        db.datasets.insertAsync({
                name: metadata.name,
                username: metadata.username,
                files: []
            }, {})
            .then((exp) => {
                var dataset_id = exp.ops[0]._id.toString(); // Add experiment ID to sent options
                var filesP = processDataset(req.files, dataset_id);
                Promise.all(filesP)
                    .then((results) => {
                        res.send({
                            message: "Files uploaded",
                            dataset_id: dataset_id
                        });
                    })
                    .catch((err) => {
                        next(err);
                    });
            });
    }

});

//toggles ai for dataset
app.put("/api/userdatasets/:id/ai", jsonParser, (req, res, next) => {
    db.datasets.updateByIdAsync(req.params.id, {
            $set: {
                ai: req.body.ai
            }
        })
        .then((result) => {
            emitEvent('aiToggled', req);

            res.send({
                message: "AI toggled for " + req.params.id
            });
        })
        .catch((err) => {
            next(err);
        });
});



// Return all entries
app.get("/api/v1/:collection", (req, res, next) => {
    req.collection.find({}).toArrayAsync()
        .then((results) => {
            res.send(results);
        })
        .catch((err) => {
            next(err);
        });
});
// Return all entries
app.get("/api/v1/:collection", (req, res, next) => {
    req.collection.find({}).toArrayAsync()
        .then((results) => {
            res.send(results);
        })
        .catch((err) => {
            next(err);
        });
});

// Create new entry
app.post("/api/v1/:collection", jsonParser, (req, res, next) => {
    req.collection.insertAsync(req.body, {})
        .then((result) => {
            res.status(201);
            res.send(result.ops[0]);
        })
        .catch((err) => {
            next(err);
        });
});


// Return a batch
app.get("/api/v1/batches/:id", (req, res, next) => {
    db.batches.findByIdAsync(req.params.id)
        .then((result) => {
            if (result._experiments !== undefined) {
                db.experiments.find({
                        '_id': {
                            $in: result._experiments
                        }
                    }).toArrayAsync()
                    .then((exp) => {
                        var num_finished = 0
                        for (var i = 0; i < exp.length; i++) {
                            if (exp[i]._status == 'success' && exp[i].best_fitness_score !== undefined) {

                                num_finished += 1
                            }
                        }
                        //write progress to the database
                        result._progress = ((num_finished) / (result._num_experiments)) * 100 + '%';
                        if (result._progress == '100%') {
                            var finished_date = new Date();
                            db.batches.updateByIdAsync(req.params.id, {
                                    $set: {
                                        _finished: finished_date,
                                        _status: 'success',
                                    }
                                })
                                .catch((err) => {
                                    next(err);
                                });
                        }

                        result._experiments = exp;
                        res.send(result);
                    })
                    .catch((err) => {
                        next(err);
                    });
            } else {
                res.send(result);
            }
        })
        .catch((err) => {
            next(err);
        });
});


// Return single entry
app.get("/api/v1/:collection/:id", (req, res, next) => {
    req.collection.findByIdAsync(req.params.id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            next(err);
        });
});



// Update existing entry
app.put("/api/v1/:collection/:id", jsonParser, (req, res, next) => {
    delete req.body._id; // Delete ID (will not update otherwise)
    req.collection.updateByIdAsync(req.params.id, {
            $set: req.body
        })
        .then((result) => {
            if (req.params.collection === 'experiments') {
                if (req.body._scores) {
                    emitEvent('expUpdated', req);
                } else if (req.body._status != 'running') {
                    emitEvent('expUpdated', req);
                }
            }

            // Update returns the count of affected objects
            res.send((result === 1) ? {
                msg: "success"
            } : {
                msg: "error"
            });
        })
        .catch((err) => {
            next(err);
        });
});

// Delete existing entry
app.delete("/api/v1/:collection/:id", (req, res, next) => {
    req.collection.removeByIdAsync(req.params.id)
        .then((result) => {
            // Remove returns the count of affected objects
            res.send((result === 1) ? {
                msg: "success"
            } : {
                msg: "error"
            });
        })
        .catch((err) => {
            next(err);
        });
});



// Experiment page
app.get("/api/v1/experiments/:id", (req, res, next) => {
    db.experiments.findByIdAsync(req.params.id)
        .then((result) => {
            var projP = db.projects.findByIdAsync(result._project_id, {
                name: 1
            }); // Find project name
            var macP = db.machines.findByIdAsync(result._machine_id, {
                hostname: 1,
                address: 1
            }); // Find machine hostname and address
            Promise.all([projP, macP])
                .then((results) => {
                    res.return("experiment", {
                        experiment: result,
                        project: results[0],
                        machine: results[1]
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});

app.get("/api/v1/experiments/:id/model", (req, res, next) => {
    let filePrefix = "model_"
    db.experiments.findByIdAsync(req.params.id, {"files": 1})
        .then((result) => {
            if(result === null) {
                res.status(400);
                res.send({ error: "Experiment " + req.params.id + " does not exist"});
                return;
            }
            for(let i=0; i<result.files.length; i++){
                if(result.files[i].filename.includes(filePrefix)) {
                    res.send(result.files[i])
                    return;
                }
            }
            res.status(400);
            res.send({error: "'" + filePrefix + "' file for experiment " + req.params.id + " does not exist"});
            return;
        })
        .catch((err) => {
            next(err);
        });
});

app.get("/api/v1/experiments/:id/script", (req, res, next) => {
    let filePrefix = "scripts_"
    db.experiments.findByIdAsync(req.params.id, {"files": 1})
        .then((result) => {
            if(result === null) {
                res.status(400);
                res.send({ error: "Experiment " + req.params.id + " does not exist"});
                return;
            }
            for(let i=0; i<result.files.length; i++){
                if(result.files[i].filename.includes(filePrefix)) {
                    res.send(result.files[i])
                    return;
                }
            }
            res.status(400);
            res.send({error: "'" + filePrefix + "' file for experiment " + req.params.id + " does not exist"});
            return;
        })
        .catch((err) => {
            next(err);
        });
});


// Return all experiments for a project
app.get("/api/v1/projects/:id/experiments", (req, res, next) => {
    db.experiments.find({
            _project_id: db.toObjectID(req.params.id)
        }).toArrayAsync() // Get experiments for project
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            next(err);
        });
});

// Delete all experiments for a project
app.delete("/api/v1/projects/:id/experiments", (req, res, next) => {
    db.experiments.removeAsync({
            _project_id: db.toObjectID(req.params.id)
        }) // Get experiments for project
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            next(err);
        });
});

// Gets the status of an experiment
app.get("/api/v1/experiments/:id/status", (req, res, next) => {
    db.experiments.findByIdAsync(req.params.id, {
            _status: 1
        })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            next(err);
        });
});

// TODO Consider renaming API endpoint
// Constructs a project from an uploaded .json file
app.post("/api/v1/projects/schema", upload.single("schema"), (req, res, next) => {
    // Extract file name
    var name = req.file.originalname.replace(".json", "");
    // Extract .json as object
    var schema = JSON.parse(req.file.buffer.toString());
    // Set category as empty
    var category = 'ML';

    // Store
    db.projects.insertAsync({
            name: name,
            schema: schema,
            category: category
        }, {})
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            next(err);
        });
});

// Adds a category for an existing project
app.put("/api/v1/projects/:id/category", jsonParser, (req, res, next) => {
    db.projects.updateByIdAsync(req.params.id, {
            $set: {
                category: req.body.category
            }
        })
        .then((result) => {
            res.send((result.ok === 1) ? {
                msg: "success"
            } : {
                msg: "error"
            });
        })
        .catch((err) => {
            next(err);
        });
});

var optionChecker = (schema, obj) => {
    //console.log('schema');
    //console.log(schema);
    //console.log('obj');
    //console.log(obj);
    /*for (var prop in schema) {
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
        // changed to accept bool as either boolean type or string type
        if (val !== true && val !== false && val != "true" && val != "false") {
          return {error: "Field " + prop + " of type " + type + " is invalid"};
        }
      } else if (type === "string") {
        if (val.length === 0) {
          return {error: "Field " + prop + " of type " + type + " is invalid"};
        }
      } else if (type === "enum") {
          // changed to allow check for both single and multiple val(s)
          var selected = val.split(',');
          for(var i = 0; i < selected.length; i++) {
            if (schemaField.values.indexOf(selected[i]) === -1) {
              return {error: "Field " + prop + " of type " + type + " is invalid"};
            }
          }
      }
    var prevExp = retPrevExp(projId, options, datasetId);
    Promise.all(prevExp)
        .then((results) => {
            if (results.length >= 1) {
                error = {
                    error: "already exists"
                };
                console.log(error);
                return error;
            } else {
                console.log(results);
            }
    );
    }*/
    return {
        success: "Options validated"
    };
};
var retPrevExp = function(projId, options, datasetId) {
    return db.experiments.find({
        _dataset_id: db.toObjectID(datasetId),
        _project_id: db.toObjectID(projId),
        _options: options,
        _status: "success"
    }).toArrayAsync(); // Get project names
}

var submitJob = (projId, options, files, datasetId, username) => {
    //console.log("submitJob (", projId, options, files, datasetId, username, ")");

    //check for duplicate experiments
    return new Promise((resolve, reject) => {

        //if ((!datasetId || datasetId == undefined || datasetId == "") && (dataset['files'] === undefined || dataset['files'].length == 0)){
        if (!datasetId || datasetId == undefined || datasetId == "") {
            reject({
                error: "Experiment failed to run: datasetId not defined"
            });
            return;
        }

        // find machines that could potentally handle the project
        db.machines.find({
            //_project_id: db.toObjectID(projId)
            }, {
                address: 1
            }).toArrayAsync() // Get machine hostnames
            .then((machines) => {
                console.log("===machines: ", machines)
                console.log("===machines.projects: ", machines.projects)

                if (machines.length == 0) {
                    reject({
                        error: "Experiment failed to run: project '" + projId + "' not suppored by any machine."
                    });
                    return;
                }

                // Check machine capacities
                var macsP = Array(machines.length);
                for (var i = 0; i < machines.length; i++) {
                    macsP[i] = rp({
                        uri: machines[i].address + "/projects/" + projId + "/capacity",
                        method: "GET",
                        data: null
                    });
                }

                // Loop over reponses
                Promise.any(macsP)
                    // First machine with capacity, so use
                    .then((availableMac) => {
                        availableMac = JSON.parse(availableMac);

                        // Create experiment
                        db.experiments.insertAsync({
                                _options: options,
                                _dataset_id: db.toObjectID(datasetId),
                                _project_id: db.toObjectID(projId),
                                _machine_id: db.toObjectID(availableMac._id),
                                username: username,
                                files: [],
                                _status: "running"
                            }, {})
                            .then((exp) => {
                                options._id = exp.ops[0]._id.toString(); // Add experiment ID to sent options

                                if (datasetId == "") {
                                    var filesP = processExperimentFiles(exp.ops[0], files); // Add files to project
                                } else {
                                    var filesP = linkDataset(exp.ops[0], datasetId); // Add files to project
                                }
                                // Wait for file upload to complete
                                Promise.all(filesP)
                                    .then(() => {
                                        // Send project
                                        rp({
                                                uri: availableMac.address + "/projects/" + projId,
                                                method: "POST",
                                                json: options,
                                                gzip: true
                                            })
                                            .then((body) => {
                                                resolve(body);
                                            })
                                            .catch(() => {
                                                db.experiments.removeByIdAsync(exp.ops[0]._id); // Delete failed experiment
                                                reject({
                                                    error: "Experiment failed to run"
                                                });
                                            });
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    });
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    })
                    // No machines responded, therefore fail
                    .catch(() => {
                        reject({
                            error: "No machine capacity available"
                        });
                    });
            })
            .catch((err) => {
                reject(err);
            });
    });
    //};
};

// Constructs an experiment
app.post("/api/v1/projects/:id/experiment", jsonParser, upload.array("_files"), (req, res, next) => {
    var projId = req.params.id;
    var dataset;
    var ai_score;

    users.returnUserData(req)
        .then((user) => {
            var username = user['username'];
            db.projects.findByIdAsync(projId, {
                    schema: 1
                })
                .then((project) => {
                    if (project === null) {
                        res.status(400);
                        res.send({
                            error: "Project ID " + projId + " does not exist"
                        });
                    } else {
                        var obj = Object.assign(req.query, req.body);

                        if (obj['parameters']) {
                            old_obj = obj;
                            obj = new Object(obj['parameters']);
                            obj['dataset'] = old_obj['dataset_id'];
                            ai_score = old_obj['ai_score'];
                            dataset = old_obj['dataset_id']
                            username = old_obj['username'];
                        }
                        if ("dataset" in obj) {
                            dataset = obj['dataset'];
                            delete obj['dataset'];
                        }
                        var files = req.files;

                        if (dataset === undefined) {
                            res.status(500);
                            res.send({
                                error: "Parameter body.'dataset' or param.'dataset_id' must be defined"
                            });
                        }

                        // Validate
                        var validation = optionChecker(project.schema, obj, dataset);
                        if (validation.error) {
                            res.status(400);
                            res.send(validation);
                        } else {
                            //console.log(projId, obj, files, dataset, username);
                            submitJob(projId, obj, files, dataset, username)
                                .then((resp) => {
                                    res.status(201);
                                    res.send(resp);
                                })
                                .catch((err) => {
                                    // TODO Check comprehensiveness of error catching
                                    if (err.error === "No machine capacity available") {
                                        res.status(501);
                                        res.send(err);
                                    } else if ((err.error !== undefined) && err.error.startsWith("Experiment failed to run")) {
                                        res.status(500);
                                        res.send(err);
                                    }
                                     else {
                                        //next(err);
                                        res.status(500);
                                        res.send({
                                            error: "Experiment failed to run: unknown error from submitJob()"
                                        });
                                    }
                                });

                                        
                        }
                    }
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});

// Submit job with retry
var submitJobRetry = function(projId, options, batch_id, retryT) {
    submitJob(projId, options)
        .then((foo) => {
            // Update batch with experiment id
            experiment_id = foo._id.toString();
            db.batches.updateByIdAsync(batch_id, {
                    $push: {
                        _experiments: db.toObjectID(experiment_id)
                    }
                })
                .then((result) => {
                    // Update returns the count of affected objects
                    res.send((result === 1) ? {
                        msg: "success"
                    } : {
                        msg: "error"
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch(() => {
            // Retry in a random interval
            setTimeout(() => {
                submitJobRetry(projId, options, batch_id, retryT);
            }, retryT * Math.random());
        });
};

// Constructs a batch job from a list of options
app.post("/api/v1/projects/:id/batch", jsonParser, (req, res, next) => {
    var num_experiments = req.body.length;
    var projId = req.params.id;
    var retryTimeout = parseInt(req.query.retry);
    var dataset;
    // Set default as 5 seconds
    if (isNaN(retryTimeout) || retryTimeout <= 0) {
        retryTimeout = 5;
    }
    // Check project actually exists
    db.projects.findByIdAsync(projId, {
            schema: 1
        })
        .then((project) => {
            if (project === null) {
                res.status(400);
                res.send({
                    error: "Project ID " + projId + " does not exist"
                });
            } else {
                var expList = req.body;
                // Validate
                var validationList = [];
                for (var i = 0; i < expList.length; i++) {
                    var validation = optionChecker(project.schema, expList[i], dataset);
                    if (validation.error) {
                        validationList.push(validation);
                    }
                }
                if (validationList.length > 0) {
                    res.status(400);
                    res.send(validationList[0]); // Send first validation error       
                } else {
                    // Create batch
                    db.batches.insertAsync({
                            _project_id: db.toObjectID(projId),
                            _status: "running",
                            _num_experiments: num_experiments,
                            _started: new Date()
                        }, {})
                        .then((result) => {
                            batch_id = result.ops[0]._id.toString();
                            for (var j = 0; j < expList.length; j++) {
                                submitJobRetry(projId, expList[j], batch_id, retryTimeout);
                            }
                            res.send({
                                status: "Started",
                                _id: batch_id
                            });
                            res.send(result);
                        })
                        .catch((err) => {
                            next(err);
                        });
                    // Loop over jobs
                }
            }
        })
        .catch((err) => {
            next(err);
        });
});

// Adds started time to experiment
app.put("/api/v1/experiments/:id/started", (req, res, next) => {
    mediator.emit("experiments:" + req.params.id + ":started"); // Emit event

    db.experiments.updateByIdAsync(req.params.id, {
            $set: {
                _started: new Date()
            }
        })
        .then((result) => {
            emitEvent('expStarted', req);

            // Update returns the count of affected objects
            res.send((result === 1) ? {
                msg: "success"
            } : {
                msg: "error"
            });
        })
        .catch((err) => {
            next(err);
        });
});

// Adds finished time to experiment
app.put("/api/v1/experiments/:id/finished", (req, res, next) => {
    mediator.emit("experiments:" + req.params.id + ":finished"); // Emit event

    db.experiments.updateByIdAsync(req.params.id, {
            $set: {
                _finished: new Date()
            }
        })
        .then((result) => {
            // Update returns the count of affected objects
            res.send((result === 1) ? {
                msg: "success"
            } : {
                msg: "error"
            });
        })
        .catch((err) => {
            next(err);
        });
});

var processExperimentFiles = function(experiment, files) {
    var filesP = [];
    if (files !== undefined) {
        filesP = Array(files.length);

        var _saveGFSFile = function(fileId, fileObj, replace) {
            // Open new file
            var gfs = new db.GridStore(db, fileId, fileObj.originalname, "w", {
                metadata: {
                    contentType: fileObj.mimetype
                },
                promiseLibrary: Promise
            });
            gfs.open((err, gfs) => {
                if (err) {
                    console.log(err);
                } else {
                    // Write from buffer and flush to db
                    gfs.write(fileObj.buffer, true)
                        .then((gfs) => {
                            if (!replace) {
                                // Save file reference
                                filesP[i] = db.experiments.updateByIdAsync(experiment._id, {
                                    $push: {
                                        files: {
                                            _id: gfs.fileId,
                                            filename: gfs.filename,
                                            mimetype: gfs.metadata.contentType,
                                            timestamp: Date.now()
                                        }
                                    }
                                });
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            });
        };

        var saveGFSFile = function(fileObj) {
            // Check if file needs to be replaced
            var oldFile = _.find(experiment.files, {
                filename: fileObj.originalname
            });
            if (oldFile) {
                // Delete old file
                var gfs = new db.GridStore(db, oldFile._id, "w", {
                    promiseLibrary: Promise
                });
                gfs.unlinkAsync()
                    .then(() => {
                        _saveGFSFile(oldFile._id, fileObj, true);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                // Save new file with new ID
                _saveGFSFile(new db.ObjectID(), fileObj, false);
            }
        };

        for (var i = 0; i < files.length; i++) {
            saveGFSFile(files[i]); // Save file in function closure
        }
    }

    return filesP;
};
// sorts an array of objects according to one field
// call like this: sortObjArray(myArray, "name" );
// it will modify the input array
sortObjArray = function(arr, field) {
    //console.log(arr['timestamp']);
    return arr.sort(
        function compare(a, b) {
            if (a[field] > b[field])
                return -1;
            if (a[field] < b[field])
                return 1;
            return 0;
        }
    );
}

// call like this: uniqueDishes = removeDuplicatesFromObjArray(dishes, "dishName");
// it will NOT modify the input array
// input array MUST be sorted by the same field (asc or desc doesn't matter)
removeDuplicatesFromObjArray = function(arr, field) {
    var u = [];
    arr.reduce(function(a, b) {
        if (a[field] !== b[field]) u.push(b);
        return b;
    }, []);
    return u;
}


//associate files from a  dataset with an experiment
var linkDataset = function(experiment, datasetId) {
    var filesP = [];
    db.datasets.findByIdAsync(datasetId, {
            files: 1
        })
        .then((dataset) => {
            if (dataset && (dataset['files'] !== undefined)) {
            //if (dataset['files'] !== undefined) {
                untrimmed = dataset['files'];
                //sort and trim to get latest unique files
                sorted = sortObjArray(sortObjArray(untrimmed, 'filename'), 'timestamp');
                files = removeDuplicatesFromObjArray(sorted, 'filename');
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file['mimetype'] && file['mimetype'] == "text/csv") {
                        //console.log(file['mimetype']);
                        filesP[i] = db.experiments.updateByIdAsync(experiment._id, {
                            $push: {
                                files: file
                            }
                        });
                    }
                };
            }
        })
    return filesP;
};

/**
* process files for a dataset
*
*/
var processDataset = function(files, dataset_id) {
    metadataP = Array(files.length);
    ready = Promise.resolve(null);
    obj = {};
    promises = [];
    files.forEach(function(fileObj, i) {
        fileId = new db.ObjectID();
        metadata = []

        var mfRes = generateFeatures(fileObj)
        if (mfRes.success) {
            db.datasets.updateByIdAsync(dataset_id, {$set : {metafeatures: mfRes.data}})
            console.log("setting metafeatures for dataset " + dataset_id)
        }
        else {
            console.log(`Error getting metafeatures for dataset ${dataset_id}, error: ${mfRes.error}`)
        }

        var gfs = new db.GridStore(db, fileId, fileObj.originalname, "w", {
            metadata: {
                contentType: fileObj.mimetype
            },
            promiseLibrary: Promise
        });
        // ready = ready.then(function() {
        var file_open = gfs.open((err, res1) => {
            if (err) {
                console.log(err);
            } else {
                // Write from buffer and flush to db
                var file_write = res1.write(fileObj.buffer, true)
                    .then((gfs) => {
                        // Save file reference
                        db.datasets.updateByIdAsync(dataset_id, {
                            $push: {
                                files: {
                                    _id: gfs.fileId,
                                    filename: gfs.filename,
                                    mimetype: gfs.metadata.contentType,
                                    timestamp: Date.now()
                                }
                            }
                        });
                    });

                //db.events.update( { "user_id" : "714638ba-2e08-2168-2b99-00002f3d43c0" }, 
                //{ $push : { "events" : { "profile" : 10, "data" : "X"}}}, {"upsert" : true

                promises.push(file_write);
            }
        });
        promises.push(file_open);

        //});
    });
    return (promises);
};



// Processess files for an experiment
app.put("/api/v1/experiments/:id/files", upload.array("files"), (req, res, next) => {
    // Retrieve list of files for experiment
    db.experiments.findByIdAsync(req.params.id, {
            files: 1
        })
        .then((experiment) => {

            // Process files
            var filesP = processExperimentFiles(experiment, req.files);

            // Check file promises
            Promise.all(filesP)
                .then(() => {
                    res.send({
                        message: "Files uploaded"
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
});

// Delete all files for an experiment
app.delete("/api/v1/experiments/:id/files", (req, res, next) => {
    db.experiments.findByIdAsync(req.params.id, {
            files: 1
        })
        .then((experiment) => {
            var filesP = Array(experiment.files.length);

            for (var i = 0; i < experiment.files.length; i++) {
                var gfs = new db.GridStore(db, experiment.files[i]._id, "w", {
                    promiseLibrary: Promise
                });
                filesP[i] = gfs.unlinkAsync();
            }

            // Check file promises
            Promise.all(filesP)
                .then(() => {
                    res.send({
                        message: "Files deleted"
                    });
                })
                .catch((err) => {
                    console.log(err);
                    next(err);
                });
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
});

// Delete all files for a project
app.delete("/api/v1/projects/:id/experiments/files", (req, res, next) => {
    db.experiments.find({
            _project_id: db.toObjectID(req.params.id)
        }).toArrayAsync() // Get experiments for project
        .then((experiments) => {
            var numFiles = 0;
            for (var i = 0; i < experiments.length; i++) {
                numFiles += experiments[i].files.length;
            }
            var filesP = Array(numFiles);

            // Loop over experiments
            var fileIndex = 0;
            for (var j = 0; j < experiments.length; j++) {
                var experiment = experiments[j];
                // Loop over files
                for (var k = 0; k < experiment.files.length; k++) {
                    var gfs = new db.GridStore(db, experiment.files[k]._id, "w", {
                        promiseLibrary: Promise
                    });
                    filesP[fileIndex++] = gfs.unlinkAsync();
                }
            }

            // Check file promises
            Promise.all(filesP)
                .then(() => {
                    res.send({
                        message: "Files deleted"
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});


/*
// Registers machine projects
app.post("/api/v1/machines/:id/projects", jsonParser, (req, res, next) => {
  db.machines.findByIdAsync(req.params.id)
  .then((result) => {
    // Fail if machine does not exist
    if (result === null) {
      res.status(404);
      return res.send({error: "Machine ID " + req.params.id + " does not exist"});
    }
    // Register projects otherwise
    db.machines.updateByIdAsync(req.params.id, {$set: req.body})
    .then((result) => {
      // Update returns the count of affected objects
      res.send((result === 1) ? {msg: "success"} : {msg: "error"});
    })
    .catch((err) => {
      next(err);
    });
  })
  .catch((err) => {
    next(err);
  });
});
*/
// Registers machine projects
app.post("/api/v1/machines/:id/projects", jsonParser, (req, res, next) => {


    var projP = db.projects.find({}, {
        name: 1,
        category: 1
    }).sort({
        name: 1
    }).toArrayAsync(); // Get project names

    var macP = db.machines.findByIdAsync(req.params.id);

    Q.allSettled([macP, projP]).then((result) => {

        //console.log("/api/v1/machines/:id/projects")

        var machines = result[0].value;
        var project_records = result[1].value;
        var project_caps = req.body.projects
        var projects = {};

        //console.log("project_records", project_records)
        //console.log("project_caps", project_caps)

        for (var i in project_records) {
            var project_record = project_records[i];
            //console.log(project_record);
            for (var j in project_caps) {
                var project_cap = project_caps[j];
                if(project_record['name'] == project_cap['name']) {
                    projects[project_record['_id']] = project_cap;
                }
                //console.log(project_cap);
            };
        }

        console.log("Registering projects:", projects)

        // Fail if machine does not exist
        if (machines === null) {
            res.status(404);
            return res.send({
                error: "Machine ID " + req.params.id + " does not exist"
            });
        }
        // Register projects otherwise
        db.machines.updateByIdAsync(req.params.id, {
                $set: {
                    projects
                }
            })
            .then((result) => {
                // Update returns the count of affected objects
                res.send((result.n === 1) ? {
                    msg: "success",
                    projects: projects,
                } : {
                    msg: "error"
                });
            })
            .catch((err) => {
                next(err);
            });
    })
    .catch((err) => {
        console.log(Err);
        next(err);
    });
});

/* Rendering Routes */

// React app
/*app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'www', 'index.html'));
});*/

// List projects and machines on homepage
app.get("/oldui", (req, res, next) => {
    var category = req.query.cat;

    if (!category) {
        return res.render("base-index");
    }

    var projP = db.projects.find({
        category: category.toUpperCase()
    }, {
        name: 1
    }).sort({
        name: 1
    }).toArrayAsync(); // Get project names
    var macP = db.machines.find({}, {
        address: 1,
        hostname: 1
    }).sort({
        hostname: 1
    }).toArrayAsync(); // Get machine addresses and hostnames
    Promise.all([projP, macP])
        .then((results) => {
            return res.render("index", {
                projects: results[0],
                machines: results[1]
            });
        })
        .catch((err) => {
            return next(err);
        });



});

// List projects and machines on admin page
app.get("/admin", (req, res, next) => {
    var projP = db.projects.find({}, {
        name: 1,
        category: 1
    }).sort({
        name: 1
    }).toArrayAsync(); // Get project names
    var macP = db.machines.find({}, {
        address: 1,
        hostname: 1
    }).sort({
        hostname: 1
    }).toArrayAsync(); // Get machine addresses and hostnames
    Promise.all([projP, macP])
        .then((results) => {
            return res.render("admin", {
                projects: results[0],
                machines: results[1]
            });
        })
        .catch((err) => {
            return next(err);
        });
});

// Project page (new experiment)
app.get("/projects/:id", (req, res, next) => {
    db.projects.findByIdAsync(req.params.id)
        .then((result) => {
            res.render("project", {
                project: result
            });
        })
        .catch((err) => {
            next(err);
        });
});

// Project page (optimisation)
app.get("/projects/:id/optimisation", (req, res, next) => {
    db.projects.findByIdAsync(req.params.id)
        .then((result) => {
            res.render("optimisation", {
                project: result
            });
        })
        .catch((err) => {
            next(err);
        });
});

// Project page (experiments)
app.get("/projects/:id/experiments", (req, res, next) => {
    var projP = db.projects.findByIdAsync(req.params.id);
    var expP = db.experiments.find({
        _project_id: db.toObjectID(req.params.id)
    }, {
        _scores: 1,
        _status: 1,
        _options: 1,
        _started: 1,
        _finished: 1,
        _notes: 1
    }).toArrayAsync();
    Promise.all([projP, expP])
        .then((results) => {
            res.render("experiments", {
                project: results[0],
                experiments: results[1]
            });
        })
        .catch((err) => {
            next(err);
        });
});

// Machine page
app.get("/machines/:id", (req, res, next) => {
    db.machines.findByIdAsync(req.params.id)
        .then((mac) => {
            var projKeys = _.keys(mac.projects); // Extract project IDs
            projKeys = _.map(projKeys, db.toObjectID); // Map to MongoDB IDs
            db.projects.find({
                    _id: {
                        $in: projKeys
                    }
                }, {
                    name: 1
                }).sort({
                    name: 1
                }).toArrayAsync()
                .then((projects) => {
                    // Return only projects existing in FGLab
                    res.render("machine", {
                        machine: mac,
                        projects: projects
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});


// Experiment page
app.get("/experiments/:id", (req, res, next) => {
    db.experiments.findByIdAsync(req.params.id)
        .then((result) => {
            var projP = db.projects.findByIdAsync(result._project_id, {
                name: 1
            }); // Find project name
            var macP = db.machines.findByIdAsync(result._machine_id, {
                hostname: 1,
                address: 1
            }); // Find machine hostname and address
            Promise.all([projP, macP])
                .then((results) => {
                    res.render("experiment", {
                        experiment: result,
                        project: results[0],
                        machine: results[1]
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});


// Experiment page
app.get("/batches/:id", (req, res, next) => {
    db.batches.findByIdAsync(req.params.id)
        .then((result) => {
            var projP = db.projects.findByIdAsync(result._project_id, {
                name: 1
            }); // Find project name
            var macP = db.machines.findByIdAsync(result._machine_id, {
                hostname: 1,
                address: 1
            }); // Find machine hostname and address
            Promise.all([projP, macP])
                .then((results) => {
                    res.render("experiment", {
                        experiment: result,
                        project: results[0],
                        machine: results[1]
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});

app.all("/api/:apipath/:id", jsonParser, (req, res, next) => {
    users.returnUserData(req)
        .then((user) => {
            req.params.user = user;
            req.responder(req, res)
        })
        .catch((err) => {
            next(err);
        });
});

//use api handler
app.all("/api/:apipath", jsonParser, (req, res, next) => {
    users.returnUserData(req)
        .then((user) => {
            req.params.user = user;
            req.responder(req, res);
        })
        .catch((err) => {
            next(err);
        });
});




/* Errors */
// Error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // Delegate to Express' default error handling
    }
    console.log("Unhandled error from request " + req + ": ")
    console.log("Error: " + err)
    res.status(500);
    res.send("Error: " + err);
});

/* HTTP server */
var server = http.createServer(app); // Create HTTP server
socketServer(server);
if (!process.env.LAB_PORT) {
    console.log("Error: No port specified");
    process.exit(1);
} else {
    // Listen for connections
    server.listen(process.env.LAB_PORT, () => {
        console.log("Server listening on port " + process.env.LAB_PORT);
    });
}

/* WebSocket server */
// Add websocket server
var wss = new WebSocketServer({
    server: server
});
// Catches errors to prevent FGMachine crashing if browser disconnect undetected
var wsErrHandler = function() {};

// Call on connection from new client
wss.on("connection", (ws) => {
    // Print received messages
    ws.on("message", (message) => {
        console.log(message);
    });

    // Perform clean up if necessary
    ws.on("close", () => {
        //console.log("Client closed connection");
    });
});
