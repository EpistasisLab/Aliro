import { List, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { createSelector } from 'reselect';
import { 
  ALGORITHMS_FETCH_REQUEST, 
  ALGORITHMS_FETCH_SUCCESS, 
  ALGORITHMS_FETCH_FAILURE
} from './actions';

const getById = (state) => 
  state.getIn(['admin', 'byId']);

const byId = (state = Map(), action) => {
  switch(action.type) {
    case ALGORITHMS_FETCH_SUCCESS: {
      const newAlgorithms = {};
      action.response.forEach(algorithm => {
        newAlgorithms[algorithm._id] = algorithm;
      });
      return state.merge(newAlgorithms);
    }
    default:
      return state;
  }
};

const getAllIds = (state) => 
  state.getIn(['admin', 'allIds']);

const allIds = (state = List(), action) => {
  switch(action.type) {
    case ALGORITHMS_FETCH_SUCCESS: {
      const newAlgorithms = action.response.map(algorithm => algorithm['_id']);
      return state.merge(newAlgorithms);
    }
    default:
      return state;
  }
};

export const getIsFetching = (state) => 
  state.getIn(['admin', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case ALGORITHMS_FETCH_REQUEST:
      return true;
    case ALGORITHMS_FETCH_SUCCESS:
    case ALGORITHMS_FETCH_FAILURE:
      return false;   
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['admin', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case ALGORITHMS_FETCH_FAILURE:
      return action.message;
    case ALGORITHMS_FETCH_REQUEST:
    case ALGORITHMS_FETCH_SUCCESS:
      return null;
    default:
      return state; 
  }
};

const algorithms = combineReducers({
  byId,
  allIds,
  isFetching,
  errorMessage
});

// transform selectors
export const getAllAlgorithms = createSelector(
  [getAllIds, getById],
  (allIds, byId) => 
    allIds
      .map(id => byId.get(id))
      .sort((a, b) => { // alphabetize
        const A = a.get('name').toUpperCase();
        const B = b.get('name').toUpperCase();
        return A > B ? 1 : A < B ? -1 : 0;
      })
);

export default algorithms;