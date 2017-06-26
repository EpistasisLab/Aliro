import React, { Component } from 'react';
import FetchError from '../FetchError';
import { SelectedAlgorithm } from './components/SelectedAlgorithm';
import { Parameters } from './components/Parameters';
import { Launch } from './components/Launch';
import { Header, Grid, Button } from 'semantic-ui-react';

class Builder extends Component {
	render() {

		const {
			dataset,
			experiment,
			isFetching,
			errorMessage,
			defaultAlgorithms,
			currentAlgorithm,
			currentParams,
			setCurrentAlgorithm,
			setParamValue,
			submitExperiment
		} = this.props;

		const { query } = this.props.location;

		if(!query.dataset && !query.experiment) {
			return (
				<Header 
					inverted 
					size="small"
					content="No dataset or experiment is specified."
				/>
			);
		} else if(errorMessage) {
			/*return (
				<FetchError 
					message={errorMessage}
					onRetry={() => fetchDatasets()}
				/>
			);*/
		} else if(isFetching) {
			return (
				<Header 
					inverted 
					size="small"
					content="Preparing the builder..."
				/>
			);
		}

		return (
			<div className="builder-scene">
				<Grid stretched>
					<SelectedAlgorithm
						algorithms={defaultAlgorithms}
						currentAlgorithm={currentAlgorithm}
						setCurrentAlgorithm={setCurrentAlgorithm}
						setParamValue={setParamValue}
					/>
					<Parameters 
						params={currentAlgorithm.get('schema')}
						currentParams={currentParams}
						setParamValue={setParamValue}
					/>
				</Grid>
				<Button 
					color="blue" 
					content="Launch Experiment"
					onClick={() => submitExperiment(
						currentAlgorithm.get('_id'), 
						currentParams.set('dataset', dataset.get('_id'))
					)}
				/>
				<Button 
					color="grey" 
					onClick={() => setCurrentAlgorithm(currentAlgorithm)}>
						Reset
				</Button>
			</div>
		);
	}
}

export default Builder;