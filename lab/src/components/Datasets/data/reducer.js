import { List, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { 
	FETCH_DATASETS_REQUEST,
	FETCH_DATASETS_SUCCESS,
	FETCH_DATASETS_FAILURE
} from './actions';

export const getDatasets = (state) => 
	state.getIn(['datasets', 'byId']);

const byId = (state = Map(), action) => {
	switch(action.type) {
		case FETCH_DATASETS_SUCCESS:
			const newDatasets = {};
			action.response.forEach(dataset => {
				newDatasets[dataset._id] = dataset;
			});
			return state.merge(newDatasets);
		default:
			return state;
	}
};

export const getIsFetching = (state) => 
	state.getIn(['datasets', 'isFetching']);

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

export const getErrorMessage = (state) =>
	state.getIn(['datasets', 'errorMessage']);

const errorMessage = (state = null, action) => {
	switch(action.type) {
		case FETCH_DATASETS_FAILURE:
			return action.message
		case FETCH_DATASETS_REQUEST:
		case FETCH_DATASETS_SUCCESS:
			return null;
		default:
			return state;	
	}
};

const datasets = combineReducers({
	byId,
	isFetching,
	errorMessage
});

export default datasets;