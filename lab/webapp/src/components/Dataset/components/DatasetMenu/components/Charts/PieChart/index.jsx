import React, { Component } from 'react';
import { connect } from 'react-redux';
// define list of colors to use for charts in chartInfo.js
import {colorStringList, colorsListObj} from '../../static/chartInfo.js';
import { Header } from 'semantic-ui-react';
import Plot from 'react-plotly.js';

class PieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };

    this.createStackedData = this.createStackedData.bind(this);
    this.createPlotlyPieChart = this.createPlotlyPieChart.bind(this);
  }

  createStackedData() {
    const { depCol, dataPreview, valByRowObj, colKey, cleanKey } = this.props;
    let givenColSet = [... new Set(valByRowObj[cleanKey])];
    let depColSet = [... new Set(valByRowObj[depCol])].sort();
    let columnValueObj = {}; // key: unique value in dataset given colKey, val: list of all depCol values for given colKey
    let plotlyData = [];

    // for every entry in depColSet, map keys to color

    let colorObj = {};
    depColSet.forEach((depVal, i) => {
      let colorString;
      if(i < 12) {
        colorString = colorStringList[i];
      } else {
        let colorKeys = Object.keys(colorsListObj.names);
        colorString = colorsListObj.names[colorKeys[i]];
        colorList.push(colorString);
      }
      colorObj[depVal] = colorString;
    })
    // in order to create a pie chart need to look at given categorical feature
    // column key to collect the total count of each individual value given that key
    // each entry is added to pieList
    let testPieList = [];

    givenColSet.forEach(rawKey => {
      let testPieObj = {};
      testPieObj.col_value = rawKey;
      let tKey = rawKey.toString();
      //testPieObj[tKey] = valByRowObj[cleanKey].filter(item => item === tKey).length;
      testPieObj.total_count = valByRowObj[cleanKey].filter(item => item === tKey).length;

      testPieList.push(testPieObj);
      columnValueObj[tKey] = [];
      dataPreview.data.forEach(entry => {
        if(entry[colKey] === tKey) {
          columnValueObj[tKey].push(entry[depCol])
        }
      })
    });

    testPieList.sort((a, b) => (a.total_count < b.total_count) ? 1 : -1);

    window.console.log('testPieObj', testPieList);

    let values = [];
    let pieChartLabels = [];
    let restOfPieChart = 0;
    // sort in ascending order, take top 5 and consolidate rest into one
    for(var i = 0; i < testPieList.length; i++) {
      if(i < 5){
        values.push(testPieList[i].total_count);
        pieChartLabels.push(testPieList[i].col_value)
      } else {
        restOfPieChart += testPieList[i].total_count;
      }
    }
    pieChartLabels.push("rest of data");
    values.push(restOfPieChart);

    // https://plot.ly/javascript/pie-charts/
    plotlyData.push({
      type: 'pie',
      values: values,
      labels: pieChartLabels
    })
    //window.console.log('plotlyData pie chart', plotlyData);
    return plotlyData;
  }

  // in the case of creating a stacked bar chart with too many items to display
  // along x - axis (number of unique vals for given column key/categorical_feature)
  // display alternative chart instead - take top five largest/most numerous values
  // and consolidate remaining items into one and display a pie chart with six slices
  createPlotlyPieChart() {
    const { chartCutoff } = this.state;

    let testData = this.createStackedData();
    if(testData.chartCutoff) {
      return {chartCutoff: true};
    }
    // layout obj for plotly
    const plotLayout = {
      barmode: 'stack',
      font: {
        family: 'Courier New, monospace',
        size: 1,
        color: 'white'
      },
      xaxis: {
        tickangle: 'auto',
        tickfont: {
         family: 'Oswald, sans-serif',
         size: 9,
         color: 'white'
        }
      },
      yaxis: {
        zerolinecolor: 'white',
        tickangle: 'auto',
        tickfont: {
         family: 'Oswald, sans-serif',
         size: 9,
         color: 'white'
        }
      },
      width: 500,
      height: 375,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: {
        x: 1,
        y: 1,
        traceorder: 'normal',
        font: {
          family: 'sans-serif',
          size: 9,
          color: 'white'
        }
      }
    };

    // config for plotly
    const optBtnsToRemove = [
      'toImage',
      'sendDataToCloud'
    ];
    const plotConfig = {
      displaylogo: false,
      modeBarButtonsToRemove: optBtnsToRemove
    };

    return (<Plot
      style={{position:'relative', left:'-50px'}}
      data={testData}
      layout={plotLayout}
      config={plotConfig}
    />)
  }

  render() {

    let plotlyChart = this.createPlotlyPieChart();
    //plotlyChart = (<p>pie chart</p>);
    //plotlyChart.chartCutoff ? plotlyChart = (<p>Too many values to plot</p>) : null;
    return (
      <div>
        {plotlyChart}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PieChart };
export default connect(mapStateToProps, {})(PieChart);
