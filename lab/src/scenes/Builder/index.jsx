import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentDataset, setCurrentAlgorithm, setParamValue, resetParams } from './data/actions';
import { submitJob } from './data/api';
import { Header, Grid, Button } from 'semantic-ui-react';
import { SelectedAlgorithm } from './components/SelectedAlgorithm';
import { Parameters } from './components/Parameters';
import { Launch } from './components/Launch';

export class Builder extends React.Component {
	componentDidMount() {
		const { 
			datasets,
			algorithms,
			setCurrentDataset,
			setCurrentAlgorithm,
			setParamValue
		} = this.props;

		const currentDatasetId = this.props.params.id;

		const findDatasetById = (dataset) => {
			return dataset.get('_id') === currentDatasetId;
		};

		let currentDataset = datasets.find(findDatasetById);
		let currentAlgorithm = algorithms.first();

		setCurrentDataset(currentDataset);
		setCurrentAlgorithm(currentAlgorithm);
		currentAlgorithm.get('params').entrySeq().forEach(([key, value]) => {
			setParamValue(key, value.get('default'));
		});
	}

	render() {

		const {
			builder,
			algorithms,
			setCurrentAlgorithm,
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
						content={`Experiment Builder: ${builder.getIn(['currentDataset', 'name'])}`}
					/>
				</div>
				{builder.get('currentDataset') ? (
					<div>
						<Grid stretched>
							<SelectedAlgorithm
								algorithms={algorithms}
								currentAlgorithm={builder.get('currentAlgorithm')}
								setCurrentAlgorithm={setCurrentAlgorithm}
								setParamValue={setParamValue}
							/>
							<Parameters 
								params={builder.getIn(['currentAlgorithm', 'params'])}
								currentParams={builder.get('currentParams')}
								setParamValue={setParamValue}
							/>
						</Grid>
						<Button 
							color="blue" 
							content="Launch Experiment"
							onClick={() => submitJob(builder.getIn(['currentAlgorithm', '_id']), builder.get('currentParams'))}
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
		isFetching: state.preferences.get('isFetching'),
		algorithms: state.preferences.getIn(['preferences', 'Algorithms']),
		datasets: state.datasets.get('items'),
		builder: state.builder
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setCurrentDataset: bindActionCreators(setCurrentDataset, dispatch),
		setCurrentAlgorithm: bindActionCreators(setCurrentAlgorithm, dispatch),
		setParamValue: bindActionCreators(setParamValue, dispatch),
		submitJob: bindActionCreators(submitJob, dispatch),
		resetParams: bindActionCreators(resetParams, dispatch)
	};
}

export const BuilderContainer = connect(mapStateToProps, mapDispatchToProps)(Builder);