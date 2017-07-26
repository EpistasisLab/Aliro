import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getPreferences,
  getIsFetching,
  getErrorMessage
} from './data';
import App from './App';

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