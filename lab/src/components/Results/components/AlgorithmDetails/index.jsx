import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import InvertedCard from '../../../InvertedCard';
import { Header, Grid } from 'semantic-ui-react';

function AlgorithmDetails({ algorithm, params }) {
  return (
    <InvertedCard 
      header="Algorithm"
      content={
        <div>
          <Header inverted size="small" content={algorithm} />
          <Grid columns={2}>
            {params.entrySeq().map(([param, value]) => (
              <Grid.Column key={param}>
                <Header
                  inverted
                  size="tiny"
                  color="grey"
                  content={param}
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

AlgorithmDetails.propTypes = {
  algorithm: PropTypes.string.isRequired,
  params: ImmutablePropTypes.map.isRequired
};

export default AlgorithmDetails;