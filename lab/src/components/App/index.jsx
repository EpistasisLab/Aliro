import React from 'react';
import MediaQuery from 'react-responsive';
import { Container, Menu } from 'semantic-ui-react';
import { BasicNavbar } from './BasicNavbar';

export class App extends React.Component {
		render() {
				return <Container fluid className="app">
						<MediaQuery query='(max-width: 1824px)'>
							<BasicNavbar />
						</MediaQuery>
						{this.props.children}
				</Container>;
		}
}