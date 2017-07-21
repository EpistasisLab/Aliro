import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'semantic-ui-react';

function ExperimentsTableHeader({
  selectedAlgorithm,
  shouldDisplayQuality,
  shouldDisplayParams,
  orderedParamKeys,
  sort,
  updateQuery
}){
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
          Start Time
        </Table.HeaderCell>
        {shouldDisplayQuality ? (
          <Table.HeaderCell 
            rowSpan={shouldDisplayParams && 2}
            sorted={getIsSorted('quality_metric')}
            onClick={() => onSort('quality_metric')}
          >
            Quality
          </Table.HeaderCell>
        ) : (
          <Table.HeaderCell 
            rowSpan={shouldDisplayParams && 2}
            sorted={getIsSorted('accuracy_score')}
            onClick={() => onSort('accuracy_score')}
          >
            Accuracy
          </Table.HeaderCell>
        )}
        <Table.HeaderCell 
          rowSpan={shouldDisplayParams && 2}
          sorted={getIsSorted('dataset_name')}
          onClick={() => onSort('dataset_name')}
        >
          Dataset
        </Table.HeaderCell>
        <Table.HeaderCell 
          colSpan={shouldDisplayParams && orderedParamKeys.size}
          sorted={shouldDisplayParams ? null : getIsSorted('algorithm')}
          onClick={shouldDisplayParams ? null : () => onSort('algorithm')}
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
          {orderedParamKeys.map((key) => (
            <Table.HeaderCell 
              key={key}
              sorted={getIsSorted(key)}
              onClick={() => onSort(key)}
            >
              {key}
            </Table.HeaderCell> 
          ))}
        </Table.Row>
      }
    </Table.Header>
  );
}

ExperimentsTableHeader.propTypes = {
  selectedAlgorithm: PropTypes.string.isRequired,
  shouldDisplayQuality: PropTypes.bool.isRequired,
  shouldDisplayParams: PropTypes.bool.isRequired,
  orderedParamKeys: ImmutablePropTypes.seq.isRequired,
  sort: PropTypes.shape({
    column: PropTypes.string,
    direction: PropTypes.string
  }),
  updateQuery: PropTypes.func.isRequired
};

export default ExperimentsTableHeader;