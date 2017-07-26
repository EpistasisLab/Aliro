import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import ImmutablePropTypes from 'react-immutable-proptypes';
import DatasetCard from './DatasetCard';

class DatasetCardContainer extends Component {
  render() {
    return (
      <DatasetCard {...this.props} />
    );
  }
}

DatasetCardContainer.propTypes = {
  dataset: ImmutablePropTypes.map.isRequired
};

export default connect(
  null,
  actions
)(DatasetCardContainer);