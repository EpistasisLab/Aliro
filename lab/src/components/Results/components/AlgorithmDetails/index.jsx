import React from 'react';
import InvertedCard from '../../../InvertedCard';
import { Header, Grid } from 'semantic-ui-react';
import { formatAlgorithm, formatParam } from 'utils/formatter';

function AlgorithmDetails({ algorithm, params }) {
  return (
    <InvertedCard 
      header="Algorithm"
      content={
        <div>
          <Header inverted size="small" content={formatAlgorithm(algorithm)} />
          <Grid columns={2}>
            {Object.entries(params).map(([param, value]) => (
              <Grid.Column key={param}>
                <Header
                  inverted
                  size="tiny"
                  color="grey"
                  content={formatParam(param)}
                  subheader={value.toString()}
                />
              </Grid.Column>
            ))}
          </Grid>
        </div>
      }
    />
  );
}

export default AlgorithmDetails;