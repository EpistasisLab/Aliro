import React from 'react';
import { Menu, Container, Divider, Table, Grid, Segment, Header, Button, Label, Checkbox, Dropdown, Icon, Progress } from 'semantic-ui-react';

export class DatasetPanel extends React.Component {
	render() {
		const { dataset } = this.props;
		return <Grid.Column className='dataset'>
			<Segment inverted attached='top' className='dataset-header'>
				<Header 
					as='a'
					href={`/#/datasets/${dataset.get('_id')}`}
					inverted 
					size='large' 
					content={dataset.get('name')} 
				/>
				{!dataset.get('has_metadata') &&
					<Icon inverted color='red' name='warning sign' />
				}
				<div className='right'>
					<span className={`ai-label ${dataset.get('ai') ? 'on' : 'off' }`}>
						AI {dataset.get('ai') ? 'on' : 'off' }
					</span>
					<Checkbox
						toggle 
						checked={dataset.get('ai')}
						className='ai-switch'
					/>
					<Dropdown pointing='top right' icon={<Icon name='caret down' size='large' inverted color='grey' />}>
						<Dropdown.Menu>
							<Dropdown.Item icon='file' text='Replace file' />
							<Dropdown.Item icon='trash' text='Delete' />
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</Segment>
			<Segment inverted attached className='dataset-best-result'>
				{dataset.get('best_result') &&
					<Container href={`/#/experiments/${dataset.getIn(['best_result', '_id'])}`}>
						<Header 
							inverted
							size='small'
							content='Best Result'
							subheader={`${dataset.getIn(['best_result', 'algorithm'])} (#${dataset.getIn(['best_result', '_id'])})`}
						/>
						<Progress 
							inverted
							progress
							percent={dataset.getIn(['best_result', 'accuracy_score']) * 100}
							className='accuracy-score'
						/>
					</Container>
				}
				{!dataset.get('best_result') && dataset.get('has_metadata') &&
					<span>No results yet, build a new experiment to start.</span>
				}
				{!dataset.get('has_metadata') &&
					<span>
						You must upload a metadata file in order to use this dataset.
						Please follow the insructions here.
					</span>
				}
			</Segment>	
			<Table unstackable celled inverted attached columns={3} className='dataset-experiments'>
				<Table.Body>
					<Table.Row>
						<Table.Cell selectable textAlign='center'>
							<a href={`/#/experiments?dataset=${dataset.get('_id')}&status=pending`}>
								<Header inverted size='tiny'>
									{dataset.getIn(['experiments', 'pending'])}<br />
									experiments<br />
									pending
								</Header>
							</a>	
						</Table.Cell>
						<Table.Cell selectable textAlign='center'>
							<a href={`/#/experiments?dataset=${dataset.get('_id')}&status=running`}>
								<Header inverted size='tiny'>
									{dataset.getIn(['experiments', 'running'])}<br />
									experiments<br />
									running
								</Header>
							</a>	
						</Table.Cell>
						<Table.Cell selectable textAlign='center'>
							<a href={`/#/experiments?dataset=${dataset.get('_id')}&status=finished`}>
								<Header inverted size='tiny'>
									{dataset.getIn(['experiments', 'finished'])}<br />
									results
								</Header>
							</a>
							{dataset.getIn(['notifications', 'error']) > 0 &&
								<Label color='red' floating size='tiny'>{dataset.getIn(['notifications', 'error'])} error</Label>
							}
							{!dataset.getIn(['notifications', 'error']) && dataset.getIn(['notifications', 'new']) > 0 &&
								<Label color='green' floating size='tiny'>{dataset.getIn(['notifications', 'new'])} new</Label>
							}		
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
			<Button
				color='blue'
				attached='bottom'
				as='a' href={`/#/build/${dataset.get('_id')}`}
				content='Build New Experiment'
			/>
		</Grid.Column>;
	}
}