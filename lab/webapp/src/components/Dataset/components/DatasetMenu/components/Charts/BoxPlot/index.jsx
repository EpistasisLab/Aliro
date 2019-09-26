import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js/dist/plotly';

class BoxPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createPlotlyBoxPlot = this.createPlotlyBoxPlot.bind(this);
  }

  createPlotlyBoxPlot() {
    const {cleanKey, valByRowObj, rawKey} = this.props;
    let testForPlotly = [{
      x: valByRowObj[cleanKey],
      type: 'box',
      marker: {color: 'rgb(22, 120, 194)'},
      name: rawKey,
      title: {
        text: cleanKey,
        font: {
          family: 'Courier New, monospace',
          size: 12,
          color: 'white'
        }
      },
      boxpoints: false,
      boxmean: 'sd'
    }];
    // check here for button list -
    // https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js
    const optBtnsToRemove = [
      'toImage',
      'sendDataToCloud',
      'lasso2d',
      'select2d',
      'toggleSpikelines',
      'hoverClosestCartesian',
      'hoverCompareCartesian'
    ];
    const boxPlotConfig = {
      displaylogo: false,
      modeBarButtonsToRemove: optBtnsToRemove
    };
   //use pretty much any html font/css style with certain parts of chart
    const plotLayout = {
      font: {
        family: 'Courier New, monospace',
        size: 1,
        color: 'white'
      },
      xaxis: {
        showticklabels: true,
        gridcolor: 'white',
        zerolinecolor: 'white',
        tickangle: 'auto',
        tickfont: {
         family: 'Oswald, sans-serif',
         size: 9,
         color: 'white'
        },
        exponentformat: 'e',
        showexponent: 'all'
      },
      yaxis: {
        gridcolor: 'white'
      },
      width: 500,
      height: 375,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: false
    };

    return (<Plot
      style={{position:'relative', left: '-100px'}}
      data={testForPlotly}
      layout={plotLayout}
      config={boxPlotConfig}
    />);
  }

  render() {
    let plotlyChart = this.createPlotlyBoxPlot();

    return (
      <div style={{}}>
        {plotlyChart}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { BoxPlot };
export default connect(mapStateToProps, {})(BoxPlot);
