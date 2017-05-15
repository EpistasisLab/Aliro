import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchExperiments } from './data/api';
import { setFilter, setSort, resetFilters } from './data/actions';
import { Header, Segment } from 'semantic-ui-react';
import { ExperimentFilters } from './components/ExperimentFilters';
import { ExperimentsTable } from './components/ExperimentsTable';

// change location on click!
// use alg/dataset ids instead
// set up sorting!
// add pagination and # of experiments
export class Experiments extends React.Component {
	componentDidMount() {
		const { fetchExperiments, setFilter, filters } = this.props;
		const { query } = this.props.location;

		fetchExperiments();

		const isValid = (filter, query) => {
			return filters.getIn([filter, 'options']).includes(query);
		};

		filters.keySeq().toArray().map((key) => {
			if(query[key] && isValid(key, query[key])) {
				setFilter(key, query[key]);
			}
		});
	}

	render() {

		const { 
			experiments, 
			filters,
			sorted,
			setFilter,
			setSort,
			resetFilters
		} = this.props;

		return (
			<div className="experiments-scene">
				<div className="page-title">
					<Header 
						inverted 
						size="huge" 
						content="Experiments" 
					/>
				</div>
				<Segment inverted attached="top" className="filters">
					<ExperimentFilters
						filters={filters}
						setFilter={setFilter}
						resetFilters={resetFilters}
					/>
				</Segment>
				<Segment inverted attached="bottom" className='tabled'>
					<ExperimentsTable 
						experiments={experiments}
						filters={filters}
						sorted={sorted}
						setSort={setSort}
					/>
				</Segment>
			</div>
		);
	}
}

function getVisibleExperiments(experiments, filters, sorted) {
	var selectedStatus = filters.getIn(['status', 'selected']);
	var selectedDataset = filters.getIn(['dataset', 'selected']);
	var selectedAlgorithm = filters.getIn(['algorithm', 'selected']);
	var sortedColumn = sorted.get('column');
	var direction = sorted.get('direction');

	const matchesFilters = (exp) => {
		return (
			(selectedStatus === 'all' || selectedStatus == exp.get('status')) &&
			(selectedDataset === 'all' || selectedDataset == exp.get('dataset')) &&
			(selectedAlgorithm === 'all' || selectedAlgorithm == exp.get('algorithm'))
		);
	};

	// must define type of data
	const sortedBy = (a, b) => {
			if(sortedColumn === 'id') {
				return a._id - b._id;
			}
	};		

	return experiments.filter(exp => matchesFilters(exp));
}

function mapStateToProps(state) {
	const { experiments } = state;

	return {
		isFetching: experiments.get('isFetching'),
		experiments: getVisibleExperiments(experiments.get('items'), experiments.get('filters'), experiments.get('sorted')),
		filters: experiments.get('filters'),
		sorted: experiments.get('sorted')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchExperiments: bindActionCreators(fetchExperiments, dispatch),
		setFilter: bindActionCreators(setFilter, dispatch),
		setSort: bindActionCreators(setSort, dispatch),
		resetFilters: bindActionCreators(resetFilters, dispatch)
	};
}

export const ExperimentsContainer = connect(mapStateToProps, mapDispatchToProps)(Experiments);