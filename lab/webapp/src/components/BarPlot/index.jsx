import React, { Component } from 'react';
import c3 from 'c3';

class BarPlot extends Component {
  componentDidMount() {
    const { expList, chartKey, chartColor } = this.props;
    expList && this.renderChart(expList, chartKey, chartColor);
  }
/*
colors: {
  'test_score': '#0072b2',  ---- light blue
  'train_score': '#f0e442'  ---- light yellow
  '#55D6BE' ----- light sea green
}

use anonymous function to 'disable' interaction
look here - https://github.com/c3js/c3/issues/493#issuecomment-456686654
*/

  renderChart(expList, chartKey, chartColor) {
    //window.console.log('exp list: ', expList);
    let tempIndex = 0;
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        onclick: () => {},
        columns: expList,
        color: function (color, data) {
          tempIndex++;
          switch (tempIndex % 2) {
            case 0:
              return '#55d6be'; // sea foam green
              break;
            case 1:
              return '#7D5BA6'; // purple
              break;
            default:
              return color;
          }
        },
        type: 'bar',
      },
      legend: {
        item: { onclick: () => {} }
      },
      axis: {
        y: {
          show: false
          },
        x: {
          show: false
        }
      },
      bar: {
        width: {
          ratio: 0.5
        },
        label: {
          format: function(value) {
            // don't return anything to 'disable' floating label
            // - they get cut off & are difficult to read when they overlap
            // TODO: try to override styling
            // let retVal;
            // value ? retVal = value.toFixed(2) : retVal = value;
            return;
          },
          show: true
        }
      },
      interaction: {
        enabled: true
      }
    });
  }

  render() {
    return (
      <div className={`bar ${this.props.chartKey}`} />
    );
  }
}

BarPlot.defaultProps = {
  chartColor: '#60B044'
};

export default BarPlot;
