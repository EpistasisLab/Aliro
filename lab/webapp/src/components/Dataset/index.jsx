require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import SceneHeader from '../SceneHeader';
import DatasetModal from './components/DatasetModal';
import { Grid, Segment, Header, Table, Loader, Icon, Menu, Tab } from 'semantic-ui-react';
import { formatDataset, formatTime } from 'utils/formatter';
import Papa from 'papaparse';
import * as d3 from "d3";

class Dataset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: 'fetching',
      dataPreview: null
    };
    this.fileDetailsClick = this.fileDetailsClick.bind(this);
    this.getCatAndOrdTable = this.getCatAndOrdTable.bind(this);
    this.handleCloseFileDetails = this.handleCloseFileDetails.bind(this);
    this.getTabMenu = this.getTabMenu.bind(this);
    this.getSummaryTab = this.getSummaryTab.bind(this);
    this.createChart = this.createChart.bind(this);
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
          //this.createChart();
        });
    }
    this.createChart();
  }
  //handleItemClick = (e, { name }) => this.setState({ activeItem: name });
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

  createChart() {
    const { dataset, dataPreview } = this.state;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    // let svg = d3.select("#test_chart")
    // .append("svg")
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    //   .attr("transform",
    //         "translate(" + margin.left + "," + margin.top + ")");
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      let dataKeys = Object.keys(dataStuff[0]);
      let valByRowObj = {};

      dataKeys.forEach(key => {
        valByRowObj[key] = []
      });

      let valueTest = d3.values(dataStuff);
      valueTest.forEach(entry => {
        dataKeys.forEach(key => {
          valByRowObj[key].push(entry[key])
        })
      });
      window.console.log('val test ', valByRowObj);
      //https://www.d3-graph-gallery.com/graph/boxplot_basic.html
      let svgCircle = d3.select("#test_circle")
          .append("svg")
          .attr("width", 100)
          .attr("height", 100);

      svgCircle.append("circle")
        .style("stroke", "gray")
        .style("fill", "white")
        .attr("r", 40)
        .attr("cx", 50)
        .attr("cy", 50)
        .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
        .on("mouseout", function(){d3.select(this).style("fill", "white");});

      dataKeys.forEach(key => {
        let chartInnerHTML = "";
        if(document.getElementById("test_chart_" + key)) {
          chartInnerHTML = document.getElementById("test_chart_" + key).innerHTML;
        };
        // ignore dependent column, dont make boxplot
        if(chartInnerHTML === "" && key !== dataset.files[0].dependent_col) {
          width = 460 - margin.left - margin.right;
          let svg = d3.select("#test_chart_" + key)
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .style("background-color", "aliceblue")
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

          let data_sorted = valByRowObj[key].sort(d3.ascending);
          let q1 = d3.quantile(data_sorted, .25);
          let median = d3.quantile(data_sorted, .5);
          let q3 = d3.quantile(data_sorted, .75);
          let interQuantileRange = q3 - q1;
          let min = q1 - 1.5 * interQuantileRange;
          let max = q1 + 1.5 * interQuantileRange;
          let y = d3.scaleLinear()
            .domain([min, max])
            .range([height, 0]);
          svg.call(d3.axisLeft(y));
          let center = 200;
          let width = 200;
          svg
          .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min) )
            .attr("y2", y(max) )
            .attr("stroke", "black")

          // Show the box
          svg
          .append("rect")
            .attr("x", center - width/2)
            .attr("y", y(q3) )
            .attr("height", (y(q1)-y(q3)) )
            .attr("width", width )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

          // show median, min and max horizontal lines
          svg
          .selectAll("toto")
          .data([min, median, max])
          .enter()
          .append("line")
            .attr("x1", center-width/2)
            .attr("x2", center+width/2)
            .attr("y1", function(d){ return(y(d))} )
            .attr("y2", function(d){ return(y(d))} )
            .attr("stroke", "black")

          svg.enter()
             .append("text")
             .text("test text")
             .attr("x", center)
             .attr("dy", 12)
             .style("text-anchor", "end");
           //https://www.dashingd3js.com/svg-text-element
           // var textLabels = svg
           //                    .text( function (d) {
           //                      window.console.log('test d', d);
           //                      return "( " + d + ", " + d +" )";
           //                    })
           //                    .attr("font-family", "sans-serif")
           //                    .attr("font-size", "20px")
           //                    .attr("fill", "red");
        } else {

          width = 460 - margin.left - margin.right;
          let data_sorted = valByRowObj[key].sort(d3.ascending);
          let q1 = d3.quantile(data_sorted, .25);
          let median = d3.quantile(data_sorted, .5);
          let q3 = d3.quantile(data_sorted, .75);
          let interQuantileRange = q3 - q1;
          let min = q1 - 1.5 * interQuantileRange;
          let max = q1 + 1.5 * interQuantileRange;


          let svg = d3.select("#test_chart_" + key)
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .style("background-color", "aliceblue")
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

          let y = d3.scaleLinear()
            .domain([0, data_sorted.length])
            .range([height, 0]);

          svg.call(d3.axisLeft(y));

          let testSet = [... new Set(data_sorted)];

          window.console.log('test set', testSet);
          // if(testSet && testSet.length) {
          //   let x = d3.scaleBand()
          //     .range([0, testSet.length])
          //     .domain(testSet.forEach(item => item))
          //     .padding(0.2);
          //   svg.call(d3.axisBottom(x));
          // }

        }

      })
    }
  }

  getSummaryTab() {
    const { dataset, dataPreview } = this.state;
    if(dataset === 'fetching') { return null; }
    let dataKeys;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // let svg = d3.select("#test_chart")
    // .append("svg")
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    //   .attr("transform",
    //         "translate(" + margin.left + "," + margin.top + ")");
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
      let valByRowObj = {};

      dataKeys.forEach(key => {
        valByRowObj[key] = []
      });

      let valueTest = d3.values(dataStuff);
      valueTest.forEach(entry => {
        dataKeys.forEach(key => {
          valByRowObj[key].push(entry[key])
        })
      });
      window.console.log('val test ', valByRowObj);
      //this.createChart();
      //https://www.d3-graph-gallery.com/graph/boxplot_basic.html
    }

    return (
      <div id="test_feature_stuff">
        <p>
          Hello
        </p>
        <div id="test_chart"></div>

      </div>
    )
  }

  getTabMenu() {
    const { dataset, dataPreview } = this.state;
    // sort metafeatures in desired order
    let first = ['n_rows', 'n_columns', 'n_classes']; // priority metafeatures
    let empty = []; // metafeatures that have no value
    let rest = [];  // rest of metafeatures
    let dataKeys = {};
    Object.entries(dataset.metafeatures).forEach(([key, value]) => {
      if(first.includes(key)) { return; }
      if(value === null) { empty.push(key); }
      else { rest.push(key); }
    });
    // join the categorized metafeatures into one array
    const allMetafeatures = first.concat(rest).concat(empty);
    if(dataset === 'fetching') { return null; }

    // categorical_features & ordinal_features
    let cat_feats = dataset.files[0].categorical_features;
    let ord_feats = dataset.files[0].ordinal_features;

    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);

    }

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
            {/*this.getSummaryTab()*/}
            {dataKeys && dataKeys.map(key => {
              return (
                <div key={"test_chart_" + key}>
                  <p style={{color: "aliceblue"}}>
                    {"test_chart_" + key}
                  </p>
                  <div id={"test_chart_" + key}>
                  </div>
                </div>
              )
            })}

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
      }
    ];

    return testPain;
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
    const { dataset, dataPreview, metadataStuff } = this.state;
    let dataKeys;
    let testPain = [
      {
        menuItem: 'empty stuff',
        pane: 'nothin\' here'
      }
    ];
    if(dataset === 'fetching') { return null; }
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
      testPain = this.getTabMenu();
    }
    // sort metafeatures in desired order
    /*let first = ['n_rows', 'n_columns', 'n_classes']; // priority metafeatures
    let empty = []; // metafeatures that have no value
    let rest = [];  // rest of metafeatures

    Object.entries(dataset.metafeatures).forEach(([key, value]) => {
      if(first.includes(key)) { return; }
      if(value === null) { empty.push(key); }
      else { rest.push(key); }
    });

    // join the categorized metafeatures into one array
    const allMetafeatures = first.concat(rest).concat(empty);*/

    // categorical_features & ordinal_features
    let cat_feats = dataset.files[0].categorical_features;
    let ord_feats = dataset.files[0].ordinal_features;

    //window.console.log("cat feats: ", cat_feats);
    //window.console.log("ord feats: ", ord_feats);

    let catAndOrdTable = this.getCatAndOrdTable();
    //this.createChart();

    return (
      <div>
        <DatasetModal project={metadataStuff} handleClose={this.handleCloseFileDetails} />
        <SceneHeader header={formatDataset(dataset.name)} />
        <Tab
          menu={{ attached: 'top' }}
          panes={testPain}
          renderActiveOnly={true}
          onTabChange={(e, d) => {
            //window.console.log('event ', e);
            //window.console.log('data ', d);
            if(d.activeIndex === 0){
              //this.createChart()
              window.setTimeout(this.createChart, 0.5);
            }
          }}
        />
        <Grid columns={2}>
          <Grid.Column >
            <div id="test_circle"></div>
          </Grid.Column>
          <Grid.Column>
            {/*dataKeys && dataKeys.map(key => {
              return (
                <div id={"test_chart_" + key}>
                </div>
              )
            })*/}
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Dataset;
