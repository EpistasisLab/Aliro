import React from 'react';
import { breakpoints } from '../../breakpoints';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchDatasets } from './data/api';
import { Segment, Header, Button, Grid } from 'semantic-ui-react';
import { DatasetPanel } from './components/DatasetPanel';

export class Datasets extends React.Component {
	constructor() {
		super();
  	this.state = { width: '0', height: '0' };
  	this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	componentDidMount() {
		this.updateWindowDimensions();
 		window.addEventListener('resize', this.updateWindowDimensions.bind(this));

		const { fetchDatasets } = this.props;
		fetchDatasets();
	}

	componentWillUnmount() {
	  window.removeEventListener('resize', this.updateWindowDimensions.bind(this));
	}

	updateWindowDimensions() {
		this.setState({ width: window.innerWidth, height: window.innerHeight });
	}

	calcCols() {
		let { width } = this.state; 

		if(width < breakpoints.MIN_TABLET) 				{ return 1; } 
		else if(width < breakpoints.MAX_TABLET) 	{ return 2; } 
		else if(width < breakpoints.MAX_DESKTOP) 	{ return 3; } 
		else 																			{ return 4; }
	}

	render() {
		const { datasets } = this.props;
		return <div>
			<div className='page-title'>
				<Header inverted size='huge' content='Datasets' />
				<Button inverted color='blue' compact size='small' icon='plus' content='Add new'/>
			</div>
			<Grid stretched columns={this.calcCols()}>
				{datasets.map(dataset =>
					<DatasetPanel
						key={dataset.get('_id')}
						dataset={dataset}
					/>
				)}
			</Grid>
		</div>;
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
		fetchDatasets: bindActionCreators(fetchDatasets, dispatch)
	};
}

export const DatasetsContainer = connect(mapStateToProps, mapDispatchToProps)(Datasets);