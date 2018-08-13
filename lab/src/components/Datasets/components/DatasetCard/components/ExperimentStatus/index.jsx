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