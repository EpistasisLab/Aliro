import React from 'react';
import { breakpoints } from '../../breakpoints';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchDatasets, toggleAI } from './data/api';
import { Header, Button, Grid } from 'semantic-ui-react';
import { DatasetPanel } from './components/DatasetPanel';

export class Datasets extends React.Component {
	constructor() {
		super();
		this.state = { width: 0, height: 0 };
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	componentDidMount() {
		const { fetchDatasets } = this.props;
		fetchDatasets();

		this.updateWindowDimensions();
		window.addEventListener('resize', this.updateWindowDimensions.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWindowDimensions.bind(this));
	}

	updateWindowDimensions() {
		this.setState({ width: window.innerWidth, height: window.innerHeight });
	}

	calcCols() {
		let { width } = this.state; 

		if(width < breakpoints.MIN_TABLET) 			{ return 1; } 
		else if(width < breakpoints.MAX_TABLET) 	{ return 2; } 
		else if(width < breakpoints.MAX_DESKTOP) 	{ return 3; } 
		else 										{ return 4; }
	}

	render() {
		const { 
			datasets,
			isFetching,
			toggleAI
		} = this.props;

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
					<Grid stretched columns={this.calcCols()}>
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