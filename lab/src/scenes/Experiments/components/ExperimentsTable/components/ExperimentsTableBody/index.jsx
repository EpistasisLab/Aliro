import React from 'react';
import { Table, Icon, Dropdown } from 'semantic-ui-react';

export class ExperimentsTableBody extends React.Component {
	render() {

		const { 
			experiments,
			shouldDisplayParams,
			orderedParamKeys
		} = this.props;

		const renderStatusIcon = (status) => {
			switch(status) {
				case 'pending':
					return <Icon inverted color="yellow" name="clock" />;
				case 'running':
					return <Icon inverted color="blue" name="refresh" />;
				case 'finished':
					return <Icon inverted color="green" name="check" />;
				case 'cancelled':
					return <Icon inverted color="red" name="ban" />;
				case 'failed':
					return <Icon inverted color="red" name="warning sign" />;
				default:
					return;	
			}
		};

		const renderWhoIcon = (who) => {
			switch(who) {
				case 'user':
					return <Icon inverted color="grey" size="large" name="user" />;
				case 'ai':
					return <Icon inverted color="violet" size="large" name="android" />;
				default:
					return;	
			}
		};

		return (
			<Table.Body>
				{experiments.map(experiment =>
					<Table.Row 
						key={experiment.get('_id')}
						className={experiment.get('notification')}
					>
						<Table.Cell width={2}>
							{renderStatusIcon(experiment.get('status'))} #{experiment.get('_id')}
						</Table.Cell>
						<Table.Cell width={2}>
							{experiment.get('accuracy_score') || '-'}
						</Table.Cell>
						<Table.Cell width={3}>
							{experiment.get('dataset')}
						</Table.Cell>
						{shouldDisplayParams ? (
							orderedParamKeys.map((key) => 
								<Table.Cell key={[experiment._id, key]}>
									{experiment.getIn(['params', key]) || '-'}
								</Table.Cell>
							)
						) : (
							<Table.Cell width={6}>
								{experiment.get('algorithm')}
							</Table.Cell>	
						)}
						<Table.Cell width={1} textAlign="center">
							{renderWhoIcon(experiment.get('launched_by'))}
						</Table.Cell>
						<Table.Cell width={1} textAlign="center">
							<Dropdown 
								pointing="top right" 
								icon={<Icon inverted color="grey" size="large" name="caret down" />}
							>
								<Dropdown.Menu>
									<Dropdown.Item icon="download" text="Download results" />
								</Dropdown.Menu>
							</Dropdown>
						</Table.Cell>
					</Table.Row>
				)}
			</Table.Body>
		);
	}
}