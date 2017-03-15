import React from 'react';
import { Container } from 'semantic-ui-react';
import { Headline } from './Headline'
import { Navbar } from './Navbar';

export class App extends React.Component {
		render() {
				return <Container fluid className="app">
						<Headline />
						{this.props.children}
						<Navbar />
				</Container>;
		}
}