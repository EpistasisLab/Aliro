import React from 'react';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

export class SelectedAlgorithm extends React.Component {
	render() {

		const { 
			algorithms,
			currentAlgorithm,
			setCurrentAlgorithm
		} = this.props;

		const isActive = (algorithm) => {
			return currentAlgorithm && (algorithm.get('name') === currentAlgorithm.get('name'));
		};

		const color = 'orange';

		return (
			<Grid.Column width={16}>
				<Segment inverted attached="top" className="panel-header">
					<Header 
						inverted
						size="large"
						color={color} 
						content="Select Algorithm" 
					/>
				</Segment>
				<Segment inverted attached="bottom">	
					<Grid columns={3} stackable className="compressed">
						{algorithms && algorithms.map(algorithm =>
							<Grid.Column key={algorithm.get('name')}>
								<Button
									inverted 
									color={color}
									size="large"
									fluid
									active={isActive(algorithm)}
									onClick={() => setCurrentAlgorithm(algorithm)}
								>
									{algorithm.get('name')}
									<div className="param-count">
										{algorithm.get('params').size} parameters
									</div>
								</Button>
							</Grid.Column>
						)}
					</Grid>	
				</Segment>
			</Grid.Column>
		);
	}
}