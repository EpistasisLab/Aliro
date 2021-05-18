import React, { Component } from 'react';
import Plot from 'react-plotly.js';

class PlotlyBarPlot extends Component {
    componentDidMount() {

    }

    render() {
        const { data, xdata, ydata, width, height, header, axis_color, font_color } = this.props;

        const layout = {
            width: width, height: height, 
            paper_bgcolor:"#2D2E2F", plot_bgcolor: "rgba(0,0,0,0)",
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
            },
        };

        if(!(data == null)){
            var count = [];
            for (var i = 1; i <= data.length; i++) {
                count.push(1);
            }
            return (<Plot 
                data={[
                    {
                        histfunc: "count",
                        y: count,
                        x: data,
                        type: "histogram"
                    }
                ]}
                layout = {layout}
            />);
        }
        else{
            return (<Plot
                data={[
                    {
                    x: xdata,
                    y: ydata,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                    },
                    {type: 'bar', x: xdata, y: ydata},
                ]}
                layout = {layout}
            />);
        }
    }
}

export default PlotlyBarPlot;