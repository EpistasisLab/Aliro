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
  constructor(props) {
    super(props);
    this.getGaugeArray = this.getGaugeArray.bind(this);
  }

  componentDidMount() {
    this.props.fetchExperiment(this.props.params.id);
  }

  componentWillUnmount() {
    this.props.clearExperiment();
  }

  /**
  * Basic helped method to create array containing [key,val] entries where
  *   key - name of given score
  *   value - actual score
  * passed to Score component which uses javascript library C3 to create graphic
  */
  getGaugeArray(keyList) {
    const { experiment } = this.props;
    let testList = [];
    let expScores = experiment.data.scores;

    keyList.forEach(scoreKey => {
        if(typeof expScores[scoreKey].toFixed === 'function'){
          let tempLabel;
          scoreKey.includes('train')
            ? tempLabel = 'train (' + expScores[scoreKey].toFixed(2) + ')'
            : tempLabel = 'test (' + expScores[scoreKey].toFixed(2) + ')';
          testList.push(
            [tempLabel, expScores[scoreKey]]
          )
        }
      }
    );

    return testList;
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

    // --- get lists of scores ---

    // balanced accuracy
    let balancedAccKeys = ['train_score', 'accuracy_score'];
    // precision scores
    let precisionKeys = ['train_precision_score', 'precision_score']
    // AUC
    let aucKeys = ['roc_auc_score', 'train_roc_auc_score'];
    // f1 score
    let f1Keys = ['train_f1_score', 'f1_score'];
    // recall
    let recallKeys = ['train_recall_score', 'recall_score'];

    let balancedAccList = this.getGaugeArray(balancedAccKeys);
    let precisionList = this.getGaugeArray(precisionKeys);
    let aucList = this.getGaugeArray(aucKeys);
    let recallList = this.getGaugeArray(recallKeys);
    let f1List = this.getGaugeArray(f1Keys);
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
                scoreValueList={balancedAccList}
                chartKey="all"
                chartColor="#7D5BA6"
              />
              <Score
                scoreName="AUROC"
                scoreValueList={aucList}
                chartKey="auc_scores"
                chartColor="#55D6BE"
              />
              <Score
                scoreName="Precision"
                scoreValueList={precisionList}
                chartKey="precision_scores"
                chartColor="#55D6BE"
              />
              <Score
                scoreName="Recall"
                scoreValueList={recallList}
                chartKey="recall_scores"
                chartColor="#55D6BE"
              />
              <Score
                scoreName="F1 Score"
                scoreValueList={f1List}
                chartKey="f1_scores"
                chartColor="#55D6BE"
              />
              {/*<Score
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
              />*/}
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
              />
              <Score
                scoreName="AUC"
                scoreValue={experiment.data.scores.roc_auc_score}
                chartKey="auc"
                chartColor="#7D5BA6"
              />
              <Score
                scoreName="Train AUC"
                scoreValue={experiment.data.scores.train_roc_auc_score}
                chartKey="train_auc"
                chartColor="#55D6BE"
              />*/}
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
