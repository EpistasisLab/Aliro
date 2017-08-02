import * as api from './api';
import { getIsUpdatingCategory } from './index';

export const ACTION_PREFIX = 'ALGORITHM_';

export const UPDATE_CATEGORY_REQUEST = ACTION_PREFIX + 'UPDATE_CATEGORY_REQUEST';
export const UPDATE_CATEGORY_SUCCESS = ACTION_PREFIX + 'UPDATE_CATEGORY_SUCCESS';
export const UPDATE_CATEGORY_FAILURE = ACTION_PREFIX + 'UPDATE_CATEGORY_FAILURE';

export const updateCategory = (id, nextCategory) => (dispatch, getState) => {
  if(getIsUpdatingCategory(getState(), id)) {
    return Promise.resolve();
  }

  dispatch({
    type: UPDATE_CATEGORY_REQUEST,
    id
  });

  return api.updateCategory(id, nextCategory).then(
    response => {
      dispatch({
        type: UPDATE_CATEGORY_SUCCESS,
        receivedAt: Date.now(),
        id,
        nextCategory,
        response
      });
    },
    error => {
      dispatch({
        type: UPDATE_CATEGORY_FAILURE,
        receivedAt: Date.now(),
        message: error.message || 'Something went wrong.',
        id
      });
    }
  );
};