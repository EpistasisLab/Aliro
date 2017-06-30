import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import NotFound from '../NotFound';
import FetchError from '../FetchError';
import SceneWrapper from '../SceneWrapper';
import AlgorithmOptions from './components/AlgorithmOptions';
import ParameterOptions from './components/ParameterOptions';
import { Header, Grid, Button, Icon } from 'semantic-ui-react';

class Builder extends Component {
	onSubmitExperiment(algorithm, params) {
		const { submitExperiment } = this.props;

		submitExperiment(algorithm, params)
			// redirect to experiments page
			.then(res => hashHistory.push('/experiments')); 
	}

	getRetry(builderType) {
		const { query } = this.props.location;

		if(builderType === 'build') {
			return this.props.fetchDataset(query.dataset);
		}

		if(builderType === 'review') {
			return this.props.fetchExperiment(query.experiment);
		}
	}

	getSceneHeader(builderType) {
		const { dataset, experiment } = this.props;

		if(builderType === 'build') {
			return {
				header: 'Build a New Experiment',
				subheader: `Dataset: ${dataset.get('name')}`
			};
		}

		if(builderType === 'review') {
			return {
				header: 'Review Experiment',
				subheader: `Dataset: ${experiment.get('dataset')}, Id # ${experiment.get('_id')}`
			};
		}
	}

	render() {

		const {
			dataset,
			experiment,
			isFetching,
			errorMessage,
			defaultAlgorithms,
			currentAlgorithm,
			currentParams,
			isSubmitting,
			setCurrentAlgorithm,
			setParamValue
		} = this.props;

		const { query } = this.props.location;

		const builderType = query.dataset ? 'build' : query.experiment ? 'review' : null;

		const sceneHeader = this.getSceneHeader(builderType);

		if(!query.dataset && !query.experiment) {
			return (
				<NotFound />
			);
		} else if(errorMessage) {
			return (
				<FetchError 
					message={errorMessage}
					onRetry={() => this.getRetry(builderType)}
				/>
			);
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
			<SceneWrapper
				headerContent={sceneHeader.header}
				subheader={sceneHeader.subheader}
			>
				<div className="builder-scene">
					<Grid stretched>
						<AlgorithmOptions
							algorithms={defaultAlgorithms}
							currentAlgorithm={currentAlgorithm}
							setCurrentAlgorithm={setCurrentAlgorithm}
						/>
						<ParameterOptions
							params={currentAlgorithm.get('schema')}
							currentParams={currentParams}
							setParamValue={setParamValue}
						/>
					</Grid>
					<div className="builder-btns">
						<Button 
							color="blue"
							size="large"
							content="Launch Experiment"
							icon={isSubmitting ? <Icon loading name="spinner" /> : null}
							disabled={isSubmitting}
							onClick={() => this.onSubmitExperiment(
								currentAlgorithm.get('_id'), 
								currentParams.set('dataset', dataset.get('_id'))
							)}
						/>
						<Button 
							color="grey"
							size="large"
							disabled={isSubmitting}
							onClick={() => setCurrentAlgorithm(currentAlgorithm)}>
								Reset
						</Button>
					</div>
				</div>
			</SceneWrapper>	
		);
	}
}

export default Builder;