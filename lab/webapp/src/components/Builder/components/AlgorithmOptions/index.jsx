/* This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
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
                content={
                  <div className="content">
                    <p>{algorithm.description}</p>
                    {algorithm.url &&
                      <a href={algorithm.url} target="_blank"><strong>Read more here <Icon name="angle double right" /></strong></a>
                    }
                  </div>
                }
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
