import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import dataset from './dataset';
import { 
  FETCH_DATASETS_REQUEST, 
  FETCH_DATASETS_SUCCESS, 
  FETCH_DATASETS_FAILURE
} from './actions';
import {
  TOGGLE_AI_REQUEST,
  TOGGLE_AI_SUCCESS,
  TOGGLE_AI_FAILURE,
  AI_UPDATE,
  DATASET_UPDATE
} from './dataset/actions';

const byId = (state = {}, action) => {
  switch(action.type) {
    case FETCH_DATASETS_SUCCESS:
      return action.payload.reduce((map, d) => {
        map[d._id] = d;
        return map;
      }, {});
    case TOGGLE_AI_REQUEST:
    case TOGGLE_AI_SUCCESS:
    case TOGGLE_AI_FAILURE:
    case AI_UPDATE:
    case DATASET_UPDATE:
      return Object.assign({}, state, {
        [action.dataset._id]: dataset(state[action.dataset._id], action)
      });
    default:
      return state;
  }
};

const allIds = (state = [], action) => {
  switch(action.type) {
    case FETCH_DATASETS_SUCCESS:
      return action.payload.map(d => d._id);
    default:
      return state;  
  }
};

const isFetching = (state = false, action) => {
  switch(action.type) {
    case FETCH_DATASETS_REQUEST:
      return true;
    case FETCH_DATASETS_SUCCESS:
    case FETCH_DATASETS_FAILURE:
      return false;   
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_DATASETS_FAILURE:
      return action.payload;
    default:
      return state;  
  }
};

const datasets = combineReducers({
  byId,
  allIds,
  isFetching,
  error
});

// selector for alphabetizing
const getAllIds = (state) => state.datasets.allIds; 
const getById = (state) => state.datasets.byId; 
export const getSortedDatasets = createSelector(
  [getAllIds, getById],
  (allIds, byId) =>
    allIds
      .map(id => byId[id])
      .sort((a, b) => {
        const A = a.name.toLowerCase();
        const B = b.name.toLowerCase();
        return A > B ? 1 : A < B ? -1 : 0;
      })
);

export default datasets;