import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setDataset, setAlgorithm } from './data/actions';
import { Header, Grid } from 'semantic-ui-react';
import { DatasetPanel } from './components/DatasetPanel';
import { AlgorithmsPanel } from './components/AlgorithmsPanel';
import { Parameters } from './components/Parameters';
import { Launch } from './components/Launch';

// dataset does not exist
export class Builder extends React.Component {
	componentDidMount() {
		const { 
			datasets,
			algorithms,
			setDataset,
			setAlgorithm
		} = this.props;

		const currentDatasetId = this.props.params.id;

		const findDatasetById = (dataset) => {
			return dataset.get('_id') === currentDatasetId;
		};

		setDataset(datasets.find(findDatasetById));
		setAlgorithm(algorithms.first());
	}

	render() {

		const {
			algorithms,
			builder
		} = this.props;

		return (
			<div>
				<div className="page-title">
					<Header 
						inverted 
						size="huge" 
						content="Experiment Builder" 
					/>
				</div>
				<Grid stretched>
					<DatasetPanel 
						datasetName={builder.getIn(['dataset', 'name'])}
					/>
					
				</Grid>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.preferences.get('isFetching'),
		algorithms: state.preferences.getIn(['preferences', 'Algorithms']),
		datasets: state.datasets.get('items'),
		builder: state.builder
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setDataset: bindActionCreators(setDataset, dispatch),
		setAlgorithm: bindActionCreators(setAlgorithm, dispatch)
	};
}

export const BuilderContainer = connect(mapStateToProps, mapDispatchToProps)(Builder);