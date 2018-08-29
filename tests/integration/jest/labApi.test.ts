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

});