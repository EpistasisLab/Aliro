import * as api from './api';
export const FETCH_MACHINES_REQUEST = 'FETCH_MACHINES_REQUEST';
export const FETCH_MACHINES_SUCCESS = 'FETCH_MACHINES_SUCCESS';
export const FETCH_MACHINES_FAILURE = 'FETCH_MACHINES_FAILURE';
export const FETCH_ENV_VARS_REQUEST = 'FETCH_ENV_VARS_REQUEST';
export const FETCH_ENV_VARS_SUCCESS = 'FETCH_ENV_VARS_SUCCESS';
export const FETCH_ENV_VARS_FAILURE = 'FETCH_ENV_VARS_FAILURE';

export const fetchMachines = () => (dispatch) => {
  dispatch({
    type: FETCH_MACHINES_REQUEST
  });

  return api.fetchMachines().then(
    machines => {
      dispatch({
        type: FETCH_MACHINES_SUCCESS,
        payload: machines
      });
    },
    error => {
      dispatch({
        type: FETCH_MACHINES_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const fetchEnvVars = () => (dispatch) => {
  dispatch({
    type: FETCH_ENV_VARS_REQUEST
  });

  return api.fetchEnvVars().then(
    envVar => {
      dispatch({
        type: FETCH_ENV_VARS_SUCCESS,
        payload: envVar
      });
    },
    error => {
      dispatch({
        type: FETCH_ENV_VARS_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};
