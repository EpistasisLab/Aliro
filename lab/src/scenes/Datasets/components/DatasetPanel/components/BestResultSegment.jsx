import React from 'react';
import { Segment, Header, Progress } from 'semantic-ui-react';

export class BestResultSegment extends React.Component {
	render() {
		const { result } = this.props;
		const link = `/#/results/${result.get('_id')}`;
		const subheader = `${result.get('algorithm')} (#${result.get('_id')})`;
		const percent = result.get('accuracy_score') * 100;
		return (
			<Segment 
				inverted 
				attached 
				href={link}
				className='panel-body best-result'
			>
				<Header 
					inverted
					size='small'
					content='Best Result'
					subheader={subheader}
				/>
				<Progress 
					inverted
					progress
					percent={percent}
					className='accuracy-score'
				/>
			</Segment>
		);
	}
}