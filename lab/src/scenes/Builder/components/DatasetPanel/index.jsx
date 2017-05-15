import React from 'react';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

export class DatasetPanel extends React.Component {
	render() {
		const { datasetName } = this.props;
		const color = 'orange';
		return (
			<Grid.Column
				mobile={16} 
				tablet={4} 
				computer={4} 
				widescreen={2} 
				largeScreen={2}
			>
				<Segment inverted attached="top">
					<Header 
						inverted
						size="large"
						color={color} 
						content="Dataset" 
					/>
				</Segment>
				<Segment inverted attached="bottom">
					<Button
						inverted
						size="large"
						active
						fluid
						icon="file text outline"
						color={color} 
						content={datasetName} 
					/>
				</Segment>
			</Grid.Column>
		);
	}
}