import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Segment, Table } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js/dist/plotly';
// import from 'plotly.js/dist/plotly' because using webpack
// as outlined here - https://github.com/plotly/plotly-webpack#the-easy-way-recommended

class PlotlyTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {valByRowObj, dataKeys} = this.props;
    window.console.log('boxplot test data', valByRowObj);
    let boxPlotLayout = {
      title: 'Horizontal Box Plot test',
      width: 400,
      height: 300
    };
    const testData = [];
    dataKeys.forEach(dKey => testData.push(
      {
        x: valByRowObj[dKey],
        type: 'box',
        marker: {color: 'red'},
        name: dKey,
        boxpoints: false,
        boxmean: true
      }
    ))

    /* test data for plot
    [
      {
        x: [1, 2, 3],
        type: 'box',
        marker: {color: 'red'},
      },
      {type: 'scatter', x: [1, 2, 3], y: [2, 5, 3]},
    ]
    */
    return (
      <div>
        <Segment inverted attached="top" className="panel-header">
          <Header as="h3" content="Test for plotly" style={{ display: 'inline', marginRight: '0.5em' }} />
        </Segment>
        <Segment inverted attached="bottom">
          <div style={{ overflow: 'scroll', maxHeight: '1000px' }}>
          {/*<Plot
            data={testData}
            layout={boxPlotLayout}
          />*/}
          {testData.map(colEntry => {
            return (
              <Plot
                data={[colEntry]}
                layout={{
                  title: 'box plot for ' + colEntry.name,
                  width: 400,
                  height: 300
                }}
              />
            )
          })}
          </div>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { PlotlyTest };
export default connect(mapStateToProps, {})(PlotlyTest);
