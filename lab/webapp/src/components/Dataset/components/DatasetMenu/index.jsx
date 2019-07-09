import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatDataset, formatTime } from 'utils/formatter';
import { Header, Tab, Segment, Grid, Loader, Table, Icon } from 'semantic-ui-react';
import BarChart from '../BarChart/';
import BarCharts from '../BarCharts/';
import BoxPlot from '../BoxPlot/';
import * as d3 from "d3";

class DatasetMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.getTabMenu = this.getTabMenu.bind(this);
    this.getDataValByRow = this.getDataValByRow.bind(this);

    this.createCharts = this.createCharts.bind(this);
    this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    this.createCharts();
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

  createCharts() {
    const { dataset, dataPreview } = this.props;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    // only attempt to make charts if parsed data preview is available
    if(dataPreview) {
      let valByRowObj = this.getDataValByRow();
      let dataKeys;
      //window.console.log('val test ', valByRowObj);
      if(dataPreview) {
        let dataStuff = dataPreview.data;
        // grab dataset columns names from first entry
        dataKeys = Object.keys(dataStuff[0]);
      }
      //https://www.d3-graph-gallery.com/graph/boxplot_basic.html
      dataKeys && dataKeys.forEach(key => {
        // only attempt to make charts once
        let tempKey = key.replace(/ /g, "_");
        let chartInnerHTML = "";
        if(document.getElementById("test_chart_" + tempKey)) {
          chartInnerHTML = document.getElementById("test_chart_" + tempKey).innerHTML;
        };
        // ignore dependent column, dont make boxplot
        if(chartInnerHTML === "" && tempKey !== dataset.files[0].dependent_col) {
          this.createBoxPlot(tempKey);
        } else {
          //this.createBarGraph(tempKey);
        }
      })
    }
  }

  //TODO: check accuracy of calculated statistics - not sure if correct
  //      look at 'banana' dataset
  createBoxPlot(tempKey){
    const { dataset, dataPreview } = this.props;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    let valByRowObj = this.getDataValByRow();
    let dataKeys;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
    }

    let svg = d3.select("#test_chart_" + tempKey)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "aliceblue")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let data_sorted = valByRowObj[tempKey].sort(d3.ascending);
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
    width = 200;
    svg.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min) )
      .attr("y2", y(max) )
      .attr("stroke", "black");

    // Show the box
    svg.append("rect")
      .attr("x", center - width/2)
      .attr("y", y(q3) )
      .attr("height", (y(q1)-y(q3)) )
      .attr("width", width )
      .attr("stroke", "black")
      .style("fill", "#69b3a2")
      .on("mouseover", function(){d3.select(this).style("fill", "yellow");})
      .on("mouseout", function(){d3.select(this).style("fill", "#69b3a2");});

    // show median, min and max horizontal lines
    svg.selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
      .attr("x1", center-width/2)
      .attr("x2", center+width/2)
      .attr("y1", function(d){ return(y(d))} )
      .attr("y2", function(d){ return(y(d))} )
      .attr("stroke", "black");

    svg.enter()
       .append("text")
       .text("test text")
       .attr("x", center)
       .attr("dy", 12)
       .style("text-anchor", "end");
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
    let cat_feats = dataset.files[0].categorical_features;
    let ord_feats = dataset.files[0].ordinal_features;
    let valByRowObj = this.getDataValByRow();
    let allKeys;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab all dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
      allKeys = [...dataKeys];
      let depColIndex = dataKeys.indexOf(dataset.files[0].dependent_col);
      // remove dependent_col from dataKeys list
      dataKeys.splice(depColIndex, 1);
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
            {
              // display boxplots
              dataKeys && dataKeys.map(key => {
                // loop through dataset column name/key for charts later on
                let tempKey = key.replace(/ /g, "_");
                let tempChart = (
                  <div key={"test_chart_" + tempKey}>
                    <p style={{color: "aliceblue"}}>
                      {"old_test_chart_" + tempKey}
                    </p>
                    <div id={"test_chart_" + tempKey}>
                    </div>
                    {/*<BoxPlot
                      key={tempKey}
                      tempKey={tempKey}
                      dataPreview={dataPreview}
                      valByRowObj={valByRowObj}
                    />*/}
                  </div>
                )
                return tempChart;
                // return (<BoxPlot
                //   key={tempKey}
                //   tempKey={tempKey}
                //   dataPreview={dataPreview}
                //   valByRowObj={valByRowObj}
                // />)
              })
            }
            { // display bar chart for dependent column/target/class
              valByRowObj && Object.keys(valByRowObj).length &&
              <BarChart
                tempKey={dataset.files[0].dependent_col}
                dataset={dataset}
                dataPreview={dataPreview}
                valByRowObj={valByRowObj}
              />
            }
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
        menuItem: 'Bar_Chart',
        render: () => (
          <BarChart
            tempKey={dataset.files[0].dependent_col}
            dataset={dataset}
            dataPreview={dataPreview}
            valByRowObj={valByRowObj}
          />
        )
      },{
        menuItem: 'Box_Plot',
        render: () => (
          <div>
            {
              valByRowObj
              && Object.keys(valByRowObj).length
              && dataKeys
              && dataKeys.map(key => {
                let tempKey = key.replace(/ /g, "_");
                return (<BoxPlot
                  key={tempKey}
                  tempKey={tempKey}
                  dataPreview={dataPreview}
                  valByRowObj={valByRowObj}
                />)
              })
            }
          </div>
        )
      },{
        menuItem: 'Bar_Charts',
        render: () => (
          <BarCharts
            tempKey={dataset.files[0].dependent_col}
            dataset={dataset}
            keys={allKeys}
            dataPreview={dataPreview}
            valByRowObj={valByRowObj}
          />
        )
      }
    ];

    return testPain;
  }

  render() {
    let stuff = this.getTabMenu();
    return (
      <div>
        <Tab
          menu={{ attached: 'top' }}
          panes={stuff}
          renderActiveOnly={true}
          onTabChange={(e, d) => {
            if(d.activeIndex === 0){
              // make chart for summary tab - index is 0

              // this is real bad but temp solution though,
              // try to delay call to create chart until tab is mounted in DOM?
              // not sure but guessing that tab containing html DOM elements
              // where d3 graphics will be displayed is not immediately available
              // crudely setting timeout to wait until div for d3 is ready
              window.setTimeout(this.createCharts, 1.5);
            }
          }}
        />
      </div>

    );
  }
}

const mapStateToProps = (state) => ({

});

export { DatasetMenu };
export default connect(mapStateToProps, {})(DatasetMenu);
