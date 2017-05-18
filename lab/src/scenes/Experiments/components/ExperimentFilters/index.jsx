import React from 'react';
import { Form, Dropdown, Button } from 'semantic-ui-react';

export class ExperimentFilters extends React.Component {
	render() {

		const {
			filters,
			updateQuery,
			resetQuery
		} = this.props;

		const buildOptionsArray = (filter) => {
			let optionsArray = filters[filter].options.map((option) => {
				return { text: option, value: option };
			});

			optionsArray.unshift({ text: 'all', value: 'all' });

			return optionsArray;
		};

		return (
			<Form inverted>
				<Form.Group>
					<Form.Field 
						inline
						label="Status:"
						control={Dropdown}
						value={filters.status.selected}
						options={buildOptionsArray('status')}
						onChange={(e, data) => updateQuery('status', data.value)}
						className="filter"
					/>
					<Form.Field 
						inline
						label="Dataset:"
						control={Dropdown} 
						value={filters.dataset.selected}
						options={buildOptionsArray('dataset')}
						onChange={(e, data) => updateQuery('dataset', data.value) }
						className="filter"
					/>
					<Form.Field 
						inline
						label="Algorithm:"
						control={Dropdown} 
						value={filters.algorithm.selected}
						options={buildOptionsArray('algorithm')} 
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