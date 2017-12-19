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
var share = false;
var dockerDir;
var basedir;
var allroots = [];
//makevars will be passed to hosts as global env variables
var makevars = [];
var steps = [];
var cmds = {};
var hosts = []
/*
    var shared = experiment.doShare
    makevars = experiment.global;
    for (var i in makevars) {
        var name = i;
        var val = makevars[i];
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
*/

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
//extract build dependancy order from Dockerfiles 
var getDeps = function(dockerDir, dirs, network) {
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

                    if (requires[0] == network) {
                        depends[dir] = requires[1]

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
    var cwd = '/share/devel/pennai/dockers'
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
    var all = ['base', 'compute', 'dbmongo', 'dbredis', 'lab', 'machine', 'paiwww', 'paix01'];
    var tasks = [];
    var makevars = experiment.global;
    var network = makevars.NETWORK;
    if (forum.doShared !== undefined && forum.doShared) {
        makevars['PROJECT_ROOT'] = makevars['SHARE_PATH'] + '/' + network;
    } else {
        makevars['PROJECT_ROOT'] = '/opt/' + network;
    }
console.log(makevars);
    var registry;
    if (forum && forum['datasets'] !== undefined) {
        makevars['DATASETS'] = forum['datasets'].join();
    };
    if (forum && forum['forumName'] !== undefined) {
        makevars['FORUM'] = forum['forumName']
    }
    if (action == 'rebuild') {
        steps = ['stop', 'rm', 'build', 'create', 'start','tag','push']
    } else if (action == 'reload') {
        steps = ['stop', 'rm', 'build', 'create', 'start']
    } else if (action == 'restart') {
        steps = ['stop','start']
    } else {
        steps = [action]
    };
    var hosts = [];
    var repos = {};
    for (var i in services) {
        var service = services[i];
        var hostname = service['name']
        if (tasks.length == 0 || tasks.indexOf(hostname) >= 0) {
            hosts.push(hostname);
        }
        if (service['repositoryUri'] !== undefined) {
            repos[hostname] = service['repositoryUri'];
        }
    }
    console.log('processing hosts ' + hosts);
    // look for container definitions in dockers directory
    for (var i in all) {
        var requested = false;
        var host = all[i];
        if (hosts.indexOf(host) >= 0) {
            requested = true;
        }
        //build continers
        var tag = 'latest';
        var quiet = '';
        if (!verbose) {
            quiet = '-q'
        }
        var build_args = quiet + ' -t ' + network + '/' + host + ':' + tag + ' .';
        commander('build', build_args, host);
        //process makevars for this host
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
                }
            }
        }


        if (requested) {

            if (forum.sentient[host]) {
                var container_id = forum.sentient[host]['id']
                if (forum.sentient[host]['state'] == 'up') {
                    commander('stop', container_id);
                }
                commander('rm', container_id);
            }

            var create_args = '-i -t -v ' + makevars['SHARE_PATH'] + ':' + makevars['SHARE_PATH'] +
                docker_args + ' --hostname ' + host + ' --name ' + host +
                ' --net ' + network + ' ' + network + '/' + host;
            commander('create', create_args, host);

            if (repos[host] !== undefined ) {
    var tag_args = network + '/' + host + ':' + tag + ' ' + repos[host] + ':' + tag;
                commander('tag', tag_args)



                var push_args = repos[host] + ':' + tag;
                commander('push', push_args);
            }
            commander('start', host);
        }
    }
    var dockerDir = '/share/devel/pennai/dockers'
    var deps = getDeps(dockerDir, all, network)
    //promises
    var chain = Q.when();
    //build the containers (if we're supposed to)
    if (steps.indexOf('build') >= 0) {
        var buildArray = makeBuildArray(hosts, deps, all, forum.sentient);
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
            });
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
