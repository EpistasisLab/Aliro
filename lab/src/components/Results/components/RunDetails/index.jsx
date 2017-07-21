import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import InvertedCard from '../../../InvertedCard';
import { Grid, Header } from 'semantic-ui-react';
import moment from 'moment';
import twix from 'twix';

function RunDetails({ startTime, finishTime, launchedBy }) {
  const getFormattedTime = (time) => {
    return moment(time).format('M/DD/YY h:mm a');
  };

  const getDuration = (startTime, finishTime) => {
    let duration = moment(startTime).twix(finishTime).asDuration();
    return `${duration._data.hours}h ${duration._data.minutes}m ${duration._data.seconds}s`;
  };
  
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
              subheader={getFormattedTime(startTime)}
            />
          </Grid.Column>
          <Grid.Column>
            <Header 
              inverted 
              color="grey" 
              size="tiny" 
              content="Finished"
              subheader={getFormattedTime(finishTime)}
            />
          </Grid.Column>
          <Grid.Column>
            <Header 
              inverted 
              color="grey" 
              size="tiny" 
              content="Duration"
              subheader={getDuration(startTime, finishTime)}
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

RunDetails.propTypes = {
  startTime: MomentPropTypes.momentString.isRequired,
  finishTime: MomentPropTypes.momentString.isRequired,
  launchedBy: PropTypes.string.isRequired
};

export default RunDetails;