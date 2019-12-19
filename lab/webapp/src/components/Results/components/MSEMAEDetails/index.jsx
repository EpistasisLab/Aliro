import React from 'react';
import InvertedCard from '../../../InvertedCard';
import { Header, Grid, Icon} from 'semantic-ui-react';

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
              <Icon name={mseicons[0]}
              inverted
              color={mseicons[1]}
              size="tiny"/>
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
              <Icon name={maeicons[0]}
              inverted
              color={maeicons[1]}
              size="tiny"/>
            </Header>
          </Grid.Column>
        </Grid>
      }
    />
  );
}

export default MSEMAEDetails;
