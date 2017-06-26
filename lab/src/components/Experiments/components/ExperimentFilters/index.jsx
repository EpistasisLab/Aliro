import React, { Component } from 'react';
import { Form, Dropdown, Button } from 'semantic-ui-react';

class ExperimentFilters extends Component {
	getOptionsArray(filter) {
		const { filters } = this.props;

		let optionsArray = filters[filter].options.map((option) => {
			return { text: option, value: option };
		});

		optionsArray.unshift({ text: 'all', value: 'all' });

		return optionsArray;
	}

	render() {

		const {
			filters,
			updateQuery,
			resetQuery
		} = this.props;

		return (
			<Form inverted>
				<Form.Group>
					<Form.Field 
						inline
						label="Status:"
						control={Dropdown}
						value={filters.status.selected}
						options={this.getOptionsArray('status')}
						onChange={(e, data) => updateQuery('status', data.value)}
						className="filter"
					/>
					<Form.Field 
						inline
						label="Dataset:"
						control={Dropdown} 
						value={filters.dataset.selected}
						options={this.getOptionsArray('dataset')}
						onChange={(e, data) => updateQuery('dataset', data.value) }
						className="filter"
					/>
					<Form.Field 
						inline
						label="Algorithm:"
						control={Dropdown} 
						value={filters.algorithm.selected}
						options={this.getOptionsArray('algorithm')} 
						onChange={(e, data) => updateQuery('algorithm', data.value)}
						className="filter"
					/>
					<Form.Button
						inline
						inverted 
						color="blue"
						size="mini" 
						compact
						content="Reset filters"
						onClick={() => resetQuery()}
					/>
				</Form.Group>
			</Form>
		);
	}
}

export default ExperimentFilters;