import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchError from '../FetchError';
import ExperimentFilters from './components/ExperimentFilters';
import ExperimentsTable from './components/ExperimentsTable';
import { Segment, Header, Loader } from 'semantic-ui-react';
import { hashHistory } from 'react-router';

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
      <Loader active inverted size="large" content="Retrieving your experiments..." />
    );
  }

  return (
    <div>
      <Segment inverted attached="top">
        <ExperimentFilters
          filters={filters}
          resultCount={experiments.size}
          updateQuery={updateQuery}
          resetQuery={resetQuery}
        />
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
          <Header inverted size="small" content="No results available." />
        )}
      </Segment>
    </div>
  );
}

Experiments.propTypes = {
  experiments: ImmutablePropTypes.list.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  filters: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetchExperiments: PropTypes.func.isRequired
};

export default Experiments;