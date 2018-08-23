import * as api from './api';
export const FETCH_PREFERENCES_REQUEST = 'FETCH_PREFERENCES_REQUEST';
export const FETCH_PREFERENCES_SUCCESS = 'FETCH_PREFERENCES_SUCCESS';
export const FETCH_PREFERENCES_FAILURE = 'FETCH_PREFERENCES_FAILURE';

export const fetchPreferences = () => (dispatch) => {
  dispatch({
    type: FETCH_PREFERENCES_REQUEST
  });

  return api.fetchPreferences().then(
    preferences => {
      dispatch({
        type: FETCH_PREFERENCES_SUCCESS,
        payload: preferences[0]
      });
    },
    error => {
      dispatch({
        type: FETCH_PREFERENCES_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};