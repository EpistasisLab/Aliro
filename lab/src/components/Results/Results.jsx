import React from 'react';
//import PropTypes from 'prop-types';
import FetchMessage from '../FetchMessage';
import FetchError from '../FetchError';
import AlgorithmDetails from './components/AlgorithmDetails';
import RunDetails from './components/RunDetails';
import ConfusionMatrix from './components/ConfusionMatrix';
import { Gauge } from './components/Gauge';
import { Header, Grid, Segment, Image } from 'semantic-ui-react';

function Results({
  results,
  isFetching,
  errorMessage,
  fetchResults,
  confusionMatrix,
  rocCurve,
  params
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
          <ConfusionMatrix imageSrc={confusionMatrix} />
          <Segment inverted attached="top" className="panel-header">
            <Header 
              inverted
              size="medium"
              content="ROC Curve" 
            />
          </Segment>
          <Segment inverted attached="bottom">  
            {rocCurve ? (
              <Image src={rocCurve} />
            ) : (
              <span>Not available</span>
            )}
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment inverted attached="top" className="panel-header">
            <Header 
              inverted
              size="medium"
              content="Training Accuracy" 
            />
          </Segment>
          <Segment inverted attached="bottom">  
            <Gauge 
              chartName="training" 
              color="#7D5BA6"
              value={results.getIn(['scores', 'train_score'])}
            />
          </Segment>
          <Segment inverted attached="top" className="panel-header">
            <Header 
              inverted
              size="medium"
              content="Testing Accuracy" 
            />
          </Segment>
          <Segment inverted attached="bottom">  
            <Gauge 
              chartName="testing" 
              color="#55D6BE"
              value={results.getIn(['scores', 'test_score'])}
            />
          </Segment>
          <Segment inverted attached="top" className="panel-header">
            <Header 
              inverted
              size="medium"
              content="AUC" 
            />
          </Segment>
          <Segment inverted attached="bottom">  
            <Gauge 
              chartName="auc" 
              color="#59ABE3"
              value={results.getIn(['scores', 'roc_auc_score'])}
            />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

Results.propTypes = {

};


export default Results;