require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchDatasets = () => {
	const route = 'api/userdatasets';
	
	return fetch(route)
		.then(response => {
			if(response.status >= 400) {
				throw new Error(`${response.status}: ${response.statusText}`);
			}  
			return response.json();
		})
		.then(json => json);
};