import { fromJS } from 'immutable';
import { 
	REQUEST_EXPERIMENTS,
	RECEIVE_EXPERIMENTS,
	SET_FILTER,
	SET_SORT,
	RESET_FILTERS
} from './actions';
import { getUniqOptions } from './reducer_utils';

import { initialExperiments } from './initialExperiments'; // for testing
const initialState = fromJS({
	isFetching: false,
	items: /* [] */ initialExperiments, // for testing
	filters: {
		status: {
			options: /* [] */ getUniqOptions(initialExperiments, 'status'), // for testing
			selected: 'all'
		},
		dataset: {
			options: /* [] */ getUniqOptions(initialExperiments, 'dataset'), // for testing
			selected: 'all'
		},
		algorithm: {
			options: /* [] */ getUniqOptions(initialExperiments, 'algorithm'), // for testing
			selected: 'all'
		}
	},
	sorted: {
		column: null,
		direction: null
	}
});

const experiments = (state = initialState, action) => {
	switch(action.type) {
		case REQUEST_EXPERIMENTS:
			return state.merge({
				isFetching: true
			});
		case RECEIVE_EXPERIMENTS:
			return state.mergeDeep({
				isFetching: false,
				items: action.experiments,
				filters: {
					status: {
						options: getUniqOptions(action.experiments, 'status')
					},
					dataset: {
						options: getUniqOptions(action.experiments, 'dataset')
					},
					algorithm: {
						options: getUniqOptions(action.experiments, 'algorithm')
					}
				}
			});
		case SET_FILTER:
			return state.setIn(
				['filters', action.filter, 'selected'], 
				action.value
			);
		case SET_SORT:
			return state.merge({
				sorted: {
					column: action.column,
					direction: action.direction
				}
			});	
		case RESET_FILTERS:
			return state.mergeDeep({
				filters: {
					status: {
						selected: 'all'
					},
					dataset: {
						selected: 'all'
					},
					algorithm: {
						selected: 'all'
					}
				}
			});
		default:
			return state;
	}
};

export default experiments;