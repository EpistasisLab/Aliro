import React from 'react';
import { Table, Icon, Popup, Dropdown } from 'semantic-ui-react';
import { formatTime, formatDataset, formatAlgorithm } from 'utils/formatter';

function ExperimentsTableBody({
  experiments,
  shouldDisplayQuality,
  shouldDisplayAwards,
  shouldDisplayParams,
  shouldDisplayErrorMessage,
  orderedParamKeys
}) {
  const getExperimentLink = (experiment) => {
    const status = experiment.status;
    const id = experiment._id;

    if(status === 'suggested' || status === 'pending' && status !== 'fail') {
      return `/#/builder?experiment=${id}`;
    } else if (status === 'fail') {
      return `/#/experiments?status=fail`;
    } else if (status === 'cancelled') {
      return `/#/experiments`;
    } else {
      return `/#/results/${id}`;
    }
  };

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'suggested':
        return (
          <Popup
            size="tiny"
            position="top center"
            content="Suggested"
            trigger={<Icon inverted color="purple" name="android" />}
          />
        );
      case 'pending':
        return (
          <Popup
            size="tiny"
            position="top center"
            content="Pending"
            trigger={<Icon inverted color="yellow" name="clock" />}
          />
        );
      case 'running':
        return (
          <Popup
            size="tiny"
            position="top center"
            content="Running"
            trigger={<Icon inverted loading color="blue" name="refresh" />}
          />
        );
      case 'success':
        return (
          <Popup
            size="tiny"
            position="top center"
            content="Success"
            trigger={<Icon inverted color="green" name="check" />}
          />
        );
      case 'cancelled':
        return (
          <Popup
            size="tiny"
            position="top center"
            content="Cancelled"
            trigger={<Icon inverted color="red" name="ban" />}
          />
        );
      case 'fail':
        return (
          <Popup
            size="tiny"
            position="top center"
            content="Failed"
            trigger={<Icon inverted color="red" name="warning sign" />}
          />
        );
      default:
        return;
    }
  };

  const renderAwardPopup = (experiment) => {
    switch(experiment.award) {
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
            content={`Best result for this dataset with ${formatAlgorithm(experiment.algorithm)}`}
          />
        );
      default:
        return;
    }
  };

  const cancelExperiment = (id) => {
    const host_url = `${window.location.protocol}//${window.location.hostname}`;
    fetch(`${host_url}:5081/experiments/${id}/kill`, { method: 'POST' })
      .then(response => {
        if(response.status >= 400) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      });
  };

  const downloadModel = (id) => {
    fetch(`/api/v1/experiments/${id}/model`)
      .then(response => {
        if(response.status >= 400) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(json => {
        window.location = `/api/v1/files/${json._id}`;
      });
  };

  const downloadScript = (id) => {
    fetch(`/api/v1/experiments/${id}/script`)
      .then(response => {
        if(response.status >= 400) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(json => {
        window.location = `/api/v1/files/${json._id}`;
      });
  };


  return (
    <Table.Body>
      {experiments.map(experiment => {
        const experimentLink = getExperimentLink(experiment);
        return (
          <Table.Row
            key={experiment._id}
            className={experiment.notification}
          >
            <Table.Cell selectable>
              <a href={experimentLink}>
                {renderStatusIcon(experiment.status)}
                {formatTime(experiment.started)}
              </a>
            </Table.Cell>
            {shouldDisplayQuality ? (
              <Table.Cell selectable>
                <a href={experimentLink}>
                  {experiment.quality_metric.toFixed(2)}
                </a>
              </Table.Cell>
            ) : (
              <Table.Cell selectable>
                <a href={experimentLink}>
                  {experiment.scores.exp_table_score ?
                    experiment.scores.exp_table_score.toFixed(2) : '-'
                  }
                  {shouldDisplayAwards && renderAwardPopup(experiment)}
                </a>
              </Table.Cell>
            )}
            <Table.Cell selectable>
              <a href={experimentLink}>
                {formatDataset(experiment.dataset_name)}
              </a>
            </Table.Cell>
            {shouldDisplayErrorMessage &&
              <Table.Cell selectable>
              <a href={experimentLink}>
                {formatDataset(experiment.errorMessage)}
              </a>
            </Table.Cell>
            }
            {shouldDisplayParams ? (
              orderedParamKeys.map((key) => (
                <Table.Cell key={[experiment._id, key]} selectable>
                  <a href={experimentLink}>
                    {experiment.params[key].toString() || '-'}
                  </a>
                </Table.Cell>
              ))
            ) : (
              <Table.Cell selectable>
                <a href={experimentLink}>
                  {formatAlgorithm(experiment.algorithm)}
                </a>
              </Table.Cell>
            )}
            <Table.Cell textAlign="center">
              <Dropdown
                pointing="top right"
                icon={<Icon inverted color="grey" size="large" name="caret down" />}
                disabled={['cancelled', 'fail'].includes(experiment.status)}
              >
                <Dropdown.Menu>
                  {experiment.status === 'running' &&
                    <Dropdown.Item
                      icon="cancel"
                      text="Cancel experiment"
                      onClick={() => cancelExperiment(experiment._id)}
                    />
                  }
                  {experiment.status === 'success' &&
                    [
                      <Dropdown.Item
                        key="model"
                        icon="download"
                        text="Download model"
                        onClick={() => downloadModel(experiment._id)}
                      />,
                      <Dropdown.Item
                        key="script"
                        icon="download"
                        text="Download script"
                        onClick={() => downloadScript(experiment._id)}
                      />
                    ]
                  }
                </Dropdown.Menu>
              </Dropdown>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </Table.Body>
  );
}

export default ExperimentsTableBody;
