import { fromJS } from 'immutable';
import { 
	REQUEST_EXPERIMENTS,
	RECEIVE_EXPERIMENTS
} from './actions';

import { initialExperiments } from './initialExperiments'; // for testing
const initialState = fromJS({
	isFetching: false,
	items: /* [] */ initialExperiments, // for testing
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
				items: action.experiments
			});
		default:
			return state;
	}
};

export default experiments;