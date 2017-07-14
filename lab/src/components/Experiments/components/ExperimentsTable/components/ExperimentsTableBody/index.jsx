import React, { Component } from 'react';
import { Table, Icon, Popup, Dropdown } from 'semantic-ui-react';
import moment from 'moment';

class ExperimentsTableBody extends Component {
  getExperimentLink(experiment) {
    const status = experiment.get('status');
    const id = experiment.get('_id');

    if(status === 'suggested' || status === 'pending') {
      return `/#/builder?experiment=${id}`;
    } else {
      return `/#/results/${id}`;
    }
  }

  getFormattedDate(date) {
    return moment(date).format('M/DD/YY h:mm a');
  }

  renderStatusIcon(status) {
    switch(status) {
      case 'suggested': 
        return <Icon inverted color="purple" name="android" />;
      case 'pending': 
        return <Icon inverted color="yellow" name="clock" />;
      case 'running':
        return <Icon inverted color="blue" name="refresh" />;
      case 'success': 
        return <Icon inverted color="green" name="check" />;
      case 'cancelled':
        return <Icon inverted color="red" name="ban" />;
      case 'fail':
        return <Icon inverted color="red" name="warning sign" />;
      default: 
        return;
    }
  }

  renderAwardPopup(experiment) {
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
            content={`Best result for this dataset with ${experiment.get('algorithm')}`}
          />
        );
      default:
        return; 
    }
  }

  render() {

    const { 
      experiments,
      shouldDisplayQuality,
      shouldDisplayAwards,
      shouldDisplayParams,
      orderedParamKeys
    } = this.props;

    return (
      <Table.Body>
        {experiments.map(experiment => (
          <Table.Row 
            key={experiment.get('_id')}
            className={experiment.get('notification')}
          >
            <Table.Cell selectable>
              <a href={this.getExperimentLink(experiment)}>
                {this.renderStatusIcon(experiment.get('status'))} 
                {this.getFormattedDate(experiment.get('started'))}
              </a>  
            </Table.Cell>
            {shouldDisplayQuality ? (
              <Table.Cell selectable>
                <a href={this.getExperimentLink(experiment)}>
                  {experiment.get('quality_metric').toFixed(2)}
                </a>  
              </Table.Cell>
            ) : (
              <Table.Cell selectable>
                <a href={this.getExperimentLink(experiment)}>
                  {experiment.getIn(['scores', 'accuracy_score']) ? 
                    experiment.getIn(['scores', 'accuracy_score']).toFixed(2) : '-'
                  }
                  {shouldDisplayAwards && this.renderAwardPopup(experiment)}
                </a>  
              </Table.Cell>
            )}
            <Table.Cell selectable>
              <a href={this.getExperimentLink(experiment)}>
                {experiment.get('dataset_name')}
              </a>  
            </Table.Cell>
            {shouldDisplayParams ? (
              orderedParamKeys.map((key) => (
                <Table.Cell key={[experiment._id, key]} selectable>
                  <a href={this.getExperimentLink(experiment)}>
                    {experiment.getIn(['params', key]).toString() || '-'}
                  </a>
                </Table.Cell>
              ))
            ) : (
              <Table.Cell selectable>
                <a href={this.getExperimentLink(experiment)}>
                  {experiment.get('algorithm')}
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
        ))}
      </Table.Body>
    );
  }
}

export default ExperimentsTableBody;