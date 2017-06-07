require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import {
	FETCH_DATASETS_REQUEST,
	FETCH_DATASETS_SUCCESS,
	FETCH_DATASETS_FAILURE,
	requestAIToggle,
	receiveAIToggle
} from './actions';

export const fetchDatasets = () => {
	const route = 'api/userdatasets';
	
	return function(dispatch) {
		dispatch({
			type: FETCH_DATASETS_REQUEST
		});

		return fetch(route)
			.then(response => {
				console.log(response);
				if(response.status >= 400) {
					//dispatch()
				}  
				return response.json();
			})
			.then(response => {
				console.log(response);
				dispatch({
					type: FETCH_DATASETS_SUCCESS,
					receivedAt: Date.now(),
					response
				})
			});
	}
};

export const toggleAI = (datasetId, aiState) => {
	const route = `api/v1/datasets/${datasetId}/ai`;
		
	let myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');

	return function(dispatch) {
		dispatch(requestAIToggle(datasetId));
		return fetch(route, {
			method: 'PUT',
			headers: myHeaders,
			mode: 'cors',
			cache: 'default',
			body: JSON.stringify({ai: aiState})
		})
		.then(response => response.json())
		.then(json =>
			dispatch(receiveAIToggle(datasetId, aiState))
		);
	}  
};