import React, { Component } from 'react';
import c3 from 'c3';

class GaugeAll extends Component {
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
*/

  renderChart(expList, chartKey, chartColor) {
    //window.console.log('exp list: ', expList);
    let tempIndex = 0;
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        columns: expList,
        color: function (color, data) {
          //let tempScore = data.slice(-5,-1);
          //window.console.log("is even? ", tempIndex % 2);
          tempIndex++;
          switch (tempIndex % 3) {
            case 0:
              return '#55d6be'; // sea foam green
              break;
            case 1:
              return '#7D5BA6'; // purple
              break;
            case 2:
              return '#59ABE3'; // light pale blue
              break;
            default:
              return color;
          }
          //return tempIndex % 2 ? '#7D5BA6' : "#55d6be";
        },
        type: 'gauge',
      },
      gauge: {
        label: {
          format: function(value) {
            let retVal;
            value ? retVal = value.toFixed(2) : retVal = value;
            return retVal;
          },
          show: true
        },
        min: 0.5,
        max: 1.0
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
