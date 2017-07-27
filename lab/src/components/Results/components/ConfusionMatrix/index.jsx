import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getConfusionMatrix, 
  getIsFetching, 
  getErrorMessage
} from './data';
import ConfusionMatrix from './ConfusionMatrix';

class ConfusionMatrixContainer extends Component {
  componentWillMount() {
    this.props.clearConfusionMatrix();
  }

  componentDidMount() {
    if(this.props.file) {
      this.props.fetchConfusionMatrix(this.props.file.get('_id'));
    }
  }

  render() {
    return (
      <ConfusionMatrix {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  confusionMatrix: getConfusionMatrix(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

ConfusionMatrixContainer.propTypes = {
  file: ImmutablePropTypes.map,
  clearConfusionMatrix: PropTypes.func.isRequired,
  fetchConfusionMatrix: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps, 
  actions
)(ConfusionMatrixContainer);