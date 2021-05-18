import React, { Component } from 'react';
import Plot from 'react-plotly.js';

class PlotlyStackedBarPlot extends Component {
    render() {
        const { data, width, height, header, axis_color, font_color } = this.props;
        return (<Plot
            data={data}
            layout={ {width: width, height: height, barmode: 'stack',
                    paper_bgcolor:"#2D2E2F", plot_bgcolor: "#2D2E2F",
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

export default PlotlyStackedBarPlot;