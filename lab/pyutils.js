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
function generateFeaturesFromFilepath(filename, filepath, dependent_col) {
	console.log(`generateFeaturesFromFilepath ('${filename}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + filename
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col]

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
function generateFeaturesFromFilepathAsync(filename, filepath, dependent_col) {
	console.log(`generateFeaturesFromFilepath ('${filename}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + filename
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col]

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
function generateFeaturesFromFileId(fileid, dependent_col) {
	console.log(`generateFeaturesFromFileId ('${fileid}', '${dependent_col}')`)

	var args = ['ai/metalearning/get_metafeatures.py', fileid, '-target', dependent_col, '-identifier_type', 'fileid']

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
function generateFeaturesFromFileIdAsync(fileid, dependent_col) {
	console.log(`generateFeaturesFromFileId ('${fileid}', '${dependent_col}')`)

	var args = ['ai/metalearning/get_metafeatures.py', fileid, '-target', dependent_col, '-identifier_type', 'fileid']

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
function validateDatafileByFileIdAsync(fileid, dependent_col, categorical_features, ordinal_features) {
	console.log(`validateDatafileByFileIdAsync ('${fileid}', '${dependent_col}', '${categorical_features}', '${ordinal_features}')`)

	var args = [
		'lab/pyutils/validateDataset.py', fileid, 
		'-target', dependent_col, 
		'-identifier_type', 'fileid'
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
