import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'data/experiments/selected/actions';
import SceneHeader from '../SceneHeader';
import FetchError from '../FetchError';
import AlgorithmDetails from './components/AlgorithmDetails';
import RunDetails from './components/RunDetails'
import MSEMAEDetails from './components/MSEMAEDetails';;
import ConfusionMatrix from './components/ConfusionMatrix';
import ROCCurve from './components/ROCCurve';
import ShapSummaryCurve from './components/ShapSummaryCurve';
import ImportanceScore from './components/ImportanceScore';
import RegFigure from './components/RegFigure';
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
            ? tempLabel = 'Train (' + expScores[scoreKey].toFixed(2) + ')'
            : tempLabel = 'Test (' + expScores[scoreKey].toFixed(2) + ')';
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


    console.log(experiment.data.prediction_type)
    // --- get lists of scores ---
    if(experiment.data.prediction_type == "classification") { // classification
      let confusionMatrix, rocCurve, importanceScore, shap_explainer, shap_num_samples;
      let shapSummaryCurveDict = {};
      experiment.data.experiment_files.forEach(file => {
        const filename = file.filename;
        if(filename.includes('confusion_matrix')) {
          confusionMatrix = file;
        } else if(filename.includes('roc_curve')) {
          rocCurve = file;
        } else if(filename.includes('imp_score')) {
          importanceScore = file;
        } else if(filename.includes('shap_summary_curve')) {
          let class_name = filename.split('_').slice(-2,-1);
          shapSummaryCurveDict[class_name] = file;
          shap_explainer=experiment.data.shap_explainer;
          shap_num_samples=experiment.data.shap_num_samples;
        }
      });
      // balanced accuracy
      let balancedAccKeys = ['train_balanced_accuracy_score', 'balanced_accuracy_score'];
      // precision scores
      let precisionKeys = ['train_precision_score', 'precision_score']
      // AUC
      let aucKeys = ['train_roc_auc_score', 'roc_auc_score'];
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
                <ShapSummaryCurve 
                  fileDict={shapSummaryCurveDict} 
                  shap_explainer={shap_explainer}
                  shap_num_samples={shap_num_samples} />
              </Grid.Column>
              <Grid.Column>
                <Score
                  scoreName="Balanced Accuracy"
                  scoreValueList={balancedAccList}
                  chartKey="all"
                  chartColor="#7D5BA6"
                  type="classification"
                />
                <Score
                  scoreName="AUC"
                  scoreValueList={aucList}
                  chartKey="auc_scores"
                  chartColor="#55D6BE"
                  type="classification"
                />
                <Score
                  scoreName="Precision"
                  scoreValueList={precisionList}
                  chartKey="precision_scores"
                  chartColor="#55D6BE"
                  type="classification"
                />
                <Score
                  scoreName="Recall"
                  scoreValueList={recallList}
                  chartKey="recall_scores"
                  chartColor="#55D6BE"
                  type="classification"
                />
                <Score
                  scoreName="F1 Score"
                  scoreValueList={f1List}
                  chartKey="f1_scores"
                  chartColor="#55D6BE"
                  type="classification"
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    } else if(experiment.data.prediction_type == "regression") { // regression
      let importanceScore, reg_cv_pred, reg_cv_resi, reg_cv_qq;
      experiment.data.experiment_files.forEach(file => {
        const filename = file.filename;
        if(filename.includes('imp_score')) {
          importanceScore = file;
        } else if(filename.includes('reg_cv_pred')) {
          reg_cv_pred = file;
        } else if(filename.includes('reg_cv_resi')) {
          reg_cv_resi = file;
        } else if(filename.includes('reg_cv_qq')) {
          reg_cv_qq = file;
        }

      });
      // r2
      let R2Keys = ['train_r2_score', 'r2_score'];
      // r
      let RKeys = ['train_pearsonr_score', 'pearsonr_score'];
      // r2
      let VAFKeys = ['train_explained_variance_score', 'explained_variance_score'];

      let R2List = this.getGaugeArray(R2Keys);
      let RList = this.getGaugeArray(RKeys);
      let VAFList = this.getGaugeArray(VAFKeys);


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
                <RegFigure file={reg_cv_pred} />
                <RegFigure file={reg_cv_resi} />
                <RegFigure file={reg_cv_qq} />
              </Grid.Column>
              <Grid.Column>
                <MSEMAEDetails
                  scores={experiment.data.scores}
                />
                <Score
                  scoreName="R2"
                  scoreValueList={R2List}
                  chartKey="R2"
                  chartColor="#55D6BE"
                  type="r2_or_vaf"
                />
                <Score
                  scoreName="Explained Variance"
                  scoreValueList={VAFList}
                  chartKey="VAF"
                  chartColor="#55D6BE"
                  type="r2_or_vaf"
                />
                <Score
                  scoreName="Pearson's r"
                  scoreValueList={RList}
                  chartKey="pearsonr"
                  chartColor="#55D6BE"
                  type="pearsonr"
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  experiment: state.experiments.selected
});

export { Results };
export default connect(mapStateToProps, actions)(Results);
