import * as api from './api';
import { getIsFetching } from './reducer';

export const FETCH_DATASETS_REQUEST = 'FETCH_DATASETS_REQUEST';
export const FETCH_DATASETS_SUCCESS = 'FETCH_DATASETS_SUCCESS';
export const FETCH_DATASETS_FAILURE = 'FETCH_DATASETS_FAILURE';

export const fetchDatasets = () => (dispatch, getState) => {
	if(getIsFetching(getState())) {
		return Promise.resolve();
	}

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