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

describe('run regression experiment', () => {
	it('run DecisionTreeRegressor experiment on 192_vineyard', async () => {
		console.log('run DecisionTreeRegressor experiment on 192_vineyard')

		jest.setTimeout(util.JEST_TIMEOUT)

		let algoName = 'DecisionTreeRegressor'
		let algoParms = {
			"criterion": "mse",
			"max_depth": 3,
			"min_samples_split": 2,
			"min_samples_leaf": 1,
			"min_weight_fraction_leaf": 0.0,
			"max_features": "sqrt"
		};

		let datasetName = "192_vineyard.csv";

		//-------------------
	 	// get dataset
	 	var datasets = await labApi.fetchDatasets();
	 	expect(datasets.length).toBeGreaterThanOrEqual(util.MIN_EXPECTED_DATASET_COUNT);
	 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
	 	expect(datasetId).toBeTruthy();

	 	// get algorithm
	 	var algorithms = await labApi.fetchAlgorithms();
	 	expect(algorithms.length).toBeGreaterThanOrEqual(util.MIN_EXPECTED_LAB_ALGO_COUNT);
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
		while (experimentResults._status === ('running') && count < 10) {
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


	it('start and then kill experiment', async () => {
		console.log('start and then kill experiment')
		util.delay(15000)
		jest.setTimeout(util.JEST_TIMEOUT+10000)

		let algoName = 'XGBRegressor'
		let algoParms = {
			"n_estimators":12000
		};

		let datasetName = "192_vineyard.csv";

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
		console.log("killing experiment...")
		var killResult = machineApi.killExperiment(submitResult._id)
		console.log("kill result: ", killResult)
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

		// hacky...
		util.delay(30000)
		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)
	});
});
