import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getAllDatasets, 
  getIsFetching, 
  getErrorMessage 
} from './data';
import SceneHeader from '../SceneHeader';
import Datasets from './Datasets';

class DatasetsContainer extends Component {
  componentDidMount() {
    this.props.fetchDatasets();
  }

  render() {
    return (
      <div>
        <SceneHeader header="Datasets" btnText="Add new" btnIcon="plus" />
        <Datasets {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  datasets: getAllDatasets(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

DatasetsContainer.propTypes = {
  fetchDatasets: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps, 
  actions
)(DatasetsContainer);