import { List, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { 
	TOGGLE_AI_REQUEST,
	TOGGLE_AI_SUCCESS,
	TOGGLE_AI_FAILURE
} from './actions';

const getDataset = (state, id) =>
	state.getIn(['datasets', id]);

export const getIsToggling = (state, id) => 
	state.getIn(['datasets', id, 'isToggling']);

const isToggling = (state = false, action) => {
	//const val = getDataset(state, action.id).get('isToggling');
	console.log(state);
	switch(action.type) {
		case TOGGLE_AI_REQUEST:
			return true;
		case TOGGLE_AI_SUCCESS:
		case TOGGLE_AI_FAILURE:
			return false;   
		default:
			return state;
	}
};

export const getErrorMessage = (state, id) =>
	state.getIn(['datasets', id, 'errorMessage']);

const errorMessage = (state = null, action) => {
	switch(action.type) {
		case TOGGLE_AI_FAILURE:
			return action.message
		case TOGGLE_AI_REQUEST:
		case TOGGLE_AI_SUCCESS:
			return null;
		default:
			return state;
	}
};

const dataset = combineReducers({
	isToggling
});

export default dataset;