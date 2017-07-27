import React, { Component } from 'react';
import { connect } from 'react-redux';
//import * as actions from './data/actions';
import AlgorithmCard from './AlgorithmCard';

class AlgorithmCardContainer extends Component {
  render() {
    return (
      <AlgorithmCard {...this.props} />
    );
  }
}

export default connect(
  null,
  //actions
)(AlgorithmCardContainer);