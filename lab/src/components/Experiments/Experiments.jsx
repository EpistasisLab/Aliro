import React from 'react';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchMessage from '../FetchMessage';
import FetchError from '../FetchError';
import ExperimentFilters from './components/ExperimentFilters';
import ExperimentsTable from './components/ExperimentsTable';
import { Header, Segment } from 'semantic-ui-react';

function Experiments({
  experiments,
  isFetching,
  errorMessage,
  filters,
  sort,
  location,
  fetchExperiments
}) {
  const updateQuery = (key, value) => {
    const nextLocation = Object.assign({}, location);
    if(value === 'all') {
      delete nextLocation.query[key];
    } else {
      Object.assign(nextLocation.query, { [key]: value });
    }
    hashHistory.push(nextLocation);
  };

  const resetQuery = () => {
    const nextLocation = Object.assign({}, location);
    Object.keys(nextLocation.query).forEach((key) => {
      delete nextLocation.query[key];
    });
    hashHistory.push(nextLocation);
  };

  if(errorMessage && !experiments.size) {
    return (
      <FetchError 
        message={errorMessage}
        onRetry={() => fetchExperiments()}
      />
    );
  } else if(isFetching && !experiments.size) {
    return (
      <FetchMessage message="Retrieving your experiments..." />
    );
  }

  return (
    <div>
      <Segment inverted attached="top">
        <ExperimentFilters
          filters={filters}
          updateQuery={updateQuery}
          resetQuery={resetQuery}
        />
        <span className="experiment-count float-right">
          <Header 
            inverted
            size="small" 
            content={`${experiments.size} result${experiments.size === 1 ? '' : 's'}`}
          />
        </span>
      </Segment>
      <Segment inverted attached="bottom">
        {experiments.size > 0 ? (
          <ExperimentsTable 
            experiments={experiments}
            filters={filters}
            sort={sort}
            updateQuery={updateQuery}
          />
        ) : (
          <FetchMessage message="No results available." />
        )}
      </Segment>
    </div>
  );
}

export default Experiments;