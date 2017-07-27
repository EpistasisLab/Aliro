import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
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

  const currentParameters = experiments.first().get('params');

  const shouldDisplayQuality = selectedStatus === 'suggested';

  const shouldDisplayAwards = selectedDataset !== 'all';

  const shouldDisplayParams = selectedAlgorithm !== 'all' && currentParameters.size > 0;

  const orderedParamKeys = currentParameters.keySeq().sort();

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
          orderedParamKeys={orderedParamKeys}
          sort={sort}
          updateQuery={updateQuery}
        />
        <ExperimentsTableBody
          experiments={experiments}
          shouldDisplayQuality={shouldDisplayQuality}
          shouldDisplayAwards={shouldDisplayAwards}
          shouldDisplayParams={shouldDisplayParams}
          orderedParamKeys={orderedParamKeys}
        />
      </Table>
    </div>  
  );
}

ExperimentsTable.propTypes = {
  experiments: ImmutablePropTypes.list.isRequired,
  filters: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  updateQuery: PropTypes.func.isRequired
};

export default ExperimentsTable;