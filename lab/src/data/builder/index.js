import { combineReducers } from 'redux';
import {
  SUBMIT_EXPERIMENT_REQUEST,
  SUBMIT_EXPERIMENT_SUCCESS,
  SUBMIT_EXPERIMENT_FAILURE,
  SET_CURRENT_ALGORITHM,
  SET_PARAM_VALUE,
  CLEAR_ERROR
} from './actions';

const currentAlgorithm = (state = {}, action) => {
  switch(action.type) {
    case SET_CURRENT_ALGORITHM:
      return action.payload.algorithm;
    default:
      return state;
  }
};

const currentParams = (state = {}, action) => {
  switch(action.type) {
    case SET_PARAM_VALUE:
      const { param, value } = action.payload;
      return Object.assign({}, state, {
        [param]: value
      });
    case SET_CURRENT_ALGORITHM:
      const { algorithm } = action.payload;
      return Object.entries(algorithm.schema).reduce((map, [key, value]) => {
        map[key] = value.default;
        return map;
      }, {});
    default:
      return state;
  }
};

const isSubmitting = (state = false, action) => {
  switch(action.type) {
    case SUBMIT_EXPERIMENT_REQUEST:
      return true;
    case SUBMIT_EXPERIMENT_SUCCESS:
    case SUBMIT_EXPERIMENT_FAILURE:
      return false; 
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case SUBMIT_EXPERIMENT_FAILURE:
      return action.payload;
    case SUBMIT_EXPERIMENT_REQUEST:
    case SUBMIT_EXPERIMENT_SUCCESS:
    case CLEAR_ERROR:
      return null;
    default:
      return state;  
  }
};

const builder = combineReducers({
  currentAlgorithm,
  currentParams,
  isSubmitting,
  error
});

export default builder;