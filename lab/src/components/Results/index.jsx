import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchResults } from './data/api';
import { Header, Grid, Segment, Icon } from 'semantic-ui-react';
import { Gauge } from './components/Gauge';
import moment from 'moment';
import twix from 'twix';

// if results does not exist, then go to not found page!
export class Results extends React.Component {
	componentDidMount() {
		const { fetchResults } = this.props;
		fetchResults(this.props.params.id);
	}

	render() {
		const { details } = this.props;

		const started = (() => {
			let started = details.getIn(['run', 'started']);
			return moment(started).format('M/DD/YY h:mm a');
		})();

		const finished = (() => {
			let finished = details.getIn(['run', 'finished']);
			return moment(finished).format('M/DD/YY h:mm a');
		})();

		const duration = (() => {
			let duration = moment(details.getIn(['run', 'started'])).twix(details.getIn(['run', 'finished'])).asDuration();
			return `${duration._data.hours}h ${duration._data.minutes}m ${duration._data.seconds}s`;
		})();

		const renderWhoIcon = () => {
			let who = details.getIn(['run', 'launched_by']);

			switch(who) {
				case 'user':
					return <Icon inverted color="grey" size="large" name="user" />;
				case 'ai':
					return <Icon inverted color="grey" size="large" name="android" />;
				default:
					return;	
			}
		};

		return (
			<div className="results-scene">
				<div className='page-title'>
					<Header 
						inverted 
						size='huge' 
						content={`Results: ${details.getIn(['dataset', 'name'])}`} 
						subheader={`Experiment #${details.getIn(['dataset', '_id'])}`}
					/>
				</div>
					<Grid columns={4}>
						<Grid.Row stretched>
							<Grid.Column>
								<Segment inverted attached="top" className="panel-header">
									<Header inverted size="medium" content="Algorithm" />
								</Segment>
								<Segment inverted attached="bottom">	
									<Header inverted size="small" content={details.getIn(['algorithm', 'name'])} />
								</Segment>

								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="Run Details" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									<Grid columns={2}>
										<Grid.Column>
											<Header inverted color="grey" size="tiny" content="Started" />
											{started}
										</Grid.Column>
										<Grid.Column>
											<Header inverted color="grey" size="tiny" content="Finished" />
											{finished}
										</Grid.Column>
										<Grid.Column>
											<Header inverted color="grey" size="tiny" content="Duration" />
											{duration}
										</Grid.Column>
										<Grid.Column>
											<Header inverted color="grey" size="tiny" content="Who?" />
											{renderWhoIcon()}
										</Grid.Column>
									</Grid>
								</Segment>
							</Grid.Column>
							<Grid.Column>
								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="ROC Curve" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									
								</Segment>

								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="Predictive Features" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									
								</Segment>
							</Grid.Column>
							<Grid.Column>
								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="Confusion Matrix" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									
								</Segment>
								
								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="Decision Tree" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									
								</Segment>
							</Grid.Column>
							<Grid.Column>
								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="Testing Accuracy" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									<Gauge 
										chartName="testing" 
										color="#AEA8D3"
										value={details.getIn(['scores', 'testing_accuracy'])}
									/>
								</Segment>

								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="Training Accuracy" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									<Gauge 
										chartName="training" 
										color="#2ABB9B"
										value={details.getIn(['scores', 'training_accuracy'])} 
									/>
								</Segment>

								<Segment inverted attached="top" className="panel-header">
									<Header 
										inverted
										size="medium"
										content="AUC" 
									/>
								</Segment>
								<Segment inverted attached="bottom">	
									<Gauge 
										chartName="auc"
										color="#59ABE3"
										value={details.getIn(['scores', 'AUC'])} 
									/>
								</Segment>
							</Grid.Column>
						</Grid.Row>
					</Grid>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.results.get('isFetching'),
		details: state.results.get('details')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchResults: bindActionCreators(fetchResults, dispatch)
	};
}

export const ResultsContainer = connect(mapStateToProps, mapDispatchToProps)(Results);