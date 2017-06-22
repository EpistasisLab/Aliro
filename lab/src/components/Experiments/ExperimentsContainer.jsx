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
} from './data/reducer';
import Experiments from './Experiments';

class ExperimentsContainer extends Component {
	componentDidMount() {
		this.props.fetchExperiments();
	}

	render() {
		return (
			<Experiments {...this.props} />
		);
	}
}

const mapStateToProps = (state, { location }) => ({
	experiments: getVisibleExperiments(state, location.query),
	isFetching: getIsFetching(state),
	errorMessage: getErrorMessage(state),
	filters: getFilters(state, location.query),
	sort: getSort(location.query)
});

ExperimentsContainer = withRouter(connect(
	mapStateToProps, 
	actions
)(ExperimentsContainer));

export default ExperimentsContainer;