//creates a network of hosts to serve PennAI
var fs = require('fs');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var Promise = require("bluebird");
var dockerDir = '/share/devel/Gp/dockers'
var exec = require('child-process-promise').exec;
var makevars = {}
var cmds = {}
//var steps = ['stop','rm','build','create']
var steps = ['build']
var hosts = ['paix01', 'lab', 'dbredis']


//read the initialization variables from Makevars file
var initVars = function(callback) {
    fileBuffer = fs.readFileSync(dockerDir + '/Makevars');
    vars_string = fileBuffer.toString();
    vars_lines = vars_string.split("\n");
    for (i in vars_lines) {
        var line = vars_lines[i]
        var spliteded = line.split(':=');
        var name = spliteded[0];
        var val = spliteded[1];
        if (name && val) {
            makevars[name] = val;
        }
    }
    retHosts(makevars['NETWORK'], callback)
}


//create the specified network if it does not yet exist
var createNetwork = function(network, callback) {
    exec('docker network inspect ' + network)
        .then(function(result) {
            callback();
        })
        .catch(function(err) {
            exec('docker network create ' + network)
                .then(function(result2) {
                    var stdout = result2.stdout;
                    var stderr = result2.stderr;
                    console.log('stdout: ', stdout);
                    console.log('stderr: ', stderr);
                    callback();
                })

        });

}

//returns a list of existing containers for the given network
var retHosts = function(network, callback) {
    var containers = 'docker ps -a --filter network=' + makevars["NETWORK"] + ' --format \"table {{.Names}}:{{.ID}}:{{.Status}}\" | tail -n +2 | sort'
    var runner = fexec(containers);
    runner.then(function(result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        var list;
        var existing = {}
        if (stdout) {
            //                    console.log('stdout: ', stdout);
            list = stdout.trim().split('\n');
        }
        if (stderr) {
            console.log('stderr: ', stderr);
        }
        for (i in list) {
            var splitted = list[i].split(':');
            var host = splitted[0];
            var container_id = splitted[1];
            var state = splitted[2].split(" ")[0].toLowerCase();
            existing[host] = {
                'id': container_id,
                'state': state
            };
        }
        callback(existing);


    });
}


//extract build dependancy order from Dockerfiles 
var getDeps = function(dirs, callback) {
    var depends = [];
    for (i in dirs) {
        var dir = dirs[i];
        fileBuffer = fs.readFileSync(dockerDir + '/' + dir + '/Dockerfile');
        string = fileBuffer.toString();
        lines = string.split("\n");
        for (j in lines) {
            var line = lines[j]
            var splitted = line.split(' ');
            if (splitted[0] == 'FROM') {
                var requires = splitted[1].split(":")[0].split("/")
                if (requires[0] == makevars['NETWORK']) {
                    depends[dir] = requires[1];
                }
            }
        }
    }
    callback(depends);
}


// container build, run, etc.
var processDirs = function(cb) {
    createNetwork(makevars['NETWORK'], function() {
        fs.readdir(dockerDir, function(err, files) {
            var dirs = [];
            for (var index = 0; index < files.length; ++index) {
                var file = files[index];
                if (file[0] !== '.') {
                    var filePath = dockerDir + '/' + file;
                    fs.stat(filePath, function(err, stat) {
                        if (stat.isDirectory()) {
                            dirs.push(this.file);
                        }
                        if (files.length === (this.index + 1)) {
                            return cb(dirs);
                        }
                    }.bind({
                        index: index,
                        file: file
                    }));
                }
            }
        });
    });
}



//execution wrapper
var fexec = function(cmd, dir) {
    var cwd = dockerDir
    if (dir) {
        cwd = cwd + '/' + dir;
    }
    return (exec(cmd, {
        cwd: cwd
    }));
}


//execute each job and save it to the promis_array
var runJobs = function(jobs) {
    if (jobs === undefined) {
        return []
    }
    //console.log(jobs);
    var promise_array = Array(jobs.length);
    for (i in jobs) {
        var job = jobs[i];
        var name = job['name'];
        var depends = job['depends'];
        //check dependancy order
        if (name) {
            if (!depends) {
                var runner = fexec(job['cmd'], job['cwd']);
                promise_array[i] = runner;
                runner.then(function(result) {
                    var stdout = result.stdout;
                    var stderr = result.stderr;
                    if (stdout) {
                        console.log('stdout: ', stdout);
                    }
                    if (stderr) {
                        console.log('stderr: ', stderr);
                    }
                });
                //if the job depends on another job, wait for that one
            } else {
                for (j in jobs) {
                    var job2 = jobs[j];
                    if (job2['name'] && job2['name'] == depends) {
                        var runner = fexec(job['cmd'], job['cwd']);
                        promis_array.push(runner);
                        runner.then(function(result) {
                            var stdout = result.stdout;
                            var stderr = result.stderr;
                            if (stdout) {
                                console.log('stdout: ', stdout);
                            }
                            if (stderr) {
                                console.log('stderr: ', stderr);
                            }
                        });
                    }

                }


            }
        } else {
            var runner = fexec(job['cmd'], job['cwd']);
            promise_array.push(runner);
            runner.then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                if (stdout) {
                    console.log('stdout: ', stdout);
                }
                if (stderr) {
                    console.log('stderr: ', stderr);
                }
            })

        }
    }
    return promise_array;
}


var commander = function(cmd, args, cwd) {
    //skip execution if cmd is not a valid step
    if (steps.indexOf(cmd) >= 0) {
        if (cmds[cmd] === undefined) {
            cmds[cmd] = [];
        }
        cmds[cmd].push({
            cmd: "docker " + cmd + " " + args,
            //cmd: "true",
            cwd: cwd
        });
        //}
    }
}

var doBuild = function(hosts, deps, dirs, running) {
    var buildArray = Array();
    for (i in dirs) {
        var hostData = {}
        var name = dirs[i];
        if (deps[name]) {
            var depsname = deps[name];
            hostData['require'] = depsname;

        }
        if (hosts.indexOf(name) >= 0) {
            buildArray[name] = hostData;
        }
    }
    var builds = []
    for (j in buildArray) {
        if (buildArray[j]['require']) {
            var h1 = buildArray[j]['require'];
            var p1 = doBuild([buildArray[j]['require']], deps, dirs, running);
            buildArray[h1] = p1[h1];
        }
    }
    return buildArray;
}


// do it
initVars(function(running) {
    console.log('processing hosts', hosts);
    processDirs(function(dirs) {
        //Make subdirs
        for (i in dirs) {
            var makedir = dockerDir + '/' + dirs[i];
            //build continers
            var network = 'pennai';
            var tag = 'latest';
            var host = makedir.split("\/").pop();
            var build_args = '-q -t ' + makevars['NETWORK'] + '/' + host + ':' + tag + ' .';
            commander('build', build_args, dirs[i]);
            for (varname in makevars) {
                //check for <anything>_HOST variable
                var splitted = varname.split('_');
                if (splitted[1] == 'HOST') {
                    if (host == makevars[varname]) {
                        var docker_args = '';
                        for (varname_inner in makevars) {
                            docker_args = docker_args + ' -e ' + varname_inner + '=' +
                                makevars[varname_inner];
                        }
                        var portvar = splitted[0] + '_PORT';
                        if (makevars[portvar]) {
                            var port = makevars[portvar];
                            docker_args = docker_args + ' -p ' + makevars['IP'] + ':' + port + ':' + port;
                        }

                        if (host in running) {
                            var container_id = running[host]['id']
                            if (running[host]['state'] == 'up') {
                                commander('stop', container_id);
                            }
                            commander('rm', container_id);
                        }


                        var create_args = '-i -v ' + makevars['SHARE_PATH'] + ':/share/devel' +
                            docker_args + ' --hostname ' + host + ' --name ' + host +
                            ' --net ' + network + ' ' + network + '/' + host;
                        commander('create', create_args, makedir);
                        commander('start', host);
                    }
                }
            }
        }


        var getRoot = function(build, deps) {
            var retArray = []
            if (build in deps) {
                retArray = retArray.concat(getRoot(deps[build], deps))
            } else {
                retArray.push(build)
            }
            return (retArray);
        }

        deps = getDeps(dirs, function(deps) {
            var Pa = Array();
            var builds = doBuild(hosts, deps, dirs, running);
            var roots = [];
            for (build in builds) {
                var root = getRoot(build, deps);
                roots = roots.concat(root);
            }
            var rootset = new Set(roots);

            console.log('roots', rootset);
            var bs = {}
            for (cmd in cmds['build']) {
                var index = cmds['build'][cmd]['cwd'];
                bs[index] = cmds['build'][cmd]
            }
            //console.log('bs',bs)
            //console.log('c',cmds['build'])
            var ccmds = []
            for (let item of rootset) {
                ccmds.push(bs[item])
            }
            //console.log(ccmds);
            var stopP = runJobs(ccmds);
            //console.log('builds', builds);

        });



        var buildP = Array(dirs.length);
        Promise.all(buildP).then(function() {
                console.log('build done');

                var stopP = runJobs(cmds['stop']);
                Promise.all(stopP).then(function() {
                        console.log('stop done');

                        var removeP = runJobs(cmds['rm']);
                        Promise.all(removeP).then(function() {
                                console.log("remove done");

                                var createP = runJobs(cmds['create']);
                                Promise.all(createP).then(function() {
                                        console.log("create done");


                                        var startP = runJobs(cmds['start']);
                                    })
                                    .catch((errrrr) => {
                                        console.log(errrrr);
                                    });




                            })
                            .catch((errrr) => {
                                console.log(errrr);
                            });

                    })
                    .catch((errr) => {
                        console.log(errr);
                    });



            })
            .catch((err) => {
                console.log(err);
            });

    });
});