/* Modules */
require("./env"); // Load configuration variables
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
var byuser_datasets_path = 'datasets/byuser';
var fs = require('fs');
var rp = require("request-promise");
const md5File = require('md5-file')
var mime = require('mime');
var debug = false;

// change the algo to sha1, sha256 etc according to your requirements
var processDataset = function(username, dataset_name) {
var dataset_path  = byuser_datasets_path + '/' + username + '/' + dataset_name;
    var formData = {
        _files: [],
        _metadata: []
    };
var metadata = [];
    // Create form data
    fs.readdir(dataset_path, function(err, files) {
    // if metadata exists, ignore
       var metadata_file = dataset_path + '/metadata.json'
        if (fs.existsSync(metadata_file) && !debug) {
            console.log('exists')
        } else {
          metadata = {
            'name': dataset_name,
            'username': username,
            'timestamp': Date.now(),
            'files': []
          }
            for (var i = 0; i < files.length; i++) {
                if (files[i] == 'README.MD') {
                //todo:parse README
                } else {
                var filename = dataset_path + '/' + files[i];
                var is_zipped = false;
                checksum = md5File.sync(filename);
                if (path.extname(filename) == '.gz') {
                    filetype = mime.lookup(path.basename(filename, '.gz'));
                    is_zipped = true;
                } else {
                    filetype = mime.lookup(filename);
                }
                var file_level_metadata = {
                    'filename': files[i],
                    'checksum': checksum,
                    'filetype': filetype
                }
                if (filetype == 'text/csv') {
                    file_level_metadata['classlabel'] = 'class';
                }
                metadata.files.push(file_level_metadata);
                formData._files.push(fs.createReadStream(filename));
             }
            }
           formData._metadata = JSON.stringify(metadata);
           
           fs.writeFile(metadata_file, JSON.stringify(metadata), function(err) {
                if (err) throw err;
                console.log('wrote metadata');
                        var p= rp({
                            uri: process.env.FGLAB_URL + "/api/v1/datasets/",
                            method: "PUT",
                            formData: formData,
                            gzip: true
                        })
                .then(data => {
                        console.log(data);
                    }).catch(err => {
                        console.log(err);
                    });
            });
            //console.log(p);

        }
    });
    // Add file
    // return(formData);
};
var processUserDatasets = function(username) {
    datasets_path = byuser_datasets_path + '/' + username;
    fs.readdir(datasets_path, function(err, datasets) {
    if(datasets !== undefined) {
        for (var i = 0; i < datasets.length; i++) {
            var dataset_name = datasets[i];
            processDataset(username, dataset_name);
        }
    } 
    });
}

exports.scrapeUsers = function() {

if (fs.existsSync(byuser_datasets_path)) {
    fs.readdir(byuser_datasets_path, function(err,users) {
        for (var i = 0; i < users.length; i++) {
            var username = users[i];
            processUserDatasets(username);
        }
    });
}
}
