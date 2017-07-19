import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getResults, 
  getIsFetching, 
  getErrorMessage,
  getConfusionMatrix,
  getROCCurve
} from './data';
import SceneHeader from '../SceneHeader';
import Results from './Results';

class ResultsContainer extends Component {
  componentDidMount() {
    this.props.fetchResults(this.props.params.id);
  }

  componentDidUpdate(prevProps) {
    const { results } = this.props;
    if(results !== prevProps.results) {
      const files = results.get('experiment_files');
      files.forEach(f => {
        const filename = f.get('filename');
        if(filename.includes('confusion_matrix')) {
          this.props.fetchConfusionMatrix(f.get('_id'));
        } else if(filename.includes('roc_curve')) {
          this.props.fetchROCCurve(f.get('_id'));
        }
      });
    }
  }

  getSceneHeader() {
    const { results } = this.props;
    if(results.size) {
      return {
        header: `Results: ${results.get('dataset_name')}`,
        subheader: `Experiment: #${results.get('_id')}`
      };
    }

    return { header: 'Results', subheader: null };
  }

  render() {
    const sceneHeader = this.getSceneHeader();
    return (
      <div>
        <SceneHeader header={sceneHeader.header} subheader={sceneHeader.subheader} />
        <Results {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  results: getResults(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state),
  confusionMatrix: getConfusionMatrix(state),
  rocCurve: getROCCurve(state)
});

export default connect(
  mapStateToProps, 
  actions
)(ResultsContainer);