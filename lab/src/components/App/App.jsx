import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchError from '../FetchError';
import Navbar from './Navbar';
import { Container, Loader } from 'semantic-ui-react';

function App({ 
  children,
  preferences,
  isFetching,
  errorMessage,
  fetchPreferences
}) {
  const getContent = () => {
    if(errorMessage) {
      return (
        <FetchError 
          message={errorMessage}
          onRetry={() => fetchPreferences()}
        />
      );
    } else if(isFetching) {
      return (
        <Loader active inverted size="large">
          Retrieving your preferences...
        </Loader>
      );
    }

    return children;
  };
 
  return (
    <Container fluid className="app pennai">
      <Navbar preferences={preferences} />
      {getContent()}
    </Container>
  );
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  preferences: ImmutablePropTypes.map,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchPreferences: PropTypes.func.isRequired
};

export default App;