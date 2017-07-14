import React, { Component } from 'react';
import { Table, Header, Label } from 'semantic-ui-react';

class ExperimentStatus extends Component {
  render() {

    const { 
      filter,
      experiments, 
      notifications 
    } = this.props;

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
                  {experiments.get('pending')}<br />
                  experiments<br />
                  pending
                </Header>
              </a>  
            </Table.Cell>
            <Table.Cell selectable textAlign="center">
              <a href={filterLink + 'running'}>
                <Header inverted size="tiny">
                  {experiments.get('running')}<br />
                  experiments<br />
                  running
                </Header>
              </a>  
            </Table.Cell>
            <Table.Cell selectable textAlign="center">
              <a href={filterLink + 'success'}>
                <Header inverted size="tiny">
                  {experiments.get('finished')}<br />
                  results
                </Header>
              </a>
              {notifications.get('error') > 0 &&
                <Label 
                  color="red" 
                  size="tiny"
                  floating
                  content={`${notifications.get('error')} error`}
                />
              }
              {!notifications.get('error') && notifications.get('new') > 0 &&
                <Label 
                  color="green" 
                  size="tiny"
                  floating
                  content={`${notifications.get('new')} new`}
                />
              }   
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }
}

export default ExperimentStatus;