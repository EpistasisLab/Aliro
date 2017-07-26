import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Segment, Header, Progress } from 'semantic-ui-react';
import { formatAlgorithm } from '../../../../../../utils/formatter';

function BestResult({ result, hasMetadata }) {
  const getNoResultMessage = () => {
    if(!hasMetadata) {
      return 'You must upload a metadata file in order to use this dataset.';
    }

    return 'No results yet, build a new experiment to start.';
  };

  const getResultLink = () => 
    `/#/results/${result.get('_id')}`;

  const getPercent = () => 
    (result.get('accuracy_score') * 100).toFixed(2);

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
        Best Result
        <Header.Subheader>
          <div>{formatAlgorithm(result.get('algorithm'))}</div>
          <span>#{result.get('_id')}</span>
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

BestResult.propTypes = {
  result: ImmutablePropTypes.map,
  hasMetadata: PropTypes.bool.isRequired
};

export default BestResult;