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
}
*/
  renderChart(expList, chartKey, chartColor) {
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        columns: [
          [expList[0][0].toString(), expList[0][1]],
          [expList[1][0].toString(), expList[1][1]]
        ],
        colors: {
          'test_score': '#55D6BE',
          'train_score': '#7D5BA6'
        },
        type: 'gauge',
        //onclick: function (d, i) { console.log("onclick", d, i); },
        //onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        //onmouseout: function (d, i) { console.log("onmouseout", d, i); }
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
