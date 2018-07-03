/**
* First pass at integrations tests that run against the lab container api through an external context
*
*/

import * as machineApi from './machineApi';


it('integration fetchCapacity', async () => {
	try {
		var data = await machineApi.fetchCapacity("foo")
	} catch (e) {
		// console.log("fetchCapacity exception")
		// console.log(e)
		// console.log(data)
		var json = await e.response.json() // get the specific error description
		expect(json).toBeFalsy()
		expect(e).toBeFalsy() // break even if no message body returned
	}

	console.log("fetchCapacity: ");
 	console.log(data);
  	expect(data.length).toEqual(1);
};