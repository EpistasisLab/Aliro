import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getConfusionMatrix, 
  getIsFetching, 
  getErrorMessage
} from './data';
import ImmutablePropTypes from 'react-immutable-proptypes';
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
  file: ImmutablePropTypes.map
};

export default connect(
  mapStateToProps, 
  actions
)(ConfusionMatrixContainer);