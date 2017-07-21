import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getROCCurve, 
  getIsFetching, 
  getErrorMessage
} from './data';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ROCCurve from './ROCCurve';

class ROCCurveContainer extends Component {
  componentDidMount() {
    if(this.props.file) {
      this.props.fetchROCCurve(this.props.file.get('_id'));
    }
  }

  render() {
    return (
      <ROCCurve {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  rocCurve: getROCCurve(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

ROCCurveContainer.propTypes = {
  file: ImmutablePropTypes.map
};

export default connect(
  mapStateToProps, 
  actions
)(ROCCurveContainer);