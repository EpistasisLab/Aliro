import { Map } from 'immutable';
import { 
	SET_CURRENT_ALGORITHM,
    SET_PARAMETER_VALUE
} from './actions';

const initialState = Map();

const currentAlgorithm = (state = initialState, action) => {
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

export default currentAlgorithm;