import React from 'react';
import { Grid } from 'semantic-ui-react';
import { DatasetsContainer } from './components/Datasets';
import { AlgorithmsContainer } from './components/Algorithms';
import { ParametersContainer } from './components/Parameters';
import { LaunchContainer } from './components/Launch';

export class Build extends React.Component {
		render() {
				return <Grid columns="equal" stretched centered>
					<DatasetsContainer />
					<AlgorithmsContainer />
					<ParametersContainer />
					<LaunchContainer />
				</Grid>;
		}
}