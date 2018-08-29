import React from 'react';
import { Grid, Segment, Header, Popup, Button, Icon } from 'semantic-ui-react';
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
                fluid
                inverted
                color="orange"
                size="large"
                active={getIsActive(algorithm)}
                onClick={() => setCurrentAlgorithm(algorithm)}
                className="algorithm-btn"
              >
                {formatAlgorithm(algorithm.name)}
                <div className="param-count">
                  {`${Object.keys(algorithm.schema).length} parameters`}
                </div>
              </Button>
              <Popup
                on="click"
                position="right center"
                header={formatAlgorithm(algorithm.name)}
                content={algorithm.description}
                trigger={
                  <Icon
                    inverted
                    size="large"
                    color="orange"
                    name="info circle"
                  />
                }
              />
            </Grid.Column>
          ))}
        </Grid>
      </Segment>
    </Grid.Column>
  );
}

export default AlgorithmOptions;
