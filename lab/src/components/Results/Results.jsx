import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchMessage from '../FetchMessage';
import FetchError from '../FetchError';
import AlgorithmDetails from './components/AlgorithmDetails';
import RunDetails from './components/RunDetails';
import ConfusionMatrix from './components/ConfusionMatrix';
import ROCCurve from './components/ROCCurve';
import Score from './components/Score';
import { Grid } from 'semantic-ui-react';

function Results({
  params,
  results,
  isFetching,
  errorMessage,
  fetchResults
}) {
  if(errorMessage === 'Failed to fetch') {
    return (
      <FetchError message="The specified experiment does not exist." />
    );
  } else if(errorMessage && !results.size) {
    return (
      <FetchError
        message={errorMessage}
        onRetry={() => fetchResults(params.id)}
      />
    );
  } else if(isFetching && !results.size) {
    return (
      <FetchMessage message="Retrieving experiment results..." />
    );
  } else if(!isFetching && !results.size) {
    return (
      <FetchMessage message="No results available yet." />
    );
  }

  // check if files are available
  let confusionMatrix, rocCurve;
  results.get('experiment_files').forEach(file => {
    const filename = file.get('filename');
    if(filename.includes('confusion_matrix')) {
      confusionMatrix = file;
    } else if(filename.includes('roc_curve')) {
      rocCurve = file;
    }
  });

  return (
    <Grid columns={3} stackable>
      <Grid.Row>
        <Grid.Column>
          <AlgorithmDetails
            algorithm={results.get('algorithm')}
            params={results.get('params')}
          />
          <RunDetails
            startTime={results.get('started')}
            finishTime={results.get('finished')}
            launchedBy={results.get('launched_by')}
          />
        </Grid.Column>
        <Grid.Column>
          <ConfusionMatrix file={confusionMatrix} />
          <ROCCurve file={rocCurve} />
        </Grid.Column>
        <Grid.Column>
          <Score
            scoreName="Training Accuracy"
            scoreValue={results.getIn(['scores', 'train_score'])}
            chartKey="training"
            chartColor="#7D5BA6"
          />
          <Score
            scoreName="Testing Accuracy"
            scoreValue={results.getIn(['scores', 'test_score'])}
            chartKey="testing"
            chartColor="#55D6BE"
          />
          <Score
            scoreName="AUC"
            scoreValue={results.getIn(['scores', 'roc_auc_score'])}
            chartKey="auc"
            chartColor="#59ABE3"
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

Results.propTypes = {
  params: PropTypes.shape({ id: PropTypes.string }).isRequired,
  results: ImmutablePropTypes.map.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchResults: PropTypes.func.isRequired
};

export default Results;