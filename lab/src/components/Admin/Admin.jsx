import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ResponsiveGrid from '../ResponsiveGrid';
import AlgorithmCard from './components/AlgorithmCard';
import FetchError from '../FetchError';
import { Header, Loader } from 'semantic-ui-react';

function Admin({
  algorithms,
  isFetching,
  errorMessage,
  fetchAlgorithms
}) {
  if(errorMessage && !algorithms.size) {
    return (
      <FetchError 
        message={errorMessage}
        onRetry={() => fetchAlgorithms()}
      />
    );
  } else if(isFetching && !algorithms.size) {
    return (
      <Loader active inverted size="large" content="Retrieving algorithms..." />
    );
  } else if(!isFetching && !algorithms.size) {
    return (
      <Header inverted size="small" content="You have no algorithms uploaded yet." />
    );
  }
      
  return (
    <ResponsiveGrid mobile={1} tablet={2} desktop={3} lgscreen={4}>
      {algorithms.map(algorithm => (
        <AlgorithmCard
          key={algorithm.get('_id')}
          algorithm={algorithm}
        />
      ))}
    </ResponsiveGrid>
  );
}

Admin.propTypes = {
  algorithms: ImmutablePropTypes.list.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchAlgorithms: PropTypes.func.isRequired
};

export default Admin;