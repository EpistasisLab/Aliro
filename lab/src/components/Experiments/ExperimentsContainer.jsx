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

const mapStateToProps = (state, { location }) => {
	const filters = getFilters(state, location.query);
	const sort = getSort(location.query);

	return {
		experiments: getVisibleExperiments(state, filters, sort),
		isFetching: getIsFetching(state),
		errorMessage: getErrorMessage(state),
		filters,
		sort
	};
};

ExperimentsContainer = withRouter(connect(
	mapStateToProps, 
	actions
)(ExperimentsContainer));

export default ExperimentsContainer;