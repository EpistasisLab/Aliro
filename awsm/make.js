//create a network
'use strict';
var fs = require('fs');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var Q = require("q")
var exec = require('child_process').exec;
var argv = require('minimist')(process.argv.slice(2));
//run every step by default
var dryrun = false;
var verbose = true;
var share = false;
var dockerDir;
var basedir;
var allroots = [];
var makevars;
var steps = []
var cmds = {}
var initVars = function(share, callback) {
    makevars = [];
    var fileBuffer = fs.readFileSync('./dockers/Makevars');
    var vars_string = fileBuffer.toString();
    var vars_lines = vars_string.split("\n");
    for (var i in vars_lines) {
        var line = vars_lines[i]
        var spliteded = line.split(':=');
        var name = spliteded[0];
        var val = spliteded[1];
        if (name && val) {
            makevars[name] = val;
        }
    }
    var network = makevars['NETWORK'];
    if (share) {
        basedir = makevars['SHARE_PATH'] + '/' + network;
    } else {
        basedir = '/opt/' + network;
    }
    makevars['PROJECT_ROOT'] = basedir;
    dockerDir = makevars['SHARE_PATH'] + '/' + network + '/dockers'
    retHosts(makevars, callback);
}
exports.initVars = initVars;


//create the specified network if it does not yet exist
var createNetwork = function(network, callback) {
    /*
        exec('docker network inspect ' + network)
            .then(function(result) {
                callback();
            })
            .catch(function(err {
                exec('docker network create ' + network)
                    .then(function(result2) {
                        var stdout = result2.stdout;
                        var stderr = result2.stderr;
                        console.log('stdout: ', stdout);
                        console.log('stderr: ', stderr);
                        callback();
                    })

            });
    */
    callback()


}

//returns a list of existing containers for the given network
var retHosts = function(makevars, callback) {
    var network = makevars['NETWORK'];
    var cmd = 'docker ps -a --filter network=' + network + ' --format \"table {{.Names}}:{{.ID}}:{{.Status}}\" | tail -n +2 | sort'
    var cwd = dockerDir;
    if (verbose) {
        console.log('fexec', {
            cmd,
            cwd
        });
    }
    var deferred = Q.defer();
    var cwd = dockerDir
    exec(cmd, {
        maxBuffer: 1024 * 1024,
        cwd: cwd
    }, (error, stdout, stderr) => {
        if (error) {
            console.log('err');
            deferred.reject(new Error(error));
            console.error(`exec error: ${error}`);
            //process.exit();
        } else {
            deferred.resolve(stdout);
        }
    })
    deferred.promise.then(function(stdout) {
        var list;
        var existing = {}
        if (stdout) {
            list = stdout.trim().split('\n');
        }
        //console.log(list);
        for (var i in list) {
            var splitted = list[i].split(':');
            var host = splitted[0];
            var container_id = splitted[1];
            var state = splitted[2].split(" ")[0].toLowerCase();
            existing[host] = {
                'id': container_id,
                'state': state
            };
        }
        callback(existing, makevars);





    });
}

//extract build dependancy order from Dockerfiles 
var getDeps = function(makevars, dirs, callback) {
    var depends = [];
    for (var i in dirs) {
        var dir = dirs[i];
        var is_docker = false;
        var files = fs.readdirSync(dockerDir + '/' + dir);
        if (files.indexOf('Dockerfile') >= 0) {

            var fileBuffer = fs.readFileSync(dockerDir + '/' + dir + '/Dockerfile');
            var string = fileBuffer.toString();
            var lines = string.split("\n");
            for (var j in lines) {
                var line = lines[j]
                var splitted = line.split(' ');
                if (splitted[0] == 'FROM') {
                    var requires = splitted[1].split(":")[0].split("/")

                    if (requires[0] == makevars['NETWORK']) {
                        depends[dir] = requires[1]

                    }
                }
            }
            if (!(dir in depends)) {
                depends[dir] = '';
            }
        }
    }

    callback(depends);
}


// container build, run, etc.
var parseDirs = function(makevars, cb) {
    //console.log(makevars);
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



//docker exec wrapper
var fexec = function(cmd, host) {
    var cwd = dockerDir
    if (host) {
        cwd = cwd + '/' + host;
    }
    if (verbose) {
        console.log('fexec', {
            cmd,
            cwd
        });
    }
    if (dryrun) {
        cmd = 'true';
    }

    var deferred = Q.defer();
    //console.log('running',{cmd:cmd,cwd:cwd});
    exec(cmd, {
        maxBuffer: 1024 * 1024,
        cwd: cwd
    }, (error, stdout, stderr) => {
        if (error) {
            console.log('err');
            deferred.reject(new Error(error));
            console.error(`exec error: ${error}`);
            process.exit();
        } else {
            if (verbose) {
                console.log(stdout);
            }
            deferred.resolve(stdout);
        }
    })

    return deferred.promise;

}


//execute each job and save it to the promis_array
var runJobs = function(jobs) {
    if (jobs === undefined) {
        return []
    }
    var promise_array = Array(jobs.length);
    for (var i in jobs) {
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
                    //                if (stdout) {
                    console.log('stdout: ', stdout);
                    //                }
                    //                if (stderr) {
                    console.log('stderr: ', stderr);
                    //                 }
                });
                //if the job depends on another job, wait for that one
            } else {
                for (var j in jobs) {
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
    return Q.allSettled(promise_array);
}


//format commands and save to a global var
var commander = function(cmd, args, cwd) {
    //skip execution if cmd is not a valid step
    if (steps.indexOf(cmd) >= 0) {
        if (cmds[cmd] === undefined) {
            cmds[cmd] = [];
        }
        cmds[cmd].push({
            cmd: "docker " + cmd + " " + args,
            cwd: cwd
        });
    }
}


//construct an array to guide building of containers
var makeBuildArray = function(hosts, deps, dirs, sentient) {
    var buildArray = Array();
    for (var i in dirs) {
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
    for (var j in buildArray) {
        if (buildArray[j]['require']) {
            var h1 = buildArray[j]['require'];
            var p1 = makeBuildArray([buildArray[j]['require']], deps, dirs, sentient);
            if (h1 in deps) {
                buildArray[h1] = p1[h1];
            }
        }
    }
    return buildArray;
}



//find the oldest ancestor for this container 
var getRoot = function(build, buildArray, deps) {
    var retArray = []
    if (build in buildArray && buildArray[build]['require'] !== undefined) {
        retArray = retArray.concat(getRoot(deps[build], buildArray, deps))
    } else {
        retArray.push(build)
    }
    return (retArray);
}


var build = function(forum, services, action, doShared, tasks, verbose) {
    var deferred = Q.defer();
    initVars(doShared, function(sentient, makevars) {
        if (forum && forum['datasets'] !== undefined) {
            makevars['DATASETS'] = forum['datasets'].join();
        };
        if (forum && forum['forumName'] !== undefined) {
            makevars['FORUM'] = forum['forumName']
        }
        if (action == 'build') {
            steps = ['stop', 'rm', 'build', 'create', 'tag', 'start']
        } else if (action == 'stop') {
            steps = ['stop', 'rm']
        } else if (action == 'start') {
            steps = ['stop', 'rm', 'build', 'create', 'tag', 'start']
        }
        var hosts = [];
        for (var i in services) {
            var service = services[i];
            var hostname = service['name']
            if (tasks.length == 0 || tasks.indexOf(hostname) >= 0) {
                hosts.push(hostname);
            }
        }
        console.log('processing hosts ' + hosts);
        // look for container definitions in dockers directory
        parseDirs(makevars, function(dirs) {
            for (var i in dirs) {
                //build continers
                var network = makevars['NETWORK'];
                var registry = makevars['REGISTRY'];
                var tag = 'latest';
                var host = dirs[i];
                var quiet = '';
                if (!verbose) {
                    quiet = '-q'
                }

                var build_args = quiet + ' -t ' + network + '/' + host + ':' + tag + ' .';
                commander('build', build_args, host);
                for (var varname in makevars) {
                    //check for <anything>_HOST variable
                    var splitted = varname.split('_');
                    if (splitted[1] == 'HOST') {
                        if (host == makevars[varname] && hosts.indexOf(host) >= 0) {
                            var docker_args = '';
                            for (var varname_inner in makevars) {
                                docker_args = docker_args + ' -e ' + varname_inner + '=' +
                                    makevars[varname_inner];
                            }
                            var portvar = splitted[0] + '_PORT';
                            if (makevars[portvar]) {
                                var port = makevars[portvar];
                                docker_args = docker_args + ' -p ' + makevars['IP'] + ':' + port + ':' + port;
                            }
                            if (host in sentient) {
                                var container_id = sentient[host]['id']
                                if (sentient[host]['state'] == 'up') {
                                    commander('stop', container_id);
                                }
                                commander('rm', container_id);
                            }


                            var create_args = '-i -t -v ' + makevars['SHARE_PATH'] + ':' + makevars['SHARE_PATH'] +
                                docker_args + ' --hostname ' + host + ' --name ' + host +
                                ' --net ' + network + ' ' + network + '/' + host;
                            commander('create', create_args, host);

                            var tag_args = network + '/' + host + ':' + tag + ' ' + registry + '/' + host + ':' + tag;
                            commander('tag', tag_args);

                            var push_args = registry + '/' + host + ':' + tag;
                            commander('push', push_args);
                            commander('start', host);
                        }
                    }
                }
            }
            //clean the build array as things get processed
            var trimBuildArray = function(buildArray, rootset) {
                var returnArray = {}
                var returnable = false;
                for (var h in buildArray) {
                    if (buildArray[h]['require']) {
                        if (rootset.indexOf(buildArray[h]['require']) >= 0) {
                            delete buildArray[h]['require'];
                        } else {}
                        returnArray[h] = buildArray[h];
                    }
                    returnable = true;
                }
                if (!returnable) {
                    returnArray = false;
                }
                return (returnArray);
            }

            //build containers based on deps
            getDeps(makevars, dirs, function(deps) {
                //promises
                var chain = Q.when();
                //build the containers (if we're supposed to)
                if (steps.indexOf('build') >= 0) {
                    var buildArray = makeBuildArray(hosts, deps, dirs, sentient);
                    var ccmdAr = []
                    while (buildArray) {
                        var roots = [];
                        //ccmdAr = []
                        for (var build in buildArray) {
                            var root = getRoot(build, buildArray, deps);
                            roots = roots.concat(root);
                        }
                        //list of unique 
                        var rootset = new Set(roots);
                        var bs = {}
                        for (var cmd in cmds['build']) {
                            var index = cmds['build'][cmd]['cwd'];
                            bs[index] = cmds['build'][cmd]
                        }
                        var ccmds = []
                        for (let item of rootset) {
                            ccmds.push(bs[item])
                            allroots.push(item)
                        }
                        buildArray = trimBuildArray(buildArray, allroots);
                        if (ccmds.length > 0) {
                            ccmdAr.push(ccmds);
                        }
                    }

                    var ccmd = true;


                    //where the magic happens
                    var chain = ccmdAr.reduce(function(promise, item) {
                        if (verbose) {
                            console.log('item', item);
                        }
                        return promise.then(function(result) {
                            return runJobs(item);
                        });
                    }, Q());

                };
                //ontinue processing the chain in the correct order
                chain.then(function() {
                        //console.log('build done');
                        var stopP = runJobs(cmds['stop']);
                        Q.all(stopP).then(function() {
                                //console.log('stop done');
                                var removeP = runJobs(cmds['rm']);
                                //console.log(cmds['rm']);
                                Q.all(removeP).then(function() {
                                        //console.log("remove done");
                                        var createP = runJobs(cmds['create']);
                                        Q.all(createP).then(function() {
                                                //console.log("create done");
                                                var tagP = runJobs(cmds['tag']);
                                                Q.all(tagP).then(function() {
                                                        //console.log("create done");
                                                        var pushP = runJobs(cmds['push']);
                                                        Q.all(pushP).then(function() {
                                                                //console.log("push done");
                                                                //deferred.reject(new Error(error));
                                                                deferred.resolve(makevars);
                                                                var startP = runJobs(cmds['start']);
                                                            })
                                                            .catch((err) => {
                                                                console.log(err);
                                                            });
                                                    })
                                                    .catch((err) => {
                                                        console.log(err);
                                                    });
                                            })
                                            .catch((err) => {
                                                console.log(err);
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
            })
        }).catch((err) => {
            console.log(err);
        });
    });
    return deferred.promise;
};
exports.build = build;
