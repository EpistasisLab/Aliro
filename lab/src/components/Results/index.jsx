import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
	getResults, 
	getIsFetching, 
	getErrorMessage 
} from './data';
import SceneWrapper from '../SceneWrapper';
import Results from './Results';

class ResultsContainer extends Component {
	componentDidMount() {
		this.props.fetchResults(this.props.params.id);
	}

	render() {
		const { results } = this.props;
		return (
			<SceneWrapper
				headerContent="Results"
				subheader={`Experiment #${this.props.params.id}`}
			>
				<Results {...this.props} />
			</SceneWrapper>
		);
	}
}

const mapStateToProps = (state) => ({
	results: getResults(state),
	isFetching: getIsFetching(state),
	errorMessage: getErrorMessage(state)
});

ResultsContainer = connect(
	mapStateToProps, 
	actions
)(ResultsContainer);

export default ResultsContainer;