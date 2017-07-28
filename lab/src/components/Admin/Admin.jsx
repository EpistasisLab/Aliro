import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchError from '../FetchError';
import AlgorithmRow from './components/AlgorithmRow';
import { Header, Segment, Table, Loader } from 'semantic-ui-react';

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
    <Segment inverted>
      <Table 
        inverted
        basic
        celled
        compact
        unstackable
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{'Algorithm'}</Table.HeaderCell>
            <Table.HeaderCell>{'Category'}</Table.HeaderCell>
            <Table.HeaderCell>{'Add to Machines'}</Table.HeaderCell>
            <Table.HeaderCell>{'Actions'}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {algorithms.map(algorithm => (
            <AlgorithmRow
              key={algorithm.get('_id')}
              algorithm={algorithm}
            />
          ))}
        </Table.Body>  
      </Table>
    </Segment>
  );
}

Admin.propTypes = {
  algorithms: ImmutablePropTypes.list.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchAlgorithms: PropTypes.func.isRequired
};

export default Admin;