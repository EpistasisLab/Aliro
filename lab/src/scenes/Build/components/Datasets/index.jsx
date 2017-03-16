import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentDataset } from '../../actions';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

export class Datasets extends React.Component {
	render() {
		const color = 'orange';
		return <Grid.Column mobile={16} tablet={8} computer={8} widescreen={8} largeScreen={8}>
			<Segment inverted color={color}>
				<Header as='h1' inverted color={color} content="Dataset" />
				{this.props.datasets.get('Datasets') &&
					this.props.datasets.get('Datasets').map(item =>
                    <Button
                    	inverted color={color} 
                    	key={item}
                    	content={item.get('name')} 
                    	active={item.get('name') === this.props.currentDataset.get('name')} 
                    	onClick={() => this.props.setCurrentDataset(item)} 
                    />
                )}
			</Segment>
		</Grid.Column>;
	}
}

function mapStateToProps(state) {
	return {
		datasets: state.preferences.get('items'),
		currentDataset: state.currentDataset
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setCurrentDataset: bindActionCreators(setCurrentDataset, dispatch)
	};
}

export const DatasetsContainer = connect(mapStateToProps, mapDispatchToProps)(Datasets);