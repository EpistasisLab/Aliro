/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - Michael Stauffer (stauffer@upenn.edu)
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

(Autogenerated header, do not modify)

*/
import React from 'react';
import ExperimentsTableHeader from './components/ExperimentsTableHeader';
import ExperimentsTableBody from './components/ExperimentsTableBody';
import { Table } from 'semantic-ui-react';

function ExperimentsTable({
  experiments, 
  filters,
  sort,
  updateQuery
}) {
  const selectedStatus = filters.status.selected;

  const selectedDataset = filters.dataset.selected;

  const selectedAlgorithm = filters.algorithm.selected;

  const currentParameters = experiments[0].params;

  const shouldDisplayQuality = selectedStatus === 'suggested';

  const shouldDisplayAwards = selectedDataset !== 'all';

  const shouldDisplayParams = selectedAlgorithm !== 'all' && Object.keys(currentParameters).length > 0;

  const shouldDisplayErrorMessage = selectedStatus === 'fail';

  const orderedParamKeys = Object.keys(currentParameters).sort();

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
          shouldDisplayQuality={shouldDisplayQuality}
          shouldDisplayParams={shouldDisplayParams}
          shouldDisplayErrorMessage={shouldDisplayErrorMessage}
          orderedParamKeys={orderedParamKeys}
          sort={sort}
          updateQuery={updateQuery}
        />
        <ExperimentsTableBody
          experiments={experiments}
          shouldDisplayQuality={shouldDisplayQuality}
          shouldDisplayAwards={shouldDisplayAwards}
          shouldDisplayParams={shouldDisplayParams}
          shouldDisplayErrorMessage={shouldDisplayErrorMessage}
          orderedParamKeys={orderedParamKeys}
        />
      </Table>
    </div>  
  );
}

export default ExperimentsTable;