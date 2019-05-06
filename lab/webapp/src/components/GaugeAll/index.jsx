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
    let trainKey = expList[0][0].toString().slice(0,5) + '(' + expList[0][1].toFixed(2) + ')';
    let testKey = expList[1][0].toString().slice(0,4) + '(' + expList[1][1].toFixed(2) + ')';
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        columns: [
          [`${trainKey}`, expList[0][1]],
          [`${testKey}`, expList[1][1]]
        ],
        colors: {
          [trainKey]: '#55D6BE',
          [testKey]: '#7D5BA6'
        },
        color: function (color, data) {
          return data.id && data.id.includes('test') ? '#55D6BE' : color;
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
