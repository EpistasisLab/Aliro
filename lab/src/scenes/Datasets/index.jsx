import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './data/actions';
import { fetchDatasets, toggleAI } from './data/api';
import Datasets from './Datasets';

class DatasetsContainer extends Component {
	componentDidMount() {
		this.props.fetchDatasets();
	}

	render() {
		return (
			<Datasets {...this.props} />
		);
	}
}

const mapStateToProps = (state) => ({
	datasets: state.datasets
});

const mapDispatchToProps = (dispatch) => ({
	fetchDatasets: bindActionCreators(fetchDatasets, dispatch),
	toggleAI: bindActionCreators(toggleAI, dispatch)
});

DatasetsContainer = connect(
	mapStateToProps, 
	mapDispatchToProps
)(DatasetsContainer);

export default DatasetsContainer;