import { fromJS } from 'immutable';
import { 
    REQUEST_DATASETS,
    RECEIVE_DATASETS,
    REQUEST_AI_TOGGLE,
    RECEIVE_AI_TOGGLE
} from './actions';

import { initialDatasets } from './initialDatasets'; // for testing
const initialState = fromJS({
    isFetching: false,
    items: /* [] */ fromJS(initialDatasets) // for testing
});

const datasets = (state = initialState, action) => {
    switch(action.type) {
        case REQUEST_DATASETS:
            return state.merge({
                isFetching: true
            });
        case RECEIVE_DATASETS:
            return state.merge({
                isFetching: false,
                items: action.datasets
            });
        case REQUEST_AI_TOGGLE:
            /*return state.items.map({
                isFetching: false,
                items: action.datasets
            });*/
            console.log(action.datasetId);
            return state;
        case RECEIVE_AI_TOGGLE:
            /*return state.merge({
                isFetching: false,
                items: action.datasets
            });*/
            return state;
        default:
            return state;
    }
};

export default datasets;