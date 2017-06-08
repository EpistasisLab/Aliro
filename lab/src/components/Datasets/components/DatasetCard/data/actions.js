import * as api from './api';
import { getIsToggling } from './reducer';

export const TOGGLE_AI_REQUEST = 'TOGGLE_AI_REQUEST';
export const TOGGLE_AI_SUCCESS = 'TOGGLE_AI_SUCCESS';
export const TOGGLE_AI_FAILURE = 'TOGGLE_AI_FAILURE';

export const toggleAI = (id, aiState) => (dispatch, getState) => {
	console.log(id);
	if(getIsToggling(getState())) {
		return Promise.resolve();
	}

	dispatch({
		type: TOGGLE_AI_REQUEST,
		id
	});

	return api.toggleAI(id).then(
		response => {
			dispatch({
				type: TOGGLE_AI_SUCCESS,
				receivedAt: Date.now(),
				id,
				aiState
				//response, should get response of updated dataset
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