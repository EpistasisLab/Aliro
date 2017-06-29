import React, { Component } from 'react';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

class AlgorithmOptions extends Component {
	getIsActive(algorithm) {
		const { currentAlgorithm } = this.props;
		return currentAlgorithm && (algorithm.get('_id') === currentAlgorithm.get('_id'));
	}

	render() {

		const { 
			algorithms,
			currentAlgorithm,
			setCurrentAlgorithm
		} = this.props;

		return (
			<Grid.Column width={16}>
				<Segment inverted attached="top" className="panel-header">
					<Header 
						inverted
						size="large"
						color="orange"
						content="Select Algorithm" 
					/>
				</Segment>
				<Segment inverted attached="bottom">	
					<Grid columns={3} stackable className="compressed">
						{algorithms && algorithms.map(algorithm =>
							<Grid.Column key={algorithm.get('_id')}>
								<Button
									inverted 
									color="orange"
									size="large"
									fluid
									active={this.getIsActive(algorithm)}
									onClick={() => setCurrentAlgorithm(algorithm)}
								>
									{algorithm.get('name')}
									<div className="param-count">
										{algorithm.get('schema').size} parameters
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

export default AlgorithmOptions;