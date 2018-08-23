import { combineReducers } from 'redux';
import {
  FETCH_EXPERIMENT_REQUEST,
  FETCH_EXPERIMENT_SUCCESS,
  FETCH_EXPERIMENT_FAILURE,
  CLEAR_EXPERIMENT
} from './actions';

const data = (state = null, action) => {
  switch(action.type) {
    case FETCH_EXPERIMENT_SUCCESS:
      return action.payload;
    case CLEAR_EXPERIMENT:
      return null;  
    default:
      return state; 
  }
};

const isFetching = (state = false, action) => {
  switch(action.type) {
    case FETCH_EXPERIMENT_REQUEST:
      return true;
    case FETCH_EXPERIMENT_SUCCESS:
    case FETCH_EXPERIMENT_FAILURE:
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_EXPERIMENT_FAILURE:
      return action.payload;
    default:
      return state;  
  }
};

const experiment = combineReducers({
  data,
  isFetching,
  error
});

export default experiment;