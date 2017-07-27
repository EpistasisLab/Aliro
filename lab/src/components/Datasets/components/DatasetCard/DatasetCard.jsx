import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import DatasetActions from './components/DatasetActions';
import BestResult from './components/BestResult';
import ExperimentStatus from './components/ExperimentStatus';
import { Grid, Segment, Header, Button, Message } from 'semantic-ui-react';
import { formatDataset } from '../../../../utils/formatter';

function DatasetCard({ dataset, toggleAI }) {
  const datasetLink = `/#/datasets/${dataset.get('_id')}`;
  const builderLink = `/#/builder?dataset=${dataset.get('_id')}`;

  return (
    <Grid.Column className="dataset-card">
      {dataset.get('errorMessage') &&
        <Message 
          attached
          error
          color="black"
          size="mini"
          icon="warning sign"
          content="An error ocurred while performing that action. Try again."
        />
      }
      <Segment inverted attached={dataset.get('errorMessage') ? true : 'top'} className="panel-header">
        <Header 
          as="a"
          inverted 
          size="large"
          content={formatDataset(dataset.get('name'))}
          href={datasetLink}
          className="title"
        />
        <span className="float-right">
          <DatasetActions
            dataset={dataset}
            toggleAI={toggleAI}
          />
        </span>
      </Segment>
      <BestResult
        result={dataset.get('best_result')}
        hasMetadata={dataset.get('has_metadata')}
      />
      <ExperimentStatus
        filter={dataset.get('_id')}
        experiments={dataset.get('experiments')}
        notifications={dataset.get('notifications')}
      />
      <Button
        as="a"
        color="blue"
        attached="bottom"
        content="Build New Experiment"
        href={builderLink}
      />
    </Grid.Column>
  );
}

DatasetCard.propTypes = {
  dataset: ImmutablePropTypes.map.isRequired,
  toggleAI: PropTypes.func.isRequired
};

export default DatasetCard;