import React, { Component } from 'react';
import c3 from 'c3';

class GaugeAll extends Component {
  componentDidMount() {
    const { expList, chartKey, chartColor } = this.props;
    expList && this.renderChart(expList, chartKey, chartColor);
  }

  renderChart(expList, chartKey, chartColor) {
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        columns: [
          [expList[0][0], expList[0][1]],
          [expList[1][0], expList[1][1]],
          [expList[2][0], expList[2][1]]

        ],
        type: 'gauge',
        //onclick: function (d, i) { console.log("onclick", d, i); },
        //onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        //onmouseout: function (d, i) { console.log("onmouseout", d, i); }
      },
      gauge: {
        label: {

          show: true
        },
        min: 0.5,
        max: 1.0
      },
      color: {
        pattern: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896',,'#CD853F'], // the three color levels for the percentage values.
        threshold: {
          unit: 'value', // percentage is default
          max: 200, // 100 is default
          values: [30, 60, 90, 100]
        }
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
