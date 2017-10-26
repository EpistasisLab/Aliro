var readline = require('readline');
var fs = require('fs');
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var Stream = require('stream');
var ws = new Stream;
ws.writable = true;
ws.bytes = 0;
var spawnSync = require("child_process").spawnSync;
var dockerDir = '/share/devel/Gp/dockers'
var exec = require('child_process').exec,child;
var makevars = {}
fileBuffer =  fs.readFileSync(dockerDir + '/Makevars');
to_string = fileBuffer.toString();
split_lines = to_string.split("\n");
for(i in split_lines){
    var line = split_lines[i]
    var spliteded = line.split(':=');
    var name = spliteded[0];
    var val = spliteded[1];
    if(name && val) {
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
function makeContainer(dir, makevars) {
        child = exec('cd ' + dir + ' && make',
        function(error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            if(stderr) {
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            }
        },
        {env:makevars}
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
    for (i in dirs) {
        var makedir = dockerDir + '/' + dirs[i];
        checkFile(makedir, 'Makefile', function(dirname) {
            if (dirname) {
            //    makeContainer(makevars)
            }
        });
        checkFile(makedir, 'Dockerfile', function(dirname) {
var network = 'pennai';
var host = dirname;
var tag = 'latest';
            if (dirname) {
                var cmd = 'docker build -t '+ network + '/'+ host + ':' + tag + ' .';
                console.log(cmd)
            }
        });
    }
});


