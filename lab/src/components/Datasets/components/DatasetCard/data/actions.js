import * as api from './api';
import { getIsTogglingAI } from './reducer';

export const ACTION_PREFIX = 'DATASET_';
export const AI_TOGGLE_REQUEST = ACTION_PREFIX + 'AI_TOGGLE_REQUEST';
export const AI_TOGGLE_SUCCESS = ACTION_PREFIX + 'AI_TOGGLE_SUCCESS';
export const AI_TOGGLE_FAILURE = ACTION_PREFIX + 'AI_TOGGLE_FAILURE';

export const toggleAI = (id, aiState) => (dispatch, getState) => {
	if(getIsTogglingAI(getState(), id)) {
		return Promise.resolve();
	}

	dispatch({
		type: AI_TOGGLE_REQUEST,
		id
	});

	return api.toggleAI(id).then(
		response => {
			dispatch({
				type: AI_TOGGLE_SUCCESS,
				receivedAt: Date.now(),
				id,
				aiState
				//response, should get response of updated dataset
			});
		},
		error => {
			dispatch({
				type: AI_TOGGLE_FAILURE,
				receivedAt: Date.now(),
				message: error.message || 'Something went wrong.'
			});
		}
	);
};