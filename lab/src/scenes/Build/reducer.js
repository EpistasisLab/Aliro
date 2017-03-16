import { combineReducers } from 'redux';
import { List, Map, fromJS } from 'immutable';
import {
    SET_PREFERENCES, REQUEST_PREFERENCES, RECEIVE_PREFERENCES,
    REQUEST_ALGORITHMS, RECEIVE_ALGORITHMS, 
    SET_CURRENT_DATASET, SET_CURRENT_ALGORITHM,
    SET_PARAMETER_VALUE
} from './actions';

const preferences = (state = Map({
    isFetching: false,
    items: Map()
}), action) => {
    switch(action.type) {
        case SET_PREFERENCES:
            return state.merge({
                items: action.preferences
            });
        case REQUEST_PREFERENCES:
            return state.merge({
                isFetching: true
            });
        case RECEIVE_PREFERENCES:
            return state.merge({
                isFetching: false,
                items: action.preferences
            });
        default:
            return state;
    }
};

const datasets = (state = Map({
    isFetching: false,
    items: List()
}), action) => {
    switch (action.type) {
        default:
            return state;
    }
};

const currentDataset = (state = Map(), action) => {
    switch (action.type) {
        case SET_CURRENT_DATASET:
            return action.currentDataset;
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

const currentAlgorithm = (state = Map(), action) => {
    switch (action.type) {
        case SET_CURRENT_ALGORITHM:
            return action.currentAlgorithm;
        case SET_PARAMETER_VALUE:
            return state.setIn(
                ['params', action.param, 'currentValue'],
                action.value
            );
        default:
            return state;
    }
};

const app = combineReducers({
   preferences,
   datasets,
   algorithms,
   currentDataset,
   currentAlgorithm
});

export default app;
