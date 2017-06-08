require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const toggleAI = (datasetId, aiState) => {
	const route = `api/v1/datasets/${datasetId}/ai`;
		
	let myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');

	return fetch(route, {
		method: 'PUT',
		headers: myHeaders,
		mode: 'cors',
		cache: 'default',
		body: JSON.stringify({ai: aiState})
	})
		.then(response => {
			if(response.status >= 400) {
				throw new Error(`${response.status}: ${response.statusText}`);
			}  
			console.log(response);
			return response.json();
		})
		.then(json => json);
};