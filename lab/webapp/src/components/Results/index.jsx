import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'data/experiments/selected/actions';
import SceneHeader from '../SceneHeader';
import FetchError from '../FetchError';
import AlgorithmDetails from './components/AlgorithmDetails';
import RunDetails from './components/RunDetails';
import ConfusionMatrix from './components/ConfusionMatrix';
import ROCCurve from './components/ROCCurve';
import ImportanceScore from './components/ImportanceScore';
import Score from './components/Score';
import { Header, Grid, Loader } from 'semantic-ui-react';
import { formatDataset } from 'utils/formatter';

class Results extends Component {
  componentDidMount() {
    this.props.fetchExperiment(this.props.params.id);
  }

  componentWillUnmount() {
    this.props.clearExperiment();
  }

  render() {
    const { experiment, fetchExperiment } = this.props;

    if(experiment.isFetching || !experiment.data) {
      return (
        <Loader active inverted size="large" content="Retrieving results..." />
      );
    }

    if(experiment.error === 'Failed to fetch') {
      return (
        <FetchError
          message="The specified experiment does not exist."
        />
      );
    } else if(experiment.error) {
      return (
        <FetchError
          message={experiment.error}
          onRetry={() => fetchExperiment()}
        />
      );
    }

    let confusionMatrix, rocCurve, importanceScore;
    experiment.data.experiment_files.forEach(file => {
      const filename = file.filename;
      if(filename.includes('confusion_matrix')) {
        confusionMatrix = file;
      } else if(filename.includes('roc_curve')) {
        rocCurve = file;
      } else if(filename.includes('imp_score')) {
        importanceScore = file;
      }
    });

    return (
      <div>
        <SceneHeader
          header={`Results: ${formatDataset(experiment.data.dataset_name)}`}
          subheader={`Experiment: #${experiment.data._id}`}
        />
        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column>
              <AlgorithmDetails
                algorithm={experiment.data.algorithm}
                params={experiment.data.params}
              />
              <RunDetails
                startTime={experiment.data.started}
                finishTime={experiment.data.finished}
                launchedBy={experiment.data.launched_by}
              />
              <ImportanceScore file={importanceScore} />
            </Grid.Column>
            <Grid.Column>
              <ConfusionMatrix file={confusionMatrix} />
              <ROCCurve file={rocCurve} />
            </Grid.Column>
            <Grid.Column>
              <Score
                scoreName="Balanced Accuracy"
                scoreValue={-1}
                scoreValueList={experiment.data.scores}
                chartKey="all"
                chartColor="#7D5BA6"
              />
              <Score
                scoreName="Precision Score"
                scoreValue={experiment.data.scores.precision_score}
                chartKey="precision"
                chartColor="#55D6BE"
              />
              <Score
                scoreName="Recall Score"
                scoreValue={experiment.data.scores.recall_score}
                chartKey="recall"
                chartColor="#7D5BA6"
              />
              <Score
                scoreName="F1 Score"
                scoreValue={experiment.data.scores.f1_score}
                chartKey="f1_score"
                chartColor="#55D6BE"
              />
              {/*<Score
                scoreName="Training Accuracy"
                scoreValue={experiment.data.scores.train_score}
                chartKey="training"
                chartColor="#7D5BA6"
              />
              <Score
                scoreName="Testing Accuracy"
                scoreValue={experiment.data.scores.test_score}
                chartKey="testing"
                chartColor="#55D6BE"
              />*/}
              <Score
                scoreName="AUC"
                scoreValue={experiment.data.scores.roc_auc_score}
                chartKey="auc"
                chartColor="#7D5BA6"
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  experiment: state.experiments.selected
});

export { Results };
export default connect(mapStateToProps, actions)(Results);
