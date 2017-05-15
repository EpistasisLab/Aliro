export const REQUEST_EXPERIMENTS = 'REQUEST_EXPERIMENTS';
export const RECEIVE_EXPERIMENTS = 'RECEIVE_EXPERIMENTS';
export const SET_FILTER = 'SET_FILTER';
export const SET_SORT = 'SET_SORT';
export const RESET_FILTERS = 'RESET_FILTERS';

export const requestExperiments = () => {
	return {
		type: REQUEST_EXPERIMENTS
	}
};

export const receiveExperiments = (json) => {
	return {
		type: RECEIVE_EXPERIMENTS,
		experiments: json,
		receivedAt: Date.now()
	}
};

export const setFilter = (filter, value) => {
	return {
		type: SET_FILTER,
		filter,
		value
	}
};

export const setSort = (column, direction) => {
	return {
		type: SET_SORT,
		column,
		direction
	}
};

export const resetFilters = () => {
	return {
		type: RESET_FILTERS
	}
};