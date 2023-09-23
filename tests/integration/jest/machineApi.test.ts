/**
* Integration tests against a machine instance
*
*/

import * as machineApi from './machineApi';
import * as labApi from './labApi';
import * as dbBuilder from "./util/db";
import * as util from "./util/testUtils";
import FormData = require('form-data');
const fs = require('fs');


const db = dbBuilder.openDbConnection();

afterAll(() => {
  db.close();
});

describe('machine', () => {
	describe('api', () => {
		it('fetchProjects', async () => {
			try {
				var data = await machineApi.fetchProjects()
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json).toBeFalsy()
				expect(e).toBeFalsy() // break even if no message body returned
			}

			console.log("machine.fetchProjects");
		 	console.log("data: ", data);

		 	expect(data)
		  	expect(Object.keys(data).length).toEqual(util.EXPECTED_MACHINE_ALGO_COUNT);
		});

		it('fetchCapacity for KNeighborsClassifier by id', async () => {
			var labAlgos = await labApi.fetchAlgorithms()
			expect(labAlgos.length).toBeGreaterThan(10)
			var algoId = labAlgos.find(function(element) {return element.name == 'KNeighborsClassifier';})._id;
		 	expect(algoId).toBeTruthy();

		 	console.log("calling machine.fetchCapacity(", algoId,")")

			try {
				var data = await machineApi.fetchCapacity(algoId)
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json).toBeFalsy()
				expect(e).toBeFalsy() // break even if no message body returned
			}

			//console.log("machine.fetchCapacity KNeighborsClassifier'");
		 	//console.log("data:", data);
		 	expect(data).toHaveProperty('capacity')
		 	expect(data.capacity).toEqual(1)
		});

		it('fetchCapacity for DecisionTreeClassifier by id', async () => {
			var labAlgos = await labApi.fetchAlgorithms()
			expect(labAlgos.length).toBeGreaterThan(10)
			var algoId = labAlgos.find(function(element) {return element.name == 'DecisionTreeClassifier';})._id;
		 	expect(algoId).toBeTruthy();

		 	console.log("calling machine.fetchCapacity(", algoId,")")

			try {
				var data = await machineApi.fetchCapacity(algoId)
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json).toBeFalsy()
				expect(e).toBeFalsy() // break even if no message body returned
			}

			//console.log("machine.fetchCapacity DecisionTreeClassifier");
		 	//console.log("data:", data);
		  	expect(data).toHaveProperty('capacity')
		 	expect(data.capacity).toEqual(1)
		});

        it('Test the code run API endpoint results are correct.', async () => {
            var labCodeRun = await labApi.postCodeExecutions({ src_code: "print('hello world')" })
            expect(labCodeRun.status).toBeTruthy()
            expect(labCodeRun.status).toEqual('completed')
            expect(labCodeRun._id).toBeTruthy()
            expect(labCodeRun.result).toEqual('hello world\n')
			expect(labCodeRun.files).toEqual([])
        });

		it('Test the code run API handles generated files correctly.', async () => {
			var labCodeRun = await labApi.postCodeExecutions({ 
				src_code: "with open('test.txt', 'w') as file:\n    file.write('hello world')\nwith open('test2.txt', 'w') as file:\n    file.write('hello world 2')"
			})
			expect(labCodeRun.status).toBeTruthy()
            expect(labCodeRun.status).toEqual('completed')
            expect(labCodeRun._id).toBeTruthy()
            expect(labCodeRun.result).toEqual('')
			expect(labCodeRun.files[0]).toHaveProperty("_id")
			expect(labCodeRun.files[0]).toHaveProperty("filename")
			expect(labCodeRun.files[1]).toHaveProperty("_id")
			expect(labCodeRun.files[1]).toHaveProperty("filename")

		})

        it('Test code run API endpoint recognizes df.', async () => {
			// upload a test dataset
			let filename = 'exec_df_iris.csv'
			let filepath = `${util.DATASET_PATH}/${filename}`
			let form = new FormData();
			let metadata = JSON.stringify({
				'name': filename,
				'username': 'testuser',
				'timestamp': Date.now(),
				'dependent_col': 'class',
				'prediction_type': 'classification',
				'categorical_features': [],
				'ordinal_features': []
			})

			console.log(metadata)
			form.append('_metadata', metadata)
			form.append('_files', fs.createReadStream(filepath));

			console.log('form:', form);

			let result;

			try {
				result = await labApi.putDataset(form);
				console.log('result:');
				console.log(result);
			} catch (e) {
				var json = await e.response.json()
				expect(json.error).toBeUndefined()
				expect(e).toBeUndefined()
			}

			expect(result).toHaveProperty('dataset_id');

			var dataset_id = result.dataset_id;

            var labCodeRun = await labApi.postCodeExecutions({ 
				src_code: "print(df.head(1))", 
				dataset_id: dataset_id
			});

            expect(labCodeRun.status).toBeTruthy()
            expect(labCodeRun.status).toEqual('completed')
            expect(labCodeRun._id).toBeTruthy()
            expect(labCodeRun.result).toBeTruthy()
			expect(labCodeRun._dataset_id).toEqual(dataset_id)
        });

		let dataset_result;

        it('Test code run API endpoint recognizes model.', async () => {
			
			jest.setTimeout(util.JEST_TIMEOUT*10)
			
			// upload a test dataset
			let filename = 'bananamodel.csv'
			let filepath = `${util.DATASET_PATH}/${filename}`
			let form = new FormData();
			let metadata = JSON.stringify({
				'name': filename,
				'username': 'testuser',
				'timestamp': Date.now(),
				'dependent_col': 'class',
				'prediction_type': 'classification',
				'categorical_features': [],
				'ordinal_features': []
			})

			console.log(metadata)
			form.append('_metadata', metadata)
			form.append('_files', fs.createReadStream(filepath));

			console.log('form:', form);

			// let result;

			try {
				// result = await labApi.putDataset(form);
				dataset_result = await labApi.putDataset(form);
				console.log('dataset_result:');
				console.log(dataset_result);
			} catch (e) {
				var json = await e.response.json()
				expect(json.error).toBeUndefined()
				expect(e).toBeUndefined()
			}

			expect(dataset_result).toHaveProperty('dataset_id');

			let dataset_id = dataset_result.dataset_id;

			let algoName = 'LogisticRegression'
			let algoParams = {
				"penalty": "l1",
				"C": 1.0,
				"dual": false,
				"dataset": dataset_id
			};

			// get algorithms
			var algorithms = await labApi.fetchAlgorithms();
			expect(algorithms.length).toBeGreaterThanOrEqual(util.MIN_EXPECTED_LAB_ALGO_COUNT);
			var algoId = algorithms.find(function(element) { return element.name == algoName; })._id;
			expect(algoId).toBeTruthy();

			// submit a simple experiment
			try {
				var submitResult = await labApi.submitExperiment(algoId, algoParams);
			} catch (e) {
				console.log("submit experiment exception")
				var json = await e.response.json();
				expect(json).toBeFalsy();
				expect(e).toBeFalsy();
			}

			expect(submitResult).toBeTruthy();

			// expect that the experiment started running
			var experimentResult = await labApi.fetchExperiment(submitResult._id)
			//console.log("experimentResults: ", experimentResults)
			expect(experimentResult._status).toBeTruthy()
			expect(experimentResult._status).toEqual('running')
			expect(experimentResult._prediction_type).toEqual('classification')

			// wait for the experiment to finish running, probably a better way to do this then delay...
			var count = 0
			console.log("starting timeout...")
			// while (experimentResult._status === ('running') && count < 10) {
			while (experimentResult._status === ('running') && count < 30) {
				util.delay(10000)
				count = count + 1
				experimentResult = await labApi.fetchExperiment(experimentResult._id)
				console.log("experimentResult._status, count (" + count + "): ", experimentResult._status)
			}
			console.log("finished timeout...")

			// check that the expected results are there
			//console.log("experimentResult: ", experimentResult)
			expect(experimentResult._status).toBeTruthy()
			expect(experimentResult._status).toEqual('success')

			// check that the experiment results are available
			var model = await labApi.fetchExperimentModel(experimentResult._id)
			// example model value:
			// {"_id": "65026b6456a434004af258e4", "filename": "model_65026b5f56a434004af258e1.pkl", "mimetype": "application/octet-stream", "timestamp": 1694657380209}
			expect(model).toBeTruthy()

            var labCodeRun = await labApi.postCodeExecutions({ 
				src_code: "print(model)", 
				dataset_id: dataset_id,
				experiment_id: experimentResult._id,
			});

			console.log('code execution model result:');
			console.log(labCodeRun);

            expect(labCodeRun.status).toBeTruthy();
            expect(labCodeRun.status).toEqual('completed');
            expect(labCodeRun._id).toBeTruthy();
            expect(labCodeRun.result).toBeTruthy();
			expect(labCodeRun._dataset_id).toEqual(dataset_id);
			expect(labCodeRun.result).toMatch(new RegExp(`^${algoName}?`))
        });


		it('Test that a dataset is deleted correctly', async () => {
			// dataset_result is reused from the previous test
			expect(dataset_result).toBeTruthy();
			expect(dataset_result).toHaveProperty('dataset_id');
			let delete_dataset_result = await labApi.deleteDataset(dataset_result.dataset_id);
			console.log('delete_dataset_result', delete_dataset_result);
			expect(delete_dataset_result).toBeTruthy();
			expect(delete_dataset_result).toHaveProperty('datasetCount');
			expect(delete_dataset_result.datasetCount).toEqual(1);
			expect(delete_dataset_result).toHaveProperty('experimentCount');
			expect(delete_dataset_result.experimentCount).toBeTruthy();
		});

		it('Test that an experiment can run after deleting a dataset', async () => {
			jest.setTimeout(util.JEST_TIMEOUT*10)
			
			// upload a test dataset
			let filename = 'bananamodel.csv'
			let filepath = `${util.DATASET_PATH}/${filename}`
			let form = new FormData();
			let metadata = JSON.stringify({
				'name': filename,
				'username': 'testuser',
				'timestamp': Date.now(),
				'dependent_col': 'class',
				'prediction_type': 'classification',
				'categorical_features': [],
				'ordinal_features': []
			})

			console.log(metadata)
			form.append('_metadata', metadata)
			form.append('_files', fs.createReadStream(filepath));

			console.log('form:', form);

			// let result;

			try {
				// result = await labApi.putDataset(form);
				dataset_result = await labApi.putDataset(form);
				console.log('dataset_result:');
				console.log(dataset_result);
			} catch (e) {
				var json = await e.response.json()
				expect(json.error).toBeUndefined()
				expect(e).toBeUndefined()
			}

			expect(dataset_result).toHaveProperty('dataset_id');

			let dataset_id = dataset_result.dataset_id;

			let algoName = 'LogisticRegression'
			let algoParams = {
				"penalty": "l1",
				"C": 1.0,
				"dual": false,
				"dataset": dataset_id
			};

			// get algorithms
			var algorithms = await labApi.fetchAlgorithms();
			expect(algorithms.length).toBeGreaterThanOrEqual(util.MIN_EXPECTED_LAB_ALGO_COUNT);
			var algoId = algorithms.find(function(element) { return element.name == algoName; })._id;
			expect(algoId).toBeTruthy();

			// submit a simple experiment
			try {
				var submitResult = await labApi.submitExperiment(algoId, algoParams);
			} catch (e) {
				console.log("submit experiment exception")
				var json = await e.response.json();
				expect(json).toBeFalsy();
				expect(e).toBeFalsy();
			}

			expect(submitResult).toBeTruthy();

			// expect that the experiment started running
			var experimentResult = await labApi.fetchExperiment(submitResult._id)
			//console.log("experimentResults: ", experimentResults)
			expect(experimentResult._status).toBeTruthy()
			expect(experimentResult._status).toEqual('running')
			expect(experimentResult._prediction_type).toEqual('classification')

			// wait for the experiment to finish running, probably a better way to do this then delay...
			var count = 0
			console.log("starting timeout...")
			// while (experimentResult._status === ('running') && count < 10) {
			while (experimentResult._status === ('running') && count < 30) {
				util.delay(10000)
				count = count + 1
				experimentResult = await labApi.fetchExperiment(experimentResult._id)
				console.log("experimentResult._status, count (" + count + "): ", experimentResult._status)
			}
			console.log("finished timeout...")

			// check that the expected results are there
			//console.log("experimentResult: ", experimentResult)
			expect(experimentResult._status).toBeTruthy()
			expect(experimentResult._status).toEqual('success')
		})

        it('Test the package install API endpoint with good package.', async () => {
            var labCodeInstall = await labApi.postPackageInstall({ command: 'install', packages: ['numpy'] })
            expect(labCodeInstall.exec_results.code).toEqual(0)
            expect(labCodeInstall.exec_results.stdout).toBeTruthy()
        });

        it('Test the package install API endpoint with a bad package.', async () => {
            var labCodeInstall = await labApi.postPackageInstall({ command: 'install', packages: ['test'] })
            expect(labCodeInstall.exec_results.code).toEqual(1)
            expect(labCodeInstall.exec_results.stderr).toBeTruthy()
        })

	});

	describe('startup validation', () =>
		it('machine exists in lab by address', async () => {
		  	var dbMachine = await db.machines.find({"address":"http://machine:5081"}, {
		        address: 1
		    }).toArrayAsync();

		  	//console.log('machine exists in db by address')
		  	//console.log(dbMachine)

		    expect(dbMachine.length).toEqual(1)
		    expect(dbMachine[0].address).toEqual("http://machine:5081")
		})
	);

	it('bad machine does not exist in db by address', async () => {
		var dbMachine = await db.machines.find({"address":"http://machineFoobar:5081"}, {
			address: 1
		}).toArrayAsync();

		expect(dbMachine.length).toEqual(0)
	});

	it('local machine projectIds match db machine.projectIds', async () => {
		//console.log('machine projectIds match db machine.project ids')
		
		//---get machine server projects state
		let servMachineProjects : Object
		try {
			servMachineProjects = await machineApi.fetchProjects()
		} catch (e) {
			var json = await e.response.json() // get the specific error description
			expect(json).toBeFalsy()
			expect(e).toBeFalsy() // break even if no message body returned
		}
		
		//---get database projects state
		var res

		// db.machine.projects
		res = await db.machines.find({"address":"http://machine:5081"}, {projects: 1}).toArrayAsync();
		//console.log("db.machines.res: ", res)
		expect(res.length).toEqual(1)
		let dbMachineProjects : Object = res[0].projects

		// db.projects
		let dbProjectsList : Object[] = await db.projects.find({}, {name: 1}).toArrayAsync();
		//console.log("db.projects res: ", res)

		//console.log("servMachineProjects:", servMachineProjects)
		//console.log("dbMachineProjects:", dbMachineProjects)
		//console.log("dbProjectsList:", dbProjectsList)

		//---check server state against database state
		expect(Object.keys(servMachineProjects).length).toEqual(util.EXPECTED_MACHINE_ALGO_COUNT)
		expect(Object.keys(dbMachineProjects).length).toEqual(util.EXPECTED_MACHINE_ALGO_COUNT)
		expect(Object.keys(dbProjectsList).length).toBeGreaterThan(util.MIN_EXPECTED_DATASET_COUNT)

		// check that dbMachineProjects is a subset of servMachineProjects by id
		for (let dbMacProjId of Object.keys(dbMachineProjects)) {
			let dbMacProjSpec = dbMachineProjects[dbMacProjId]

			// db.machine.projects is a subset of the projects defined on the server
			expect(servMachineProjects).toHaveProperty(dbMacProjId)

			let serverProjSpec = servMachineProjects[dbMacProjId] 
			expect(dbMacProjSpec.name).toEqual(serverProjSpec.name)

			// db.machine.projects is a subset of the projects defined in db.projects
			// TODO: this should work??
			//expect(dbProjectsList).toContainEqual({_id: dbMacProjId, name: dbMacProjSpec.name})

			/*
			console.log("dbMacProjId: ", dbMacProjId)
			console.log("serverProjSpec: ", serverProjSpec)
			console.log("dbMacProjSpec: ", dbMacProjSpec)
			console.log("dbProjExpected: ", dbProjExpected)
			*/
		}
	});
});
