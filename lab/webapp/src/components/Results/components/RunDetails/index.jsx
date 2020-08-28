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