/**
* Integration tests against a lab instance
*
*/

import * as labApi from './labApi';


const MIN_EXPECTED_LAB_ALGO_COUNT = 10; // min number of algorithms registered with in the server
const EXPECTED_DATASET_COUNT = 4; // min number of datasets registered with the lab server

describe('lab', () => {
	describe('api', () => {
		// fetch datasets and check for metafeatures
		it('fetchDatasets', () => {
			expect.assertions(5);
			return labApi.fetchDatasets().then((data) => {
				expect(data.length).toEqual(EXPECTED_DATASET_COUNT);
				var banana = data.find(function(element) {
				  return element.name == 'banana';
				});
				expect(banana).toBeTruthy();
				expect(banana.metafeatures).toBeTruthy();
				expect(banana.metafeatures).toHaveProperty('n_rows')
				expect(banana.metafeatures).toHaveProperty('n_columns')
			});
		});


		it('fetchDataset', async () => {
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
		});

		it.skip('putDatasetGood', async () => {
			var parms = {
				_files:[],
				_metadata:[]
			}
			var result = await labApi.putDataset(parms);

			expect(result).toHaveProperty('message');
			expect(result).toHaveProperty('dataset_id');

			expect(result.message).toEqual("Files uploaded");
		});

		it('putDataset missing param _metadata', async () => {
			expect.assertions(2);

			var parms = {
				_files:[]
			}

			try {
				var result = await labApi.putDataset(parms);
			} catch (e) {
				console.log(`error: ${e}`)
				console.log(e.response)
				expect(e.response.status).toEqual(400)
				var json = await e.response.json() // get the specific error description
				expect(json.error).toEqual("Missing parameter _metadata")
			}
		});

		it('putDataset missing param _metadata.filepath', async () => {
			expect.assertions(2);

			var parms = {
				_files:[],
				_metadata: JSON.stringify({
					'name': 'datasetName',
		            'username': 'testUser',
		            'timestamp': Date.now(),
		            'dependent_col' : 'class',
	            })
			}

			try {
				var result = await labApi.putDataset(parms);
			} catch (e) {
				console.log(`error: ${e}`)
				console.log(e.response)
				expect(e.response.status).toEqual(400)
				var json = await e.response.json() // get the specific error description
				expect(json.error).toEqual("Missing parameter _metadata.filepath")
			}
		});


		it.skip('fetchDatasetMetafeatures', async () => {
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
		});


		it('fetchMachines', () => {
		 	expect.assertions(1);
		 	return labApi.fetchMachines().then((data) => {
		  		expect(data.length).toEqual(1);
			});
		});

		it('fetchAlgorithms', () => {
		 	expect.assertions(1);
		 	return labApi.fetchAlgorithms().then((data) => {
		  		expect(data.length).toBeGreaterThan(10);
			});
		});
	});
});