var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var Promise = require("bluebird");

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* For now, generate the process synchronously.
* 
*
* @param filename (String)
* @param filepath (String)
* @param dependent_col (String)
*
* @return data: (if success) JSON
*/
function generateFeaturesFromFilepath(filename, filepath, dependent_col) {
	console.log(`generateFeaturesFromFilepath ('${filename}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + filename
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col]

	console.log(`args: ${args}`)

	return generateFeatures(args)
}

function generateFeaturesFromFilepathAsync(fileObj, filepath, dependent_col) {
	return new Promise((resolve, reject) => { 
		resolve(generateFeaturesFromFilepath(fileObj, filepath, dependent_col))
	})
}

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* For now, generate the process synchronously.
* 
*
* @param fileid (String)
* @param dependent_col (String)
*
* @return data: (if success) JSON
*/
function generateFeaturesFromFileId(fileid, dependent_col) {
	console.log(`generateFeaturesFromFileId ('${fileid}', '${dependent_col}')`)

	var args = ['ai/metalearning/get_metafeatures.py', fileid, '-target', dependent_col, '-identifier_type', 'fileid']

	console.log(`args: ${args}`)

	return generateFeatures(args)
}


function generateFeaturesFromFileIdAsync(fileid, dependent_col) {
	console.log(`generateFeaturesFromFileId ('${fileid}', '${dependent_col}')`)

	var args = ['ai/metalearning/get_metafeatures.py', fileid, '-target', dependent_col, '-identifier_type', 'fileid']

	console.log(`args: ${args}`)

	return generateFeaturesAsync(args)
}


function generateFeatures(args) {
	var metafeatureProc = spawnSync('python', 
    	args, {
            cwd: process.env.PROJECT_ROOT
    })

	if (metafeatureProc.error != null) {
		var error = `Error: unable to spawn generateFeatures process: ${err}`
		console.log(error)
		throw new Error(error)
	}
	else if(metafeatureProc.status != 0) {
		var error = `Error, generateFeatures process exited with status ${metafeatureProc.status}, stderr: '${metafeatureProc.stderr}'`
		console.log(error)
		throw new Error(error)
	}
	else { 
		try { var data = JSON.parse(metafeatureProc.stdout) }
		catch (err) {
			var error = `Error, generateFeatures process exited properly with status ${metafeatureProc.status}, but unable to parse stdout as JSON.  stdout: ${metafeatureProc.stdout}, err: ${err}`
			console.log(error)
			throw new Error(error)
		} 
		return data
	}
}

function generateFeaturesAsync(args) {
	return new Promise((resolve, reject) => { 

		var metafeatureProc = spawn('python', 
	    	args, {
	            cwd: process.env.PROJECT_ROOT
	    })

	    metafeatureProc.on('close', (code) => {
			console.log(`child process exited with code ${code}`);

			if(code != 0) {
				var error = `Error, generateFeaturesAsync process exited with status ${metafeatureProc.status}, stderr: '${metafeatureProc.stderr}'`
				console.log(error)
				throw new Error(error)
			}
		})

		metafeatureProc.stdout.on('data', (raw_data) => {
			try { var data = JSON.parse(`${raw_data}`) }
			catch (err) {
				var error = `Error, generateFeaturesAsync unable to parse stdout as JSON.  stdout: ${metafeatureProc.stdout}, err: ${err}`
				console.log(error)
				throw new Error(error)
			} 
			resolve(data)
		});

		metafeatureProc.on('error', (code) => {
			var error = `Error: unable to spawn generateFeaturesAsync process: ${err}`
			console.log(error)
			throw new Error(error)
		})
	})
}


module.exports = {
	generateFeaturesFromFilepath: generateFeaturesFromFilepath,
	generateFeaturesFromFilepathAsync: generateFeaturesFromFilepathAsync,
	generateFeaturesFromFileId: generateFeaturesFromFileId,
	generateFeaturesFromFileIdAsync: generateFeaturesFromFileIdAsync

};
