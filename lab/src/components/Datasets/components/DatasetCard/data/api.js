require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const toggleAI = (datasetId, nextAIState) => {
	const route = `api/userdatasets/${datasetId}/ai`;
		
	let myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');

	return fetch(route, {
		method: 'PUT',
		headers: myHeaders,
		mode: 'cors',
		cache: 'default',
		body: JSON.stringify({ai: nextAIState})
	})
		.then(response => {
			if(response.status >= 400) {
				throw new Error(`${response.status}: ${response.statusText}`);
			}
			return response.json();
		})
		.then(json => json);
};