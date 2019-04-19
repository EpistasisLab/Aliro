/**
* Run and experiment
*
*/

import * as labApi from './labApi';
import * as machineApi from './machineApi';
import * as dbBuilder from "./util/db";
import * as util from "./util/testUtils";


/*
const db = dbBuilder.openDbConnection();


afterAll(() => {
  db.close();
});
*/

describe('run experiment', () => {
	it('run decisionTree experiment on banana', async () => {	
		console.log('run decisionTree experiment on banana')

		jest.setTimeout(15000)
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

		let datasetName = 'banana'

		//-------------------
	 	// get dataset
	 	var datasets = await labApi.fetchDatasets();
	 	expect(datasets.length).toBeGreaterThan(util.MIN_EXPECTED_DATASET_COUNT);
	 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
	 	expect(datasetId).toBeTruthy();

	 	// get algorithm
	 	var algorithms = await labApi.fetchAlgorithms();
	 	expect(algorithms.length).toBeGreaterThan(util.MIN_EXPECTED_LAB_ALGO_COUNT);
	 	var algoId = algorithms.find(function(element) {return element.name == algoName;})._id;
	 	expect(algoId).toBeTruthy();

	 	algoParms.dataset = datasetId

	 	// fetch previously run experiments
		var prevExperiments = await labApi.fetchExperiments()

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
			util.delay(10000)
			count = count + 1
			experimentResults = await labApi.fetchExperiment(submitResult._id)
			console.log("experimentResults._status, count (" + count + "): ", experimentResults._status)
		}
		console.log("finished timeout...")

		// check that the expected results are there
		//console.log("experimentResults: ", experimentResults)
		expect(experimentResults._status).toBeTruthy()
		expect(experimentResults._status).toEqual('success')

		// check that the experiment results are available
		var model = await labApi.fetchExperimentModel(submitResult._id)
		expect(model).toBeTruthy()

		var script = await labApi.fetchExperimentScript(submitResult._id)
		expect(script).toBeTruthy()

		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)
	});


	it('run decisionTree experiment with invalid parms on banana', async () => {	
		console.log('run decisionTree experiment with invalid parms on banana')

		jest.setTimeout(15000)

		let algoName = 'LogisticRegression'
		let algoParms = {
			"penalty": "l1",
			"C": 1.0,
			"dual": true,
		};

		let datasetName = 'banana'
		let expectedError = 'ValueError: Unsupported set of arguments: The combination of penalty=\'l1\' and loss=\'logistic_regression\' are not supported when dual=True, Parameters: penalty=\'l1\', loss=\'logistic_regression\', dual=True'


		//-------------------
	 	// get dataset
	 	var datasets = await labApi.fetchDatasets();
	 	expect(datasets.length).toBeGreaterThan(util.MIN_EXPECTED_DATASET_COUNT);
	 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
	 	expect(datasetId).toBeTruthy();

	 	// get algorithm
	 	var algorithms = await labApi.fetchAlgorithms();
	 	expect(algorithms.length).toBeGreaterThan(util.MIN_EXPECTED_LAB_ALGO_COUNT);
	 	var algoId = algorithms.find(function(element) {return element.name == algoName;})._id;
	 	expect(algoId).toBeTruthy();

	 	algoParms.dataset = datasetId

	 	// fetch previously run experiments
		var prevExperiments = await labApi.fetchExperiments()

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
			util.delay(10000)
			count = count + 1
			experimentResults = await labApi.fetchExperiment(submitResult._id)
			console.log("experimentResults._status, count (" + count + "): ", experimentResults._status)
		}
		console.log("finished timeout...")

		// try to ping machine
		var machineData = await machineApi.fetchProjects()
		expect(Object.keys(machineData).length).toBeGreaterThan(1)
		console.log("successfully pinged machine")

		// check that the expected results are there
		console.log("experimentResults: ", experimentResults)
		expect(experimentResults._status).toBeTruthy()
		expect(experimentResults._status).toEqual('fail')
		expect(experimentResults).toHaveProperty('errorMessage')
		expect(experimentResults.errorMessage).toEqual(expectedError)

		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)
	});

	it.skip('start and then kill experiment', async () => {
		console.log('start and then kill experiment')
		jest.setTimeout(20000)

		let algoName = 'SVC'
		let algoParms = {
			"tol":1e-05
		};

		let datasetName = 'banana'

		//-------------------
	 	// get dataset
	 	var datasets = await labApi.fetchDatasets();
	 	expect(datasets.length).toBeGreaterThan(util.MIN_EXPECTED_DATASET_COUNT);
	 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
	 	expect(datasetId).toBeTruthy();

	 	// get algorithm
	 	var algorithms = await labApi.fetchAlgorithms();
	 	expect(algorithms.length).toBeGreaterThan(util.MIN_EXPECTED_LAB_ALGO_COUNT);
	 	var algoId = algorithms.find(function(element) {return element.name == algoName;})._id;
	 	expect(algoId).toBeTruthy();

	 	algoParms.dataset = datasetId

		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)

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

		// expect that the experiment started running
		var experimentResults = await labApi.fetchExperiment(submitResult._id)
		expect(experimentResults._status).toEqual('running')

		//var capRes = await machineApi.fetchCapacity(algoId)
		//expect(capRes.capacity).toEqual(0)

		// kill experiment
		var killResult = machineApi.killExperiment(submitResult._id)
		expect(killResult)

		// wait for the experiment to finish running, probably a better way to do this then delay...
		var count = 0
		console.log("starting timeout...")
		while (experimentResults._status === ('running') && count < 4) {
			util.delay(10000)
			count = count + 1
			experimentResults = await labApi.fetchExperiment(submitResult._id)
			console.log("experimentResults._status, count (" + count + "): ", experimentResults._status)
		}
		console.log("finished timeout...")

		// expect that the experiment was canceled
		var experimentResults = await labApi.fetchExperiment(submitResult._id)
		expect(experimentResults._status).toEqual('cancelled')

		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)
	});
});