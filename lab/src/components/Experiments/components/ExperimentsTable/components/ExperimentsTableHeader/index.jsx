import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';

class ExperimentsTableHeader extends Component {
	onSort(clickedColumn) {
		const { sort, updateQuery } = this.props;

		let direction;
		if(clickedColumn === sort.column) {
			direction = sort.direction === 'ascending' ? 'descending' : 'ascending';
		} else {
			direction = 'ascending';
		}

		updateQuery('col', clickedColumn);
		updateQuery('direction', direction);
	}

	getIsSorted(column) {
		const { sort } = this.props;
		return (sort.column === column && sort.direction) || null;
	}

	render() {

		const {
			selectedAlgorithm,
			shouldDisplayQuality,
			shouldDisplayParams,
			orderedParamKeys
		} = this.props;

		return (
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={this.getIsSorted('started')}
						onClick={() => this.onSort('started')}
					>
						Start Time
					</Table.HeaderCell>
					{shouldDisplayQuality ? (
						<Table.HeaderCell 
							rowSpan={shouldDisplayParams && 2}
							sorted={this.getIsSorted('quality_metric')}
							onClick={() => this.onSort('quality_metric')}
						>
							Quality
						</Table.HeaderCell>
					) : (
						<Table.HeaderCell 
							rowSpan={shouldDisplayParams && 2}
							sorted={this.getIsSorted('accuracy_score')}
							onClick={() => this.onSort('accuracy_score')}
						>
							Accuracy
						</Table.HeaderCell>
					)}
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={this.getIsSorted('dataset_name')}
						onClick={() => this.onSort('dataset_name')}
					>
						Dataset
					</Table.HeaderCell>
					<Table.HeaderCell 
						colSpan={shouldDisplayParams && orderedParamKeys.size}
						sorted={shouldDisplayParams ? null : this.getIsSorted('algorithm')}
						onClick={shouldDisplayParams ? null : () => this.onSort('algorithm')}
					>
						Algorithm
						{shouldDisplayParams &&
							<span className="alg-name">({selectedAlgorithm})</span>
						}
					</Table.HeaderCell>
					<Table.HeaderCell rowSpan={shouldDisplayParams && 2}>
						Actions
					</Table.HeaderCell>
				</Table.Row>
				{shouldDisplayParams &&
					<Table.Row>
						{orderedParamKeys.map((key) =>
							<Table.HeaderCell 
								key={key}
								sorted={this.getIsSorted(key)}
								onClick={() => this.onSort(key)}
							>
								{key}
							</Table.HeaderCell>	
						)}
					</Table.Row>
				}
			</Table.Header>
		);
	}
}

export default ExperimentsTableHeader;