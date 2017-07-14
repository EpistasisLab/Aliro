import React from 'react';
import { Form, Dropdown } from 'semantic-ui-react';

function ExperimentFilters({filters, updateQuery, resetQuery}) {
 

  return (
    <Form inverted>
      <Form.Group>
        <Form.Field 
          inline
          label="Status:"
          control={Dropdown}
          value={filters.status.selected}
          options={filters.status.options}
          onChange={(e, data) => updateQuery('status', data.value)}
          className="filter"
        />
        <Form.Field 
          inline
          label="Dataset:"
          control={Dropdown} 
          value={filters.dataset.selected}
          options={filters.dataset.options}
          onChange={(e, data) => updateQuery('dataset', data.value)}
          className="filter"
        />
        <Form.Field 
          inline
          label="Algorithm:"
          control={Dropdown} 
          value={filters.algorithm.selected}
          options={filters.algorithm.options} 
          onChange={(e, data) => updateQuery('algorithm', data.value)}
          className="filter"
        />
        <Form.Button
          inline
          inverted 
          color="blue"
          size="mini" 
          compact
          content="Reset filters"
          type="button"
          onClick={() => resetQuery()}
        />
      </Form.Group>
    </Form>
  );
}

export default ExperimentFilters;