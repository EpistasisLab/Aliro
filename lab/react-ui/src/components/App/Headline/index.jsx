import React from 'react';
import { Divider, Header } from 'semantic-ui-react';

export class Headline extends React.Component {
		render() {
				return <Divider horizontal inverted>
					<Header 
						as='h1' 
						inverted color='grey'
						content='PennAI' 
						subheader='Your friendly Artificial Intelligence assistant' 
					/>
				</Divider>;
		}
}