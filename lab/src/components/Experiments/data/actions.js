import * as api from './api';
import { getIsFetching } from './index';

export const EXPERIMENTS_FETCH_REQUEST = 'EXPERIMENTS_FETCH_REQUEST';
export const EXPERIMENTS_FETCH_SUCCESS = 'EXPERIMENTS_FETCH_SUCCESS';
export const EXPERIMENTS_FETCH_FAILURE = 'EXPERIMENTS_FETCH_FAILURE';
export const EXPERIMENT_ADD = 'EXPERIMENT_ADD';
export const EXPERIMENT_UPDATE = 'EXPERIMENT_UPDATE';

export const fetchExperiments = () => (dispatch, getState) => {
	if(getIsFetching(getState())) {
		return Promise.resolve();
	}

	dispatch({
		type: EXPERIMENTS_FETCH_REQUEST
	});

	return api.fetchExperiments().then(
		response => {
			dispatch({
				type: EXPERIMENTS_FETCH_SUCCESS,
				receivedAt: Date.now(),
				response
			});
		},
		error => {
			dispatch({
				type: EXPERIMENTS_FETCH_FAILURE,
				receivedAt: Date.now(),
				message: error.message || 'Something went wrong.'
			});
		}
	);
};

export const addExperiment = (experiment) => (dispatch) => {
  dispatch({
    type: EXPERIMENT_ADD,
    experiment
  });
};

export const updateExperiment = (experiment) => (dispatch) => {
  dispatch({
    type: EXPERIMENT_UPDATE,
    experiment
  });
};