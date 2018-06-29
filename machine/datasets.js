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
exports.laburi;

//genForm
// process parentdir for file, execute callback with results
var genForm = function(file, callback) {
    dataset_id = false;
    has_metadata = false;
    p = file.split('/')
    updated_file = p.pop()
    dataset_path = p.join('/');
    dataset_name = p.pop()
    username = p.pop()
    fs.readdir(dataset_path, function(err, files) {
        var formData = {
            _files: [],
            _metadata: []
        };
        var metadata = [];
        metadata = {
            'name': dataset_name,
            'username': username,
            'timestamp': Date.now(),
            'files': []
        }
        for (var i = 0; i < files.length; i++) {
            if (files[i] == 'README.MD') {
                //todo:parse README
            }
            if (files[i] == 'metadata.json') {
                has_metadata = true;
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
else {
console.log(filetype);
}
            metadata.files.push(file_level_metadata);
            formData._files.push(fs.createReadStream(filename));
            }
        }
        if(has_metadata) {
                fs.readFile(dataset_path + '/metadata.json', 'utf8', function(err, data) {
                    if (err) throw err;
                    obj = JSON.parse(data);
                    metadata['dataset_id'] = obj['dataset_id'];
                    callback(formData,metadata);
                })
        } else {
        formData._metadata = JSON.stringify(metadata);
        callback(formData,metadata);
        }

    });
};
// change the algo to sha1, sha256 etc according to your requirements
//var processDataset = function(dataset_path) {
var processUserDataset = function(username, dataset_name) {
    var dataset_path = byuser_datasets_path + '/' + username + '/' + dataset_name;
    var formData = {
        _files: [],
        _metadata: []
    };
    var metadata = [];
    // Create form data
    fs.readdir(dataset_path, function(err, files) {
        // if metadata exists, ignore
        var metadata_json = dataset_path + '/metadata.json'
        if (fs.existsSync(metadata_json) && !debug) {
            //console.log('exists')
        } else {
            metadata = {
                'name': dataset_name,
                'username': username,
                'timestamp': Date.now(),
                'files': []
            }
        if(files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].toUpperCase() == 'README.MD') {
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
            var p = rp({
                    uri: exports.laburi + "/api/v1/datasets/",
                    method: "PUT",
                    formData: formData,
                    gzip: true
                })
                .then(response => {
                    data = JSON.parse(response);
                    metadata['dataset_id'] = data['dataset_id'];
                    fs.writeFile(metadata_json, JSON.stringify(metadata), function(err) {
                        if (err) throw err;
                        console.log('wrote metadata');
                    });


                }).catch(err => {
                    console.log(err);
                });
            //console.log(p);

}
        }
    });
    // Add file
    // return(formData);
};




var processUserDatasets = function(username) {
    datasets_path = byuser_datasets_path + '/' + username;
    fs.readdir(datasets_path, function(err, datasets) {
        if (datasets !== undefined) {
            for (var i = 0; i < datasets.length; i++) {
                var dataset_name = datasets[i];
                //processDataset(dataset_path);
                processUserDataset(username, dataset_name);
            }
        }
    });
}

exports.scrapeUsers = function() {
if(exports.laburi) {
console.log(exports.laburi) 
} else {
console.log('laburi not defined');
exit(0);
}
    if (fs.existsSync(byuser_datasets_path)) {
        fs.readdir(byuser_datasets_path, function(err, users) {
            for (var i = 0; i < users.length; i++) {
                var username = users[i];
                processUserDatasets(username);
            }
        });
    }
}
var submitForm = function(formData,metadata) {
            metadata_json = byuser_datasets_path + '/' + username + '/' + dataset_name + '/metadata.json';
            formData._metadata = JSON.stringify(metadata);
            var p = rp({
                    uri: exports.laburi + "/api/v1/datasets/",
                    method: "PUT",
                    formData: formData,
                    gzip: true
                })
                .then(response => {
                    data = JSON.parse(response);
                    metadata['dataset_id'] = data['dataset_id'];
                    fs.writeFile(metadata_json, JSON.stringify(metadata), function(err) {
                        if (err) throw err;
                        console.log('wrote metadata');
                    });


                }).catch(err => {
                    console.log(err);
                });

}
exports.processChangedFile = function(file) {
    console.log("Update metadata for " + file);
    // get base path for dataset
    genForm(file, submitForm);
    //processDataset(dataset_path);
}
exports.byuser_datasets_path = byuser_datasets_path;
