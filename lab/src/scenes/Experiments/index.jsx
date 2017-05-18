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
					<Header 
						inverted
						color="blue"
						size="small" 
						content={`${experiments.size} result${experiments.size === 1 ? '' : 's'}`}
						className="float-right experiment-count"
					/>
				</Segment>
				<Segment inverted attached="bottom" className='tabled'>
					{experiments.size ? (
						<ExperimentsTable 
							experiments={experiments}
							filters={filters}
							sorted={sorted}
							setSort={setSort}
						/>
					) : (
						<Header 
							inverted 
							size="small"
							content="No results available."
						>
				</Header>
					)}
				</Segment>
			</div>
		);
	}
}

function getVisibleExperiments(experiments, filters, sorted) {
	var selectedStatus = filters.getIn(['status', 'selected']);
	var selectedDataset = filters.getIn(['dataset', 'selected']);
	var selectedAlgorithm = filters.getIn(['algorithm', 'selected']);
	var column = sorted.get('column');
	var direction = sorted.get('direction');

	const matchesFilters = (exp) => {
		return (
			(selectedStatus === 'all' || selectedStatus === exp.get('status')) &&
			(selectedDataset === 'all' || selectedDataset === exp.get('dataset')) &&
			(selectedAlgorithm === 'all' || selectedAlgorithm === exp.get('algorithm'))
		);
	};

	const sortedBy = (a, b) => {
		let A = a.getIn([column]), B = b.getIn([column]);

		if(typeof(A) === 'number' || typeof(B) === 'number') {
			return direction === 'ascending' ? ((A || 2) - (B || 2)) : ((B || 0) - (A || 0));
		} else if(typeof(A) === 'string' && typeof(B) === 'string') {
			A = A.toUpperCase(), B = B.toUpperCase();

			let result = direction === 'ascending' ? (
				A > B ? 1 : A < B ? -1 : 0
			) : (
				B > A ? 1 : B < A ? -1 : 0
			);

			return result;
		}


		/*if(column === '_id') {
			A = a.get('_id'), B = b.get('_id');
			return direction === 'ascending' ? (A - B) : (B - A);
		} else if(column === 'accuracy' && direction === 'ascending') {
			return (a.get('accuracy_score') || 2) - (b.get('accuracy_score') || 2);
		} else if(column === 'accuracy' && direction === 'descending') {
			return (b.get('accuracy_score') || -1) - (a.get('accuracy_score') || -1);
		} else if(column === 'dataset' && direction === 'ascending') {
			let datasetA = a.get('dataset').toUpperCase();
  			let datasetB = b.get('dataset').toUpperCase();
			if (datasetA < datasetB) { return -1; }
			if (datasetB < datasetA) { return 1;  }
  			return 0;
		} else if(column === 'dataset' && direction === 'descending') {
			let datasetA = a.get('dataset').toUpperCase();
  			let datasetB = b.get('dataset').toUpperCase();
			if (datasetB < datasetA) { return -1; }
			if (datasetA < datasetB) { return 1;  }
  			return 0;
		} else if(column === 'algorithm' && direction === 'ascending') {
			let algA = a.get('algorithm').toUpperCase();
  			let algB = b.get('algorithm').toUpperCase();
			if (algA < algB) { return -1; }
			if (algB < algA) { return 1;  }
  			return 0;
		} else if(column === 'algorithm' && direction === 'descending') {
			let algA = a.get('algorithm').toUpperCase();
  			let algB = b.get('algorithm').toUpperCase();
			if (algB < algA) { return -1; }
			if (algA < algB) { return 1;  }
  			return 0;
		} else if(direction === 'ascending') {
			let targetA = a.getIn(['params', sortedColumn]) || 0;
			let targetB = b.getIn(['params', sortedColumn]) || 0;

			// what about undefined?
			if(typeof(targetA) && typeof(targetB) === 'number') {
				return targetA - targetB;
			} else if(typeof(targetA) && typeof(targetB) === 'string') {
				if (targetA < targetB) { return -1; }
				if (targetB < targetA) { return 1;  }
  				return 0;
			} else {
				return;
			}
		} else if(direction === 'descending') {
			let targetA = a.getIn(['params', sortedColumn]);
			let targetB = b.getIn(['params', sortedColumn]);

			if(typeof(targetA) && typeof(targetB) === 'number') {
				return targetB - targetA;
			} else if(typeof(targetA) && typeof(targetB) === 'string') {
				if (targetB < targetA) { return -1; }
				if (targetA < targetB) { return 1;  }
  				return 0;
			} else {
				return;
			}
		}*/
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