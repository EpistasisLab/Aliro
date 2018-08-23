import React from 'react';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';
import { formatAlgorithm } from 'utils/formatter';

function AlgorithmOptions({
  algorithms,
  currentAlgorithm,
  setCurrentAlgorithm
}) {
  const getIsActive = (algorithm) => {
    return currentAlgorithm && (algorithm._id === currentAlgorithm._id);
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
            <Grid.Column key={algorithm._id}>
              <Button
                inverted 
                color="orange"
                size="large"
                fluid
                active={getIsActive(algorithm)}
                onClick={() => setCurrentAlgorithm(algorithm)}
              >
                {formatAlgorithm(algorithm.name)}
                <div className="param-count">
                  {`${Object.keys(algorithm.schema).length} parameters`}
                </div>
              </Button>
            </Grid.Column>
          ))}
        </Grid> 
      </Segment>
    </Grid.Column>
  );
}

export default AlgorithmOptions;