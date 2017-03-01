import React from 'react';
import { Container, Divider, Header, Grid } from 'semantic-ui-react';
import { DatasetsContainer } from './Datasets';
import { AlgorithmsContainer } from './Algorithms';
//import { LevelsContainer } from './Levels';
import { LaunchContainer } from './Launch';
import { ParametersContainer } from './Parameters';

export class App extends React.Component {
		render() {
				return <Container fluid className="app">
						<Divider horizontal inverted>
								<Header as='h1' color='grey' inverted
												content='PennAI' 
												subheader='Your friendly machine learning assistant' 
								/>
						</Divider>

						<Grid columns="equal" stretched centered>
								<DatasetsContainer />
								<AlgorithmsContainer />
								<ParametersContainer />
								<LaunchContainer />
						</Grid>
				</Container>;
		}
}