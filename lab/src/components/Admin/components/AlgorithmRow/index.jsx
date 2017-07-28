import React from 'react';
import { connect } from 'react-redux';
//import * as actions from './data/actions';
import AlgorithmRow from './AlgorithmRow';

function AlgorithmRowContainer(props) {
  return (
    <AlgorithmRow {...props} />
  );
}

export default connect(
  null
  //actions
)(AlgorithmRowContainer);