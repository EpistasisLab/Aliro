import React from 'react';
import { Grid, Segment, Header, Button, Icon } from 'semantic-ui-react';

// change to algorithm id
export class AlgorithmsPanel extends React.Component {
	render() {
			const { 
				algorithms,
				currentAlgorithm
			} = this.props;
			const color = 'purple';
			if(currentAlgorithm) {
				console.log(currentAlgorithm.toJS());
			}
			return (
				<Grid.Column 
					mobile={16} 
					tablet={8} 
					computer={8} 
					widescreen={8} 
					largeScreen={8}
				>
					<Segment inverted attached="top">
						<Header 
							inverted
							size="large"
							color={color} 
							content="Select algorithm" 
						/>
					</Segment>
					<Segment inverted attached="bottom">	
						{algorithms.map(algorithm =>
							<Button
								key={algorithm.get('name')}
								inverted 
								color={color}
								content={algorithm.get('name')} 
								
							/>
						)}
					</Segment>
			</Grid.Column>
		);
	}
}