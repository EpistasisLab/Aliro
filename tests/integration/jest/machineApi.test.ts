/**
* First pass at integrations tests that run against the lab container api through an external context
*
*/

import * as machineApi from './machineApi';


it('machine.fetchProjects', async () => {
	try {
		var data = await machineApi.fetchProjects()
	} catch (e) {
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}

	console.log("fetchProjects: ");
 	console.log(data);
  	expect(data.length).toBeGreaterThan(10);
};

it('machine.fetchCapacity BernoulliNB', async () => {
	try {
		var data = await machineApi.fetchCapacity("5813bdaec1321420f8bbcc7f")
	} catch (e) {
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}

	console.log("fetchCapacity: ");
 	console.log(data);
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

	console.log("fetchCapacity: ");
 	console.log(data);
  	expect(data.length).toEqual(1);
};