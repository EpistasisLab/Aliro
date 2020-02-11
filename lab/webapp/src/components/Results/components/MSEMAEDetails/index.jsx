import React from 'react';
import InvertedCard from '../../../InvertedCard';
import { Header, Grid, Icon, Button, Popup} from 'semantic-ui-react';

function foldcheck(fold) {
  let iconname = 'checkmark';
  let iconcolor = 'green';
  let iconmsg = "The model looks good!";
  if(fold>2){
    iconname = 'angle double up';
    iconcolor = 'red';
    iconmsg = 'Warning! The model is overfitted!';
  } else if(fold>1.5){
    iconname = 'angle up';
    iconcolor = 'yellow';
    iconmsg = 'Warning! The model may be overfitted!';
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
