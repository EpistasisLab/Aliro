import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
	getIsToggling, 
	getErrorMessage // use error message of main page?
} from './data/reducer';
import { AIToggle } from './components/AIToggle';
import { ActionsDropdown } from './components/ActionsDropdown';
import { BestResultSegment } from './components/BestResultSegment';
import { ExperimentsSegment } from './components/ExperimentsSegment';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

class DatasetCard extends Component {
	render() {
		const { 
			dataset,
			toggleAI,
			isToggling
		} = this.props;

		const datasetLink = `/#/datasets/${dataset.get('_id')}`;
		const buildLink = `/#/build/${dataset.get('_id')}`;
		return <Grid.Column className='dataset-card'>
			<Segment inverted attached='top' className='panel-header'>
				<Header 
					as='a'
					inverted 
					size='large'
					content={dataset.get('name')}
					href={datasetLink}
					className='title'
				/>
				<span className='float-right'>
					{dataset.get('has_metadata') &&
						<AIToggle 
							aiState={dataset.get('ai')}
							toggleAI={toggleAI.bind(null, dataset.get('_id'))}
							isToggling={isToggling}
						/>
					}	
					<ActionsDropdown />
				</span>
			</Segment>
			{dataset.get('best_result') &&
				<BestResultSegment result={dataset.get('best_result')} />
			}
			{!dataset.get('best_result') && dataset.get('has_metadata') &&
				<Segment inverted attached className='panel-body'>
					No results yet, build a new experiment to start.
				</Segment>	
			}
			{!dataset.get('has_metadata') &&
				<Segment inverted attached className='panel-body'>
					You must upload a metadata file in order to use this dataset. 
					Please follow the instructions here.
				</Segment>
			}
			<ExperimentsSegment
				datasetName={dataset.get('name')}
				experiments={dataset.get('experiments')}
				notifications={dataset.get('notifications')}
			/>
			<Button
				as='a'
				color='blue'
				attached='bottom'
				content='Build New Experiment'
				href={buildLink}
			/>
		</Grid.Column>;
	}
}

const mapStateToProps = (state, { dataset }) => ({
	isToggling: getIsToggling(state, dataset.get('_id')),
	errorMessage: getErrorMessage(state, dataset.get('_id'))
});

DatasetCard = connect(
	mapStateToProps, 
	actions
)(DatasetCard);

export default DatasetCard;