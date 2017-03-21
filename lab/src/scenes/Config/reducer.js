import { combineReducers } from 'redux';
import { List, Map, fromJS } from 'immutable';
import {
    REQUEST_ALGORITHMS,
    RECEIVE_ALGORITHMS
} from './actions';

const datasets = (state = Map({
    isFetching: false,
    items: List()
}), action) => {
    switch (action.type) {
        default:
            return state;
    }
};

const algorithms = (state = Map({
    isFetching: false,
    items: List()
}), action) => {
    switch (action.type) {
        case REQUEST_ALGORITHMS:
            return state.merge({
                isFetching: true
            });
        case RECEIVE_ALGORITHMS:
            return state.merge({
                isFetching: false,
                items: action.algorithms
            });
        default:
            return state;
    }
};

const app = combineReducers({
   datasets,
   algorithms
});