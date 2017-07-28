import React from 'react';
import { connect } from 'react-redux';
//import * as actions from './data/actions';
import AlgorithmCard from './AlgorithmCard';

function AlgorithmCardContainer(props) {
  return (
    <AlgorithmCard {...props} />
  );
}

export default connect(
  null
  //actions
)(AlgorithmCardContainer);