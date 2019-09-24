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
    let proportionObj = {}; // key: unique value in dataset given colKey, val: # of values per unique value in depCol
    let proportionObjList = [];
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
    // in order to create a stacked bar chart need proportion of data per categorical
    // feature for count of each dependent column value

    // First step is to consolidate values of a given categorical feature:
    // for every unique value of given colKey in dataset, collect all matches
    // by looping over entire dataset and keep track of dependent column
    // values for each given categorical feature
    let testPieObj = {};
    givenColSet.forEach(rawKey => {
      let tKey = rawKey.toString();
      testPieObj[tKey] = valByRowObj[cleanKey].filter(item => item === tKey).length;
      columnValueObj[tKey] = [];
      dataPreview.data.forEach(entry => {
        if(entry[colKey] === tKey) {
          columnValueObj[tKey].push(entry[depCol])
        }
      })
    });
    // ------------------------------------------------------------------------
    // TODO: use this method instead of 'recombining' stacked chart data below
    // ------------------------------------------------------------------------
    window.console.log('testPieObj', testPieObj);

    //window.console.log('columnValueObj pie chart', columnValueObj);
    // Next step is to calculate proportion of depedent column values:
    // unqiue counts of each class occurance per value in given column name/key
    // results in list of objects -
    // ex: [ {0: 21, 1: 6, cat: "a"}, {0: 22, 1: 5, cat: "b"} ... ]
    // for this example depCol is 'target_class' which can be '0' or '1'
    // and colKey is 'cat' which can be 'a', 'b' ...
    Object.entries(columnValueObj).forEach((entry, index) => {
      // entry[0] is column key - entry[1] is list of all values for column key
      proportionObj[entry[0]] = []; // init obj key with empty list
      let tempObj = {};
      let tempTotal = 0;
      depColSet.forEach(depVal => {
        tempObj[colKey] = entry[0];
        // calculate count of depedent column for given column key
        // use array filter to create temp list and use that list's length
        let tempLen = entry[1].filter(x => {
          let parsedX = parseFloat(x);
          if(!isNaN(parsedX)) {
            return parsedX === depVal;
          } else {
            return x === depVal;
          }
        }).length;
        //proportionObj[entry[0]].push({[depVal]: tempLen})
        tempObj[depVal] = tempLen;
        tempTotal += tempLen;
        proportionObj[entry[0]].push(tempLen);
      })
      tempObj.total_count = tempTotal;
      proportionObjList.push(tempObj);
    })

    let values = [];
    let pieChartLabels = [];
    let restOfPieChart = 0;
    // sort in ascending order, take top 5 and consolidate rest into one
    proportionObjList.sort((a, b) => (a.total_count < b.total_count) ? 1 : -1);
    //window.console.log('sorted proportionObjList', proportionObjList);
    for(var i = 0; i < proportionObjList.length; i++) {
      if(i < 5){
        values.push(proportionObjList[i].total_count);
        pieChartLabels.push(proportionObjList[i][colKey])
      } else {
        restOfPieChart += proportionObjList[i].total_count;
      }
    }
    pieChartLabels.push("rest of data");
    values.push(restOfPieChart);
    // proportionObjList.forEach(tEntry => {
    //   //window.console.log('here', tEntry);
    //   values.push(tEntry.total_count)
    // });
    plotlyData.push({
      type: 'pie',
      values: values,
      labels: pieChartLabels
    })
    // depColSet.forEach((depVal, i) => {
    //   // plotly stuff - based on stacked bar chart example from here
    //   // https://plot.ly/javascript/bar-charts/
    //   let values = [];
    //   proportionObjList.forEach(tEntry => values.push(tEntry.total));
    //   plotlyData.push({
    //     name: depVal,
    //     type: 'pie',
    //     values: values,
    //     labels: ,
    //     marker: {
    //       color: colorObj[depVal]
    //     }
    //   })
    // })
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
