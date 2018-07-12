/**
* First pass at integrations tests that run against the lab container api through an external context
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
	try {
		var machineProjects = await machineApi.fetchProjects()
	} catch (e) {
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}
  
  	//---get database projects state
  	var res

  	// db.machine.projects
  	res = await db.machines.find({"address":"http://machine:5081"}, {projects: 1}).toArrayAsync();
  	console.log("db.machines.res: ", res)
  	expect(res.length).toEqual(1)
  	var dbMachineProjects = res[0].projects

  	// db.projects
  	var dbProjects = await db.projects.find({}, {}).toArrayAsync();
  	console.log("db.projects res: ", res)

  	console.log("machineProjects:", machineProjects)
  	console.log("dbMachineProjects:", dbMachineProjects)
  	console.log("dbProjects:", dbProjects)

  	//---check server state against database state
  	expect(Object.keys(machineProjects).length).toBeGreaterThan(10)
  	expect(Object.keys(dbMachineProjects).length).toBeGreaterThan(10)
  	expect(Object.keys(dbProjects).length).toBeGreaterThan(10)

  	// TODO - check that db.machine.projects is a subset of machineProjects, check that ids match
  	// TODO - check that machineProjects is a subset of db.projects and that ids match
  	// TODO - check that db.machine.projects is a subset of db.projects and that ids match

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
