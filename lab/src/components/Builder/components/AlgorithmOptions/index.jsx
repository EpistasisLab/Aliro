import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';
import { formatAlgorithm } from '../../../../utils/formatter';

function AlgorithmOptions({
  algorithms,
  currentAlgorithm,
  setCurrentAlgorithm
}) {
  const getIsActive = (algorithm) => {
    return currentAlgorithm && (algorithm.get('_id') === currentAlgorithm.get('_id'));
  };

  return (
    <Grid.Column width={16}>
      <Segment inverted attached="top" className="panel-header">
        <Header 
          inverted
          size="large"
          color="orange"
          content="Select Algorithm" 
        />
      </Segment>
      <Segment inverted attached="bottom">  
        <Grid columns={3} stackable className="compressed">
          {algorithms && algorithms.map(algorithm => (
            <Grid.Column key={algorithm.get('_id')}>
              <Button
                inverted 
                color="orange"
                size="large"
                fluid
                active={getIsActive(algorithm)}
                onClick={() => setCurrentAlgorithm(algorithm)}
              >
                {formatAlgorithm(algorithm.get('name'))}
                <div className="param-count">
                  {`${algorithm.get('schema').size} parameters`}
                </div>
              </Button>
            </Grid.Column>
          ))}
        </Grid> 
      </Segment>
    </Grid.Column>
  );
}

AlgorithmOptions.propTypes = {
  algorithms: ImmutablePropTypes.list,
  currentAlgorithm: ImmutablePropTypes.map.isRequired,
  setCurrentAlgorithm: PropTypes.func.isRequired
};

export default AlgorithmOptions;