/**
* First pass at integrations tests that run against the lab container api through an external context
*
*/

import * as labApi from './labApi';


it('integration fetchDatasets', () => {
	expect.assertions(2);
	return labApi.fetchDatasets().then((data) => {
		//console.log("fetchDatasets: ");
 		//console.log(data);
		expect(data.length).toBeGreaterThan(50);
		var adult = data.find(function(element) {
		  return element.name == 'adult';
		});
		expect(adult).toBeTruthy();
 		//console.log(adult);
	});
});

it('integration fetchMachines', () => {
 	expect.assertions(1);
 	return labApi.fetchMachines().then((data) => {
 		//console.log("fetchMachines: ");
 		//console.log(data);
  		expect(data.length).toEqual(1);
	});
};

it('integration fetchAlgorithms', () => {
 	expect.assertions(1);
 	return labApi.fetchAlgorithms().then((data) => {
 		//console.log("fetchAlgorithms: ");
 		//console.log(data);
  		expect(data.length).toBeGreaterThan(10);
	});
};


it('integration run simple experiment on adult', async () => {
 	//expect.assertions(5);
 	//console.log('integration runExperiment on adult')

 	// get adult
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var adultId = datasets.find(function(element) {return element.name == 'adult';})._id;
 	expect(adultId).toBeTruthy();

 	// get algorithm
 	var algorithms = await labApi.fetchAlgorithms();
 	expect(algorithms.length).toBeGreaterThan(10);
 	var algoId = algorithms.find(function(element) {return element.name == 'DecisionTreeClassifier';})._id;
 	expect(algoId).toBeTruthy();

 	// no pending or finished experiments on adult
	//await labApi.fetchExperiments().resolves.toBeFalsy()

	// submit simple experiment
	let parms = new Map([
		["dataset", adultId],
		["criterion", "gini"],
		["max_depth", 3],
		["min_samples_split", 2],
		["min_samples_leaf", 1]
	]);

	try {
		await labApi.submitExperiment(algoId, parms)
	} catch (e) {
		console.log("submitExperiment exception")
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}

	// should finish within 20 seconds
	//await labApi.fetchExperiments().resolves.toBeTruthy()
});