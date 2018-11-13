/* Modules */
require("./env"); // Load configuration variables
var os = require("os");
var path = require("path");
var fs = require("mz/fs");
//var fs = require('fs');
var rp = require("request-promise");
const md5File = require('md5-file')
var mime = require('mime');
exports.laburi;

var datasets_path;

if (process.env.STARTUP_DATASET_PATH) {
    datasets_path = process.env.STARTUP_DATASET_PATH;
} else {
    console.log("Error: environment variable STARTUP_DATASET_PATH not defined");
    process.exit(1);
}

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
/**
* Read the dataset and register it with the lab api
* 
* dataset.csv
* dataset_metafeatures.csv
* dataset_config.json
*
* @param username - string
* @param dataset_name - string
* @param dataset_path - string
*/
var processDataset = function(username, dataset_name, dataset_path) {
    console.log(`processDataset(${username}, ${dataset_name}, ${dataset_path})`)
    var formData = {
        _files: [],
        _metadata: []
    };
    var metadata = [];
    // Create form data
    fs.readdir(dataset_path, function(err, files) {
        var metadata_json_path = dataset_path + '/metadata.json'

        metadata = {
            'name': dataset_name,
            'username': username,
            'timestamp': Date.now(),
            'filepath' : dataset_path,
            'files': []
        }
        console.log(`files: ${files}`)

        if(files) {
            for (var i = 0; i < files.length; i++) {
                console.log(`${path.parse(files[i]).name}`)
                if (files[i].toUpperCase() == 'README.MD') {
                    //todo:parse README
                } else if (path.parse(files[i]).name.toUpperCase() == dataset_name.toUpperCase()){
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
            //console.log(`Registering dataset ${formData._metadata}`)
            console.log(`Registering dataset ${JSON.stringify(metadata.files)}`)
            var p = rp({
                    uri: exports.laburi + "/api/v1/datasets/",
                    method: "PUT",
                    formData: formData,
                    gzip: true
                })
                .then(response => {
                    data = JSON.parse(response);
                    metadata['dataset_id'] = data['dataset_id'];
                })
                .catch(err => {
                    console.log(err);
                });
            //console.log(p);
        }
    });
};



/**
* process datasets that are in subdirectories or in the current directory
* Datasets must end with .csv or .gz
* 
* i.e path/adult/adult.csv, path/banana/banana.csv
*/
var processSubdirectoryDatasets = function(rootPath, username) {
    console.log(`processSubdirectoryDatasets(${rootPath}, ${username})`)
    fs.readdir(rootPath, function(err, files) {
        if (files !== undefined) {
            for (let file of files) {
                if (path.parse(file).ext == undefined || path.parse(file).ext == '') { // is directory?
                    var dataset_name = file
                    var dataset_path = rootPath + '/' + dataset_name
                    processDataset(username, dataset_name, dataset_path)
                }
                else if ((path.parse(file).ext !== undefined) && 
                    ((path.extname(file) == '.csv') || (path.extname(file) == '.gz'))) {
                    var dataset_name = path.parse(file).name;
                    var dataset_path = rootPath
                    processDataset(username, dataset_name, dataset_path)
                }
                else {
                    console.log (`skipping file: ${file}`)
                }
            }
        }
        else {
            console.log(`no datasets found for path ${path}`)
        }
    });
}


/**
* process datasets that are in this path
* 
* i.e path/adult.csv, path/banana.csv
*/

exports.loadInitialDatasets = function() {
    console.log(`Loading initial datasets for ${datasets_path}`)

    if(exports.laburi) {
        console.log(exports.laburi) 
    } else {
        console.log('laburi not defined');
        exit(0);
    }

    if (fs.existsSync(datasets_path)) {
        processSubdirectoryDatasets(datasets_path, 'testuser')
    }
    else {
        console.log(`WARNING: Could not load datasets, path does not exist: ${datasets_path}`)
    }
}

var submitForm = function(formData,metadata) {
    metadata_json = datasets_path + '/' + dataset_name + '/metadata.json';
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

exports.datasets_path = datasets_path;
