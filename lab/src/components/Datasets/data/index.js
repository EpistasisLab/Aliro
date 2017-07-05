import { List, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { createSelector } from 'reselect';
import { 
	DATASETS_FETCH_REQUEST, 
	DATASETS_FETCH_SUCCESS, 
	DATASETS_FETCH_FAILURE
} from './actions';

import { delegateTo } from '../../../utils/delegateTo';
import dataset, { DATASET_PREFIX } from '../components/DatasetCard/data';

const delegator = delegateTo([
	{ prefix: DATASET_PREFIX, reducer: dataset }
]);

const getById = (state) => 
	state.getIn(['datasets', 'byId']);

const byId = (state = Map(), action) => {
	switch(action.type) {
		case DATASETS_FETCH_SUCCESS:
			const newDatasets = {};
			action.response.forEach(dataset => {
				newDatasets[dataset._id] = dataset;
			});
			return state.merge(newDatasets);
		default:
			return delegator(state, action) || state;
	}
};

const getAllIds = (state) => 
	state.getIn(['datasets', 'allIds']);

const allIds = (state = List(), action) => {
	switch(action.type) {
		case DATASETS_FETCH_SUCCESS:
			const newDatasets = action.response.map(dataset => dataset['_id']);
			return state.merge(newDatasets);
		default:
			return state;
	}
};

export const getIsFetching = (state) => 
	state.getIn(['datasets', 'isFetching']);

const isFetching = (state = false, action) => {
	switch(action.type) {
		case DATASETS_FETCH_REQUEST:
			return true;
		case DATASETS_FETCH_SUCCESS:
		case DATASETS_FETCH_FAILURE:
			return false;   
		default:
			return state;
	}
};

export const getErrorMessage = (state) =>
	state.getIn(['datasets', 'errorMessage']);

const errorMessage = (state = null, action) => {
	switch(action.type) {
		case DATASETS_FETCH_FAILURE:
			return action.message;
		case DATASETS_FETCH_REQUEST:
		case DATASETS_FETCH_SUCCESS:
			return null;
		default:
			return state;	
	}
};

const datasets = combineReducers({
	byId,
	allIds,
	isFetching,
	errorMessage
});

// transform selectors
export const getAllDatasets = createSelector(
	[getAllIds, getById],
	(allIds, byId) => 
		allIds
			.map(id => byId.get(id))
			.sort((a, b) => a.get('name').toUpperCase() > b.get('name').toUpperCase())
);

export default datasets;