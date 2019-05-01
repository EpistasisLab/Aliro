import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'data/preferences/actions';
import Navbar from './Navbar';
import FetchError from '../FetchError';
import { Container, Loader } from 'semantic-ui-react';


/**
* Main menu bar of website - parent component of navbar
*/
class App extends Component {
  /**
  * react lifecycle method, when component is done loading, after it is mounted in
  * DOM, use preferences action creator, fetchPreferences, to request retrieval of
  * user preferences - user info and available machine learning algorithms
  */
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
