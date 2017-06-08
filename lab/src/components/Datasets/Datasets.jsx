import React, { Component } from 'react';
import { Header, Grid } from 'semantic-ui-react';
import { DatasetPanel } from './components/DatasetPanel';
import FetchError from '../FetchError';
import DeviceWatcher from '../../device-watcher';

class Datasets extends Component {
	static getColsByDevice() {
		return {mobile: 1, tablet: 2, desktop: 3, largescreen: 4};
	}

	constructor(props) {
		super(props);
		this.state = DeviceWatcher.initState();
		this.handleCols = this.handleCols.bind(this);
	}

	componentDidMount() {
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
		const { 
			datasets,
			isFetching,
			errorMessage,
			fetchDatasets
		} = this.props;

		if(errorMessage && !datasets.size) {
			return (
				<FetchError 
					message={errorMessage}
					onRetry={() => fetchDatasets()}
				/>
			);
		} else if(isFetching && !datasets.size) {
			return (
				<Header 
					inverted 
					size="small"
					content="Retrieving your datasets..."
				/>
			);
		} else if(!isFetching && !datasets.size) {
			return (
				<Header 
					inverted 
					size="small"
					content="You have no datasets uploaded yet."
				/>
			);
		}
			
		return (
			<Grid stretched columns={this.handleCols()}>
				{datasets.entrySeq().map(([id, dataset]) =>
					<DatasetPanel
						key={id}
						dataset={dataset}
					/>
				)}
			</Grid>
		);
	}
}

export default Datasets;