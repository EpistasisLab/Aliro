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
import Builder from './Builder';

class BuilderContainer extends Component {
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

	/*getSceneHeader() {
		const { dataset, experiment } = this.props;

		if(dataset.get('name')) {
			return `Build ${dataset.get('name')} Experiment`;
		} else if(experiment.get('_id')) {
			return `Review Experiment #${experiment.get('_id')}`;
		}

		return;
		// handle errors
	}*/

	render() {
		return (
			<SceneWrapper headerContent="Experiment Builder">
				<Builder {...this.props} />
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

BuilderContainer = connect(
	mapStateToProps, 
	actions
)(BuilderContainer);

export default BuilderContainer;