/**
* Integration tests against a lab instance
*
*/

import * as labApi from './labApi';
import fs = require('fs');
import FormData = require('form-data');

const MIN_EXPECTED_LAB_ALGO_COUNT = 10; // min number of algorithms registered with in the server
const EXPECTED_DATASET_COUNT = 4; // min number of datasets registered with the lab server

const DATASET_PATH = '/appsrc/data/datasets/test/integration'

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

		it('putDatasetGood', async () => {
			let filepath = `${DATASET_PATH}/appendicitis_2.csv`

			let form = new FormData();

			let metadata =  JSON.stringify({
					'name': 'appendicitis_2.csv',
		            'username': 'testUser',
		            'timestamp': Date.now(),
		            'dependent_col' : 'target_class'
	            })

			form.append('_metadata', metadata)
			form.append('_files', fs.createReadStream(filepath));

			let result

			try {
				result = await labApi.putDataset(form);
			}
			catch (e) {
				var json = await e.response.json()
				expect(json.error).toBeUndefined()
				expect(e).toBeUndefined()
			}

			expect(result).toHaveProperty('message');
			expect(result).toHaveProperty('dataset_id');

			expect(result.message).toEqual("Files uploaded");
		});

		it('putDataset missing param _metadata', async () => {
			expect.assertions(2);

			let form = new FormData();

			try {
				var result = await labApi.putDataset(form);
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json.error).toEqual("Missing parameter _metadata")
				expect(e.response.status).toEqual(400)
			}
		});

		it.skip('putDataset empty file array', async () => {
			expect.assertions(2);

			var metadata = JSON.stringify({
					'name': 'datasetName',
		            'username': 'testUser',
		            'timestamp': Date.now(),
		            'dependent_col' : 'class',
	            })

			let form = new FormData();
			form.append('_metadata', metadata)

			try {
				var result = await labApi.putDataset(parms);
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json.error).toEqual("_files does not have length 1")
				expect(e.response.status).toEqual(400)
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