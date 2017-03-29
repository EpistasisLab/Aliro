import React from 'react';
import { Header } from 'semantic-ui-react';

export class NotFound extends React.Component {
	render() {
		return <Header 
			inverted color='red' 
			size='huge' 
			textAlign='center'
			content='404 Error: Page Not Found'
		/>;
	}
}