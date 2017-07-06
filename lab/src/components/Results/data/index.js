import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import {
	RESULTS_FETCH_REQUEST,
	RESULTS_FETCH_SUCCESS,
	RESULTS_FETCH_FAILURE,
	CONF_MATRIX_FETCH_REQUEST,
	CONF_MATRIX_FETCH_SUCCESS,
	CONF_MATRIX_FETCH_FAILURE,
	ROC_CURVE_FETCH_REQUEST,
	ROC_CURVE_FETCH_SUCCESS,
	ROC_CURVE_FETCH_FAILURE
} from './actions';

export const getResults = (state) => 
	state.getIn(['results', 'data']);

const data = (state = Map(), action) => {
	switch(action.type) {
		case RESULTS_FETCH_SUCCESS:
			return state.merge(action.response[0]);
		default:
			return state;
	}
};

export const getIsFetching = (state) => 
	state.getIn(['results', 'isFetching']);

const isFetching = (state = false, action) => {
	switch(action.type) {
		case RESULTS_FETCH_REQUEST:
			return true;
		case RESULTS_FETCH_SUCCESS:
		case RESULTS_FETCH_FAILURE:
			return false;   
		default:
			return state;
	}
};

export const getErrorMessage = (state) =>
	state.getIn(['results', 'errorMessage']);

const errorMessage = (state = null, action) => {
	switch(action.type) {
		case RESULTS_FETCH_FAILURE:
			return action.message;
		case RESULTS_FETCH_REQUEST:
		case RESULTS_FETCH_SUCCESS:
			return null;
		default:
			return state;	
	}
};

// must do error/fetching for each graph
export const getConfusionMatrix = (state) =>
	state.getIn(['results', 'confusionMatrix']);

const confusionMatrix = (state = false, action) => {
	switch(action.type) {
		case CONF_MATRIX_FETCH_SUCCESS:
			return URL.createObjectURL(action.response);
		default:
			return state;
	}
};

export const getROCCurve = (state) =>
	state.getIn(['results', 'rocCurve']);

const rocCurve = (state = false, action) => {
	switch(action.type) {
		case ROC_CURVE_FETCH_SUCCESS:
			return URL.createObjectURL(action.response);
		default:
			return state;
	}
};

const results = combineReducers({
	data,
	isFetching,
	errorMessage,
	confusionMatrix,
	rocCurve
});

export default results;