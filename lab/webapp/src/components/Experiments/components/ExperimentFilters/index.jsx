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
import { Form, Dropdown, Header } from 'semantic-ui-react';

function ExperimentFilters({ 
  filters,
  displayCount,
  updateQuery, 
  resetQuery 
}) {
  return (
    <span className="filters">
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
            label="Prediction Type:"
            control={Dropdown} 
            value={filters.prediction.selected}
            options={filters.prediction.options}
            onChange={(e, data) => updateQuery('prediction', data.value)}
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
            className="reset"
          />
          <div className="experiment-count float-right">
            <Header inverted size="small" content={`${displayCount} experiment${displayCount === 1 ? '' : 's'}`} />
          </div>
        </Form.Group>
      </Form>
    </span>  
  );
}

export default ExperimentFilters;