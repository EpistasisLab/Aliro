import React from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import DatasetCard from './DatasetCard';

function DatasetCardContainer(props) {
  return (
    <DatasetCard {...props} />
  );
}

export default connect(
  null,
  actions
)(DatasetCardContainer);