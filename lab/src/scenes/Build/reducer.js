import { combineReducers } from 'redux';
import { List, Map, fromJS } from 'immutable';
import { 
    SET_DATASETS, SET_CURRENT_DATASET, 
    SET_ALGORITHMS, SET_CURRENT_ALGORITHM,
    REQUEST_ALGORITHMS, RECEIVE_ALGORITHMS, 
    SET_CURRENT_LEVEL, SET_PARAMETER_VALUE, 
    Levels 
} from './actions';
const { BASIC } = Levels;


const datasets = (state = Map({
    isFetching: false,
    items: List()
}), action) => {
    switch (action.type) {
        case SET_DATASETS:
            return state.merge({
                items: action.datasets
            });
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
        case SET_ALGORITHMS:
            return state.merge({
                items: action.algorithms
            });
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

const currentLevel = (state = BASIC, action) => {
    switch (action.type) {
        case SET_CURRENT_LEVEL:
            return action.currentLevel;
        default:
            return state;
    }
};

const app = combineReducers({
   datasets,
   algorithms,
   currentDataset,
   currentAlgorithm,
   currentLevel
});

export default app;
