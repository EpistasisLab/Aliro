import React from 'react';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

export class SelectedDataset extends React.Component {
	render() {

		const { 
			currentDataset 
		} = this.props;

		const getCurrentDataset = () => {
			return currentDataset && currentDataset.get('name');
		};

		const color = 'orange';

		return (
			<Grid.Column
				mobile={16} 
				tablet={4} 
				computer={4} 
				widescreen={4} 
				largeScreen={4}
			>
				<Segment inverted attached="top" className="panel-header">
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
						size="massive"
						active
						fluid
						icon="file text outline"
						color={color} 
						content={getCurrentDataset()}
						className="dataset-btn"
					/>
				</Segment>
			</Grid.Column>
		);
	}
}