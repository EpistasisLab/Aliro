export { ACTION_PREFIX as ALGORITHM_PREFIX } from './actions';

import {
  UPDATE_CATEGORY_REQUEST, 
  UPDATE_CATEGORY_SUCCESS, 
  UPDATE_CATEGORY_FAILURE
} from './actions';

const algorithm = (state = Map(), action) => {
  switch(action.type) {
    case UPDATE_CATEGORY_REQUEST:
      return state.mergeIn([action.id], {
        isUpdatingCategory: true
      });
    case UPDATE_CATEGORY_SUCCESS:
      return state.mergeIn([action.id], {
        category: action.nextCategory,
        isUpdatingCategory: false
      });
    case UPDATE_CATEGORY_FAILURE:
      return state.mergeIn([action.id], {
        errorMessage: action.message,
        isUpdatingCategory: false
      });
    default:
      return state; 
  }
};

export const getIsUpdatingCategory = (state, id) =>
  state.getIn(['admin', 'byId', id, 'isUpdatingCategory']);

export default algorithm;