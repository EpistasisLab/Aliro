import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getDataset, 
  getExperiment,
  getIsFetching, 
  getErrorMessage,
  getDefaultAlgorithms,
  getCurrentAlgorithm,
  getCurrentParams,
  getIsSubmitting
} from './data';
import { getPreferences } from '../App/data';
import SceneHeader from '../SceneHeader';
import Builder from './Builder';
import { formatDataset } from '../../utils/formatter';

class BuilderContainer extends Component {
  componentDidMount() {
    const { query } = this.props.location;
    const { defaultAlgorithms, setCurrentAlgorithm } = this.props;

    if(defaultAlgorithms) {
      setCurrentAlgorithm(defaultAlgorithms.first());
    }

    if(query.dataset) {
      this.props.fetchDataset(query.dataset);
      // get next recommended
    } else if(query.experiment) {
      this.props.fetchExperiment(query.experiment);
      // set params
    } else {
      // must include one or the other
    } 
  }

  componentDidUpdate(prevProps) {
    const { defaultAlgorithms, setCurrentAlgorithm } = this.props;

    if(defaultAlgorithms !== prevProps.defaultAlgorithms) {
      setCurrentAlgorithm(defaultAlgorithms.first());
    }
  }

  getSceneHeader() {
    const { dataset, experiment } = this.props;
    const { query } = this.props.location;

    if(dataset.size) {
      return {
        header: `Build New Experiment: ${formatDataset(dataset.get('name'))}`
      };
    } else if(experiment.size) {
      return {
        header: `Review Experiment: ${formatDataset(dataset.get('name'))}`,
        subheader: `Experiment: #${experiment.get('_id')}`
      };
    } else if(query.dataset) {
      return {
        header: 'Build New Experiment'
      };
    } else if(query.experiment) {
      return {
        header: 'Review Experiment'
      };
    }

    return {};
  }

  render() {
    const sceneHeader = this.getSceneHeader();
    return (
      <div className="builder-scene">
        {sceneHeader.header &&
          <SceneHeader header={sceneHeader.header} subheader={sceneHeader.subheader} />
        }
        <Builder {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: getDataset(state),
  experiment: getExperiment(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state),
  defaultAlgorithms: getDefaultAlgorithms(
    getPreferences(state)
  ),
  currentAlgorithm: getCurrentAlgorithm(state),
  currentParams: getCurrentParams(state),
  isSubmitting: getIsSubmitting(state)
});

export default connect(
  mapStateToProps, 
  actions
)(BuilderContainer);