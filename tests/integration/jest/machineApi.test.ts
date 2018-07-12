/**
* First pass at integrations tests that run against the lab container api through an external context
*
*/

import * as machineApi from './machineApi';
var db = require("./util/db").db; 


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

/*
it('machine exists in db by address', async () => {
  	var dbMachine = await db.machines.find({"address":"http://machine:5081"}, {
        address: 1
    }).toArrayAsync();

    expect(dbMachine).toBeTruthy()

};

it('bad machine does not exist in db by address', async () => {
  	var dbMachine = await db.machines.find({"address":"http://machineFoobar:5081"}, {
        address: 1
    }).toArrayAsync();

  	//console.log('bad machine does not exist in db by address')
  	//console.log(dbMachine)

    expect(dbMachine.isFulfilled).toEqual(false)

};
*/

it('machine projectIds match db machine.project ids', async () => {
	try {
		var machineProjects = await machineApi.fetchProjects()
	} catch (e) {
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}

  	expect(Object.keys(machineProjects).length).toBeGreaterThan(10);

  	var dbMachineProjects = db.machines.find({"address":"http://machine:5081"}, {
        projects: 1
    }).toArrayAsync();

  	console.log('machine projectIds match db machine.project ids')
  	console.log("dbProjects:", dbMachineProjects)

  	expect(dbMachineProjects).toBeTruthy()

  	// TODO - check that db.machine.project is a subset of machineProjects, check that ids match

  	// TODO - check that machineProjects is a subset of db.projects and that ids match
  	// TODO - check that db.machine.projects is a subset of db.projects and that ids match

};

/*
Ref issue #52
it('machine.fetchCapacity BernoulliNB', async () => {
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

it('machine.fetchCapacity DecisionTreeClassifier', async () => {
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
*/