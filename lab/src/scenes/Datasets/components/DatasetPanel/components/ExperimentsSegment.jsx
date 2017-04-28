import React from 'react';
import { Table, Header, Label } from 'semantic-ui-react';

export class ExperimentsSegment extends React.Component {
	render() {
		const { datasetId, experiments, notifications } = this.props;
		const link = `/#/experiments?dataset=${datasetId}&status=`;
		return (
			<Table 
				inverted
				attached
				unstackable
				celled 
				columns={3} 
				className='experiments'
			>
				<Table.Body>
					<Table.Row>
						<Table.Cell selectable textAlign='center'>
							<a href={link + 'pending'}>
								<Header inverted size='tiny'>
									{experiments.get('pending')}<br />
									experiments<br />
									pending
								</Header>
							</a>	
						</Table.Cell>
						<Table.Cell selectable textAlign='center'>
							<a href={link + 'running'}>
								<Header inverted size='tiny'>
									{experiments.get('running')}<br />
									experiments<br />
									running
								</Header>
							</a>	
						</Table.Cell>
						<Table.Cell selectable textAlign='center'>
							<a href={link + 'finished'}>
								<Header inverted size='tiny'>
									{experiments.get('finished')}<br />
									results
								</Header>
							</a>
							{notifications.get('error') > 0 &&
								<Label 
									color='red' 
									size='tiny'
									floating
									content={`${notifications.get('error')} error`}
								/>
							}
							{!notifications.get('error') && notifications.get('new') > 0 &&
								<Label 
									color='green' 
									size='tiny'
									floating
									content={`${notifications.get('new')} new`}
								/>
							}		
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		);
	}
}