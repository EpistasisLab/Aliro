var fs = require('fs');
var fs = require('fs');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var spawnSync = require("child_process").spawnSync;
var dockerDir = '/share/devel/Gp/dockers'
var exec = require('child_process').exec,child;
var getVars = function(cb) {
    var varsfile = dockerDir + '/Makevars';
    fs.readFile(varsfile, 'utf-8', function(err, file) {
    if (!err) {
    console.log(file);
    }
    });
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
function makeContainer(dir, arg) {
    child = exec('cd ' + dir + ' && make',
        function(error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
}


getVars(function(vars) {
    for (i in vars) {
    console.log(vars[i]);
    }
});
// do it
/*
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
    for (i in dirs) {
        var makedir = dockerDir + '/' + dirs[i];
        checkFile(makedir, 'Makefile', function(dirname) {
            if (dirname) {
                makeContainer(dirname)
            }
        });
    }
});
*/


