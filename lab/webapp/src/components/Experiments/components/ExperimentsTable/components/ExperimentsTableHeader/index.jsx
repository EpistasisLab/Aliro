import React from 'react';
import { Table } from 'semantic-ui-react';
import { formatAlgorithm, formatParam } from '../../../../../../utils/formatter';

function ExperimentsTableHeader({
  selectedAlgorithm,
  shouldDisplayQuality,
  shouldDisplayParams,
  shouldDisplayErrorMessage,
  orderedParamKeys,
  sort,
  updateQuery
}){
  // for sorting to work, clickedColumn string must be defined as keyPath for value
  // ex: scores-accuracy_score -> getIn([scores, accuracy_score])
  const onSort = (clickedColumn) => {
    let direction;
    if(clickedColumn === sort.column) {
      direction = sort.direction === 'ascending' ? 'descending' : 'ascending';
    } else {
      direction = 'ascending';
    }

    updateQuery('col', clickedColumn);
    updateQuery('direction', direction);
  };

  const getIsSorted = (column) => {
    return (sort.column === column && sort.direction) || null;
  };

  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell 
          rowSpan={shouldDisplayParams && 2}
          sorted={getIsSorted('started')}
          onClick={() => onSort('started')}
        >
          {'Start Time'}
        </Table.HeaderCell>
        {shouldDisplayQuality ? (
          <Table.HeaderCell 
            rowSpan={shouldDisplayParams && 2}
            sorted={getIsSorted('quality_metric')}
            onClick={() => onSort('quality_metric')}
          >
            {'Quality'}
          </Table.HeaderCell>
        ) : (
          <Table.HeaderCell 
            rowSpan={shouldDisplayParams && 2}
            sorted={getIsSorted('scores-accuracy_score')}
            onClick={() => onSort('scores-accuracy_score')}
          >
            {'Accuracy'}
          </Table.HeaderCell>
        )}
        <Table.HeaderCell 
          rowSpan={shouldDisplayParams && 2}
          sorted={getIsSorted('dataset_name')}
          onClick={() => onSort('dataset_name')}
        >
          {'Dataset'}
        </Table.HeaderCell>
        {shouldDisplayErrorMessage &&
          <Table.HeaderCell 
            rowSpan={shouldDisplayParams && 2}
            sorted={getIsSorted('error_message')}
            onClick={() => onSort('error_message')}
          >
            {'Error Message'}
          </Table.HeaderCell>
        }
        <Table.HeaderCell 
          colSpan={shouldDisplayParams && orderedParamKeys.length}
          sorted={shouldDisplayParams ? null : getIsSorted('algorithm')}
          onClick={shouldDisplayParams ? null : () => onSort('algorithm')}
        >
          {'Algorithm'}
          {shouldDisplayParams &&
            <span className="alg-name">{`(${formatAlgorithm(selectedAlgorithm)})`}</span>
          }
        </Table.HeaderCell>
        <Table.HeaderCell rowSpan={shouldDisplayParams && 2}>
          {'Actions'}
        </Table.HeaderCell>
      </Table.Row>
      {shouldDisplayParams &&
        <Table.Row>
          {orderedParamKeys.map((key) => (
            <Table.HeaderCell 
              key={key}
              sorted={getIsSorted(`params-${key}`)}
              onClick={() => onSort(`params-${key}`)}
            >
              {formatParam(key)}
            </Table.HeaderCell> 
          ))}
        </Table.Row>
      }
    </Table.Header>
  );
}

export default ExperimentsTableHeader;