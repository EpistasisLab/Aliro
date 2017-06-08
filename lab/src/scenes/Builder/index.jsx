import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setDataset, setExperiment, setAlgorithm, setParamValue, resetParams } from './data/actions';
import { fetchExperiment, fetchDataset, submitJob } from './data/api';
import { Header, Grid, Button } from 'semantic-ui-react';
import { SelectedAlgorithm } from './components/SelectedAlgorithm';
import { Parameters } from './components/Parameters';
import { Launch } from './components/Launch';

import { initialExperiment } from './data/initialExperiment'; // for testing
export class Builder extends React.Component {
	componentDidMount() {
		const { 
			datasets,
			fetchExperiment,
			setExperiment,
			fetchDataset,
			setDataset
		} = this.props;

		const expId = this.props.params.exp;
		if(expId) {
			//fetchExperiment(expId);
			setExperiment(initialExperiment);
		} else {
			const datasetId = this.props.params.id;
			const findDatasetById = (dataset) => {
				return dataset.get('_id') === datasetId;
			};

			let dataset = datasets.find(findDatasetById);

			// DEFAULTING TO FETCH DATASET (since dataset is undefined)
			if(dataset) {
				setDataset(dataset);
			} else {
				fetchDataset(datasetId);
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		const { 
			algorithms,
			setAlgorithm
		} = this.props;

		const expId = this.props.params.exp;

		if(!expId) {
			if(algorithms !== nextProps.algorithms) {
				let algorithm = nextProps.algorithms.first();
				setAlgorithm(algorithm);
			}
		}
	}

	render() {

		const {
			builder,
			algorithms,
			setAlgorithm,
			setParamValue,
			submitJob,
			resetParams
		} = this.props;

		return (
			<div className="builder-scene">
				<div className="page-title">
					<Header 
						inverted 
						size="huge" 
						content={`Experiment Builder: ${builder.getIn(['dataset', 'item', 'name']) || ''}`}
					/>
				</div>
				{builder.getIn(['dataset', 'item']) ? (
					<div>
						<Grid stretched>
							<SelectedAlgorithm
								algorithms={algorithms}
								currentAlgorithm={builder.get('algorithm')}
								setCurrentAlgorithm={setAlgorithm}
								setParamValue={setParamValue}
							/>
							<Parameters 
								params={builder.getIn(['algorithm', 'schema'])}
								currentParams={builder.get('params')}
								setParamValue={setParamValue}
							/>
						</Grid>
						<Button 
							color="blue" 
							content="Launch Experiment"
							onClick={() => submitJob(builder.getIn(['dataset', 'item', '_id']), builder.getIn(['algorithm', '_id']), builder.get('params'))}
						/>
						<Button color="grey" onClick={() => resetParams()}>Reset</Button>
					</div>
					) : (
						<Header inverted size='small'>
							The specified dataset does not exist.
						</Header>
					)};
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.getIn(['preferences, isFetching']),
		algorithms: state.getIn(['preferences', 'preferences', 'algorithms']),
		datasets: state.getIn(['datasets', 'byId']),
		builder: state.get('builder')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchExperiment: bindActionCreators(fetchExperiment, dispatch),
		fetchDataset: bindActionCreators(fetchDataset, dispatch),
		setExperiment: bindActionCreators(setExperiment, dispatch),
		setDataset: bindActionCreators(setDataset, dispatch),
		setAlgorithm: bindActionCreators(setAlgorithm, dispatch),
		setParamValue: bindActionCreators(setParamValue, dispatch),
		submitJob: bindActionCreators(submitJob, dispatch),
		resetParams: bindActionCreators(resetParams, dispatch)
	};
}

export const BuilderContainer = connect(mapStateToProps, mapDispatchToProps)(Builder);