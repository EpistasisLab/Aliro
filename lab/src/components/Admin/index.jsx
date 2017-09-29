import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import {
  getAllAlgorithms,
  getIsFetching, 
  getErrorMessage
} from './data';
import Admin from './Admin';
import AddNewAlgorithm from './components/AddNewAlgorithm';
import { Header } from 'semantic-ui-react';

class AdminContainer extends Component {
  componentDidMount() {
    this.props.fetchAlgorithms();
  }

  render() {
    return (
      <div className="admin-scene">
        <div className="scene-header">
          <Header inverted size="huge" content="Admin" />
          <AddNewAlgorithm />
        </div>
        <Admin {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  algorithms: getAllAlgorithms(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

AdminContainer.propTypes = {
  fetchAlgorithms: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps, 
  actions
)(AdminContainer);