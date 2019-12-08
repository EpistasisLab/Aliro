import React from 'react';
import InvertedCard from '../../../InvertedCard';
import { Header, Grid, Icon } from 'semantic-ui-react';

function foldcheck(fold) {
  let iconname = 'checkmark';
  let iconcolor = 'green';
  if(fold>2){
    iconname = 'angle double up';
    iconcolor = 'red';
  } else if(fold>1.5){
    iconname = 'angle up';
    iconcolor = 'yellow';
  }
  return [iconname, iconcolor];
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
        <Grid columns={3}>
          <Grid.Column>
            <Header
              inverted
              color="grey"
              size="tiny"
              content="Train MSE"
              subheader={scores['train_neg_mean_squared_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              color="grey"
              size="tiny"
              content="Test MSE"
              subheader={scores['neg_mean_squared_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Icon name={mseicons[0]} inverted color={mseicons[1]} size="large"/>
          </Grid.Column>
          <Grid.Column>
            <Header
              inverted
              color="grey"
              size="tiny"
              content="Train MAE"
              subheader={scores['train_neg_mean_absolute_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Header
              inverted
              color="grey"
              size="tiny"
              content="Test MAE"
              subheader={scores['neg_mean_absolute_error_score'].toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Icon name={maeicons[0]} inverted color={maeicons[1]} size="large"/>
          </Grid.Column>
        </Grid>
      }
    />
  );
}

export default MSEMAEDetails;
