import React from 'react';
import { Table, Popup, Icon } from 'semantic-ui-react';

export class ExperimentsTableHeader extends React.Component {
	render() {

		const {
			selectedAlgorithm,
			shouldDisplayParams,
			orderedParamKeys,
			sort,
			updateQuery
		} = this.props; 

		let popupStatus = 'untouched';

		const openPopup = () => {
			popupStatus = 'opened';
		};

		const closePopup = () => {
			popupStatus = 'closed';
		};

		const shouldPreventSort = () => {
			if(popupStatus === 'opened') {
				return true;
			} else if(popupStatus === 'closed') {
				popupStatus = 'untouched';
				return true;
			}

			return false;
		};

		const handleSort = (clickedColumn) => {
			let direction;
			
			if(shouldPreventSort()) {
				return;
			}

			if(clickedColumn === sort.column) {
				direction = sort.direction === 'ascending' ? 'descending' : 'ascending';
			} else {
				direction = 'ascending';
			}

			updateQuery('col', clickedColumn);
			updateQuery('direction', direction)
		};

		const isSorted = (column) => {
			return (sort.column === column && sort.direction) || null;
		};

		return (
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={isSorted('_id')}
						onClick={() => handleSort('_id')}
					>
						Id #
					</Table.HeaderCell>
					<Table.HeaderCell 
						rowSpan={shouldDisplayParams && 2}
						sorted={isSorted('accuracy_score')}
						onClick={() => handleSort('accuracy_score')}
					>
						Accuracy
						<Popup
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
							onOpen={() => openPopup()}
							onClose={() => closePopup()}
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
						sorted={shouldDisplayParams ? null : isSorted('algorithm')}
						onClick={shouldDisplayParams ? null : () => handleSort('algorithm')}
					>
						Algorithm
						{shouldDisplayParams &&
							<span className="alg-name">({selectedAlgorithm})</span>
						}
					</Table.HeaderCell>
					<Table.HeaderCell rowSpan={shouldDisplayParams && 2}>
						Who?
						<Popup
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