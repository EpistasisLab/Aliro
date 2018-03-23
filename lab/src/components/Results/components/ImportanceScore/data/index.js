import { combineReducers } from 'redux-immutable';
import {
  IMP_SCORE_FETCH_REQUEST,
  IMP_SCORE_FETCH_SUCCESS,
  IMP_SCORE_FETCH_FAILURE,
  IMP_SCORE_CLEAR
} from './actions';

export const getImportanceScore = (state) =>
  state.getIn(['results', 'importanceScore', 'data']);

const data = (state = null, action) => {
  switch(action.type) {
    case IMP_SCORE_FETCH_SUCCESS:
      return action.response;
    case IMP_SCORE_CLEAR:
      return null;
    default:
      return state;
  }
};

export const getIsFetching = (state) =>
  state.getIn(['results', 'importanceScore', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case IMP_SCORE_FETCH_REQUEST:
      return true;
    case IMP_SCORE_FETCH_SUCCESS:
    case IMP_SCORE_FETCH_FAILURE:
    case IMP_SCORE_CLEAR:
      return false;
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['results', 'importanceScore', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case IMP_SCORE_FETCH_FAILURE:
      return action.message;
    case IMP_SCORE_FETCH_REQUEST:
    case IMP_SCORE_FETCH_SUCCESS:
    case IMP_SCORE_CLEAR:
      return null;
    default:
      return state;
  }
};

const importanceScore = combineReducers({
  data,
  isFetching,
  errorMessage
});

export default importanceScore;
