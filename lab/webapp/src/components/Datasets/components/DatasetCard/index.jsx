import React from 'react';
import { connect } from 'react-redux';
import * as actions from 'data/datasets/dataset/actions';
import DatasetActions from './components/DatasetActions';
import BestResult from './components/BestResult';
import ExperimentStatus from './components/ExperimentStatus';
import { Grid, Segment, Header, Button, Popup, Message } from 'semantic-ui-react';
import { formatDataset } from '../../../../utils/formatter';

const DatasetCard = ({ dataset, toggleAI }) => {
	const datasetLink = `/#/datasets/${dataset._id}`;
  const builderLink = `/#/builder?dataset=${dataset._id}`;

  return (
    <Grid.Column className="dataset-card">
      <Segment inverted attached="top" className="panel-header">
        <Popup
          position="right center"
          header={formatDataset(dataset.name)}
          content={`Rows: ${dataset.metafeatures.n_rows}, Cols: ${dataset.metafeatures.n_columns}, Classes: ${dataset.metafeatures.n_classes}`}
          trigger={
            <Header
              as="a"
              inverted
              size="large"
              content={formatDataset(dataset.name)}
              href={datasetLink}
              className="title"
            />
          }
        />
        <span className="float-right">
          <DatasetActions
            dataset={dataset}
            toggleAI={toggleAI}
          />
        </span>
      </Segment>
      <BestResult
        result={dataset.best_result}
        hasMetadata={dataset.has_metadata}
      />
      <ExperimentStatus
        filter={dataset._id}
        experiments={dataset.experiments}
        notifications={dataset.notifications}
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
};

export { DatasetCard };
export default connect(null, actions)(DatasetCard);
