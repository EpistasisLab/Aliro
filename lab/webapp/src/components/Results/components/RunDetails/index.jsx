import React from 'react';
import InvertedCard from '../../../InvertedCard';
import { Grid, Header } from 'semantic-ui-react';
import { formatTime, formatDuration } from '../../../../utils/formatter';

function RunDetails({ startTime, finishTime, launchedBy }) {
  return (
    <InvertedCard 
      header="Run Details"
      content={
        <Grid columns={2}>
          <Grid.Column>
            <Header 
              inverted 
              color="grey" 
              size="tiny" 
              content="Started" 
              subheader={formatTime(startTime)}
            />
          </Grid.Column>
          <Grid.Column>
            <Header 
              inverted 
              color="grey" 
              size="tiny" 
              content="Finished"
              subheader={formatTime(finishTime)}
            />
          </Grid.Column>
          <Grid.Column>
            <Header 
              inverted 
              color="grey" 
              size="tiny" 
              content="Duration"
              subheader={formatDuration(startTime, finishTime)}
            />
          </Grid.Column>
          <Grid.Column>
            <Header 
              inverted 
              color="grey" 
              size="tiny" 
              content="Launched By"
              subheader={launchedBy}
            />
          </Grid.Column>
        </Grid>
      }
    />
  );
}

export default RunDetails;