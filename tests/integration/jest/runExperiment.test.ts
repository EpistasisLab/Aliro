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


//it('lab run dt experiment on adult', async () => {
it.skip('lab start dt experiment on adult', async () => {	
	console.log('lab start dt experiment on adult')

 	// get adult dataset
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var adultId = datasets.find(function(element) {return element.name == 'adult';})._id;
 	expect(adultId).toBeTruthy();

 	// get decision tree algorithm
 	var algorithms = await labApi.fetchAlgorithms();
 	expect(algorithms.length).toBeGreaterThan(10);
 	var algoId = algorithms.find(function(element) {return element.name == 'DecisionTreeClassifier';})._id;
 	expect(algoId).toBeTruthy();

 	// no experiments
	var experiments = await labApi.fetchExperiments()
	expect(experiments).toHaveLength(0)

	// submit simple experiment
	let parms = {
		"dataset": adultId,
		"criterion": "gini",
		"max_depth": 1,
		"min_samples_split": 2,
		"min_samples_leaf": 1,
	};


	try {
		var submitResult = await labApi.submitExperiment(algoId, parms)
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
		//console.log("experimentResults: ", experimentResults)
	}
	console.log("finished timeout...")

	// hacky, lab seems to need some time before it is responsive again?
	//delay(50000)

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