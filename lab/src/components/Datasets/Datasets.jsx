import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ResponsiveGrid from '../ResponsiveGrid';
import DatasetCard from './components/DatasetCard';
import FetchError from '../FetchError';
import { Header, Loader } from 'semantic-ui-react';

function Datasets({
  datasets,
  isFetching,
  errorMessage,
  fetchDatasets
}) {
  if(errorMessage && !datasets.size) {
    return (
      <FetchError 
        message={errorMessage}
        onRetry={() => fetchDatasets()}
      />
    );
  } else if(isFetching && !datasets.size) {
    return (
      <Loader active inverted size="large" content="Retrieving your datasets..." />
    );
  } else if(!isFetching && !datasets.size) {
    return (
      <Header inverted size="small" content="You have no datasets uploaded yet." />
    );
  }
      
  return (
    <ResponsiveGrid
      mobile={1}
      tablet={2}
      desktop={3}
      lgscreen={4}
    >
      {datasets.map(dataset => (
        <DatasetCard
          key={dataset.get('_id')}
          dataset={dataset}
        />
      ))}
    </ResponsiveGrid>
  );
}

Datasets.propTypes = {
  datasets: ImmutablePropTypes.list.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchDatasets: PropTypes.func.isRequired
};

export default Datasets;