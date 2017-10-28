var readline = require('readline');
var fs = require('fs');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var spawnSync = require("child_process").spawnSync;
var dockerDir = '/share/devel/Gp/dockers'
var exec = require('child-process-promise').exec;

//Process variables in Makevars file
var makevars = {}
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

var createNetwork = function(network,callback) {
        exec('docker network inspect ' + network)
        .then(function(result) {
        callback();
        })
 .catch(function (err) {
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

var getDepends = function(dirs,callback) {
var depends = [];
for(i in dirs){
var dir = dirs[i];
fileBuffer = fs.readFileSync(dockerDir + '/' + dir + '/Dockerfile');
string = fileBuffer.toString();
lines = string.split("\n");
for (j in lines) {
var line = lines[j]
var splitted = line.split(' ');
if(splitted[0] == 'FROM') {
depends[dir] = splitted[1];
}
}
}
callback(depends);
}

// container build, run, etc.
var processContainers = function(cb) {
    createNetwork(makevars['NETWORK'],function() {
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


//execute each job and save it to the promis_array
var runJobs = function(jobs, promise_array) {
    for (i in jobs) {

        job = jobs[i];
        var runner = exec(job['cmd'], {
            cwd: job['cwd']
        });
        promise_array[i] = runner;
        runner.then(function(result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            console.log('Running job');
            console.log(job['cmd']);
            console.log('stdout: ', stdout);
            console.log('stderr: ', stderr);
        })

    }

}


// do it
processContainers(function(dirs) {
    //Make subdirse
    var buildP = Array(dirs.length);
    var createP = Array(dirs.length);
    var startP = Array(dirs.length);
    creators = [];
    buildors = [];
    startors = [];
    for (i in dirs) {
        var makedir = dockerDir + '/' + dirs[i];
        //build continers
        var network = 'pennai';
        var tag = 'latest';
        var host = makedir.split("\/").pop();
        var build = 'docker build -t ' + makevars['NETWORK'] + '/' + host + ':' + tag + ' .';
        buildors.push({
            cmd: build,
            cwd: makedir,
            img: host
        });
        for (varname in makevars) {
            var splitted = varname.split('_');
            if (splitted[1] == 'HOST') {
                if (host == makevars[varname]) {
                    var docker_args = '';
                    for (varname_inner in makevars) {
                        docker_args = docker_args + ' -e ' + varname_inner + '=' + makevars[varname_inner];
                    }
                    var portvar = splitted[0] + '_PORT';
                    if (makevars[portvar]) {
                        var port = makevars[portvar];
                        docker_args = docker_args + ' -p ' + makevars['IP'] + ':' + port + ':' + port;
                    }


                    var create = 'docker create -i -v ' + makevars['SHARE_PATH'] + ':/share/devel' 
                                  + docker_args + ' --hostname ' + host + ' --name ' + host + 
                                  ' --net ' + network + ' ' +  network + '/' + host;

                    creators.push({
                        cwd: makedir,
                        cmd: create
                    });

                    var start = 'docker start ' + host;
                    startors.push({
                        cwd: makedir,
                        cmd: start,
                    });



                }
            }
        }





    }

getDepends(dirs,function(depends) {
console.log(depends);
console.log(buildors);
//    runJobs(buildors, buildP);
});


    Promise.all(buildP).then(function() {
            console.log('build done');
 //           runJobs(creators, createP);

            Promise.all(createP).then(function() {
                    console.log("create done");
//                    runJobs(startors, startP);
                    //console.log(creators);
                })
                .catch((errr) => {
                    console.log(errr);
                });

        })
        .catch((err) => {
            console.log(err);
        });

});
