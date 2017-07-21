import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as actions from './data/actions';
import {
  getVisibleExperiments,
  getIsFetching, 
  getErrorMessage,
  getFilters,
  getSort
} from './data';
import SceneHeader from '../SceneHeader';
import Experiments from './Experiments';

class ExperimentsContainer extends Component {
  componentDidMount() {
    this.props.fetchExperiments();
  }

  render() {
    return (
      <div className="experiments-scene">
        <SceneHeader header="Experiments" />
        <Experiments {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  experiments: getVisibleExperiments(state, props),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state),
  filters: getFilters(state, props),
  sort: getSort(state, props)
});

export default withRouter(connect(
  mapStateToProps, 
  actions
)(ExperimentsContainer));