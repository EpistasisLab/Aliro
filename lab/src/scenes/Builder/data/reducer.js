import { fromJS } from 'immutable';
import {
	REQUEST_EXPERIMENT,
	RECEIVE_EXPERIMENT,
	SET_EXPERIMENT,
	REQUEST_DATASET,
	RECEIVE_DATASET,
	SET_DATASET,
	SET_ALGORITHM,
	SET_PARAM_VALUE,
	RESET_PARAMS
} from './actions';

const initialState = fromJS({
	experiment: {
		isFetching: false,
		item: {}
	},
	dataset: {
		isFetching: false,
		item: {}
	},
	algorithm: {},
	params: {}
});

const builder = (state = initialState, action) => {
	switch(action.type) {
		case REQUEST_EXPERIMENT:
			return state.mergeDeep({
				experiment: {
					isFetching: true
				}
			});
		case RECEIVE_EXPERIMENT:
			return state.mergeDeep({
				experiment: {
					isFetching: false,
					item: action.experiment
				}
			});
		case SET_EXPERIMENT:
			var exp = fromJS(action.experiment);
			return state.mergeDeep({
				experiment: {
					item: exp
				},
				dataset: {
					item: exp.get('dataset')
				},
				algorithm: exp.get('algorithm'),
				params: exp.get('params')
			});	
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
				params: action.algorithm.get('schema').map(p => p.get('default'))
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