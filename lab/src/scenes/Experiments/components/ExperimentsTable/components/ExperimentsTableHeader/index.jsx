import React from 'react';
import { Table, Popup, Icon } from 'semantic-ui-react';

export class ExperimentsTableHeader extends React.Component {
	render() {

		const {
			selectedAlgorithm,
			shouldDisplayParams,
			orderedParamKeys,
			sorted,
			setSort
		} = this.props; 

		const isSorted = (column) => {
			return (sorted.get('column') === column && sorted.get('direction')) || null;
		};

		const handleSort = (clickedColumn) => {
				let direction;

				if(clickedColumn === sorted.get('column')) {
					direction = sorted.get('direction') === 'ascending' ? 'descending' : 'ascending';
				} else {
					direction = 'ascending';
				}

				setSort(clickedColumn, direction);
		};

		return (
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={isSorted('id')}
						onClick={() => handleSort('id')}
					>
						Id #
					</Table.HeaderCell>
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={isSorted('accuracy')}
						onClick={() => handleSort('accuracy')}
					>
						Accuracy
						<Popup
							on="click"
							header="What is accuracy?"
							trigger={
								<Icon 
									inverted 
									color="grey" 
									name="question circle" 
									className="float-right" 
								/>
							}
							content="A definition of accuracy"
						/>
					</Table.HeaderCell>
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={isSorted('dataset')}
						onClick={() => handleSort('dataset')}
					>
						Dataset
					</Table.HeaderCell>
					<Table.HeaderCell 
						colSpan={shouldDisplayParams && orderedParamKeys.size}
						sorted={isSorted('algorithm')}
						onClick={() => handleSort('algorithm')}
					>
						Algorithm
						{shouldDisplayParams &&
							<span>({selectedAlgorithm})</span>
						}
					</Table.HeaderCell>
					<Table.HeaderCell rowSpan={shouldDisplayParams && 2}>
						Who?
						<Popup
							on="click"
							header="You or the AI?"
							trigger={
								<Icon 
									inverted 
									color="grey" 
									name="question circle" 
									className="float-right" 
								/>
							}
							content="Displays who launched this experiment."
						/>
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
								sorted={isSorted(key)}
								onClick={() => handleSort(key)}
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