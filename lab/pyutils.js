/* This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var Promise = require("bluebird");

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* The process is blocking.
* 
*
* @param filename (String)
* @param filepath (String)
* @param dependent_col (String)
*
* @return data: (if success) JSON
*/
function generateFeaturesFromFilepath(filename, prediction_type, filepath, dependent_col) {
	console.log(`generateFeaturesFromFilepath ('${filename}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + filename
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col, '-prediction_type', prediction_type]

	console.log(`args: ${args}`)

	return pythonProcessSync(args)
}


/**
* Spawn a python process that generates metafeatures for a given dataset and generates JSON formatted data.
* 
*
* @param filename (String)
* @param filepath (String)
* @param dependent_col (String)
*
* @return Promise
*/
function generateFeaturesFromFilepathAsync(filename, prediction_type, filepath, dependent_col) {
	console.log(`generateFeaturesFromFilepath ('${filename}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + filename
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col, '-prediction_type', prediction_type]

	console.log(`args: ${args}`)

	return pythonProcessAsync(args)
}

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* The process is blocking.
* 
*
* @param fileid (String)
* @param dependent_col (String)
*
* @return data: (if success) JSON
*/
function generateFeaturesFromFileId(fileid, prediction_type, dependent_col) {
	console.log(`generateFeaturesFromFileId ('${fileid}', '${prediction_type}', '${dependent_col}')`)

	var args = ['ai/metalearning/get_metafeatures.py', fileid, '-target', dependent_col, '-identifier_type', 'fileid', '-prediction_type', prediction_type]

	console.log(`args: ${args}`)

	return pythonProcessSync(args)
}

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* The process is blocking.
* 
*
* @param fileid (String)
* @param dependent_col (String)
*
* @return Promise
*/
function generateFeaturesFromFileIdAsync(fileid, prediction_type, dependent_col) {
	console.log(`generateFeaturesFromFileId ('${fileid}', '${prediction_type}', '${dependent_col}')`)

	var args = ['ai/metalearning/get_metafeatures.py', fileid, '-target', dependent_col, '-identifier_type', 'fileid', '-prediction_type', prediction_type]

	console.log(`args: ${args}`)

	return pythonProcessAsync(args)
}

/**
* Validate a dataset.  Reject the promise if the validation failed.
*
*
* @param fileid (String)
* @param dependent_col (String)
*
* @return Promise
*/
function validateDatafileByFileIdAsync(fileid, prediction_type, dependent_col, categorical_features, ordinal_features) {
	console.log(`validateDatafileByFileIdAsync ('${fileid}', '${prediction_type}', ${dependent_col}', '${categorical_features}', '${ordinal_features}')`)

	var args = [
		'lab/pyutils/validateDataset.py', fileid, 
		'-target', dependent_col, 
		'-identifier_type', 'fileid',
		'-prediction_type', prediction_type
	]
	if (categorical_features != null) {
		args.push('-categorical_features')
		args.push(JSON.stringify(categorical_features))
	}
	if (ordinal_features != null) {
		args.push('-ordinal_features')
		args.push(JSON.stringify(ordinal_features))
	}
	
	console.log(`args: ${args}`)

	return pythonProcessAsync(args)
	.then((result) => {
		return new Promise((resolve, reject) => {
			if (result.success == true) { resolve(result) }
			else throw new Error(`Datafile validation failed, ${result.errorMessage}`)
		})
	})
}



function pythonProcessSync(args) {
	var pyProc = spawnSync('python', 
    	args, {
            cwd: process.env.PROJECT_ROOT
    })

	if (pyProc.error != null) {
		var error = `Error: unable to spawn pythonProcessSync process: ${err}`
		console.log(error)
		throw new Error(error)
	}
	else if(pyProc.status != 0) {
		var error = `Error, pythonProcessSync process exited with status ${pyProc.status}, stderr: '${pyProc.stderr}'`
		console.log(error)
		throw new Error(error)
	}
	else { 
		try { var data = JSON.parse(pyProc.stdout) }
		catch (err) {
			var error = `Error, pythonProcessSync process exited properly with status ${pyProc.status}, but unable to parse stdout as JSON.  stdout: ${pyProc.stdout}, err: ${err}`
			console.log(error)
			throw new Error(error)
		} 
		return data
	}
}

function pythonProcessAsync(args) {
	return new Promise((resolve, reject) => { 

		var pyProc = spawn('python', 
	    	args, {
	            cwd: process.env.PROJECT_ROOT
	    })

	    pyProc.on('close', (code) => {
			console.log(`child process exited with code ${code}`);

			if(code != 0) {
				var error = `Error, pythonProcessAsync process exited with status ${pyProc.status}, args: '${args}', stderr: '${pyProc.stderr.read()}', stdout: '${pyProc.stdout.read()}'`
				console.log(error)
				throw new Error(error)
			}
		})

		pyProc.stdout.on('data', (raw_data) => {
			try { var data = JSON.parse(`${raw_data}`) }
			catch (err) {
				var error = `Error, pythonProcessAsync unable to parse stdout as JSON.  stdout: ${raw_data}, err: ${err}`
				console.log(error)
				throw new Error(error)
			} 
			resolve(data)
		});

		pyProc.on('error', (code) => {
			var error = `Error: unable to spawn pythonProcessAsync process: ${err}`
			console.log(error)
			throw new Error(error)
		})
	})
}


module.exports = {
	generateFeaturesFromFilepath: generateFeaturesFromFilepath,
	generateFeaturesFromFilepathAsync: generateFeaturesFromFilepathAsync,
	generateFeaturesFromFileId: generateFeaturesFromFileId,
	generateFeaturesFromFileIdAsync: generateFeaturesFromFileIdAsync,
	validateDatafileByFileIdAsync: validateDatafileByFileIdAsync
};
