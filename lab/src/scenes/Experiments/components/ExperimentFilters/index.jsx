import React from 'react';
import { Form, Dropdown, Button } from 'semantic-ui-react';

export class ExperimentFilters extends React.Component {
	render() {

		const {
			filters,
			setFilter,
			resetFilters
		} = this.props;

		const buildOptionsArray = (filter) => {
			const options = filters.getIn([filter, 'options']);

			let optionsArray = options.toArray().map((option) => {
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
						value={filters.getIn(['status', 'selected'])}
						options={buildOptionsArray('status')}
						onChange={(e, data) => setFilter('status', data.value)}
						className="filter"
					/>
					<Form.Field 
						inline
						label="Dataset:"
						control={Dropdown} 
						value={filters.getIn(['dataset', 'selected'])}
						options={buildOptionsArray('dataset')}
						onChange={(e, data) => setFilter('dataset', data.value) }
						className="filter"
					/>
					<Form.Field 
						inline
						label="Algorithm:"
						control={Dropdown} 
						value={filters.getIn(['algorithm', 'selected'])}
						options={buildOptionsArray('algorithm')} 
						onChange={(e, data) => setFilter('algorithm', data.value)}
						className="filter"
					/>
					<Form.Button
						inline
						inverted 
						color="blue"
						size="mini" 
						compact
						content="Reset filters"
						onClick={() => resetFilters()}
					/>
				</Form.Group>
			</Form>
		);
	}
}