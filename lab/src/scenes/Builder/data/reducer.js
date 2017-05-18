import { fromJS } from 'immutable';
import {
		SET_CURRENT_DATASET,
		SET_CURRENT_ALGORITHM,
		SET_PARAM_VALUE,
		RESET_PARAMS
} from './actions';

const initialState = fromJS({
		currentDataset: null,
		currentAlgorithm: null,
		currentParams: {}
});

const builder = (state = initialState, action) => {
	switch(action.type) {
		case SET_CURRENT_DATASET:
			return state.merge({
				currentDataset: action.currentDataset
			});
		case SET_CURRENT_ALGORITHM:
			return state.merge({
				currentAlgorithm: action.currentAlgorithm,
				params: {}
			});
		case SET_PARAM_VALUE:
			return state.setIn(
				['currentParams', action.param], 
				action.value
			);
		case RESET_PARAMS:
			return state.merge({
				params: {}
			});
		default:
			return state;	
	}
};

export default builder;