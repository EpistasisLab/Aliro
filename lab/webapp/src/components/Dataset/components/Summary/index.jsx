import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Segment, Table, Grid } from 'semantic-ui-react';
import BarChart from '../BarChart/';
import BarCharts from '../BarCharts/';
import BoxPlot from '../BoxPlot/';
import * as d3 from "d3";

class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
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
                  <Grid.Row>
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

                        {tempChart}

                    </Grid.Column>
                  </Grid.Row>
                );

                return gridList;
              })
            }
          </Grid>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { Summary };
export default connect(mapStateToProps, {})(Summary);
