import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import ExperimentFilters from './components/ExperimentFilters';
import ExperimentsTable from './components/ExperimentsTable';
import FetchError from '../FetchError';
import { Header, Segment } from 'semantic-ui-react';

class Experiments extends Component {
	constructor(props) {
		super(props);

		this.updateQuery = this.updateQuery.bind(this);
		this.resetQuery = this.resetQuery.bind(this);
	}

	updateQuery(key, value) {
		const location = Object.assign({}, this.props.location);
		if(value === 'all') {
			delete location.query[key];
		} else {
			Object.assign(location.query, {[key]: value});
		}
		hashHistory.push(location);
	}

	resetQuery() {
		const location = Object.assign({}, this.props.location);
		Object.keys(location.query).forEach((key) => {
			delete location.query[key];
		});
		hashHistory.push(location);
	}

	render() {

		const { 
			experiments,
			isFetching,
			errorMessage,
			filters,
			sort,
			fetchExperiments
		} = this.props;

		if(errorMessage && !experiments.size) {
			return (
				<FetchError 
					message={errorMessage}
					onRetry={() => fetchExperiments()}
				/>
			);
		} else if(isFetching && !experiments.size) {
			return (
				<Header 
					inverted 
					size="small"
					content="Retrieving your experiments..."
				/>
			);
		}

		return (
			<div className="experiments-scene">
				<Segment inverted attached="top" className="filters">
					<ExperimentFilters
						filters={filters}
						updateQuery={this.updateQuery}
						resetQuery={this.resetQuery}
					/>
					<Header 
						inverted
						size="small" 
						content={`${experiments.size} result${experiments.size === 1 ? '' : 's'}`}
						className="float-right experiment-count"
					/>
				</Segment>
				<Segment inverted attached="bottom" className='tabled'>
					{experiments.size > 0 ? (
						<ExperimentsTable 
							experiments={experiments}
							filters={filters}
							sort={sort}
							updateQuery={this.updateQuery}
						/>
					) : (
						<Header 
							inverted 
							size="small"
							content="No results available."
						/>
					)}
				</Segment>
			</div>
		);
	}
}

export default Experiments;