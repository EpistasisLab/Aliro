require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import {
	FETCH_DATASETS_REQUEST,
	FETCH_DATASETS_SUCCESS,
	FETCH_DATASETS_FAILURE
} from './actions';

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