import React, { Component } from 'react';
import { connect } from 'react-redux';
// define list of colors to use for charts in chartInfo.js
import {colorStringList, colorsListObj} from '../../static/chartInfo.js';
import { Header, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.createPlotlyBarChart = this.createPlotlyBarChart.bind(this);
    //this.createBarGraph = this.createBarGraph.bind(this);
  }

  componentDidMount() {
    //this.createBarGraph();
  }

  // basic reference guide for plotly bar charts -
  // https://plot.ly/javascript/bar-charts/
  createPlotlyBarChart() {
    const { valByRowObj, depCol } = this.props;
    let testSet = [... new Set(valByRowObj[depCol])].sort();
    let data_sorted = valByRowObj[depCol].sort();
    let classCountObj = {};
    let testData = {
      x: [],
      y: [],
      type: 'bar'
    };
    let plotlyBarCharData = [];
    data_sorted.forEach(val => {
      classCountObj[val] = classCountObj[val] ? ++classCountObj[val] : 1;
    })

    // for every entry in depColSet, map keys to color
    let colorObj = {};
    let colorList = [];

    testSet.forEach((depVal, i) => {
      // use https://github.com/d3/d3-scale-chromatic#schemePaired for 12 colors
      // to select unique color per class in dataset - no longer using d3
      let colorString;
      if(i < 12) {
        colorString = colorStringList[i];
        // assumes color strings are added in proper order for each depedent column
        // value, was previously mapping each key to color string in object but for
        // plotly need list of strings - not sure how to ensure color strings are
        // always mapped to column keys, this appears to work okay for now
        colorList.push(colorString);
      } else {
        let colorKeys = Object.keys(colorsListObj.names);
        colorString = colorsListObj.names[colorKeys[i]];
        colorList.push(colorString);
      }
      colorObj[depVal] = colorString;
    })

    // data object, passing in list of colors
    testSet.forEach(tKey => {
      testData.x.push(tKey.toString());
      testData.y.push(classCountObj[tKey]);
      testData.marker = {color: colorList};
    });
    // push data obj to list
    plotlyBarCharData.push(testData);

    // layout obj
    const plotLayout = {
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
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    // push layout obj to list
    plotlyBarCharData.push(plotLayout);

    // config
    const optBtnsToRemove = [
      'sendDataToCloud'
    ];
    const boxPlotConfig = {
      displaylogo: false,
      modeBarButtonsToRemove: optBtnsToRemove
    };
    plotlyBarCharData.push(boxPlotConfig);
    // return data, layout & config in same list
    //tried using https://github.com/plotly/react-plotly.js/blob/master/README.md#event-handler-props
    // to detect when chart is loaded - not sure how to hook up to events to detect when plot
    // is created/loaded, using onInitialized only triggers when chart is rendered
    // if display/render a loading
    return (<Plot
      id={'bar_chart_'+depCol}
      style={{position:'relative', left:'-100px'}}
      data={[plotlyBarCharData[0]]}
      layout={plotlyBarCharData[1]}
      config={plotlyBarCharData[2]}
    />);
  }


  render() {
    const { cleanKey } = this.props;
    const { barChartLoaded } = this.state;
    let plotlyBarChart = this.createPlotlyBarChart();

    return (
      <div>
        {plotlyBarChart}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BarChart };
export default connect(mapStateToProps, {})(BarChart);
