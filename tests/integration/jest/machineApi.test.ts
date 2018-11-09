/**
* Integration tests against a machine instance
*
*/

import * as machineApi from './machineApi';
import * as labApi from './labApi';
import * as dbBuilder from "./util/db";
import * as util from "./util/testUtils";


const db = dbBuilder.openDbConnection();

const EXPECTED_MACHINE_ALGO_COUNT = 6; // number of algorithms a machine instance can run
const MIN_EXPECTED_LAB_ALGO_COUNT = 10; // min number of algorithms registered with in the server
const MIN_EXPECTED_DATASET_COUNT = 4; // min number of datasets registered with the lab server


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

			//console.log("machine.fetchProjects");
		 	//console.log("data: ", data);

		 	expect(data)
		  	expect(Object.keys(data).length).toEqual(EXPECTED_MACHINE_ALGO_COUNT);
		});

		//Ref issue #52
		it.skip('fetchCapacity for BernoulliNB by id', async () => {
			try {
				var data = await machineApi.fetchCapacity("5813bdaec1321420f8bbcc7f")
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json).toBeFalsy()
				expect(e).toBeFalsy() // break even if no message body returned
			}

			console.log("machine.fetchCapacity BernoulliNB'");
		 	console.log("data:", data);
		  	expect(Object.keys(data).length).toEqual(1);
		});

		//Ref issue #52
		it.skip('fetchCapacity for DecisionTreeClassifier by id', async () => {
			try {
				var data = await machineApi.fetchCapacity("5817660338215335404347c7")
			} catch (e) {
				var json = await e.response.json() // get the specific error description
				expect(json).toBeFalsy()
				expect(e).toBeFalsy() // break even if no message body returned
			}

			console.log("machine.fetchCapacity DecisionTreeClassifier");
		 	console.log("data:", data);
		  	expect(data.length).toEqual(1);
		});

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

		});

		it('bad machine does not exist in db by address', async () => {
		  	var dbMachine = await db.machines.find({"address":"http://machineFoobar:5081"}, {
		        address: 1
		    }).toArrayAsync();

		    expect(dbMachine.length).toEqual(0)
		});

		it.skip('kill experiment', async () => {
			let algoName = 'LogisticRegression'
			let algoParms = {
				"penalty": "l1",
				"C": 1.0,
				"dual": false,
			};

			let datasetName = 'banana'

			//-------------------
		 	// get dataset
		 	var datasets = await labApi.fetchDatasets();
		 	expect(datasets.length).toBeGreaterThan(MIN_EXPECTED_DATASET_COUNT);
		 	var datasetId = datasets.find(function(element) {return element.name == datasetName;})._id;
		 	expect(datasetId).toBeTruthy();

		 	// get algorithm
		 	var algorithms = await labApi.fetchAlgorithms();
		 	expect(algorithms.length).toBeGreaterThan(MIN_EXPECTED_LAB_ALGO_COUNT);
		 	var algoId = algorithms.find(function(element) {return element.name == algoName;})._id;
		 	expect(algoId).toBeTruthy();

		 	algoParms.dataset = datasetId

		 	// no experiments
			var experiments = await labApi.fetchExperiments()
			expect(experiments).toHaveLength(0)

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
			var killResult = machineApi.killExperiment(submitResult._id)
			expect(killResult)

			//util.delay(5000)

			// expect that the experiment started canceled
			//var capRes = await machineApi.fetchCapacity(algoId)
			//expect(capRes.capacity).toEqual(1)

			var experimentResults = await labApi.fetchExperiment(submitResult._id)
			expect(experimentResults._status).toEqual('cancelled')
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
		  	expect(Object.keys(servMachineProjects).length).toEqual(EXPECTED_MACHINE_ALGO_COUNT)
		  	expect(Object.keys(dbMachineProjects).length).toEqual(EXPECTED_MACHINE_ALGO_COUNT)
		  	expect(Object.keys(dbProjectsList).length).toBeGreaterThan(MIN_EXPECTED_DATASET_COUNT)

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
	})
})