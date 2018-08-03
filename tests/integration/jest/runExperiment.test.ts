/**
* Run and experiment
*
*/

import * as labApi from './labApi';
import * as machineApi from './machineApi';
import * as dbBuilder from "./util/db";

/*
const db = dbBuilder.openDbConnection();


afterAll(() => {
  db.close();
});
*/

// hacky delay
function delay(ms) {
   ms += new Date().getTime();
   while (new Date() < ms){}
}


it.skip('lab run dt experiment on adult', async () => {	
	console.log('lab run dt experiment on adult')

	jest.setTimeout(10000)
/*
	let algoName = 'DecisionTreeClassifier'
	let algoParms = {
		"criterion": "gini",
		"max_depth": 1,
		"min_samples_split": 2,
		"min_samples_leaf": 1,
	};
*/
	let algoName = 'LogisticRegression'
	let algoParms = {
		"penalty": "l1",
		"C": 1.0,
		"dual": false,
	};

	let datasetName = 'adult'

	//-------------------
 	// get dataset
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
 	expect(datasetId).toBeTruthy();

 	// get algorithm
 	var algorithms = await labApi.fetchAlgorithms();
 	expect(algorithms.length).toBeGreaterThan(10);
 	var algoId = algorithms.find(function(element) {return element.name == algoName;})._id;
 	expect(algoId).toBeTruthy();

 	algoParms.dataset = datasetId

 	// no experiments
	var experiments = await labApi.fetchExperiments()
	expect(experiments).toHaveLength(0)

	// submit simple experiment
	try {
		var submitResult = await labApi.submitExperiment(algoId, algoParms)
	} catch (e) {
		console.log("submitExperiment exception")
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}

	expect(submitResult).toBeTruthy()
	//console.log("SubmitResult: ", submitResult)

	// expect that the experiment started running
	var experimentResults = await labApi.fetchExperiment(submitResult._id)
	//console.log("experimentResults: ", experimentResults)
	expect(experimentResults._status).toBeTruthy()
	expect(experimentResults._status).toEqual('running')


	// wait for the experiment to finish running, probably a better way to do this then delay...
	var count = 0
	console.log("starting timeout...")
	while (experimentResults._status === ('running') && count < 4) {
		delay(10000)
		count = count + 1
		experimentResults = await labApi.fetchExperiment(submitResult._id)
		console.log("experimentResults._status, count (" + count + "): ", experimentResults._status)
	}
	console.log("finished timeout...")

	// try to ping machine
	var machineData = await machineApi.fetchProjects()
	expect(Object.keys(machineData).length).toBeGreaterThan(10)
	console.log("successfully pinged machine")

	// hacky, lab seems to need some time before it is responsive again?
	//delay(105000)

	// check that the expected results are there
	//var experimentResults = await labApi.fetchExperiment(submitResult._id)
	console.log("experimentResults: ", experimentResults)
	expect(experimentResults._status).toBeTruthy()
	expect(experimentResults._status).toEqual('success')

	// check that the experiment results are available
	var model = await labApi.fetchExperimentModel(submitResult._id)
	expect(model).toBeTruthy()

	var script = await labApi.fetchExperimentScript(submitResult._id)
	expect(script).toBeTruthy()
});