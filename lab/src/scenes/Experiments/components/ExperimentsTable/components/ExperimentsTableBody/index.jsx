import React from 'react';
import { Table, Icon, Popup, Dropdown } from 'semantic-ui-react';

export class ExperimentsTableBody extends React.Component {
	render() {

		const { 
			experiments,
			shouldDisplayAwards,
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

		const renderAwardPopup = (experiment) => {
			if(!shouldDisplayAwards) { return; }

			switch(experiment.get('award')) {
				case 'best_overall':
					return (
						<Popup
							trigger={<Icon inverted color="yellow" size="large" name="trophy" className="float-right" />}
							content="Best overall result for this dataset"
						/>
					);
				case 'best_for_algorithm':
					return (
						<Popup
							trigger={<Icon inverted color="grey" size="large" name="trophy" className="float-right" />}
							content={`Best result for this dataset with ${experiment.get('algorithm')}`}
						/>
					);
			}
		};

		const renderWhoIcon = (who) => {
			switch(who) {
				case 'user':
					return <Icon inverted color="grey" size="large" name="user" />;
				case 'ai':
					return <Icon inverted color="grey" size="large" name="android" />;
				default:
					return;	
			}
		};

		const getResultsLink = (experimentId) => {
			return `/#/results/${experimentId}`;
		};

		return (
			<Table.Body>
				{experiments.map(experiment =>
					<Table.Row 
						key={experiment.get('_id')}
						className={experiment.get('notification')}
					>
						<Table.Cell selectable width={2}>
							<a href={getResultsLink(experiment.get('_id'))}>
								{renderStatusIcon(experiment.get('status'))} #{experiment.get('_id')}
							</a>	
						</Table.Cell>
						<Table.Cell selectable width={2}>
							<a href={getResultsLink(experiment.get('_id'))}>
								{experiment.get('accuracy_score') || '-'}
								{renderAwardPopup(experiment)}
							</a>	
						</Table.Cell>
						<Table.Cell selectable width={3}>
							<a href={getResultsLink(experiment.get('_id'))}>
								{experiment.get('dataset')}
							</a>	
						</Table.Cell>
						{shouldDisplayParams ? (
							orderedParamKeys.map((key) => 
								<Table.Cell key={[experiment._id, key]} selectable>
									<a href={getResultsLink(experiment.get('_id'))}>
										{experiment.getIn(['params', key]) || '-'}
									</a>
								</Table.Cell>
							)
						) : (
							<Table.Cell selectable width={6}>
								<a href={getResultsLink(experiment.get('_id'))}>
									{experiment.get('algorithm')}
								</a>	
							</Table.Cell>	
						)}
						<Table.Cell selectable width={2} textAlign="center">
							<a href={getResultsLink(experiment.get('_id'))}>
								{renderWhoIcon(experiment.get('launched_by'))}
							</a>
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