import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import {
  DATASET_FETCH_REQUEST,
  DATASET_FETCH_SUCCESS,
  DATASET_FETCH_FAILURE,
  EXPERIMENT_FETCH_REQUEST,
  EXPERIMENT_FETCH_SUCCESS,
  EXPERIMENT_FETCH_FAILURE,
  EXPERIMENT_SUBMIT_REQUEST,
  EXPERIMENT_SUBMIT_SUCCESS,
  EXPERIMENT_SUBMIT_FAILURE,
  SET_CURRENT_ALGORITHM,
  SET_PARAM_VALUE
} from './actions';

export const getDataset = (state) => 
  state.getIn(['builder', 'dataset']);

const dataset = (state = Map(), action) => {
  switch(action.type) {
    case DATASET_FETCH_SUCCESS:
      return state.merge(action.response[0]);
    case EXPERIMENT_FETCH_SUCCESS:
      return state.clear();
    default:
      return state;
  }
};

export const getExperiment = (state) => 
  state.getIn(['builder', 'experiment']);

const experiment = (state = Map(), action) => {
  switch(action.type) {
    case EXPERIMENT_FETCH_SUCCESS:
      return state.merge(action.response[0]);
    case DATASET_FETCH_SUCCESS:
      return state.clear(); 
    default:
      return state;
  }
};

export const getIsFetching = (state) => 
  state.getIn(['builder', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case DATASET_FETCH_REQUEST:
    case EXPERIMENT_FETCH_REQUEST:
      return true;
    case DATASET_FETCH_SUCCESS:
    case DATASET_FETCH_FAILURE:
    case EXPERIMENT_FETCH_SUCCESS:
    case EXPERIMENT_FETCH_FAILURE:
      return false;   
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['builder', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case DATASET_FETCH_FAILURE:
    case EXPERIMENT_FETCH_FAILURE:
    case EXPERIMENT_SUBMIT_FAILURE:
      return action.message;
    case DATASET_FETCH_REQUEST:
    case DATASET_FETCH_SUCCESS:
    case EXPERIMENT_FETCH_REQUEST:
    case EXPERIMENT_FETCH_SUCCESS:
    case EXPERIMENT_SUBMIT_REQUEST:
    case EXPERIMENT_SUBMIT_SUCCESS:
      return null;
    default:
      return state; 
  }
};

export const getDefaultAlgorithms = (preferences) =>
  preferences.get('algorithms');

export const getCurrentAlgorithm = (state) => 
  state.getIn(['builder', 'currentAlgorithm']);

const currentAlgorithm = (state = Map(), action) => {
  switch(action.type) {
    case SET_CURRENT_ALGORITHM:
      return state.merge(action.payload.algorithm);
    default:
      return state;
  }
};

export const getCurrentParams = (state) =>
  state.getIn(['builder', 'currentParams']);

const currentParams = (state = Map(), action) => {
  switch(action.type) {
    case SET_PARAM_VALUE:
      return state.set(
        action.payload.param,
        action.payload.value
      );
    case SET_CURRENT_ALGORITHM: {
      const { algorithm } = action.payload;
      let defaultParams = algorithm.get('schema').map(param => param.get('default'));
      return state.clear().merge(defaultParams);
    }
    default:
      return state;
  }
};

export const getIsSubmitting = (state) => 
  state.getIn(['builder', 'isSubmitting']);

const isSubmitting = (state = false, action) => {
  switch(action.type) {
    case EXPERIMENT_SUBMIT_REQUEST:
      return true;
    case EXPERIMENT_SUBMIT_SUCCESS:
    case EXPERIMENT_SUBMIT_FAILURE:
      return false;   
    default:
      return state;
  }
};

const builder = combineReducers({
  dataset,
  experiment,
  isFetching,
  errorMessage,
  currentAlgorithm,
  currentParams,
  isSubmitting
});

export default builder;