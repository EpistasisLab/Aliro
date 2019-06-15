require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import SceneHeader from '../SceneHeader';
import DatasetModal from './components/DatasetModal';
import { Grid, Segment, Header, Table, Loader, Icon, Menu } from 'semantic-ui-react';
import { formatDataset, formatTime } from 'utils/formatter';
import Papa from 'papaparse';

class Dataset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: 'fetching',
      dataPreview: null,
      activeItem: 'details'
    };
    this.fileDetailsClick = this.fileDetailsClick.bind(this);
    this.getCatAndOrdTable = this.getCatAndOrdTable.bind(this);
    this.handleCloseFileDetails = this.handleCloseFileDetails.bind(this);
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
  handleItemClick = (e, { name }) => this.setState({ activeItem: name });
  fileDetailsClick(e) {
    //e.preventDefault();
    //window.console.log('clicked file details');
    const { dataset } = this.state;
    const tempFile = dataset.files[0];
    let testObj = {
      name: tempFile.filename,
      schema: tempFile
    };
    this.setState({
      metadataStuff: testObj
    });
  }

  handleCloseFileDetails() {
    this.setState({ metadataStuff: null });
  }

  getCatAndOrdTable() {
    const { dataset } = this.state;

    if(dataset === 'fetching') { return null; }

    // categorical_features & ordinal_features
    let cat_feats = dataset.files[0].categorical_features;
    let ord_feats = dataset.files[0].ordinal_features;
    let ord_body = [];
    Object.entries(ord_feats) && Object.entries(ord_feats).forEach(([key,value]) => {
      // window.console.log("ord feats key: ", key);
      // window.console.log("ord feats val: ", value);
      ord_body.push(
        <Table.Row key={key}>
          <Table.Cell>{key}</Table.Cell>
          <Table.Cell>{value.join(",")}</Table.Cell>
        </Table.Row>
      )
    })
    // { ord_body.map(ord_item => ord_item) }
    return (
      <Grid >
        <Grid.Row columns={2}>
        <Grid.Column floated='right'>
          { Object.keys(cat_feats).length ?
            <div>
              <Segment inverted attached="top" >
                <Header as="h3" content="Categorical Features" style={{ display: 'inline', marginRight: '0.5em' }} />
                <span className="muted">{`${Object.keys(cat_feats).length} total`}</span>
              </Segment>
              <Segment inverted attached="bottom">
                <div style={{ overflow: 'scroll', maxHeight: '594px' }}>
                  <Table inverted celled compact unstackable>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Feature</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {cat_feats.map(field =>
                        <Table.Row key={field}>
                          <Table.Cell>{field}</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>
              </Segment>
            </div>
            : <Segment inverted attached="top">
                <Header as="h3" content="No Categorical Features" style={{ display: 'inline', marginRight: '0.5em' }} />
              </Segment>
          }
          </Grid.Column>
          <Grid.Column floated='right'>
            { Object.keys(ord_feats).length ?
              <div>
                <Segment inverted attached="top" >
                  <Header as="h3" content="Ordinal Features" style={{ display: 'inline', marginRight: '0.5em' }} />
                  <span className="muted">{`${Object.keys(ord_feats).length} total`}</span>
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
                        {ord_body}
                      </Table.Body>
                    </Table>
                  </div>
                </Segment>
              </div>
              : <Segment inverted attached="top" className="cat-and-ord-dataset-table">
                  <Header as="h3" content="No Ordinal Features" style={{ display: 'inline', marginRight: '0.5em' }} />
                </Segment>
            }
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  render() {
    const { dataset, dataPreview, metadataStuff, activeItem } = this.state;

    if(dataset === 'fetching') { return null; }

    // sort metafeatures in desired order
    let first = ['n_rows', 'n_columns', 'n_classes']; // priority metafeatures
    let empty = []; // metafeatures that have no value
    let rest = [];  // rest of metafeatures

    // categorical_features & ordinal_features
    let cat_feats = dataset.files[0].categorical_features;
    let ord_feats = dataset.files[0].ordinal_features;

    //window.console.log("cat feats: ", cat_feats);
    //window.console.log("ord feats: ", ord_feats);

    let catAndOrdTable = this.getCatAndOrdTable();

    Object.entries(dataset.metafeatures).forEach(([key, value]) => {
      if(first.includes(key)) { return; }
      if(value === null) { empty.push(key); }
      else { rest.push(key); }
    });

    // join the categorized metafeatures into one array
    const allMetafeatures = first.concat(rest).concat(empty);
    // look at donormodal from hpap for tabular menu example
    return (
      <div>
        <DatasetModal project={metadataStuff} handleClose={this.handleCloseFileDetails} />
        <SceneHeader header={formatDataset(dataset.name)} />
        <Menu>
          <Menu.Item name='details' active={activeItem === 'details'} onClick={this.handleItemClick} />
          <Menu.Item name='metafeatures' active={activeItem === 'metafeatures'} onClick={this.handleItemClick} />
        </Menu>
        <Grid columns={2}>
          <Grid.Column >
            <Segment inverted attached="top" className="panel-header" style={{maxHeight: '53px'}}>
              <Header as="h3" content="File Details" />
              <Icon
                name="info circle"
                onClick={(e) => this.fileDetailsClick(e)}
                style={{position: 'absolute', top: '11px', left: '95%', cursor: 'pointer'}}
              />
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
