/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
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
          rowSpan={shouldDisplayParams ? 0 : 2}
          sorted={getIsSorted('started')}
          onClick={() => onSort('started')}
        >
          {'Start Time'}
        </Table.HeaderCell>
        {shouldDisplayQuality ? (
          <Table.HeaderCell
            rowSpan={shouldDisplayParams ? 0 : 2}
            sorted={getIsSorted('quality_metric')}
            onClick={() => onSort('quality_metric')}
          >
            {'Quality'}
          </Table.HeaderCell>
        ) : (
          <Table.HeaderCell
            rowSpan={shouldDisplayParams ? 0 : 2}
            sorted={getIsSorted('scores-exp_table_score')}
            onClick={() => onSort('scores-exp_table_score')}
          >
            {'Score'}
          </Table.HeaderCell>
        )}
        <Table.HeaderCell
          rowSpan={shouldDisplayParams ? 0 : 2}
          sorted={getIsSorted('dataset_name')}
          onClick={() => onSort('dataset_name')}
        >
          {'Dataset'}
        </Table.HeaderCell>
        {shouldDisplayErrorMessage &&
          <Table.HeaderCell
            rowSpan={shouldDisplayParams ? 0 : 2}
            sorted={getIsSorted('error_message')}
            onClick={() => onSort('error_message')}
          >
            {'Error Message'}
          </Table.HeaderCell>
        }
        <Table.HeaderCell
          colSpan={shouldDisplayParams ? orderedParamKeys.length : null}
          rowSpan={shouldDisplayParams ? null : 2}
          sorted={shouldDisplayParams ? null : getIsSorted('algorithm')}
          onClick={shouldDisplayParams ? null : () => onSort('algorithm')}
        >
          {'Algorithm'}
          {shouldDisplayParams &&
            <span className="alg-name">{`(${formatAlgorithm(selectedAlgorithm)})`}</span>
          }
        </Table.HeaderCell>
        <Table.HeaderCell rowSpan={shouldDisplayParams ? 0 : 2}>
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
