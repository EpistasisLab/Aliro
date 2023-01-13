/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, Cedars-Sinai Medical Center

Aliro is maintained by:
    - Jun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
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
import { Table, Header, Label } from 'semantic-ui-react';

function ExperimentStatus({ filter, experiments, notifications }) {
  const filterLink = `/#/experiments?dataset=${filter}&status=`;

  return (
    <Table 
      inverted
      attached
      unstackable
      celled 
      columns={3} 
      className="experiments"
    >
      <Table.Body>
        <Table.Row>
          <Table.Cell selectable textAlign="center">
            <a href={filterLink + 'pending'}>
              <Header inverted size="tiny">
                {experiments.pending}<br />
                {`experiment${experiments.pending === 1 ? '' : 's'}`}<br />
                {'pending'}
              </Header>
            </a>  
          </Table.Cell>
          <Table.Cell selectable textAlign="center">
            <a href={filterLink + 'running'}>
              <Header inverted size="tiny">
                {experiments.running}<br />
                {`experiment${experiments.running === 1 ? '' : 's'}`}<br />
                {'running'}
              </Header>
            </a>  
          </Table.Cell>
          <Table.Cell selectable textAlign="center">
            <a href={filterLink + 'completed'}>
              <Header inverted size="tiny">
                {experiments.finished}<br />
                {`experiment${experiments.finished === 1 ? '' : 's'}`}<br />
                {'completed'}
              </Header>
            </a>
            {notifications.error > 0 &&
              <Label 
                color="red" 
                size="tiny"
                floating
                content={`${notifications.error} error${experiments.error === 1 ? '' : 's'}`}
              />
            }
            {!notifications.error && notifications.new > 0 &&
              <Label 
                color="green" 
                size="tiny"
                floating
                content={`${notifications.new} new`}
              />
            }   
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

export default ExperimentStatus;