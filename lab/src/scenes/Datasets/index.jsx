import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import { setParameterValue } from '../../../../data/currentAlgorithm/actions';
import { Grid } from 'semantic-ui-react';
import { DatasetPreview } from './components/DatasetPreview';

export class Datasets extends React.Component {
	render() {
		return <Grid columns="equal" stretched>
			{this.props.datasets.map(dataset =>
				<DatasetPreview
					key={dataset.get('id')}
					dataset={dataset}
				/>
			)}
		</Grid>;
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.data.datasets.get('isFetching'),
		datasets: state.data.datasets.get('items')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		//setParameterValue: bindActionCreators(setParameterValue, dispatch)
	};
}

export const DatasetsContainer = connect(mapStateToProps, mapDispatchToProps)(Datasets);