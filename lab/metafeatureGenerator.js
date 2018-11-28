var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;

/**
* Spawn a python process that generates metafeatures for a given dataset and returns JSON formatted data on stdout.
* For now, generate the process synchronously.
* 
*
* @param fileObj
* @return Map - {success: Boolean, 
*				 data: (if success) JSON
*				 error: (if falure) String}
*/
function generateFeatures(fileObj, filepath, dependent_col) {
	console.log(`generateFeatures ('${fileObj.originalname}', '${filepath}', '${dependent_col}')`)

	var filepath = filepath + "/" + fileObj.originalname
	var args = ['ai/metalearning/get_metafeatures.py', filepath, '-target', dependent_col]

	console.log(`args: ${args}`)

/*
	// async
    var metafeatureProc = spawn('python', 
    	args, {
            cwd: process.env.PROJECT_ROOT + '/ai/metalearning/generateTestMetafeatures.py'
    })
    .on("error", (err) => {
    	console.log(`unable to spawn generateFeatures process: ${err}`)
    })

    metafeatureProc.stdout.on('data', (data) => {
    	metafeatureJson = data
	})

	metafeatureProc.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	});
*/

	var metafeatureProcObj = spawnSync('python', 
    	args, {
            cwd: process.env.PROJECT_ROOT
    })

	if (metafeatureProcObj.error != null) {
		var error = `Error: unable to spawn generateFeatures process: ${err}`
		console.log(error)
		return {success:false, error:error}
	}
	else if(metafeatureProcObj.status != 0) {
		var error = `Error, generateFeatures process exited with status ${metafeatureProcObj.status}, stderr: '${metafeatureProcObj.stderr}'`
		console.log(error)
		return {success:false, error:error}
	}
	else { 
		try { var data = JSON.parse(metafeatureProcObj.stdout) }
		catch (err) {
			var error = `Error, generateFeatures process exited properly with status ${metafeatureProcObj.status}, but unable to parse stdout as JSON.  stdout: ${metafeatureProcObj.stdout}, err: ${err}`
			console.log(error)
			return {success:false, error:error}
		} 
		return {success:true, data:data}
	}
}


module.exports = {
	generateFeatures: generateFeatures
};
