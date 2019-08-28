import React, { Component } from 'react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';
import { Header, Segment, Table, Grid, Loader } from 'semantic-ui-react';
import BarChart from '../Charts/BarChart/';
import BarCharts from '../Charts/BarCharts/';
import BoxPlot from '../Charts/BoxPlot/';

/**
*  Main component for dataset page update - consists mostly of d3 charts
* & creates different charts based on type of data (categorical,ordinal,etc)
*/
class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.createGridContent = this.createGridContent.bind(this);
  }

  createGridContent() {
    const {
      dataset,
      dataKeys,
      cat_feats,
      ordKeys,
      dep_col,
      dataPreview,
      valByRowObj
    } = this.props;
    const { barChartLoaded } = this.state;
    // the following block loops through the data and creates one chart
    // per entry - uses column name/key for d3 charts
    let dataType;
    let gridList = []; // list of all charts
    dataKeys && dataKeys.map(key => {
      // need to be careful with this key - replace spaces and . with _
      let tempKey = key.replace(/ /g, "_");
      tempKey = tempKey.replace(/\./g, "_");
      cat_feats.indexOf(key) > -1 || ordKeys.indexOf(key) > -1
        ? dataType = 'nominal' : dataType = 'numeric';
      key === dep_col
        ? dataType = 'nominal' : null;
      // default value for chart - make box plot
      let tempChart = (
        <BoxPlot
          cleanKey={tempKey}
          rawKey={key}
          dataPreview={dataPreview}
          valByRowObj={valByRowObj}
        />);

      // override tempChart depending on type of data

      // check for categorical columns (display stacked bar chart)
      cat_feats.indexOf(key) > -1 ? tempChart = (
        <div key={"cat_chart_" + tempKey}>
          <BarCharts
            cleanKey={tempKey}
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
          <BarCharts
            cleanKey={tempKey}
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
            key={"dep_chart_" + tempKey}
            depCol={key}
            cleanKey={tempKey}
            dataset={dataset}
            dataPreview={dataPreview}
            valByRowObj={valByRowObj}
          />
        ) : null;
      // if target class add '(target)' to chart label

      gridList.push(
        <Grid.Row key={"grid_chart_" + tempKey}>
          <Grid.Column width={2}>
            <div style={{color: 'white', paddingLeft: '10px'}}>
              {tempKey}
              { // if target class add ' (target)', &nbsp; is space
                key === dep_col
                ? (<b>
                    &nbsp;(target)
                  </b>)
                : null
              }
            </div>
          </Grid.Column>
          <Grid.Column width={2}>
            <div style={{color: 'white', paddingLeft: '10px'}}>
              {dataType}
            </div>
          </Grid.Column>
          <Grid.Column width={5}>
            <LazyLoad>
              {tempChart}
            </LazyLoad>
          </Grid.Column>
        </Grid.Row>
      );
    })

    return gridList; // what will be rendered, essentially a list of charts
  }

  render() {

    const {
      dataset,
      dataKeys,
      cat_feats,
      ordKeys,
      dep_col,
      dataPreview,
      valByRowObj
    } = this.props;

    let dataType;
    let testGridStruff = this.createGridContent();
    //window.console.log('check loading here ', testGridStruff);
    // basic loading spinner fallback - doesn't address issue of many plotly
    // charts loading in bulk. Use LazyLoad when making grid content takes
    // care of loading the charts in a timly manner
    if(testGridStruff.length === 0) {
      return (
        <Loader active inverted size="large" content="Creating charts..." />
      );
    }
    return (
      <div>
        <Segment inverted attached="top" className="panel-header" style={{maxHeight: '53px'}}>
          <Header as="h3" content="Dataset Summary" />
        </Segment>
        <Grid.Row columns={1}>
          <Grid.Column>
            <Segment inverted attached="bottom">
              <span>{`# of Rows: ${dataset.metafeatures.n_rows}`}</span>
              <br/>
              <span>{`# of Columns: ${dataset.metafeatures.n_columns}`}</span>
              <br/>
              <span>{`# of Classes: ${dataset.metafeatures.n_classes}`}</span>
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Segment inverted attached="bottom">
          <Grid
            divided
            celled='internally'
            verticalAlign='middle'
          >
            <Grid.Row columns={3}>
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
              <Grid.Column width={5} textAlign="left">
                <Header
                  as="h4"
                  inverted
                  color="grey"
                  content="Chart"
                />
              </Grid.Column>
            </Grid.Row>
            {testGridStruff}
          </Grid>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { Summary };
export default connect(mapStateToProps, {})(Summary);
