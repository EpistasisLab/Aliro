import React, { Component } from 'react';
import { Segment, Header, Progress } from 'semantic-ui-react';

class BestResult extends Component {
	getNoResultMessage(hasMetadata) {
		if(!hasMetadata) {
			return 'You must upload a metadata file in order to use this dataset.'
		}

		return 'No results yet, build a new experiment to start.';
	}

	getResultLink(result) {
		return `/#/results/${result.get('_id')}`;
	}

	getSubheader(result) {
		return `${result.get('algorithm')} #${result.get('_id')}`;
	}

	getPercent(result) {
		return (result.get('accuracy_score') * 100).toFixed(2);
	}

	render() {
		
		const { 
			result,
			hasMetadata
		} = this.props;

		if(!result) {
			return (
				<Segment inverted attached className="panel-body">
					{this.getNoResultMessage(hasMetadata)}
				</Segment>
			);
		}

		return (
			<Segment 
				inverted 
				attached 
				href={this.getResultLink(result)}
				className="panel-body best-result"
			>
				<Header inverted size="small">
					Best Result
					<Header.Subheader>
						<div>{result.get('algorithm')}</div>
						<span>#{result.get('_id')}</span>
					</Header.Subheader>
				</Header>
				<Progress 
					inverted
					progress
					percent={this.getPercent(result)}
					className="accuracy-score"
				/>
			</Segment>
		);
	}
}

export default BestResult;