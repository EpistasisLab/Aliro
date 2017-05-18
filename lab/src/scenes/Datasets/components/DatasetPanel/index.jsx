import React from 'react';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';
import { AIToggle } from './components/AIToggle';
import { ActionsDropdown } from './components/ActionsDropdown';
import { BestResultSegment } from './components/BestResultSegment';
import { ExperimentsSegment } from './components/ExperimentsSegment';

export class DatasetPanel extends React.Component {
	render() {
		const { dataset } = this.props;
		const datasetLink = `/#/datasets/${dataset.get('_id')}`;
		const buildLink = `/#/build/${dataset.get('_id')}`;
		return <Grid.Column className='dataset-panel'>
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
						<AIToggle isOn={dataset.get('ai')} />
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
				datasetId={dataset.get('_id')}
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