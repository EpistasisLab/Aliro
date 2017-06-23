import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
	getDataset, 
	getExperiment,
	getIsFetching, 
	getErrorMessage,
	getDefaultAlgorithms,
	getCurrentAlgorithm,
	getCurrentParams,
	getIsSubmitting
} from './data';
import { getPreferences } from '../App/data';
import SceneWrapper from '../SceneWrapper';
import { SelectedAlgorithm } from './components/SelectedAlgorithm';
import { Parameters } from './components/Parameters';
import { Launch } from './components/Launch';
import { Header, Grid, Button } from 'semantic-ui-react';

class Builder extends Component {
	componentDidMount() {
		const { query } = this.props.location;
		const { defaultAlgorithms, setCurrentAlgorithm } = this.props;

		if(defaultAlgorithms) {
			setCurrentAlgorithm(defaultAlgorithms.first());
		}

		if(query.dataset) {
			this.props.fetchDataset(query.dataset);
			// get next recommended
		} else if(query.experiment) {
			this.props.fetchExperiment(query.experiment);
			// set params
		} else {
			// must include one or the other
		}	
	}

	componentDidUpdate(prevProps) {
		const { defaultAlgorithms, setCurrentAlgorithm } = this.props;

		if(defaultAlgorithms !== prevProps.defaultAlgorithms) {
			setCurrentAlgorithm(defaultAlgorithms.first());
		}
	}

	getSceneHeader() {
		const { dataset, experiment } = this.props;

		if(dataset.get('name')) {
			return `Build ${dataset.get('name')} Experiment`;
		} else if(experiment.get('_id')) {
			return `Review Experiment #${experiment.get('_id')}`;
		}

		return;
		// handle errors
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
			setCurrentAlgorithm,
			setParamValue,
			submitExperiment
		} = this.props;

		return (
			<SceneWrapper headerContent={this.getSceneHeader()}>
				<div className="builder-scene">
					{dataset ? (
						<div>
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
						) : (
							<Header inverted size='small'>
								The specified dataset does not exist.
							</Header>
						)};
				</div>
			</SceneWrapper>	
		);
	}
}

const mapStateToProps = (state) => ({
	dataset: getDataset(state),
	experiment: getExperiment(state),
	isFetching: getIsFetching(state),
	errorMessage: getErrorMessage(state),
	defaultAlgorithms: getDefaultAlgorithms(
		getPreferences(state)
	),
	currentAlgorithm: getCurrentAlgorithm(state),
	currentParams: getCurrentParams(state),
	isSubmitting: getIsSubmitting(state)
});

const BuilderContainer = connect(
	mapStateToProps, 
	actions
)(Builder);

export default BuilderContainer;