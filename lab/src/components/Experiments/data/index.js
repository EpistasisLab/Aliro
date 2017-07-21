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

// cleanup getfilters function
// alphabetize datasets and algorithms in filters
// make sure on click doesnt rerun change if same
// why does changing filter cause two updates?
// use selectors throughout app
// make table filters reponsive
// stylize table scrollbar
// format dataset names throughout
// also format alg names in dropdown + alphabetize
// think about incompatible params
// boolean sorting not working
// number cols init should be descending, strings ascending

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
      { key: 'status', keyPath: ['status'], textPath: ['status'], valuePath: ['status'] },
      { key: 'dataset', keyPath: ['dataset_name'], textPath: ['dataset_name'], valuePath: ['dataset_id'] },
      { key: 'algorithm', keyPath: ['algorithm'], textPath: ['algorithm'], valuePath: ['algorithm'] } // ['algorithm', '_id']
    ];

    //let filters = {};
    let test = {};

    // initalize options as array for each filter
    filterKeys.forEach((filter) => {
      test[filter.key] = {};
      test[filter.key].values = [];
      test[filter.key].options = [];
    });

    // get all possible filter options
    allExperiments.forEach((exp) => {
      filterKeys.forEach((filter) => {
        if(!test[filter.key].values.includes(exp.getIn(filter.valuePath))) {
          test[filter.key].values.push(exp.getIn(filter.valuePath));

          test[filter.key].options.push({ 
            text: exp.getIn(filter.textPath), 
            value: exp.getIn(filter.valuePath) 
          });
        }
      });
    });

    filterKeys.forEach((filter) => {
      test[filter.key].options.unshift({
        text: 'all',
        value: 'all'
      });

      test[filter.key].selected = test[filter.key].values.includes(query[filter.key]) ? query[filter.key] : 'all';
    });

    /*let filters = {};
    filterKeys.forEach((filter) => {
      let options = getUniqOptions(allExperiments, filter.keyPath);
      let selected = options.includes(query[filter.key]) ? query[filter.key] : 'all';

      filters[filter.key] = {options, selected};
    });*/

    return test;
  }
);

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