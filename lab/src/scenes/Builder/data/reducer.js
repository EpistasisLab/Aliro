import { fromJS } from 'immutable';
import {
	REQUEST_DATASET,
	RECEIVE_DATASET,
	SET_DATASET,
	SET_ALGORITHM,
	SET_PARAM_VALUE,
	RESET_PARAMS
} from './actions';

const initialState = fromJS({
	dataset: {
		isFetching: false,
		item: {}
	},
	algorithm: {},
	params: {}
});

const builder = (state = initialState, action) => {
	switch(action.type) {
		case REQUEST_DATASET:
			return state.mergeDeep({
				dataset: {
					isFetching: true
				}
			});
		case RECEIVE_DATASET:
			return state.mergeDeep({
				dataset: {
					isFetching: false,
					item: action.dataset
				}
			});
		case SET_DATASET:
			return state.mergeDeep({
				dataset: {
					item: action.dataset
				}
			});
		case SET_ALGORITHM:
			return state.merge({
				algorithm: action.algorithm,
				params: {}
			});
		case SET_PARAM_VALUE:
			return state.setIn(
				['params', action.param], 
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