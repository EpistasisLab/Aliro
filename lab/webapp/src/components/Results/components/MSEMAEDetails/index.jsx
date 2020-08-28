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
import { Header, Grid, Icon, Button, Popup} from 'semantic-ui-react';

function foldcheck(fold) {
  let iconname = 'checkmark';
  let iconcolor = 'green';
  let iconmsg = "The model is not overfitted based on this score.";
  if(fold>2){
    iconname = 'angle double up';
    iconcolor = 'red';
    iconmsg = 'Warning! The model is overfitted based on this score!';
  } else if(fold>1.5){
    iconname = 'angle up';
    iconcolor = 'yellow';
    iconmsg = 'Warning! The model may be overfitted based on this score!';
  }
  return [iconname, iconcolor, iconmsg];
}

function MSEMAEDetails({scores}) {
  let msefold, maefold;
  msefold = scores['neg_mean_squared_error_score']/scores['train_neg_mean_squared_error_score'];
  maefold = scores['neg_mean_absolute_error_score']/scores['train_neg_mean_absolute_error_score'];
  var mseicons = foldcheck(msefold)
  var maeicons = foldcheck(maefold)
  return (
    <InvertedCard
      header="MSE and MAE"
      content={
        <Grid columns={4}>
          <Grid.Column>
            <Header
              inverted
              as='h4'
              content="Metric"
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              as='h4'
              content="Train Score"
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              as='h4'
              content="Test Score"
            />
          </Grid.Column>
          <Grid.Column>
            <Header
              inverted
              as='h4'
              content="Train/Test"
            />
          </Grid.Column>
          <Grid.Column>
            <Header
              inverted
              as='h5'
              content="MSE"
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              as='h5'
              content={scores['train_neg_mean_squared_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              as='h5'
              content={scores['neg_mean_squared_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column>
          <Header inverted as='h5'>
            {msefold.toFixed(2)}
            <Popup content={mseicons[2]}
            trigger={
              <Icon
                name={mseicons[0]}
                inverted
                color={mseicons[1]}
                size="tiny"
                className="info-icon float-right"
              />}
            />
          </Header>
          </Grid.Column>
          <Grid.Column>
            <Header
              inverted
              as='h5'
              content="MAE"
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              as='h5'
              content={scores['train_neg_mean_absolute_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              as='h5'
              content={scores['neg_mean_absolute_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column>
            <Header inverted as='h5'>
              {maefold.toFixed(2)}
              <Popup content={maeicons[2]}
              trigger={
                <Icon
                  name={maeicons[0]}
                  inverted
                  color={maeicons[1]}
                  size="tiny"
                  className="info-icon float-right"
                />}
              />
            </Header>
          </Grid.Column>
        </Grid>
      }
    />
  );
}

export default MSEMAEDetails;
