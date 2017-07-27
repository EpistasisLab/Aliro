import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
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
                {experiments.get('pending')}<br />
                {`experiment${experiments.get('pending') === 1 ? '' : 's'}`}<br />
                {'pending'}
              </Header>
            </a>  
          </Table.Cell>
          <Table.Cell selectable textAlign="center">
            <a href={filterLink + 'running'}>
              <Header inverted size="tiny">
                {experiments.get('running')}<br />
                {`experiment${experiments.get('running') === 1 ? '' : 's'}`}<br />
                {'running'}
              </Header>
            </a>  
          </Table.Cell>
          <Table.Cell selectable textAlign="center">
            <a href={filterLink + 'success'}>
              <Header inverted size="tiny">
                {experiments.get('finished')}<br />
                {`result${experiments.get('finished') === 1 ? '' : 's'}`}<br />
              </Header>
            </a>
            {notifications.get('error') > 0 &&
              <Label 
                color="red" 
                size="tiny"
                floating
                content={`${notifications.get('error')} error${experiments.get('error') === 1 ? '' : 's'}`}
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

ExperimentStatus.propTypes = {
  filter: PropTypes.string.isRequired,
  experiments: ImmutablePropTypes.map.isRequired,
  notifications: ImmutablePropTypes.map.isRequired
};

export default ExperimentStatus;