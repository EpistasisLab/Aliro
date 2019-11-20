import React, { Component } from 'react';
import c3 from 'c3';

class GaugeAll extends Component {
  componentDidMount() {
    const { expList, chartKey, chartColor, min, max } = this.props;
    expList && this.renderChart(expList, chartKey, chartColor, min, max);
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

  renderChart(expList, chartKey, chartColor, min, max) {
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
        type: 'gauge',
      },
      legend: {
        item: { onclick: () => {} }
      },
      gauge: {
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
        },
        min: min,
        max: max
      },
      interaction: {
        enabled: false
      }
    });
  }

  render() {
    return (
      <div className={`gauge ${this.props.chartKey}`} />
    );
  }
}

GaugeAll.defaultProps = {
  chartColor: '#60B044'
};

export default GaugeAll;
