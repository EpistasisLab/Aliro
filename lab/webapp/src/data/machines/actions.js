import * as api from './api';
export const FETCH_MACHINES_REQUEST = 'FETCH_MACHINES_REQUEST';
export const FETCH_MACHINES_SUCCESS = 'FETCH_MACHINES_SUCCESS';
export const FETCH_MACHINES_FAILURE = 'FETCH_MACHINES_FAILURE';

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