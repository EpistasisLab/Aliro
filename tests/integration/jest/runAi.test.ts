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

describe('ai', () => {
	it('start ai for banana', async () => {
		console.log('start ai')

		jest.setTimeout(util.JEST_TIMEOUT*2)

		let algoName = 'LogisticRegression'
		let datasetName = 'banana'

		let newSuccessExpParms = {'date_start':Date.now(), '_status':'success'}

		//-------------------
	 	// get dataset
	 	var datasets = await labApi.fetchDatasets();
	 	expect(datasets.length).toBeGreaterThan(1);
	 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
	 	expect(datasetId).toBeTruthy();

	 	// get algorithm
	 	var algorithms = await labApi.fetchAlgorithms();
	 	expect(algorithms.length).toBeGreaterThanOrEqual(util.MIN_EXPECTED_LAB_ALGO_COUNT);
	 	var algoId = algorithms.find(function(element) {return element.name == algoName;})._id;
	 	expect(algoId).toBeTruthy();

	 	// make sure machine is free
		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)
		console.log("checked machine")

	 	// fetch previously run experiments
		var prevExperiments = await labApi.fetchExperiments()
		console.log("number previous experiments: ", prevExperiments.length)

	 	// turn on ai
	 	await labApi.updateAiStatus(datasetId, "requested")

	 	// wait for ai status to change
	 	var dataset = await labApi.fetchDataset(datasetId)
	 	console.log("dataset[0].ai: ", dataset[0].ai)

		var count = 0
		console.log("starting timeout...")
		while ((dataset[0].ai === ('requested') || (dataset[0].ai === ('on')))
				&& count < 6) {
			util.delay(10000)
			count = count + 1

			var experiments = await labApi.fetchExperiments()
			dataset = await labApi.fetchDataset(datasetId)
			console.log("dataset[0].ai, count (" + count + ") status:", dataset[0].ai, " total experiment count: ", experiments.length)
		}
		console.log("finished timeout...")
		console.log("dataset[0].ai: ", dataset[0].ai)

	 	// check ai status
	 	expect(dataset[0].ai).toBeTruthy()
		expect(dataset[0].ai).toEqual('finished')

		// check for new experiments
		var allExperiments = await labApi.fetchExperiments()
		expect(allExperiments.length).toEqual(prevExperiments.length + util.NUM_AI_RECS)
		console.log("checked new experiment count")

		// wait for experiments to complete
		console.log("waiting for experiments to finish")
		var experiments = await labApi.fetchExperimentsParms(newSuccessExpParms)
		console.log("new success experiments:", experiments)

		var count = 0
		console.log("starting timeout...")
		while (!experiments && count < 10) {
			util.delay(10000)
			count = count + 1
			experiments = await labApi.fetchExperimentsParms(newSuccessExpParms)
			console.log("new success experiments, count (" + count + "): ", experiments)
		}
		console.log("finished timeout...")

		expect(experiments).toBeTruthy()

		/*
		// make sure machine is free
		var capRes = await machineApi.fetchCapacity(algoId)
		expect(capRes.capacity).toEqual(1)
		console.log("checked machine")
		*/
	});
});
