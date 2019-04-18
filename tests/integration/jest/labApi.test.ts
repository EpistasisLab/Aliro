/**
* Integration tests against a lab instance
*
*/

import * as labApi from './labApi';
import * as util from "./util/testUtils";
import fs = require('fs');
import FormData = require('form-data');


describe('lab', () => {
	describe('api', () => {
		describe.each`
			testname					| filename						| categorical	| ordinal
			${'numeric'}				| ${'appendicitis_2.csv'}		| ${[]}			| ${{}}
			${'categorical'}			| ${'appendicitis_cat.csv'}		| ${["cat"]}	| ${{}}
			${'categorical_ordinal'}	| ${'appendicitis_cat_ord.csv'}	| ${["cat"]}	| ${ {"ord" : ["first", "second", "third"]} }
			`("putDatasetGood", ({testname, filename, categorical, ordinal}) => {
				it(`${testname}`, async () => {
					jest.setTimeout(15000)
					let filepath = `${util.DATASET_PATH}/${filename}`

					console.log(`${testname} ${filename} ${categorical} ${ordinal}`)
					let form = new FormData();

					let metadata =  JSON.stringify({
							'name': filename,
				            'username': 'testuser',
				            'timestamp': Date.now(),
				            'dependent_col' : 'target_class',
				            'categorical_features' : categorical,
				            'ordinal_features' : ordinal
			            })
					console.log(metadata)
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
				})
			}
		)


		describe('putDatasetBad', () => {
			it('string data in file', async () => {
				expect.assertions(3);

				let filepath = `${util.DATASET_PATH}/appendicitis_cat.csv`

				let form = new FormData();

				let metadata =  JSON.stringify({
						'name': 'appendicitis_cat_datasetbad.csv',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'target_class',
			            'categorical_features' : []		
		            })

				form.append('_metadata', metadata)
				form.append('_files', fs.createReadStream(filepath));

				let result

				try {
					result = await labApi.putDataset(form);
				}
				catch (e) {
					var json = await e.response.json()
					expect(json.error).toBeTruthy()
					expect(e.response.status).toEqual(400)
					expect(json.error).toEqual("Unable to upload files: Error: Error: Datafile validation failed: sklearn.check_array() validation failed: could not convert string to float: 'b'")
				}
			});

			it('invalid metadata key', async () => {
				expect.assertions(3);

				let filepath = `${util.DATASET_PATH}/appendicitis_2.csv`

				let form = new FormData();

				let metadata =  JSON.stringify({
						'name': 'appendicitis_2_datasetbad.csv',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'target_class',
			            'foobar' : 'foo'
		            })

				form.append('_metadata', metadata)
				form.append('_files', fs.createReadStream(filepath));

				let result

				try {
					result = await labApi.putDataset(form);
				}
				catch (e) {
					var json = await e.response.json()
					expect(json.error).toBeTruthy()
					expect(e.response.status).toEqual(400)
					expect(json.error).toEqual("invalid _metadata key: foobar")
				}
			});

			it('bad username', async () => {
				expect.assertions(3);

				let filepath = `${util.DATASET_PATH}/appendicitis_2.csv`

				let form = new FormData();

				let metadata =  JSON.stringify({
						'name': 'appendicitis.csv',
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
					expect(json.error).toBeTruthy()
					expect(e.response.status).toEqual(400)
					expect(json.error).toEqual("Unable to upload files: Error: Error: Metadata validation failed, username 'testUser' does not exist.")
				}
			});

			it('existing filename', async () => {
				expect.assertions(3);

				let filepath = `${util.DATASET_PATH}/banana.csv`

				let form = new FormData();

				let metadata =  JSON.stringify({
						'name': 'banana',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'class'
		            })

				form.append('_metadata', metadata)
				form.append('_files', fs.createReadStream(filepath));

				let result

				try {
					result = await labApi.putDataset(form);
				}
				catch (e) {
					var json = await e.response.json()
					expect(json.error).toBeTruthy()
					expect(e.response.status).toEqual(400)
					expect(json.error).toEqual("Unable to upload files: Error: Error: Metadata validation failed, dataset with name 'banana' has already been registered, count: 1.")
				}
			});

			it('missing param _metadata', async () => {
				expect.assertions(2);

				let form = new FormData();

				try {
					var result = await labApi.putDataset(form);
				} catch (e) {
					var json = await e.response.json() // get the specific error description
					expect(e.response.status).toEqual(400)
					expect(json.error).toEqual("Missing parameter _metadata")
				}
			});

			it('empty files array', async () => {
				expect.assertions(1);

				var metadata = JSON.stringify({
						'name': 'datasetName',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'class',
		            })

				let form = new FormData();
				form.append('_metadata', metadata)

				try {
					var result = await labApi.putDataset(form);
				} catch (e) {
					var json = await e.response // get the specific error description
					expect(e.response.status).toEqual(400)
					//expect(json.error).toEqual("_files does not have length 1")
				}
			});

			it('incorrect file object', async () => {
				expect.assertions(1);

				var metadata = JSON.stringify({
						'name': 'datasetName',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'class',
		            })

				let form = new FormData();
				form.append('_metadata', metadata)
				form.append('_files', 'im not a file');

				try {
					var result = await labApi.putDataset(form);
				} catch (e) {
					var json = await e.response // get the specific error description
					expect(e.response.status).toEqual(400)
					//expect(json.error).toEqual("_files[0] is not of type File")
				}
			});

			it('multiple files', async () => {
				expect.assertions(1);

				let filepath1 = `${util.DATASET_PATH}/appendicitis_cat.csv`
				let filepath2 = `${util.DATASET_PATH}/banana.csv`

				var metadata = JSON.stringify({
						'name': 'datasetName',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'class',
		            })

				let form = new FormData();
				form.append('_metadata', metadata)
				form.append('_files', fs.createReadStream(filepath1));
				form.append('_files', fs.createReadStream(filepath2));

				try {
					var result = await labApi.putDataset(form);
				} catch (e) {
					var json = await e.response // get the specific error description
					expect(e.response.status).toEqual(500)
				}
			});

			it('empty file', async () => {
				expect.assertions(1);

				let filepath = `${util.DATASET_PATH}/empty.csv`

				var metadata = JSON.stringify({
						'name': 'datasetName',
			            'username': 'testuser',
			            'timestamp': Date.now(),
			            'dependent_col' : 'class',
		            })

				let form = new FormData();
				form.append('_metadata', metadata)
				form.append('_files', fs.createReadStream(filepath));

				try {
					var result = await labApi.putDataset(form);
				} catch (e) {
					var json = await e.response // get the specific error description
					expect(e.response.status).toEqual(400)
					//expect(json.error).toEqual("_files[0] has size 0")
				}
			});
		};

		// fetch datasets and check for metafeatures
		it('fetchDatasets', () => {
			expect.assertions(5);
			return labApi.fetchDatasets().then((data) => {
				expect(data.length).toBeGreaterThanOrEqual(util.MIN_EXPECTED_DATASET_COUNT);
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
		 		//console.log(data)
		  		expect(data.length).toEqual(1);
		  		expect(data[0].metafeatures).toBeTruthy();
				expect(data[0].metafeatures).toHaveProperty('n_rows')
				expect(data[0].metafeatures).toHaveProperty('n_columns')
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