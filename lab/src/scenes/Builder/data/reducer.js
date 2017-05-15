import { fromJS } from 'immutable';
import {
		SET_DATASET,
		SET_ALGORITHM,
		SET_PARAM_VALUE
} from './actions';

const initialState = fromJS({
		dataset: null,
		algorithm: null,
		params: {}
});

const builder = (state = initialState, action) => {
	switch(action.type) {
		case SET_DATASET:
			return state.merge({
				dataset: action.dataset
			});
		case SET_ALGORITHM:
			return state.merge({
				algorithm: action.algorithm
			});
		case SET_PARAM_VALUE:
			return state.setIn(
				['params', action.param], 
				action.value
			);
		default:
			return state;	
	}
};

export default builder;