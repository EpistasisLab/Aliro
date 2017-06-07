import React, { Component } from 'react';
import { Header, Button, Grid } from 'semantic-ui-react';
import { DatasetPanel } from './components/DatasetPanel';
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
		const { datasets, toggleAI } = this.props;
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
				{datasets.get('isFetching') &&
					<Header 
						inverted 
						size="small"
						content="Retrieving your datasets..."
					/>
				}
				{!datasets.get('isFetching') && !datasets.get('byId').size &&
					<Header 
						inverted 
						size="small"
						content="You have no datasets uploaded yet."
					/>
				}
				{!datasets.get('isFetching') && datasets.get('byId').size &&
					<Grid stretched columns={this.handleCols()}>
						{datasets.get('byId').entrySeq().map(([id, dataset]) =>
							<DatasetPanel
								key={id}
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

export default Datasets;