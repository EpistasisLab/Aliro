/**
* Integration tests against a machine instance
*
*/

import * as machineApi from './machineApi';
import * as labApi from './labApi';
import * as dbBuilder from "./util/db";
import * as util from "./util/testUtils";


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
