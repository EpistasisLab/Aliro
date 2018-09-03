require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import SceneHeader from '../SceneHeader';
import { Grid, Segment, Header, Table, Loader } from 'semantic-ui-react';
import { formatDataset, formatTime } from 'utils/formatter';
import Papa from 'papaparse';

class Dataset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: 'fetching',
      dataPreview: null
    };
  }

  componentDidMount() {
    fetch(`/api/datasets/${this.props.params.id}`)
      .then(response => {
        if(response.status >= 400) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(dataset => this.setState({ dataset: dataset[0] }));
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.dataset !== prevState.dataset) {
      fetch(`/api/v1/files/${this.state.dataset.files[0]._id}`)
        .then(response => {
          if(response.status >= 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          this.setState({ dataPreview: Papa.parse(text, { header: true, preview: 100 }) });
        });
    }
  }

  render() {
    const { dataset, dataPreview } = this.state;

    if(dataset === 'fetching') { return null; }

    // sort metafeatures in desired order
    let first = ['n_rows', 'n_columns', 'n_classes']; // priority metafeatures
    let empty = []; // metafeatures that have no value
    let rest = [];  // rest of metafeatures

    Object.entries(dataset.metafeatures).forEach(([key, value]) => {
      if(first.includes(key)) { return; }
      if(value === null) { empty.push(key); }
      else { rest.push(key); }
    });

    // join the categorized metafeatures into one array
    const allMetafeatures = first.concat(rest).concat(empty);

    return (
      <div>
        <SceneHeader header={formatDataset(dataset.name)} />
        <Grid columns={2}>
          <Grid.Column>
            <Segment inverted attached="top" className="panel-header">
              <Header as="h3" content="File Details" />
            </Segment>
            <Segment inverted attached="bottom">
              <Grid>
                <Grid.Row columns={2}>
                  <Grid.Column>
                    <Header
                      as="h4"
                      inverted
                      color="grey"
                      content="Upload Date"
                      subheader={formatTime(dataset.files[0].timestamp)}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <Header
                      as="h4"
                      inverted
                      color="grey"
                      content="Filename"
                      subheader={dataset.files[0].filename}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={1}>
                  <Grid.Column>
                    <Header
                      as="h4"
                      inverted
                      color="grey"
                      content="Data Preview"
                      style={{ display: 'inline', marginRight: '0.5em' }}
                    />
                    <span className="muted">(first 100 rows)</span>
                    <Segment style={{ height: '500px' }}>
                      {dataPreview ? (
                        <div style={{ overflow: 'scroll', maxHeight: '470px' }}>
                          <Table inverted celled compact unstackable singleLine>
                            <Table.Header>
                              <Table.Row>
                                {dataPreview.meta.fields.map(field =>
                                  <Table.HeaderCell key={field}>{field}</Table.HeaderCell>
                                )}
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {dataPreview.data.slice(0, 100).map((row, i) =>
                                <Table.Row key={i}>
                                  {dataPreview.meta.fields.map(field =>
                                    <Table.Cell key={`${i}-${field}`}>{row[field]}</Table.Cell>
                                  )}
                                </Table.Row>
                              )}
                            </Table.Body>
                          </Table>
                        </div>
                      ) : (
                        <Loader inverted active content="Loading data preview" />
                      )}
                    </Segment>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment inverted attached="top" className="panel-header">
              <Header as="h3" content="Metafeatures" style={{ display: 'inline', marginRight: '0.5em' }} />
              <span className="muted">{`${Object.keys(dataset.metafeatures).length} total`}</span>
            </Segment>
            <Segment inverted attached="bottom">
              <div style={{ overflow: 'scroll', maxHeight: '594px' }}>
                <Table inverted celled compact unstackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Field</Table.HeaderCell>
                      <Table.HeaderCell>Value</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {allMetafeatures.map(field =>
                      <Table.Row key={field}>
                        <Table.Cell>{field}</Table.Cell>
                        <Table.Cell>{dataset.metafeatures[field]}</Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Dataset;
