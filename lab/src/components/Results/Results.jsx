import React, { Component } from 'react';
import FetchError from '../FetchError';
import { Gauge } from './components/Gauge';
import { Header, Grid, Segment, Icon } from 'semantic-ui-react';
import moment from 'moment';
import twix from 'twix';

// if results does not exist, then go to not found page or error message!!
class Results extends Component {
	getFormattedDate(date) {
		return moment(date).format('M/DD/YY h:mm a');
	}

	getDuration(started, finished) {
		let duration = moment(started).twix(finished).asDuration();
		return `${duration._data.hours}h ${duration._data.minutes}m ${duration._data.seconds}s`;
	}

	render() {
		
		const { 
			results,
			isFetching,
			errorMessage,
			fetchResults
		} = this.props;

		if(errorMessage) {
			return (
				<FetchError 
					message={errorMessage}
					onRetry={() => fetchResults(this.props.params.id)}
				/>
			);
		} else if(isFetching) {
			return (
				<Header 
					inverted 
					size="small"
					content="Retrieving your results..."
				/>
			);
		} else if(!isFetching && !results.size) {
			return (
				<Header 
					inverted 
					size="small"
					content="This result does not appear to exist."
				/>
			);
		}

		return (
			<div className="results-scene">
				<Grid columns={4}>
					<Grid.Row stretched>
						<Segment inverted attached="top" className="panel-header">
							<Header inverted size="medium" content="Algorithm" />
						</Segment>
						<Segment inverted attached="bottom">	
							<Header inverted size="small" content={results.get('algorithm')} />
								<Grid columns={2}>
								{results.get('params').entrySeq().map(([param, value]) =>
									<Grid.Column key={param}>
										<Header
											inverted
											size="tiny"
											color="grey"
											content={param}
											subheader={value.toString()}
										/>
									</Grid.Column>
								)}
							</Grid>
						</Segment>
						<Segment inverted attached="top" className="panel-header">
							<Header inverted size="medium" content="Run Details" />
						</Segment>
						<Segment inverted attached="bottom">	
							<Grid columns={2}>
								<Grid.Column>
									<Header 
										inverted 
										color="grey" 
										size="tiny" 
										content="Started" 
										subheader={this.getFormattedDate(results.get('_started'))}
									/>
								</Grid.Column>
								<Grid.Column>
									<Header 
										inverted 
										color="grey" 
										size="tiny" 
										content="Finished"
										subheader={this.getFormattedDate(results.get('_finished'))}
									/>
								</Grid.Column>
								<Grid.Column>
									<Header 
										inverted 
										color="grey" 
										size="tiny" 
										content="Duration"
										subheader={this.getDuration(
											results.get('_started'), 
											results.get('_finished')
										)}
									/>
								</Grid.Column>
								<Grid.Column>
									<Header 
										inverted 
										color="grey" 
										size="tiny" 
										content="Launched By"
										subheader={results.get('launched_by')}
									/>
								</Grid.Column>
								</Grid>
								</Segment>
				</Grid.Row>
				</Grid>
			</div>
		);
			
		/*return (
				<Grid columns={4}>
					<Grid.Row stretched>
						<Grid.Column>
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
		);*/
	}
}

export default Results;