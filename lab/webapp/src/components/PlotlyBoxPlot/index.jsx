import React, { Component } from 'react';
import Plot from 'react-plotly.js';

class PlotlyBoxPlot extends Component {
    componentDidMount() {

    }

    render() {
        const { data, width, height, header, axis_color, font_color, bg_color } = this.props;
        return(<Plot 
            data = {data}
            layout = { {width: width, height: height,
                        paper_bgcolor: bg_color, plot_bgcolor: bg_color,
                        xaxis: {
                          color: axis_color,
                        },
                        yaxis: {
                          color: axis_color,
                        },
                        legend: {
                          font: {
                            color: font_color,
                          },
                        },
                        title: {
                          text: header,
                          font: {
                            color: font_color,
                          }
                        }
                      } }
            />);
    }
}

export default PlotlyBoxPlot;