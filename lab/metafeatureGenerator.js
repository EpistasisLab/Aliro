var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var Promise = require("bluebird");

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* For now, generate the process synchronously.
* 
*
* @param fileObj
* @return data: (if success) JSON
*/
function generateFeatures(fileObj, filepath, dependent_col) {
	console.log(`generateFeatures ('${fileObj.originalname}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + fileObj.originalname
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col]

	console.log(`args: ${args}`)


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

function generateFeaturesAsync(fileObj, filepath, dependent_col) {
	return new Promise((resolve, reject) => { 
		resolve(generateFeatures(fileObj, filepath, dependent_col))
	})
}


module.exports = {
	generateFeatures: generateFeatures,
	generateFeaturesAsync: generateFeaturesAsync
};
