import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { fmtDatasetName } from '../../../../utils/formatter';
import DatasetActions from './components/DatasetActions';
import BestResult from './components/BestResult';
import ExperimentStatus from './components/ExperimentStatus';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

class DatasetCard extends Component {
	render() {

		const {
			dataset,
			toggleAI
		} = this.props;

		const datasetLink = `/#/datasets/${dataset.get('_id')}`;

		const builderLink = `/#/builder?dataset=${dataset.get('_id')}`;

		return (
			<Grid.Column className="dataset-card">
				<Segment inverted attached="top" className="panel-header">
					<Header 
						as="a"
						inverted 
						size="large"
						content={fmtDatasetName(dataset.get('name'))}
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
}

DatasetCard = connect(
	null,
	actions
)(DatasetCard);

export default DatasetCard;