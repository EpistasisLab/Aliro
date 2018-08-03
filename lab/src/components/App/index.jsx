import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'data/preferences/actions';
import Navbar from './Navbar';
import FetchError from '../FetchError';
import { Container, Loader } from 'semantic-ui-react';

class App extends Component {
  componentDidMount() {
    this.props.fetchPreferences();
  }

  render() {
    const { preferences, fetchPreferences, children } = this.props;

    if(preferences.isFetching) {
      return (
        <Loader active inverted size="large" content="Retrieving your preferences..." />
      );
    }

    if(preferences.error) {
      return (
        <FetchError 
          message={preferences.error}
          onRetry={() => fetchPreferences()}
        />
      );
    }

    return (
      <Container fluid className="app pennai">
        <Navbar preferences={preferences.data} />
        {children}
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  preferences: state.preferences
});

export { App };
export default connect(mapStateToProps, actions)(App);