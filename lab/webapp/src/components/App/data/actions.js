import * as api from './api';
import { getIsFetching } from './index';

export const PREFERENCES_FETCH_REQUEST = 'PREFERENCES_FETCH_REQUEST';
export const PREFERENCES_FETCH_SUCCESS = 'PREFERENCES_FETCH_SUCCESS';
export const PREFERENCES_FETCH_FAILURE = 'PREFERENCES_FETCH_FAILURE';

export const fetchPreferences = () => (dispatch, getState) => {
  if(getIsFetching(getState())) {
    return Promise.resolve();
  }

  dispatch({
    type: PREFERENCES_FETCH_REQUEST
  });

  return api.fetchPreferences().then(
    response => {
      dispatch({
        type: PREFERENCES_FETCH_SUCCESS,
        receivedAt: Date.now(),
        response
      });
    },
    error => {
      dispatch({
        type: PREFERENCES_FETCH_FAILURE,
        receivedAt: Date.now(),
        message: error.message || 'Something went wrong.'
      });
    }
  );
};