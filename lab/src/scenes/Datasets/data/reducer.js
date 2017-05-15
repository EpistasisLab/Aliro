import { Map, List, fromJS } from 'immutable';
import { 
    REQUEST_DATASETS,
    RECEIVE_DATASETS
} from './actions';

import { initialDatasets } from './initialDatasets'; // for testing
const initialState = Map({
    isFetching: false,
    items: /* List() */ fromJS(initialDatasets) // for testing
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
        default:
            return state;
    }
};

export default datasets;