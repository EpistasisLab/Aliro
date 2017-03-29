import React from 'react';
import { Grid, Segment, Header, Button, Label } from 'semantic-ui-react';
import moment from 'moment';

export class DatasetPreview extends React.Component {
	render() {
		const dataset = this.props.dataset;
		return <Grid.Column key={dataset.get('name')} mobile={16} tablet={8} computer={8} widescreen={4} largeScreen={4}>
			<Segment raised attached='top'>
				<Header as='h1' inverted
					content={dataset.get('name')} 
					subheader={`Uploaded on ${moment(dataset.get('date_uploaded')).format("MMMM DD, YYYY")}`}
				/>
				<Label.Group>
					<Label 
						color='yellow'
						content={dataset.get('running_count')}
						detail='running'
					/>
					<Label 
						color='green'
						content={dataset.get('completed_count')}
						detail='completed'
					/>
					<Label
						color='red'
						content={dataset.get('failed_count')}
						detail='failed'
					/>
				</Label.Group>
			</Segment>
			<Button.Group color='grey' attached='bottom' widths={2}>
				<Button 
					icon='rocket' 
					content='Launch' 
				/>
				<Button 
					as='a' href={`/#/datasets/${dataset.get('id')}`}
					icon='list' 
					content='Results'
				/>	
			</Button.Group>
		</Grid.Column>;
	}
}