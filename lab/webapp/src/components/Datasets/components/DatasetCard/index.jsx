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
import { connect } from 'react-redux';
import * as actions from 'data/datasets/dataset/actions';
import DatasetActions from './components/DatasetActions';
import BestResult from './components/BestResult';
import ExperimentStatus from './components/ExperimentStatus';
import { Grid, Segment, Header, Button, Popup, Message } from 'semantic-ui-react';
import { formatDataset } from '../../../../utils/formatter';

const DatasetCard = ({ dataset, recommender, toggleAI }) => {
	const datasetLink = `/#/datasets/${dataset._id}`;
  const builderLink = `/#/builder?dataset=${dataset._id}`;

	var icon_type = "question circle";
	if (dataset.metafeatures._prediction_type == "classification") {
			icon_type = "list";
	} else if (dataset.metafeatures._prediction_type == "regression") {
			icon_type = "line graph";
	}
  return (
    <Grid.Column className="dataset-card">
      <Segment inverted attached="top" className="panel-header">
        <Popup
          position="right center"
          header={formatDataset(dataset.name)}
          content={`Rows: ${dataset.metafeatures.n_rows}, Cols: ${dataset.metafeatures.n_columns}, Classes: ${dataset.metafeatures.n_classes}  Prediction type: ${dataset.files[0].prediction_type}`}
          trigger={
            <Header
              as="a"
              inverted
              size="large"
							icon={icon_type}
              content={formatDataset(dataset.name)}
              href={datasetLink}
              className="title"
            />
          }
        />
        <span className="float-right">
          <DatasetActions
            dataset={dataset}
            recommender={recommender}
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
