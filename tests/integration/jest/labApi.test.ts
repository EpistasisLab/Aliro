/**
* Integration tests against a lab instance
*
*/

import * as labApi from './labApi';


// fetch datasets and check for metafeatures
it('lab fetchDatasets', () => {
	expect.assertions(5);
	return labApi.fetchDatasets().then((data) => {
		expect(data.length).toBeGreaterThan(30);
		var banana = data.find(function(element) {
		  return element.name == 'banana';
		});
		expect(banana).toBeTruthy();
		expect(banana.metafeatures).toBeTruthy();
		expect(banana.metafeatures).toHaveProperty('n_rows')
		expect(banana.metafeatures).toHaveProperty('n_columns')
	});
});


it('lab fetchDataset', async () => {
	// get banana dataset
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var bananaId = datasets.find(function(element) {return element.name == 'banana';})._id;
 	expect(bananaId).toBeTruthy();

 	return labApi.fetchDataset(bananaId).then((data) => {
 		console.log(data)
  		expect(data.length).toEqual(1);
  		expect(data[0].metafeatures).toBeTruthy();
		expect(data[0].metafeatures).toHaveProperty('n_rows')
		expect(data[0].metafeatures).toHaveProperty('n_columns')
	});
};


it.skip('lab fetchDatasetMetaFeatures', async () => {
	expect.assertions(3);

	// get banana dataset
 	var datasets = await labApi.fetchDatasets();
 	expect(datasets.length).toBeGreaterThan(1);
 	var bananaId = datasets.find(function(element) {return element.name == 'banana';})._id;
 	expect(bananaId).toBeTruthy();


 	return labApi.fetchDatasetMetafeatures(bananaId).then((data) => {
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