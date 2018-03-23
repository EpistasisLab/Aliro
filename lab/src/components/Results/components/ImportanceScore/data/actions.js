import * as api from '../../../data/api';
import { getIsFetching } from './index';

export const IMP_SCORE_FETCH_REQUEST = 'IMP_SCORE_FETCH_REQUEST';
export const IMP_SCORE_FETCH_SUCCESS = 'IMP_SCORE_FETCH_SUCCESS';
export const IMP_SCORE_FETCH_FAILURE = 'IMP_SCORE_FETCH_FAILURE';
export const IMP_SCORE_CLEAR = 'IMP_SCORE_CLEAR';

export const fetchImportanceScore = (id) => (dispatch, getState) => {
  if(getIsFetching(getState())) {
    return Promise.resolve();
  }

  dispatch({
    type: IMP_SCORE_FETCH_REQUEST
  });

  return api.fetchFile(id).then(
    response => {
      dispatch({
        type: IMP_SCORE_FETCH_SUCCESS,
        receivedAt: Date.now(),
        response
      });
    },
    error => {
      dispatch({
        type: IMP_SCORE_FETCH_FAILURE,
        receivedAt: Date.now(),
        message: error.message || 'Something went wrong.'
      });
    }
  );
};

export const clearImportanceScore = () => (dispatch) => {
  dispatch({
    type: IMP_SCORE_CLEAR
  });
};
