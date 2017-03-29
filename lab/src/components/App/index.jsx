import React from 'react';
import MediaQuery from 'react-responsive';
import { Container } from 'semantic-ui-react';
import { Navbar } from './Navbar';

export class App extends React.Component {
	render() {
		return <Container fluid className="app pennai">
			<Navbar />
			{this.props.children}
		</Container>;
	}
}