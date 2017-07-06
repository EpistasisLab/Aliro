import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as actions from './data/actions';
import {
	getVisibleExperiments,
	getIsFetching, 
	getErrorMessage,
	getFilters,
	getSort
} from './data';
import SceneWrapper from '../SceneWrapper';
import Experiments from './Experiments';

class ExperimentsContainer extends Component {
	componentDidMount() {
		this.props.fetchExperiments();
	}

	render() {
		return (
			<SceneWrapper headerContent="Experiments">
				<Experiments {...this.props} />
			</SceneWrapper>	
		);
	}
}

const mapStateToProps = (state, props) => ({
	experiments: getVisibleExperiments(state, props),
	isFetching: getIsFetching(state),
	errorMessage: getErrorMessage(state),
	filters: getFilters(state, props),
	sort: getSort(state, props)
});

ExperimentsContainer = withRouter(connect(
	mapStateToProps, 
	actions
)(ExperimentsContainer));

export default ExperimentsContainer;