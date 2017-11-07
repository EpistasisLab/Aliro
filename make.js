//creates a network of hosts to serve PennAI
var fs = require('fs');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var dockerDir = '/share/devel/Gp/dockers'
var exec = require('child-process-promise').exec;
//Process variables in Makevars file
var makevars = {}
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
    var running = retRunning(makevars['NETWORK'], callback)
}

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

//returns a list of running containers for the given network
var retRunning = function(network, callback) {
    var running_containers = 'docker ps -a --filter network=' + makevars["NETWORK"] + ' --format \"table {{.Names}}:{{.ID}}:{{.Status}}\" | tail -n +2 | sort'
    var runner = fexec(running_containers);
    runner.then(function(result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        var list;
        var running = {}
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
            console.log(state);
            running[host] = {
                'id': container_id,
                'state': state
            };
        }

        callback(running);
    });
}




//extract build dependancy order from Dockerfiles 
var getState = function(dirs, callback) {
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
var processContainers = function(cb) {
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
                            //execute callback function on this directory
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


var fexec = function(cmd, cwd) {
    console.log(cmd);
    return (exec(cmd, {
        cwd: cwd
    }));
}


//execute each job and save it to the promis_array
var runJobs = function(jobs, promise_array) {
    var promise_array = Array(jobs.length);

    for (i in jobs) {
        var job = jobs[i];
        var name = job['name'];
        var depends = job['depends'];
        if (name) {
            if (!depends) {



                var runner = fexec(job['cmd'], job['cwd']);
                promise_array[i] = runner;
                runner.then(function(result) {
                    var stdout = result.stdout;
                    var stderr = result.stderr;
                    console.log(result.childProcess['spawnargs']);
                    //console.log(result.childProcess['spawnargs']);
                    if (stdout) {
                        console.log('stdout: ', stdout);
                    }
                    if (stderr) {
                        console.log('stderr: ', stderr);
                    }
                });




            } else {
                for (j in jobs) {
                    var job2 = jobs[j];
                    if (job2['name'] && job2['name'] == depends) {
                        var runner = fexec(job['cmd'], job['cwd']);
                        promise_array[i] = runner;
                        runner.then(function(result) {
                            var stdout = result.stdout;
                            var stderr = result.stderr;
                            console.log(result.childProcess['spawnargs']);
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
            promise_array[i] = runner;
            runner.then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                console.log(result.childProcess['spawnargs']);
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


// do it
initVars(function(running) {
    console.log(running);
    processContainers(function(dirs) {
        //Make subdirse
        var buildP = Array(dirs.length);
        var cmds = {}
        cmds['create'] = [];
        cmds['build'] = [];
        cmds['start'] = [];
        cmds['stop'] = [];
        cmds['rm'] = [];
        for (i in dirs) {
            var makedir = dockerDir + '/' + dirs[i];
            //build continers
            var network = 'pennai';
            var tag = 'latest';
            var host = makedir.split("\/").pop();
            var build = 'true';
            //var build = 'docker build -q -t ' + makevars['NETWORK'] + '/' + host + ':' + tag + ' .';
            cmds['build'].push({
                cmd: build,
                cwd: makedir,
                name: host
            });
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

                                var stop = "docker stop " + container_id;
                                cmds['stop'].push({
                                    cwd: makedir,
                                    cmd: stop
                                });

                            }



                            var rm = "docker rm " + container_id;
                            cmds['rm'].push({
                                cwd: makedir,
                                cmd: rm
                            });

                        }

                        var create = 'docker create -i -v ' + makevars['SHARE_PATH'] + ':/share/devel' +
                            docker_args + ' --hostname ' + host + ' --name ' + host +
                            ' --net ' + network + ' ' + network + '/' + host;
                        cmds['create'].push({
                            cwd: makedir,
                            cmd: create
                        });




                        var start = 'docker start ' + host;
                        cmds['start'].push({
                            cwd: makedir,
                            cmd: start,
                        });
                    }
                }
            }
        }

        getState(dirs, function(depends) {
            for (var i = 0; i < cmds['build'].length; i++) {
                var buildor = cmds['build'][i];
                var name = buildor['name'];
                if (depends[name]) {
                    buildor['depends'] = depends[name];
                    cmds['build'][i] = buildor;
                }
            }
            //        runJobs(buildors, buildP);
        });




        Promise.all(buildP).then(function() {
                console.log('build done');


                var stopP = runJobs(cmds['stop']);
                Promise.all(stopP).then(function() {
                        console.log('all containers stopped');


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