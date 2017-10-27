var readline = require('readline');
var fs = require('fs');
var Promise = require('bluebird');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var Stream = require('stream');
//var ws = new Stream;
//ws.writable = true;
//ws.bytes = 0;
//var spawnSync = require("child_process").spawnSync;
var dockerDir = '/share/devel/Gp/dockers'
var exec = require('child_process').exec;
var makevars = {}
fileBuffer = fs.readFileSync(dockerDir + '/Makevars');
to_string = fileBuffer.toString();
split_lines = to_string.split("\n");
for (i in split_lines) {
    var line = split_lines[i]
    var spliteded = line.split(':=');
    var name = spliteded[0];
    var val = spliteded[1];
    if (name && val) {
        makevars[name] = val;
    }
}

// see which subdirs need processing
var getDirs = function(cb) {
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
}


//build the specified container
function runJob(job) {
    return exec(job['cmd'], {
            cwd: job['cwd']
        },
        function(error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            if (stderr) {
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }
        }
    );
}


// do it
getDirs(function(dirs) {
    //return filename if file exists
    function checkFile(dir, file, callback) {
        var filename = dir + '/' + file;
        fs.stat(dir + '/' + file, function(err, stats) {
            if (err) {
                callback(false)
            } else {
                callback(dir)
            }
        });
    }
    //Make subdirs that have a Makefile
        var num_cont = dirs.length;
        var builders = []
        var runners = [];
var runP = []
    for (i in dirs) {
        var makedir = dockerDir + '/' + dirs[i];
        //commands for building get run first
        //some of these hosts will run and junk like that
        //build continers
            var network = 'pennai';
            var tag = 'latest';
                var host = makedir.split("\/").pop();
                for (varname in makevars) {
                    var splitted = varname.split('_');
                    if (splitted[1] == 'HOST') {
                        if (host == makevars[varname]) {
                            var docker_args = '';
                            for (varname_inner in makevars) {
                                docker_args = docker_args + ' -e ' + varname_inner + '=' + makevars[varname_inner];
                            }
                            var portvar = splitted[0] + '_PORT';
                            //do we have a port in the vars? if so forward it
                            if (makevars[portvar]) {
                                var port = makevars[portvar];
                                docker_args = docker_args + ' -p ' + makevars['IP'] + ':' + port + ':' + port;
                            }

                            var docker_create = 'docker create -i -v ' + makevars['SHARE_PATH'] + ':/share/devel' + docker_args;
                            docker_create += ' ' + network + '/' + host;
                            runners.push({cwd:makedir,cmd:docker_create});
                        }
                    }
                }
                var docker_build = 'docker build -t ' + makevars['NETWORK'] + '/' + host + ':' + tag + ' .';
                builders.push({cwd:makedir,cmd:docker_build});
    }
for(i in runners) {
var runner = runners[i]
runP.push(runJob(runner));
}
console.log(runP.length);
            Promise.all(runP).then(function(fo) {
//console.log();
                })
                .catch((err) => {
                    console.log(err);
                });
});
