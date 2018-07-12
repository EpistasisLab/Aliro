/**
* Integration tests against a machine instance
*
*/

import * as machineApi from './machineApi';
import * as dbBuilder from "./util/db";


const db = dbBuilder.openDbConnection();


afterAll(() => {
  db.close();
});


it('machine.fetchProjects', async () => {
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
  	expect(Object.keys(data).length).toBeGreaterThan(10);
};

it('machine exists in db by address', async () => {
  	var dbMachine = await db.machines.find({"address":"http://machine:5081"}, {
        address: 1
    }).toArrayAsync();

  	//console.log('machine exists in db by address')
  	//console.log(dbMachine)

    expect(dbMachine.length).toEqual(1)
    expect(dbMachine[0].address).toEqual("http://machine:5081")

};

it('bad machine does not exist in db by address', async () => {
  	var dbMachine = await db.machines.find({"address":"http://machineFoobar:5081"}, {
        address: 1
    }).toArrayAsync();

    expect(dbMachine.length).toEqual(0)
};

it('machine projectIds match db machine.project ids', async () => {
	console.log('machine projectIds match db machine.project ids')
	
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

  	console.log("servMachineProjects:", servMachineProjects)
  	console.log("dbMachineProjects:", dbMachineProjects)
  	console.log("dbProjectsList:", dbProjectsList)

  	//---check server state against database state
  	expect(Object.keys(servMachineProjects).length).toBeGreaterThan(10)
  	expect(Object.keys(dbMachineProjects).length).toBeGreaterThan(10)
  	expect(Object.keys(dbProjectsList).length).toBeGreaterThan(10)

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
};


//Ref issue #52
it.skip('machine.fetchCapacity get BernoulliNB by id', async () => {
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
};

//Ref issue #52
it.skip('machine.fetchCapacity get DecisionTreeClassifier by id', async () => {
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
};
