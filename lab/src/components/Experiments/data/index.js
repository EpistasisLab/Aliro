import { List, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { 
	EXPERIMENTS_FETCH_REQUEST, 
	EXPERIMENTS_FETCH_SUCCESS, 
	EXPERIMENTS_FETCH_FAILURE,
	EXPERIMENT_ADD
} from './actions';

const getById = (state) => 
	state.getIn(['experiments', 'byId']);

const byId = (state = Map(), action) => {
	switch(action.type) {
		case EXPERIMENTS_FETCH_SUCCESS:
			const newExperiments = {};
			action.response.forEach(experiment => {
				newExperiments[experiment._id] = experiment;
			});
			return state.merge(newExperiments);
		case EXPERIMENT_ADD:
			return state.merge(action.experiment[0]._id, action.experiment[0]);
		default:
			return state;
	}
};

const getAllIds = (state) => 
	state.getIn(['experiments', 'allIds']); 

const allIds = (state = List(), action) => {
	switch(action.type) {
		case EXPERIMENTS_FETCH_SUCCESS:
			const newExperiments = action.response.map(experiment => experiment['_id']);
			return state.merge(newExperiments);
		case EXPERIMENT_ADD:
			return state.push(action.experiment[0]._id);
		default:
			return state;
	}
};

export const getIsFetching = (state) => 
	state.getIn(['experiments', 'isFetching']);

const isFetching = (state = false, action) => {
	switch(action.type) {
		case EXPERIMENTS_FETCH_REQUEST:
			return true;
		case EXPERIMENTS_FETCH_SUCCESS:
		case EXPERIMENTS_FETCH_FAILURE:
			return false;   
		default:
			return state;
	}
};

export const getErrorMessage = (state) =>
	state.getIn(['experiments', 'errorMessage']);

const errorMessage = (state = null, action) => {
	switch(action.type) {
		case EXPERIMENTS_FETCH_FAILURE:
			return action.message;
		case EXPERIMENTS_FETCH_REQUEST:
		case EXPERIMENTS_FETCH_SUCCESS:
			return null;
		default:
			return state;	
	}
};

const experiments = combineReducers({
	byId,
	allIds,
	isFetching,
	errorMessage
});

export default experiments;

const getAllExperiments = (state) =>
	getAllIds(state).sort().reverse().map(id => getById(state).get(id));

export const getVisibleExperiments = (state, filters, sort) => {
	return getAllExperiments(state)
		.filter(filterBy(filters))
		.sort(sortBy(sort));
};

const filterBy = (filters) => (experiment) => {
	const { status, dataset, algorithm  } = filters;

	return (
		(status.selected    === 'all' || status.selected    === experiment.get('status')) &&
		(dataset.selected   === 'all' || dataset.selected   === experiment.get('dataset')) &&
		(algorithm.selected === 'all' || algorithm.selected === experiment.get('algorithm'))
	);
};


const sortBy = (sort) => (a, b) => {
	const { column, direction } = sort;

	let A = a.getIn([column]) || a.getIn(['params', column]),
		 	B = b.getIn([column]) || b.getIn(['params', column]);
	
	if(typeof(A) === 'number' && typeof(B) === 'number') {
		return direction === 'ascending' ? (A - B) : (B - A);
	} else if(typeof(A) === 'string' && typeof(B) === 'string') {
		A = A.toUpperCase(), B = B.toUpperCase();
		let result = direction === 'ascending' ? (
			A > B ? 1 : A < B ? -1 : 0
		) : (
			B > A ? 1 : B < A ? -1 : 0
		);
		return result;
	} else if(typeof(A) !== typeof(B)) {
		if(!A) {
			return Number.POSITIVE_INFINITY;
		} else if(!B) {
			return Number.NEGATIVE_INFINITY;
		} if(typeof(A) === 'number') {
			return direction === 'ascending' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
		} else if(typeof(B) === 'number') {
			return direction === 'ascending' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
		}
	}
}

export const getFilters = (state, query) => {
	const allExperiments = getAllExperiments(state);

	const filterKeys = [
		{ key: 'status',    keyPath: ['status'] },
		{ key: 'dataset',   keyPath: ['dataset'] },  // ['dataset', '_id']
		{ key: 'algorithm', keyPath: ['algorithm'] } // ['algorithm', '_id']
	];

	let filters = {};
	filterKeys.forEach((filter) => {
		let options = getUniqOptions(allExperiments, filter.keyPath);
		let selected = options.includes(query[filter.key]) ? query[filter.key] : 'all';

		filters[filter.key] = {options, selected};
	});

	return filters;
};

const getUniqOptions = (items, keyPath) =>
	[...new Set(items.map(item => item.getIn(keyPath)))];

export const getSort = (query) => ({
	column: query.col || null,
	direction: query.direction || null
});