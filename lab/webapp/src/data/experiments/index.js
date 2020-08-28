/* This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import {
  FETCH_EXPERIMENTS_REQUEST,
  FETCH_EXPERIMENTS_SUCCESS,
  FETCH_EXPERIMENTS_FAILURE,
  ADD_EXPERIMENT,
  UPDATE_EXPERIMENT
} from './actions';
import selected from './selected';
import { formatDataset, formatAlgorithm } from 'utils/formatter';

const list = (state = [], action) => {
  switch(action.type) {
    case FETCH_EXPERIMENTS_SUCCESS:
      return action.payload;
    case ADD_EXPERIMENT:
      return [action.payload, ...state];
    case UPDATE_EXPERIMENT:
      return state.map(e => {
        if(e._id === action.payload._id) {
          return action.payload;
        }
        return e;
      });
    default:
      return state; 
  }
};

const isFetching = (state = false, action) => {
  switch(action.type) {
    case FETCH_EXPERIMENTS_REQUEST:
      return true;
    case FETCH_EXPERIMENTS_SUCCESS:
    case FETCH_EXPERIMENTS_FAILURE:
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_EXPERIMENTS_FAILURE:
      return action.payload;
    default:
      return state;  
  }
};

const experiments = combineReducers({
  list,
  isFetching,
  error,
  selected
});

export default experiments;

const getExperiments = (state) => state.experiments;
const getQuery = (state, props) => props.location.query;
export const getFilters = createSelector(
  [getExperiments, getQuery],
  (experiments, query) => {
    const filterKeys = [
      //{ key: 'status', textPath: ['status'], valuePath: ['status'] },
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
    experiments.list.forEach((exp) => {
      filterKeys.forEach((filter) => {
        if(!filters[filter.key].values.includes(exp[filter.valuePath])) {
          filters[filter.key].values.push(exp[filter.valuePath]);

          filters[filter.key].options.push({
            text: formatOptionText(filter.key, exp[filter.textPath]),
            value: exp[filter.valuePath]
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

    // manually build status options (temporary until better solution)
    const statusOptions = ['all', 'pending', 'running', 'completed', 'success', 'cancelled', 'fail'];
    filters.status = {};
    filters.status.options = statusOptions.map(option => ({ text: option, value: option }));
    filters.status.selected = query.status || 'all';

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
  [getExperiments, getFilters, getSort],
  (experiments, filters, sort) => {
    const sortedList = experiments.list
      .slice(0) // clone array
      .filter(filterBy(filters))
      .sort(sortBy(sort));

    return Object.assign({}, experiments, { list: sortedList });
  }
);

const filterBy = (filters) => (experiment) => {
  const { status, dataset, algorithm } = filters;

  // status category 'completed' includes 'success', 'cancelled', and 'fail'
  return (
    (status.selected === 'all' || status.selected === experiment.status || status.selected === 'completed' && ['success', 'cancelled', 'fail'].includes(experiment.status)) &&
    (dataset.selected === 'all' || dataset.selected === experiment.dataset_id) &&
    (algorithm.selected === 'all' || algorithm.selected === experiment.algorithm)
  );
};

const sortBy = (sort) => (a, b) => {
  let { column, direction } = sort;
  if(!column) {
    column = 'started';
    sort = 'descending';
  }

  const keyPath = column.split('-');
  let A = a, B = b;
  keyPath.forEach(key => { A = A[key]; B = B[key]; });

  if(typeof(A) === 'number' && typeof(B) === 'number') {
    return direction === 'ascending' ? (A - B) : (B - A);
  } else if(typeof(A) === 'string' && typeof(B) === 'string') {
    A = A.toUpperCase(), B = B.toUpperCase();
    return alphabetize(A, B, direction);
  } else if(typeof(A) === 'boolean' && typeof(B) === 'boolean') {
    return direction === 'ascending' ? (A - B) : (B - A); // treat booleans like numbers
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
