import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import {
  getAllAlgorithms,
  getIsFetching, 
  getErrorMessage
} from './data';
import SceneHeader from '../SceneHeader';
import Admin from './Admin';

class AdminContainer extends Component {
  componentDidMount() {
    this.props.fetchAlgorithms();
  }

  render() {
    return (
      <div>
        <SceneHeader header="Admin" btnText="Add new algorithm" btnIcon="plus" />
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