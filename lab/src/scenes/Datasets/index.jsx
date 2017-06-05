import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchDatasets, toggleAI } from './data/api';
import { Header, Button, Grid } from 'semantic-ui-react';
import { DatasetPanel } from './components/DatasetPanel';
import DeviceWatcher from '../../device-watcher';

export class Datasets extends React.Component {
	static getColsByDevice() {
		return {mobile: 1, tablet: 2, desktop: 3, largescreen: 4};
	}

	constructor(props) {
		super(props);
		this.state = DeviceWatcher.initState();
		this.handleCols = this.handleCols.bind(this);
	}

	componentDidMount() {
		const { fetchDatasets } = this.props;
		fetchDatasets();

		DeviceWatcher.startWatch(this.setState.bind(this));
	}

	componentWillUnmount() {
		DeviceWatcher.endWatch();
	}

	handleCols() {
		const { getColsByDevice } = this.constructor;
		return DeviceWatcher.calcCols(this.state, getColsByDevice());
	}

	render() {
		const { datasets, isFetching, toggleAI } = this.props;
		return (
			<div>
				<div className="page-title">
					<Header 
						inverted 
						size="huge" 
						content="Datasets" 
					/>
					<Button 
						inverted 
						color="blue" 
						compact 
						size="small" 
						icon="plus" 
						content="Add new"
					/>
				</div>
				{isFetching &&
					<Header 
						inverted 
						size="small"
						content="Retrieving your datasets..."
					/>
				}
				{!isFetching && !datasets.size &&
					<Header 
						inverted 
						size="small"
						content="You have no datasets uploaded yet."
					/>
				}
				{!isFetching && datasets.size &&
					<Grid stretched columns={this.handleCols()}>
						{datasets.map(dataset =>
							<DatasetPanel
								key={dataset.get('_id')}
								dataset={dataset}
								toggleAI={toggleAI}
							/>
						)}
					</Grid>
				}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.datasets.get('isFetching'),
		datasets: state.datasets.get('items')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchDatasets: bindActionCreators(fetchDatasets, dispatch),
		toggleAI: bindActionCreators(toggleAI, dispatch)
	};
}

export const DatasetsContainer = connect(mapStateToProps, mapDispatchToProps)(Datasets);