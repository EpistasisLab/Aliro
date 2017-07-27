import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import DatasetCard from './DatasetCard';

class DatasetCardContainer extends Component {
  render() {
    return (
      <DatasetCard {...this.props} />
    );
  }
}

export default connect(
  null,
  actions
)(DatasetCardContainer);