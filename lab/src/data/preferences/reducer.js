import { Map } from 'immutable';
import { 
    REQUEST_PREFERENCES,
    RECEIVE_PREFERENCES
} from './actions';

const initialState = Map({
    isFetching: false,
    preferences: Map()
});

const preferences = (state = initialState, action) => {
    switch(action.type) {
        case REQUEST_PREFERENCES:
            return state.merge({
                isFetching: true
            });
        case RECEIVE_PREFERENCES:
            return state.merge({
                isFetching: false,
                preferences: action.preferences
            });
        default:
            return state;
    }
};

export default preferences;