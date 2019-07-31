import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatDataset, formatTime } from 'utils/formatter';
import { Header, Tab, Segment, Grid, Loader, Table, Icon } from 'semantic-ui-react';
import BarChart from '../BarChart/';
import BarCharts from '../BarCharts/';
import BoxPlot from '../BoxPlot/';
import ViolinChart from '../ViolinChart/';
import * as d3 from "d3";

class DatasetMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.getTabMenu = this.getTabMenu.bind(this);
    this.getDataValByRow = this.getDataValByRow.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createCharts();
  }

  // aggregate all available column values grouped by row, i.e all values for
  // column 'At1' into returned obj
  getDataValByRow() {
    const { dataset, dataPreview } = this.props;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      let dataKeys = Object.keys(dataStuff[0]);
      let valByRowObj = {};
      // initialize empty obj with dataset column names as keys
      dataKeys.forEach(key => {
        let tempKey = key.replace(/ /g, "_");
        valByRowObj[tempKey] = []
      });
      let valueTest = d3.values(dataStuff);
      valueTest.forEach(entry => {
        dataKeys.forEach(key => {
          let tempKey = key.replace(/ /g, "_");
          // add some checks to prevent loading empty/garbage data
          typeof entry[key] !== 'undefined'
            && entry[key] !== ''
            && valByRowObj[tempKey].push(entry[key])
        })
      });
      //window.console.log('val test ', valByRowObj);
      return valByRowObj;
    }
  }

  getTabMenu() {
    const { dataset, dataPreview, fileDetailsClick } = this.props;
    // sort metafeatures in desired order
    let first = ['n_rows', 'n_columns', 'n_classes']; // priority metafeatures
    let empty = []; // metafeatures that have no value
    let rest = [];  // rest of metafeatures
    let dataKeys;
    Object.entries(dataset.metafeatures).forEach(([key, value]) => {
      if(first.includes(key)) { return; }
      if(value === null) { empty.push(key); }
      else { rest.push(key); }
    });
    // join the categorized metafeatures into one array
    const allMetafeatures = first.concat(rest).concat(empty);
    if(dataset === 'fetching') { return null; }

    // categorical_features & ordinal_features
    let cat_feats = dataset.files[0].categorical_features; // list of column names
    // object with key/val pair - key is column name, val is ordered list
    let ord_feats = dataset.files[0].ordinal_features;
    let dep_col = dataset.files[0].dependent_col;
    let ordKeys =  Object.keys(ord_feats);
    let valByRowObj = this.getDataValByRow();

    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab all dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
      // rearrange array - last element tends to be target class/dependent_col
      // not sure if it's safe to make this assumption
      //dataKeys.splice(0, 0, dataKeys.pop());
      // check place of dependent_col manually/safetly
      let depColIndex = dataKeys.indexOf(dep_col);
      // remove item
      dataKeys.splice(depColIndex, 1);
      // add target class/dependent_col as first element
      dataKeys.splice(0, 0, dep_col);
      let dataType;
      let testPain = [
        {
          menuItem: 'Summary',
          render: () => (
            <Tab.Pane>
              <Segment inverted attached="bottom">
                <span>{`# of Rows: ${dataset.metafeatures.n_rows}`}</span>
                <br/>
                <span>{`# of Columns: ${dataset.metafeatures.n_columns}`}</span>
                <br/>
                <span>{`# of Classes: ${dataset.metafeatures.n_classes}`}</span>
              </Segment>
              <Grid columns={3} divided celled='internally'>
                <Grid.Row columns={3} centered>
                  <Grid.Column width={2}>
                    <Header
                      as="h4"
                      inverted
                      color="grey"
                      content="Name"
                    />
                  </Grid.Column>
                  <Grid.Column width={2}>
                    <Header
                      as="h4"
                      inverted
                      color="grey"
                      content="Type"
                    />
                  </Grid.Column>
                  <Grid.Column width={5}>
                    <Header
                      as="h4"
                      inverted
                      color="grey"
                      content="Chart"
                    />
                  </Grid.Column>
                </Grid.Row>
                {

                  // display boxplots
                  dataKeys && dataKeys.map(key => {
                    // loop through dataset column name/key for charts later on
                    // need to be careful with this key - replace spaces with '_'
                    let tempKey = key.replace(/ /g, "_");
                    cat_feats.indexOf(key) > -1 || ordKeys.indexOf(key) > -1
                      ? dataType = 'nominal' : dataType = 'numeric';
                    key === dep_col
                      ? dataType = 'nominal' : null;
                    // default value for chart - make box plot
                    let tempChart = (
                      <BoxPlot
                        key={tempKey}
                        tempKey={key}
                        dataPreview={dataPreview}
                        valByRowObj={valByRowObj}
                      />);

                    // override tempChart depending on type of data

                    // check for categorical columns (display stacked bar chart)
                    cat_feats.indexOf(key) > -1 ? tempChart = (
                      <div key={"cat_chart_" + tempKey}>
                        <BarCharts
                          colKey={key}
                          depCol={dep_col}
                          dataPreview={dataPreview}
                          valByRowObj={valByRowObj}
                        />
                      </div>
                    ) : null;
                    // check for ordinal columns (display stacked bar chart)
                    ordKeys.indexOf(key) > -1 ? tempChart = (
                      <div key={"ord_chart_" + tempKey}>
                        {/*<p style={{color: "green"}}>
                          {"ordinal_chart_for: " + tempKey}
                        </p>*/}
                        <BarCharts
                          colKey={key}
                          depCol={dep_col}
                          dataPreview={dataPreview}
                          valByRowObj={valByRowObj}
                        />
                      </div>
                    ) : null;
                    // create bar chart for dependent_col/target class
                    key === dep_col
                      ? tempChart = (
                        <BarChart
                          tempKey={key}
                          dataset={dataset}
                          dataPreview={dataPreview}
                          valByRowObj={valByRowObj}
                        />
                      ) : null;
                    // if target class add '(target)'
                    //key === dep_col ? tempKey += '(target)' : null;
                    let gridList = [];
                    gridList.push(
                      <Grid.Row centered>
                        <Grid.Column width={2}>
                          <div style={{color: 'white'}}>
                            {tempKey}
                            { // if target class add '(target)'
                              key === dep_col
                              ? (<b>
                                  (target)
                                </b>)
                              : null
                            }
                          </div>
                        </Grid.Column>
                        <Grid.Column width={2}>
                          <div style={{color: 'white'}}>
                            {dataType}
                          </div>
                        </Grid.Column>
                        <Grid.Column width={5}>

                            {tempChart}

                        </Grid.Column>
                      </Grid.Row>
                    );

                    return gridList;
                  })
                }
              </Grid>
            </Tab.Pane>
          )
        },
        {
          menuItem: 'Details',
          render: () => (
            <Tab.Pane>
              <Segment inverted attached="top" className="panel-header" style={{maxHeight: '53px'}}>
                <Header as="h3" content="File Details" />
                <Icon
                  name="info circle"
                  onClick={(e) => fileDetailsClick(e)}
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
            </Tab.Pane>
          )
        },{
          menuItem: 'Metafeatures',
          render: () => (
            <Tab.Pane>
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
            </Tab.Pane>
          )
        },{
          menuItem: 'violin test',
          render: () => (
            <Tab.Pane>
              <Segment inverted attached="top" className="panel-header">
                <Header as="h3" content="test violin" style={{ display: 'inline', marginRight: '0.5em' }} />
              </Segment>
              <Segment inverted attached="bottom">

                {
                  dataKeys && dataKeys.map(key => {
                    let tempKey = key.replace(/ /g, "_");
                    return (<ViolinChart
                      key={tempKey}
                      tempKey={key}
                      dataPreview={dataPreview}
                      valByRowObj={valByRowObj}
                    />);
                  })
                }
              </Segment>
            </Tab.Pane>
          )
        }
      ];
      return testPain;
  }
}

  render() {
    let stuff = this.getTabMenu();
    return (
      <div>
        <Tab
          menu={{ attached: 'top', inverted: 'true' }}
          panes={stuff}
          renderActiveOnly={true}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { DatasetMenu };
export default connect(mapStateToProps, {})(DatasetMenu);
