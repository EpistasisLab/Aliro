import { fromJS } from 'immutable';
import { 
    REQUEST_RESULTS,
    RECEIVE_RESULTS
} from './actions';

// maybe make this an array/object to store by id for future/caching
import { initialResults } from './initialResults'; // for testing
const initialState = fromJS({
    isFetching: false,
    details: /* {} */ initialResults // for testing
});

const results = (state = initialState, action) => {
    switch(action.type) {
        case REQUEST_RESULTS:
            return state.merge({
                isFetching: true
            });
        case RECEIVE_RESULTS:
            return state.merge({
                isFetching: false,
                details: action.results
            });
        default:
            return state;
    }
};

export default results;