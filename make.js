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

// do it
getDirs(function(dirs) {
    //Make subdirse
    var createP = Array(dirs.length);
    for (i in dirs) {
        var makedir = dockerDir + '/' + dirs[i];


        //build continers
        var network = 'pennai';
        var tag = 'latest';
        var host = makedir.split("\/").pop();
        var build = 'docker build -t ' + makevars['NETWORK'] + '/' + host + ':' + tag + ' .';
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
                        console.log(port);
                        docker_args = docker_args + ' -p ' + makevars['IP'] + ':' + port + ':' + port;
                    }
                    var docker_create = 'docker create -i -v ' + makevars['SHARE_PATH'] + ':/share/devel' + docker_args;
                    docker_create += ' ' + network + '/' + host;
                    var execer = exec(docker_create, {
                        cwd: makedir
                    });
                    createP[i] = execer;
                    execer.then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    })
                   
                }
            }
        }
    }
    Promise.all(createP).then(function() {
            console.log('done');
        })
        .catch((err) => {
            console.log(err);
        });

});
