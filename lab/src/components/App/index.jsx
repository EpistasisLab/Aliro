import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getPreferences,
  getIsFetching,
  getErrorMessage
} from './data';
import Navbar from './Navbar';
import { Container } from 'semantic-ui-react';

class App extends Component {
  render() {
    return (
      <Container fluid className="app pennai">
        <Navbar />
        {this.props.children}
      </Container>
    );
  }
}

class AppContainer extends Component {
  componentDidMount() {
    this.props.fetchPreferences();
  }

  render() {
    return (
      <App {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  preferences: getPreferences(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

export default connect(
  mapStateToProps, 
  actions
)(AppContainer);