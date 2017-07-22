import { List, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { createSelector } from 'reselect';
import { 
  EXPERIMENTS_FETCH_REQUEST, 
  EXPERIMENTS_FETCH_SUCCESS, 
  EXPERIMENTS_FETCH_FAILURE,
  EXPERIMENT_ADD,
  EXPERIMENT_UPDATE
} from './actions';
import { formatDataset, formatAlgorithm } from '../../../utils/formatter';

// make sure on click doesnt rerun change if same
// why does changing filter cause two updates?
// use selectors throughout app
// make table filters reponsive
// stylize table scrollbar
// think about incompatible params
// boolean sorting not working
// number cols init should be descending, strings ascending
// fix sorting so it doesn't use () bind

const getById = (state) => 
  state.getIn(['experiments', 'byId']);

const byId = (state = Map(), action) => {
  switch(action.type) {
    case EXPERIMENTS_FETCH_SUCCESS: {
      const newExperiments = {};
      action.response.forEach(experiment => {
        newExperiments[experiment._id] = experiment;
      });
      return state.merge(newExperiments);
    }
    case EXPERIMENT_ADD:
    case EXPERIMENT_UPDATE:
      return state.mergeIn([action.experiment._id], action.experiment);
    default:
      return state;
  }
};

const getAllIds = (state) => 
  state.getIn(['experiments', 'allIds']); 

const allIds = (state = List(), action) => {
  switch(action.type) {
    case EXPERIMENTS_FETCH_SUCCESS: {
      const newExperiments = action.response.map(experiment => experiment['_id']);
      return state.merge(newExperiments);
    }
    case EXPERIMENT_ADD:
      return state.push(action.experiment._id);
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

// transform selectors
const getAllExperiments = createSelector(
  [getAllIds, getById],
  (allIds, byId) => 
    allIds.sort().reverse().map(id => byId.get(id))
);

const getQuery = (state, props) => props.location.query;

export const getFilters = createSelector(
  [getAllExperiments, getQuery],
  (allExperiments, query) => {
    const filterKeys = [
      { key: 'status', textPath: ['status'], valuePath: ['status'] },
      { key: 'dataset', textPath: ['dataset_name'], valuePath: ['dataset_id'] },
      { key: 'algorithm', textPath: ['algorithm'], valuePath: ['algorithm'] } // ['algorithm', '_id']
    ];

    let filters = {};

    // initalize options as array for each filter
    filterKeys.forEach((filter) => {
      filters[filter.key] = {};
      filters[filter.key].values = [];
      filters[filter.key].options = [];
    });

    // get all possible filter options
    allExperiments.forEach((exp) => {
      filterKeys.forEach((filter) => {
        if(!filters[filter.key].values.includes(exp.getIn(filter.valuePath))) {
          filters[filter.key].values.push(exp.getIn(filter.valuePath));

          filters[filter.key].options.push({ 
            text: formatOptionText(filter.key, exp.getIn(filter.textPath)), 
            value: exp.getIn(filter.valuePath) 
          });
        }
      });
    });

    // alphabetize dataset and algorithm filters
    filters.dataset.options.sort((a, b) => alphabetize(a.text, b.text, 'ascending'));
    filters.algorithm.options.sort((a, b) => alphabetize(a.text, b.text, 'ascending'));

    // add 'all' option and set selected based on query
    filterKeys.forEach((filter) => {
      filters[filter.key].options.unshift({
        text: 'all',
        value: 'all'
      });

      filters[filter.key].selected = filters[filter.key].values.includes(query[filter.key]) ? query[filter.key] : 'all';
    });

    return filters;
  }
);

const formatOptionText = (filterKey, text) => {
  if(filterKey === 'dataset') {
    return formatDataset(text);
  }

  if(filterKey === 'algorithm') {
    return formatAlgorithm(text);
  }

  return text;
};

export const getSort = createSelector(
  [getQuery],
  (query) => ({
    column: query.col || null,
    direction: query.direction || null
  })
);

export const getVisibleExperiments = createSelector(
  [getAllExperiments, getFilters, getSort],
  (allExperiments, filters, sort) => {
    //console.log(filters);
    return allExperiments
      .filter(filterBy(filters))
      .sort(sortBy(sort));
  }
);

const filterBy = (filters) => (experiment) => {
  const { status, dataset, algorithm } = filters;

  return (
    (status.selected === 'all' || status.selected === experiment.get('status')) &&
    (dataset.selected === 'all' || dataset.selected === experiment.get('dataset_id')) &&
    (algorithm.selected === 'all' || algorithm.selected === experiment.get('algorithm'))
  );
};


const sortBy = (sort) => (a, b) => {
  const { column, direction } = sort;

  let A = a.getIn([column]) || a.getIn(['params', column]) || a.getIn(['scores', column]);
  let B = b.getIn([column]) || b.getIn(['params', column]) || b.getIn(['scores', column]);
  
  if(typeof(A) === 'number' && typeof(B) === 'number') {
    return direction === 'ascending' ? (A - B) : (B - A);
  } else if(typeof(A) === 'string' && typeof(B) === 'string') {
    A = A.toUpperCase(), B = B.toUpperCase();
    return alphabetize(A, B, direction);
  } else if(typeof(A) === 'boolean' && typeof(B) === 'boolean') {
    A = A.toString().toUpperCase(), B = B.toString().toUpperCase();
    return alphabetize(A, B, direction);
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
};

const alphabetize = (A, B, direction) => {
  return direction === 'ascending' ? (
    A > B ? 1 : A < B ? -1 : 0
  ) : (
    B > A ? 1 : B < A ? -1 : 0
  );
};