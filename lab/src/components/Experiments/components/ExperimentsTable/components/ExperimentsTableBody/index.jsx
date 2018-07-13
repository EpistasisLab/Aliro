import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Icon, Popup, Dropdown } from 'semantic-ui-react';
import { formatTime, formatDataset, formatAlgorithm } from '../../../../../../utils/formatter';

function ExperimentsTableBody({
  experiments,
  shouldDisplayQuality,
  shouldDisplayAwards,
  shouldDisplayParams,
  orderedParamKeys
}) {
  const getExperimentLink = (experiment) => {
    const status = experiment.get('status');
    const id = experiment.get('_id');

    if(status === 'suggested' || status === 'pending') {
      return `/#/builder?experiment=${id}`;
    } else {
      return `/#/results/${id}`;
    }
  };

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'suggested': 
        return <Icon inverted color="purple" name="android" />;
      case 'pending': 
        return <Icon inverted color="yellow" name="clock" />;
      case 'running':
        return <Icon inverted loading color="blue" name="refresh" />;
      case 'success': 
        return <Icon inverted color="green" name="check" />;
      case 'cancelled':
        return <Icon inverted color="red" name="ban" />;
      case 'fail':
        return <Icon inverted color="red" name="warning sign" />;
      default: 
        return;
    }
  };

  const renderAwardPopup = (experiment) => {
    switch(experiment.get('award')) {
      case 'best_overall':
        return (
          <Popup
            trigger={<Icon inverted color="yellow" size="large" name="trophy" className="float-right" />}
            content="Best overall result for this dataset"
          />
        );
      case 'best_for_algorithm':
        return (
          <Popup
            trigger={<Icon inverted color="grey" size="large" name="trophy" className="float-right" />}
            content={`Best result for this dataset with ${formatAlgorithm(experiment.get('algorithm'))}`}
          />
        );
      default:
        return; 
    }
  };

  return (
    <Table.Body>
      {experiments.map(experiment => {
        const experimentLink = getExperimentLink(experiment);
        return (
          <Table.Row 
            key={experiment.get('_id')}
            className={experiment.get('notification')}
          >
            <Table.Cell selectable>
              <a href={experimentLink}>
                {renderStatusIcon(experiment.get('status'))} 
                {formatTime(experiment.get('started'))}
              </a>  
            </Table.Cell>
            {shouldDisplayQuality ? (
              <Table.Cell selectable>
                <a href={experimentLink}>
                  {experiment.get('quality_metric').toFixed(2)}
                </a>  
              </Table.Cell>
            ) : (
              <Table.Cell selectable>
                <a href={experimentLink}>
                  {experiment.getIn(['scores', 'accuracy_score']) ? 
                    experiment.getIn(['scores', 'accuracy_score']).toFixed(2) : '-'
                  }
                  {shouldDisplayAwards && renderAwardPopup(experiment)}
                </a>  
              </Table.Cell>
            )}
            <Table.Cell selectable>
              <a href={experimentLink}>
                {formatDataset(experiment.get('dataset_name'))}
              </a>  
            </Table.Cell>
            {shouldDisplayParams ? (
              orderedParamKeys.map((key) => (
                <Table.Cell key={[experiment._id, key]} selectable>
                  <a href={experimentLink}>
                    {experiment.getIn(['params', key]).toString() || '-'}
                  </a>
                </Table.Cell>
              ))
            ) : (
              <Table.Cell selectable>
                <a href={experimentLink}>
                  {formatAlgorithm(experiment.get('algorithm'))}
                </a>  
              </Table.Cell> 
            )}
            <Table.Cell textAlign="center">
              <Dropdown 
                pointing="top right" 
                icon={<Icon inverted color="grey" size="large" name="caret down" />}
              >
                <Dropdown.Menu>
                  <Dropdown.Item icon="download" text="Download results" />
                </Dropdown.Menu>
              </Dropdown>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </Table.Body>
  );
}

ExperimentsTableBody.propTypes = {
  experiments: ImmutablePropTypes.list.isRequired,
  shouldDisplayQuality: PropTypes.bool.isRequired,
  shouldDisplayAwards: PropTypes.bool.isRequired,
  shouldDisplayParams: PropTypes.bool.isRequired,
  orderedParamKeys: ImmutablePropTypes.seq.isRequired
};

export default ExperimentsTableBody;