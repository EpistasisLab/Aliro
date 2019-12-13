import React from 'react';
import { Segment, Header, Progress } from 'semantic-ui-react';
import { formatAlgorithm } from '../../../../../../utils/formatter';

function BestResult({ result, hasMetadata }) {
  const getNoResultMessage = () => {
    if(!hasMetadata) {
      return 'You must upload a metadata file in order to use this dataset.';
    }

    return 'No results yet, build a new experiment to start.';
  };

  const getResultLink = () => `/#/results/${result._id}`;

  const getPercent = () => (result.exp_table_score * 100).toFixed(2);

  if(!result) {
    return (
      <Segment inverted attached className="panel-body">
        {getNoResultMessage()}
      </Segment>
    );
  }

  return (
    <Segment
      inverted
      attached
      href={getResultLink()}
      className="panel-body best-result"
    >
      <Header inverted size="small">
        {'Best Result'}
        <Header.Subheader>
          <div>{formatAlgorithm(result.algorithm)}</div>
          <span>{`#${result._id}`}</span>
        </Header.Subheader>
      </Header>
      <Progress
        inverted
        progress
        percent={getPercent()}
        className="accuracy-score"
      />
    </Segment>
  );
}

export default BestResult;
