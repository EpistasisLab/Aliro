import { Map } from 'immutable';
import { 
	SET_CURRENT_DATASET 
} from './actions';

const initialState = Map();

const currentDataset = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_DATASET:
            return action.currentDataset;
        default:
            return state;
    }
};

export default currentDataset;