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
var verbose;
// execute code from the shared volume instead of /opt
var share = false;
//where containers are stored
var allroots = [];
//makevars will be passed to hosts as global env variables
var makevars = [];
//which parts of the build process we're going to run
var steps = [];
//array of commands for different steps
var cmds = {};
//the hosts we're interested in building
var hosts = []
//listen here by default
var dockerDir = 'dockers';
// tag version
var tag = 'latest';
//returns a list of existing containers for the given network
var retContainers = function(network) {
    var deferred = Q.defer();
    var cmd = 'docker ps -a --filter network=' + network + ' --format \"table {{.Names}}:{{.ID}}:{{.Status}}\" | tail -n +2 | sort'
    var cwd = '/tmp';
    if (verbose) {
        console.log('fexec', {
            cmd,
            cwd
        });
    }
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
            var existing = {}
            var list = stdout.trim().split('\n');
            //console.log(list);
            for (var i in list) {
                var splitted = list[i].split(':');
                var host = splitted[0];
                if (host.length > 0) {
                    var container_id = splitted[1];
                    var state = splitted[2].split(" ")[0].toLowerCase();
                    existing[host] = {
                        'id': container_id,
                        'state': state
                    };
                }
            }

            deferred.resolve(existing);
        }
    })
    return deferred.promise;
}

//extract build dependency order from Dockerfiles
var getDeps = function(network) {
    var depends = {}
    var dirs = fs.readdirSync('dockers');
    for (var i in dirs) {
        var dir = dockerDir + '/' + dirs[i];
        var is_docker = false;
        if (fs.lstatSync(dir).isDirectory() && fs.readdirSync(dir).indexOf('Dockerfile') >= 0) {
            var fileBuffer = fs.readFileSync(dir + '/Dockerfile');
            var string = fileBuffer.toString();
            var lines = string.split("\n");
            for (var j in lines) {
                var line = lines[j]
                var splitted = line.split(' ');
                if (splitted[0] == 'FROM') {
                    var requires = splitted[1].split(":")[0].split("/")
                    if (requires[0] == network) {
                        depends[dirs[i]] = requires[1]
                    }
                }
            }
            if (!(dir in depends)) {
                depends[dir] = '';
            }
        }
    }

    return (depends);
}




//exec wrapper with dryrun
var fexec = function(cmd, host) {
    var cwd = 'dockers'
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


//execute each job and save it to the promise_array
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



//find root for this container
var getRoot = function(build, buildArray, deps) {
    var retArray = []
    if (build in buildArray && buildArray[build]['require'] !== undefined) {
        retArray = retArray.concat(getRoot(deps[build], buildArray, deps))
    } else {
        retArray.push(build)
    }
    return (retArray);
}


exports.build = function(forum, experiment) {
    verbose = forum.verbose;
    var deferred = Q.defer();
    var contP = retContainers(experiment.global.NETWORK);
    //sentients are containers that exist or have existed
   if (experiment.global.SHARE_PATH === undefined) {
            experiment.global.SHARE_PATH = process.cwd();
        }

    contP.then(function(sentient) {
        forum.sentient = sentient;
        hostCommander(forum, experiment);
    });
    return deferred.promise
}

var hostCommander = function(forum, experiment) {
    var deferred = Q.defer();
    var services = experiment.services;
    var action = forum.action;
    var makevars = experiment.global;
    var network = makevars.NETWORK;
    var deps = getDeps(network);
    var dockers = [];
    for (i in deps) {
        dockers.push(i.split('/')[1])
    }
    makevars['SHARE_PATH'] = makevars['SHARE_PATH'].replace(/\\/g,'/')
    var unix_path = makevars['SHARE_PATH'].replace(':' ,'')
    if (unix_path.charAt(0) !== '/'){
      unix_path = '/' + unix_path;
      console.log(unix_path);
    }
    makevars['UNIX_PATH'] = unix_path
    if (forum.doShared !== undefined && forum.doShared) {
        makevars['PROJECT_ROOT'] = makevars['UNIX_PATH'];
    } else {
        makevars['PROJECT_ROOT'] = '/opt/' + network;
    }
    if (action == 'rebuild') {
        steps = ['stop', 'rm', 'build', 'create', 'start', 'tag', 'push']
    } else if (action == 'reload') {
        steps = ['stop', 'rm', 'build', 'create', 'start']
    } else if (action == 'restart') {
        steps = ['stop', 'start']
    } else {
        steps = [action]
    };
    for (var i in dockers) {
        //available containers that are required for this network
        var container_name = dockers[i];
        //build continers
        var quiet = '';
        if (!verbose) {
            quiet = '-q'
        }
        var build_args = quiet + ' -t ' + network + '/' + container_name + ':latest  .';
        commander('build', build_args, container_name);
    }
    var repos = {};
    for (var i in services) {
        var service = services[i];
        hosts.push(service.name);
        var hostvar = service.name.toUpperCase() + '_HOST';
        makevars[hostvar] = service.name;
        if (service.portMappings !== undefined) {
            var portvar = service.name.toUpperCase() + '_PORT';
            makevars[portvar] = service.portMappings[0].containerPort
        }
        if (service['repositoryUri'] !== undefined) {
            repos[service.name] = service['repositoryUri'];
        }
    }

    for (var i in services) {
        var service = services[i];
        console.log('processing ' + service.name);
        var docker_args = ''
        for (var varname_inner in makevars) {
            docker_args = docker_args + ' -e ' + varname_inner + '=' +
                makevars[varname_inner];
        }
        if (service.portMappings !== undefined) {
            docker_args = docker_args + ' -p ' + forum.ip + ':' + service.portMappings[0].hostPort + ':' + service.portMappings[0].containerPort;
        }



        if (forum.sentient[service.name]) {
            var container_id = forum.sentient[service.name]['id']
            if (forum.sentient[service.name]['state'] == 'up') {
                commander('stop', container_id);
            }
            commander('rm', container_id);
        }

        var create_args = '-i -t -v ' + makevars['SHARE_PATH'] + ':' + makevars['UNIX_PATH'] +
            docker_args + ' --hostname ' + service.name + ' --name ' + service.name +
            ' --net ' + network + ' ' + network + '/' + service.name;
        commander('create', create_args, service.name);
        if (repos[service.name] !== undefined) {
            var tag_args = network + '/' + service.name + ':' + tag + ' ' + repos[service.name] + ':' + tag;
            commander('tag', tag_args)


            var push_args = repos[service.name] + ':' + tag;
            commander('push', push_args);
        }
        commander('start', service.name);
    }
    //promises
    var chain = Q.when();
    //build the containers (if we're supposed to)
    if (steps.indexOf('build') >= 0) {
        var buildArray = makeBuildArray(hosts, deps, dockers, forum.sentient);
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
                console.log('command set:', item);
            }
            return promise.then(function(result) {
                return runJobs(item);
            }).catch(function(error) {});;
        }, Q());
    } else {
        var chain = Q.when();
    }

    //continue processing the chain in the correct order
    chain.then(function() {
            var stopP = runJobs(cmds['stop']);
            Q.all(stopP).then(function() {
                    var removeP = runJobs(cmds['rm']);
                    Q.all(removeP).then(function() {
                            var createP = runJobs(cmds['create']);
                            Q.all(createP).then(function() {
                                    var tagP = runJobs(cmds['tag']);
                                    Q.all(tagP).then(function() {
                                            var pushP = runJobs(cmds['push']);
                                            Q.all(pushP).then(function() {
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
};

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
