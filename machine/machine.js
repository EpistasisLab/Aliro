/* Modules */
require("./env"); // Load configuration variables
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
//var datasets = require("./datasets");
var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var EventEmitter = require("events").EventEmitter;
var mediator = new EventEmitter();
var http = require("http");
var url = require("url");
var bytes = require("bytes");
var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var cors = require("cors");
var Promise = require("bluebird");
var rp = require("request-promise");
var chokidar = require("chokidar");
var rimraf = require("rimraf");
var WebSocketServer = require("ws").Server;
const getProjects = require('./getprojects.js');


/* App instantiation */
var app = express();
var jsonParser = bodyParser.json({
    limit: "50mb"
}); // Parses application/json
app.use(morgan("tiny")); // Log requests

// Variables
var specs = {};
var projects = {};
var experiments = {};
var laburi;
var machineuri;
var project_root;
/* FGLab check */
if (process.env.PROJECT_ROOT) {
    project_root = process.env.PROJECT_ROOT
}

if (process.env.LAB_HOST && process.env.LAB_PORT) {
    laburi = 'http://' + process.env.LAB_HOST + ':' + process.env.LAB_PORT;
} else if (process.env.LAB_URL) {
    laburi = process.env.LAB_URL;
} else {
    console.log("Error: No FGLab address specified");
    process.exit(1);
}

/* FGMachine var */
if (process.env.MACHINE_HOST && process.env.MACHINE_PORT) {
    machineuri = 'http://' + process.env.MACHINE_HOST + ':' + process.env.MACHINE_PORT;
} else if (process.env.MACHINE_URL) {
    machineuri = process.env.MACHINE_URL;
} else {
    console.log("Error: No FGMachine address specified");
    process.exit(1);
}

/* Machine config */
var machine_config_file = process.env.MACHINE_CONFIG
console.log("Machine config:", machine_config_file)
var machine_config = JSON.parse(fs.readFileSync(machine_config_file, 'utf-8'));
var algorithms = machine_config["algorithms"]

/* Machine specifications */
// Attempt to read existing specs
fs.readFile("specs.json", "utf-8")
    .then((sp) => {
        specs = JSON.parse(sp);
    })
    .catch(() => {
        // Otherwise create specs
        specs = {
            address: machineuri,
            hostname: os.hostname(),
            os: {
                type: os.type(),
                platform: os.platform(),
                arch: os.arch(),
                release: os.release()
            },
            cpus: os.cpus().map((cpu) => cpu.model), // Fat arrow has implicit return
            mem: bytes(os.totalmem()),
            gpus: []
        };
        // GPU models
        if (os.platform() === "linux") {
            var lspci = spawnSync("lspci", []);
            var grep = spawnSync("grep", ["-i", "vga"], {
                input: lspci.stdout
            });
            var gpuStrings = grep.stdout.toString().split("\n");
            for (var i = 0; i < gpuStrings.length - 1; i++) {
                specs.gpus.push(gpuStrings[i].replace(/.*controller: /g, ""));
            }
        } else if (os.platform() === "darwin") {
            var system_profiler = spawnSync("system_profiler", ["SPDisplaysDataType"]);
            var profilerStrings = system_profiler.stdout.toString().split("\n");
            for (var i = 0; i < profilerStrings.length - 1; i++) {
                if (profilerStrings[i].indexOf("Chipset Model:") > -1) {
                    specs.gpus.push(profilerStrings[i].replace(/Chipset Model: /g, ""));
                }
            }
        }

        // Register details
        rp({
                uri: laburi + "/api/v1/machines",
                method: "POST",
                json: specs,
                gzip: true
            })
            .then((body) => {
                console.log("Registered with FGLab successfully");
                // Save ID and specs
                fs.writeFile("specs.json", JSON.stringify(body, null, "\t"));
                // Reload specs with _id (prior to adding projects)
                specs = body;
                project_list = getProjects(algorithms);
                var tmppath = project_root + "/machine/learn/tmp";
                if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath, 0744);
                for (var i in project_list) {
                    var algo = project_list[i].name;
                    var project_folder = tmppath + '/' + algo;
                    if (!fs.existsSync(project_folder)) fs.mkdirSync(project_folder, 0744);
                }

                // Register projects
                rp({
                        uri: laburi + "/api/v1/machines/" + specs._id + "/projects",
                        method: "POST",
                        json: {
                            projects: project_list
                        },
                        gzip: true
                    })
                    .then((msg) => {
                        console.log("Projects registered with FGLab successfully");
                        if (msg.projects !== undefined) {
                            projects = msg.projects;
                        }
                        //console.log("projects: ", projects)
                    });
            })
            .catch((err) => {
                console.log('catchup: nobody to talk to');
                console.log(err);
                process.exit();
            });
    });

    /*
    datasets management
chokidar.watch(datasets.datasets_path, {
    awaitWriteFinish: true,
    ignored: /metadata/,
}).on("all", (event, path) => {
    if (event == 'change') {
        datasets.processChangedFile(path);
    }
});


datasets.laburi = laburi
datasets.loadInitialDatasets()
*/

//max capacity
var maxCapacity = 1;
if (process.env.CAPACITY) {
    maxCapacity = process.env.CAPACITY;
}
console.log("capacity is", maxCapacity)
//console.log("projects: ", projects)


var getCapacity = function(projId) {
    var capacity = 0;
    if (projects[projId]) {
        capacity = Math.floor(maxCapacity / projects[projId].capacity);
    }
    return capacity;
};

/* Routes */
// Updates projects.json with new project ID
app.options("/projects", cors({
    origin: laburi
})); // Enable pre-flight request for PUT

// Checks capacity
app.get("/projects/:id/capacity", (req, res) => {
    var capacity = getCapacity(req.params.id);
    if(typeof projects[req.params.id] === 'undefined') {
        res.status(501);
        res.send({
            error: "Project '" + req.params.id + "' does not exist"
        });
    } else if (capacity === 0) {
        res.status(501);
        res.send({
            error: "No capacity available"
        });
    } else {
        res.send({
            capacity: capacity,
            address: specs.address,
            _id: specs._id
        });
    }
});

/**
* Get current projects
* Used for debugging to make sure machine state is in sync with lab state
*/
app.get("/projects", (req, res) => {
    res.send(projects);
});


// Starts experiment
app.post("/projects/:id", jsonParser, (req, res) => {
    // Check if capacity still available
    if(typeof projects[req.params.id] === 'undefined') {
        res.status(501);
        res.send({
            error: "Project '" + req.params.id + "' does not exist"
        });
    } else if (getCapacity(req.params.id) === 0) {
        res.status(501);
        return res.send({
            error: "No capacity available"
        });
    }

    // Process args
    var experimentId = req.body._id;
    var project = projects[req.params.id];
    var args = [];
    if (project.args !== undefined) {
        for (var i = 0; i < project.args.length; i++) {
            args.push(project.args[i]);
        }
    }
    var options = req.body;
    // Command-line parsing
    var functionParams = [];
    for (var prop in options) {
        if (project.options === "plain") {
            args.push(prop);
            args.push(options[prop]);
        } else if (project.options === "single-dash") {
            args.push("-" + prop);
            args.push(options[prop]);
        } else if (project.options === "double-dash-noequals") {
            args.push("--" + prop + " " + options[prop]);
        } else if (project.options === "double-dash") {
            args.push("--" + prop + "=" + options[prop]);
        } else if (project.options === "function") {
            functionParams.push(JSON.stringify(prop));
            functionParams.push(JSON.stringify(options[prop]));
        }
    }
    if (project.options === "function") {
        functionParams = functionParams.toString().replace(/\"/g, "'"); // Replace " with '
        args[args.length - 1] = args[args.length - 1] + "(" + functionParams + ");";
    }

    // Spawn experiment
    //  project.command = 'set'
    //  args = []
    //console.log("args")
    //console.log(args)
    var experimentErrorMessage
    var experiment = spawn(project.command, args, {
            cwd: project_root + '/' + project.cwd
        })
        // Catch spawning errors
        .on("error", (er) => {
            // Notify of failure
            rp({
                uri: laburi + "/api/v1/experiments/" + experimentId,
                method: "PUT",
                json: {
                    _status: "fail",
                    errorMessage: `Error spawning ml process: ${er}`
                },
                gzip: true
            });
            // Log error
            console.log("Error: Experiment could not start - please check projects.json");
            console.log(er)
        });

    maxCapacity -= Number(project.capacity); // Reduce capacity of machine

    rp({
        uri: laburi + "/api/v1/experiments/" + experimentId + "/started",
        method: "PUT",
        data: null
    }); // Set started
    // Save experiment
    experiments[experimentId] = experiment;

    // Log stdout
    experiment.stdout.on("data", (data) => {
        mediator.emit("experiments:" + experimentId + ":stdout", data.toString()); // Emit event
        console.log("stdout: " + data.toString());
    });
    // Log errors
    experiment.stderr.on("data", (data) => {
        var dataStr = data.toString()
        mediator.emit("experiments:" + experimentId + ":stderr", dataStr); // Emit event
        console.log("stderr: " + dataStr);
        if (dataStr.indexOf("ValueError") !== -1) {
            experimentErrorMessage = dataStr.substring(dataStr.indexOf("ValueError")).replace('\n', '').replace('\\', '')
        }
        else if(dataStr.indexOf("Traceback") !== -1) { // python exception w. traceback
            experimentErrorMessage = dataStr
        }
    });

    // List of file promises (to make sure all files are uploaded before removing results folder)
    var filesP = [];
    // Results-sending function for JSON
    var sendJSONResults = function(results) {
        return rp({
            uri: laburi + "/api/v1/experiments/" + experimentId,
            method: "PUT",
            json: JSON.parse(results),
            gzip: true
        });
    };
    // Results-sending function for other files
    var sendFileResults = function(filename) {
        // Create form data
        var formData = {
            files: []
        };
        // Add file
        formData.files.push(fs.createReadStream(filename));
        return rp({
            uri: laburi + "/api/v1/experiments/" + experimentId + "/files",
            method: "PUT",
            formData: formData,
            gzip: true
        });
    };

    // Watch for experiment folder
    var resultsDir = path.join(project_root, project.results, experimentId);
    var watcher = chokidar.watch(resultsDir, {
        awaitWriteFinish: true
    }).on("all", (event, path) => {
        if (event === "add" || event === "change") {
            if (path.match(/\.json$/)) {
                // Process JSON files
                console.log('pushing ' + path);
                filesP.push(fs.readFile(path, "utf-8").then(sendJSONResults));
                //ugly hack to prevent input files from getting uploaded
            } else if (path.match(/\.csv$/)) {
                console.log('ignoring ' + path);
            } else {
                // Store filenames for other files
                console.log('pushing ' + path);
                filesP.push(sendFileResults(path));
            }
        }
    });

    // Processes results
    experiment.on("exit", (exitCode) => {
        console.log("on exit!")
        maxCapacity += Number(project.capacity); // Add back capacity

        // Send status
        var status
        var statusMap
        if (exitCode === 0) { statusMap = {_status : "success" }}
        else if (experiment.killed) { statusMap = {_status : "cancelled" }}
        else { statusMap = {
            _status : "fail",
            errorMessage: experimentErrorMessage
        }}

        console.log(`Exit code: ${exitCode}, status: ${status}`)
        //`Process ended with exit code ${exitCode}`

        rp({
            uri: laburi + "/api/v1/experiments/" + experimentId,
            method: "PUT",
            json: statusMap,
            gzip: true
        });
        rp({
            uri: laburi + "/api/v1/experiments/" + experimentId + "/finished",
            method: "PUT",
            data: null
        }); // Set finished

        // Finish watching for files after 100s
        setTimeout(() => {
            // Close experiment folder watcher
            watcher.close();
            // Confirm upload and delete results folder to save space
            Promise.all(filesP).then(function() {
                    rimraf(resultsDir, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        }, 100000);

        // Delete experiment
        delete experiments[experimentId];
    });
    res.send(req.body);
});

// Kills experiment
app.post("/experiments/:id/kill", (req, res) => {
    console.log(`/experiments/${req.params.id}/kill`)
    if (experiments[req.params.id]) {
        if (experiments[req.params.id].killed) {
            console.log("experiment already killed")
        }
        else {
            experiments[req.params.id].kill();
            console.log("killing experiment")
        }
    }
    else { console.log("experiment process does not exist") }
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow CORS
    res.send(JSON.stringify({
        status: "killed"
    }));
});

/* HTTP Server */
var server = http.createServer(app); // Create HTTP server
if (!machineuri) {
    console.log("Error: No FGMachine address specified");
    process.exit(1);
} else {
    // Listen for connections
    var port = url.parse(machineuri).port;
    server.listen(port, () => {
        console.log("Server listening on port " + port);
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
    console.log(`wss.connection: ${ws}`)

    // Listeners
    var sendStdout = function(data) {
        ws.send(JSON.stringify({
            stdout: data
        }), wsErrHandler);
    };
    var sendStderr = function(data) {
        ws.send(JSON.stringify({
            stderr: data
        }), wsErrHandler);
    };

    // Check subscription for logs
    var expId;
    ws.on("message", (message) => {
        if (message.indexOf("experiments") === 0) {
            expId = message.split(":")[1];
            // Send stdout and stderr
            mediator.on("experiments:" + expId + ":stdout", sendStdout);
            mediator.on("experiments:" + expId + ":stderr", sendStderr);
        }
    });

    // Remove listeners
    ws.on("close", () => {
        mediator.removeListener("experiments:" + expId + ":stdout", sendStdout);
        mediator.removeListener("experiments:" + expId + ":stdout", sendStderr);
    });
});
