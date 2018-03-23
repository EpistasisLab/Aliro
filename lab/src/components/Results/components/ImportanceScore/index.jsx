import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import {
  getImportanceScore,
  getIsFetching,
  getErrorMessage
} from './data';
import ImportanceScore from './ImportanceScore';

class ImportanceScoreContainer extends Component {
  componentWillMount() {
    this.props.clearImportanceScore();
  }

  componentDidMount() {
    if(this.props.file) {
      this.props.fetchImportanceScore(this.props.file.get('_id'));
    }
  }

  render() {
    return (
      <ImportanceScore {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  importanceScore: getImportanceScore(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

ImportanceScoreContainer.propTypes = {
  file: ImmutablePropTypes.map,
  clearImportanceScore: PropTypes.func.isRequired,
  fetchImportanceScore: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  actions
)(ImportanceScoreContainer);
