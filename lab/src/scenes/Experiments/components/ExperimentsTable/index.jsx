import React from 'react';
import { Table } from 'semantic-ui-react';
import { ExperimentsTableHeader } from './components/ExperimentsTableHeader';
import { ExperimentsTableBody } from './components/ExperimentsTableBody';

export class ExperimentsTable extends React.Component {
	render() {

		const { 
			experiments, 
			filters,
			sorted,
			setSort
		} = this.props;

		const selectedDataset = filters.dataset.selected;

		const selectedAlgorithm = filters.algorithm.selected;

		const currentParameters = experiments.first().get('params');

		const shouldDisplayAwards = (() => {
			return selectedDataset !== 'all';
		})();

		const shouldDisplayParams = (() => {
			return selectedAlgorithm !== 'all' && currentParameters.size > 0;
		})();

		const orderedParamKeys = (() => {
			return currentParameters.keySeq().sort();
		})();

		return (
			<div className="table-container">
				<Table 
					inverted
					basic
					celled
					compact
					selectable
					sortable
					structured
					unstackable
				>
					<ExperimentsTableHeader
						selectedAlgorithm={selectedAlgorithm}
						shouldDisplayParams={shouldDisplayParams}
						orderedParamKeys={orderedParamKeys}
						sorted={sorted}
						setSort={setSort}
					/>
					<ExperimentsTableBody
						experiments={experiments}
						shouldDisplayAwards={shouldDisplayAwards}
						shouldDisplayParams={shouldDisplayParams}
						orderedParamKeys={orderedParamKeys}
					/>
				</Table>
			</div>	
		);
	}
}