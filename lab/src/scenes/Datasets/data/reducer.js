import { fromJS } from 'immutable';
import { 
    REQUEST_DATASETS,
    RECEIVE_DATASETS,
    REQUEST_AI_TOGGLE,
    RECEIVE_AI_TOGGLE
} from './actions';

const initialState = fromJS({
    isFetching: false,
    items: []
});

// manages list of datasets
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
            return state.merge({
                items: state.get('items').map(d => dataset(d, action))
            });
        case RECEIVE_AI_TOGGLE:
            return state.merge({
                items: state.get('items').map(d => dataset(d, action))
            });
        default:
            return state;
    }
};

// manages individual dataset
const dataset = (state = fromJS({}), action) => {
    switch(action.type) {
        case REQUEST_AI_TOGGLE:
            if(state.get('_id') !== action.datasetId) {
                return state;
            }

            return state.merge({
                toggling: true
            });
        case RECEIVE_AI_TOGGLE:
            if(state.get('_id') !== action.datasetId) {
                return state;
            }
        
            return state.merge({
                ai: action.aiState,
                toggling: false
            });
        default:
            return state;  
    }
};

export default datasets;