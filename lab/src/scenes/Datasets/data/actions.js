import * as api from './api';
//import { getIsFetching } from './reducers';
export const FETCH_DATASETS_REQUEST = 'FETCH_DATASETS_REQUEST';
export const FETCH_DATASETS_SUCCESS = 'FETCH_DATASETS_SUCCESS';
export const FETCH_DATASETS_FAILURE = 'FETCH_DATASETS_FAILURE';
export const REQUEST_AI_TOGGLE = 'REQUEST_AI_TOGGLE';
export const RECEIVE_AI_TOGGLE = 'RECEIVE_AI_TOGGLE';

export const fetchDatasets = (dispatch, getState) => {
	/*if(getIsFetching(getState())) {
		return Promise.resolve();
	}*/

	dispatch({
		type: FETCH_DATASETS_REQUEST
	});

	return api.fetchDatasets().then(
		response => {
			dispatch({
				type: FETCH_DATASETS_SUCCESS,
					receivedAt: Date.now(),
					response
				});
			},
			error => {
				dispatch({
					type: FETCH_DATASETS_FAILURE,
					receivedAt: Date.now(),
					message: error.message || 'Something went wrong.'
				});
			}
	);
};

export const requestAIToggle = (datasetId) => ({
	type: REQUEST_AI_TOGGLE,
	datasetId
});

export const receiveAIToggle = (datasetId, aiState) => ({
	type: RECEIVE_AI_TOGGLE,
	receivedAt: Date.now(),
	datasetId,
	aiState
});

// export const actions;