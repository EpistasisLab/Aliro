import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchExperiments } from './data/api';
import { Header, Segment } from 'semantic-ui-react';
import { ExperimentFilters } from './components/ExperimentFilters';
import { ExperimentsTable } from './components/ExperimentsTable';
import { hashHistory } from 'react-router';

export class Experiments extends React.Component {
	constructor(props) {
		super(props);

		this.updateQuery = this.updateQuery.bind(this);
		this.resetQuery = this.resetQuery.bind(this);
	}

	componentDidMount() {
		const { fetchExperiments, filters } = this.props;
		const { query } = this.props.location;

		fetchExperiments();
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
			filters,
			sort
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
					{isFetching &&
						<Header 
							inverted 
							size="small"
							content="Retrieving your experiments..."
						/>
					}
					{!isFetching && !experiments.size &&
						<Header 
							inverted 
							size="small"
							content="No results available."
						/>
					}
					{!isFetching && experiments.size &&
						<ExperimentsTable 
							experiments={experiments}
							filters={filters}
							sort={sort}
							updateQuery={this.updateQuery}
						/>
					}
				</Segment>
			</div>
		);
	}
}

function getFilters(experiments, query) {
	const filterKeys = ['status', 'dataset', 'algorithm'];

	const getUniqOptions = (items, key) => {
		return [...new Set(items.map(item => item[key]))];
	};
	
	let filters = {};
	filterKeys.forEach((key) => {
		let options = getUniqOptions(experiments.toJS(), key);
		let selected = options.includes(query[key]) ? query[key] : 'all';

		filters[key] = {options, selected};
	});

	return filters;
}

function getSort(query) {
	return {
		column: query.col || null,
		direction: query.direction || null
	};
}

function getVisibleItems(items, filters, sort) {
	const status = filters.status.selected;
	const dataset = filters.dataset.selected;
	const algorithm = filters.algorithm.selected;
	const column = sort.column;
	const direction = sort.direction;

	// check if works on booleans
	return items
		.filter(exp => {
			return (
				(status === 'all' || status === exp.get('status')) &&
				(dataset === 'all' || dataset === exp.get('dataset')) &&
				(algorithm === 'all' || algorithm === exp.get('algorithm'))
			);	
		})
		.sort((a, b) => {
			let A = a.getIn([column]) || a.getIn(['params', column]),
			 	B = b.getIn([column]) || b.getIn(['params', column]);

			if(typeof(A) === 'number' && typeof(B) === 'number') {
				return direction === 'ascending' ? (A - B) : (B - A);
			} else if(typeof(A) === 'string' && typeof(B) === 'string') {
				A = A.toUpperCase(), B = B.toUpperCase();
				let result = direction === 'ascending' ? (
					A > B ? 1 : A < B ? -1 : 0
				) : (
					B > A ? 1 : B < A ? -1 : 0
				);
				return result;
			} else if(typeof(A) !== typeof(B)) {
				if(!A) {
					return Number.POSITIVE_INFINITY;
				} else if(!B) {
					return Number.NEGATIVE_INFINITY;
				} if(typeof(A) === 'number') {
					return direction === 'ascending' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
				} else if(typeof(B) === 'number') {
					return direction === 'ascending' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
				}
			}
	});
}

function mapStateToProps(state, props) {
	const { query } = props.location;

	const items = state.getIn(['experiments', 'items']);
	const filters = getFilters(items, query);
	const sort = getSort(query);
	const visibleItems = getVisibleItems(items, filters, sort);

	return {
		isFetching: state.getIn(['experiments', 'isFetching']),
		experiments: visibleItems,
		filters,
		sort
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchExperiments: bindActionCreators(fetchExperiments, dispatch)
	};
}

export const ExperimentsContainer = connect(mapStateToProps, mapDispatchToProps)(Experiments);