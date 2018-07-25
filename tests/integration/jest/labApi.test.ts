/**
* Integration tests against a lab instance
*
*/

import * as labApi from './labApi';


// fetch datasets and check for metafeatures
it('lab fetchDatasets', () => {
	expect.assertions(5);
	return labApi.fetchDatasets().then((data) => {
		expect(data.length).toBeGreaterThan(50);
		var adult = data.find(function(element) {
		  return element.name == 'adult';
		});
		expect(adult).toBeTruthy();
		expect(adult.metafeatures).toBeTruthy();
		expect(adult.metafeatures).toHaveProperty('n_rows')
		expect(adult.metafeatures).toHaveProperty('n_columns')
	});
});


it('lab fetchDataset', async () => {
	// get adult dataset
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var adultId = datasets.find(function(element) {return element.name == 'adult';})._id;
 	expect(adultId).toBeTruthy();

 	return labApi.fetchDataset(adultId).then((data) => {
 		console.log(data)
  		expect(data.length).toEqual(1);
  		expect(data[0].metafeatures).toBeTruthy();
		expect(data[0].metafeatures).toHaveProperty('n_rows')
		expect(data[0].metafeatures).toHaveProperty('n_columns')
	});
};


it.skip('lab fetchDatasetMetaFeatures', async () => {
	expect.assertions(3);

	// get adult dataset
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var adultId = datasets.find(function(element) {return element.name == 'adult';})._id;
 	expect(adultId).toBeTruthy();


 	return labApi.fetchDatasetMetafeatures(adultId).then((data) => {
 		console.log(data)
  		expect(data.length).toBeGreaterThan(4);
	});
};


it('lab fetchMachines', () => {
 	expect.assertions(1);
 	return labApi.fetchMachines().then((data) => {
  		expect(data.length).toEqual(1);
	});
};

it('lab fetchAlgorithms', () => {
 	expect.assertions(1);
 	return labApi.fetchAlgorithms().then((data) => {
  		expect(data.length).toBeGreaterThan(10);
	});
};


//it('lab run dt experiment on adult', async () => {
it('lab start dt experiment on adult', async () => {	
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
	//await labApi.fetchExperiments().resolves.toBeFalsy()

	// submit simple experiment
	let parms = {
		"dataset": adultId,
		"criterion": "gini",
		"max_depth": 3,
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
	console.log("SubmitResult: ", submitResult)

	// expect that the experiment started running
	var experimentResults = await labApi.fetchExperiment(submitResult._id)
	console.log("experimentResults: ", experimentResults)
	expect(experimentResults._status).toBeTruthy()
	expect(experimentResults._status).toEqual('running')

/*
	// wait for the experiment to finish runing
	while (experimentResults._status === ('running')) {
		setTimeout(function(){}, 10000)
		experimentResults = await labApi.fetchExperiment(submitResult._id)
		//console.log("experimentResults: ", experimentResults)
	}
*/
	//expect(experimentResults._status).toEqual('success')
});