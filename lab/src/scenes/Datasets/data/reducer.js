import { List, Map, fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { 
    FETCH_DATASETS_REQUEST,
    FETCH_DATASETS_SUCCESS,
    FETCH_DATASETS_FAILURE
} from './actions';

const byId = (state = Map(), action) => {
    switch(action.type) {
        case FETCH_DATASETS_SUCCESS:
            const newDatasets = {};
            action.response.forEach(dataset => {
                newDatasets[dataset._id] = dataset;
            });
            return state.merge(newDatasets);
        default:
            return state;
    }
};

const isFetching = (state = false, action) => {
    switch(action.type) {
        case FETCH_DATASETS_REQUEST:
            return true;
        case FETCH_DATASETS_SUCCESS:
        case FETCH_DATASETS_FAILURE:
            return false;   
        default:
            return state;
    }
};

const datasets = combineReducers({
    byId,
    isFetching
});

/*case REQUEST_AI_TOGGLE:
        return state.merge({
                items: state.get('items').map(d => dataset(d, action))
        });
case RECEIVE_AI_TOGGLE:
        return state.merge({
                items: state.get('items').map(d => dataset(d, action))
        });*/

// manages individual dataset
/*const dataset = (state = fromJS({}), action) => {
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
};*/

export default datasets;