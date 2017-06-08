import React from 'react';
import MediaQuery from 'react-responsive';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchPreferences } from './data/api';
import { Container } from 'semantic-ui-react';
import { Navbar } from './Navbar';

export class App extends React.Component {
	componentDidMount() {
		const { fetchPreferences } = this.props;
		fetchPreferences();
	}

	render() {
		return <Container fluid className="app pennai">
			<Navbar />
			{this.props.children}
		</Container>;
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.getIn(['preferences', 'isFetching']),
		preferences: state.getIn(['preferences', 'preferences'])
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchPreferences: bindActionCreators(fetchPreferences, dispatch)
	};
}

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);