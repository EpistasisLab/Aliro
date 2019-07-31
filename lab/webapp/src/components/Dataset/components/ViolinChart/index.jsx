import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";

class ViolinChart extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createViolinPlot = this.createViolinPlot.bind(this);
  }

  componentDidMount() {
    this.createViolinPlot();
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createBarGraph();
  }

  createViolinPlot(){
    const { dataPreview, valByRowObj, tempKey } = this.props;
    let margin = { top: 5, right: 60, bottom: 25, left: 85 },
        width = 425 - margin.left - margin.right,
        height = 255 - margin.top - margin.bottom;
    let dataKeys;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
    }

    // to make background of svg transparent set stroke & fill to none
    // or do not specify background color
    let svg = d3.select("#test_violin_plot_" + tempKey)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("stroke", "none")
    .style("fill", "none")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // get stats
    let data_sorted = valByRowObj[tempKey].sort(d3.ascending);
    // let data_sorted_AB = valByRowObj[tempKey].sort( (a, b) => {
    //   return a - b;
    // });

    let xScaleTest = d3.scaleLinear()
      .domain(d3.extent(data_sorted)).nice()
      .range([margin.left, width - margin.right]);

    let binTest = d3.histogram()
      .domain(xScaleTest.domain())
      .thresholds(xScaleTest.ticks(20))(data_sorted);

    window.console.debug('binTest: ', binTest);

    //window.console.debug('x scale test: ', xScaleTest);
    let q1 = d3.quantile(data_sorted, .25);
    let median = d3.quantile(data_sorted, .5);
    let q3 = d3.quantile(data_sorted, .75);
    let interQuantileRange = q3 - q1;
    let min = q1 - (1.5 * interQuantileRange);
    let max = q3 + (1.5 * interQuantileRange);
    // min = -1;
    // median = 0;
    // max = 1;
    let minData = Math.min(...data_sorted);
    let maxData = Math.max(...data_sorted);

    // print stats
    // window.console.debug('temp key: ', tempKey);
    // window.console.debug('sorted data: ', data_sorted);
    // window.console.debug('q1: ', q1);
    // window.console.debug('q3: ', q3);
    // window.console.debug('interQuantileRange: ', interQuantileRange);
    // window.console.debug('median: ', median);
    // window.console.debug('min: ', min);
    // window.console.debug('max: ', max);

    // color scale for jitter points
    let myColor = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([min, max]);

    // Y scale
    let yScale = d3.scaleBand()
      .range([height, 0])
      .domain([tempKey])
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .style("color", "white")
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain").remove()
    // X scale
    let xScale = d3.scaleLinear()
      .domain([min, max])
      .range([0, width]);

    svg.append("g")
      .attr("stroke", "white")
      .style("color", "white")
      .call(d3.axisBottom(xScale))
      .attr("transform", "translate(0," + (height) + ")");

    // histogram test
    let histogramTest = d3.histogram()
      .domain(xScale.domain)
      .thresholds(xScale.ticks(20))
      .value(d => d);

    let sumStat = d3.nest()
      .key(function(d) {
        window.console.log('sum stat key', d);
        return d + 'sumstat_key_test';
      })
      .rollup(function(d) {
        let input = d.map(function(g) {
          return g;
        })
        let bins = histogramTest(input);
        window.console.log('sum stat rollup', bins);
        return bins
      })
      .entries(valByRowObj[tempKey]);
    // box features
    let center = 150;
    width = 100;
    // main vertical line
    svg.append("line")
      .attr("y1", center)
      .attr("y2", center)
      .attr("x1", xScale(min) )
      .attr("x2", xScale(max) )
      .attr("stroke", "white");

    // Show the box
    svg.append("rect")
      .attr("x", xScale(q1))
      .attr("y", center - width/2 )
      .attr("height",  width)
      .attr("width", (xScale(q3)-xScale(q1)) )
      .attr("stroke", "white")
      .style("fill", "#1678c2")
      // orange - #f26202
      // sea foam green - rgb(85, 214, 190)
      // #1678c2
    // show median, min and max horizontal lines
    svg.selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
      .attr("y1", center-width/2)
      .attr("y2", center+width/2)
      .attr("x1", function(d){ return(xScale(d))} )
      .attr("x2", function(d){ return(xScale(d))} )
      .attr("stroke", "white");

    // tool tip
    let tooltip = d3.select("#test_violin_plot_" + tempKey)
    .append("div")
      .style("opacity", 0)
      .style("font-size", "16px");

    let mouseover = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 1)
      tooltip
        .html(`<span style='color:white'>data: ${d}</span>`)
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    let mouseleave = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

  }

  render() {
    const {tempKey } = this.props;
    return (
      <div id={"test_violin_plot_" + tempKey} />
    );
  }
}

const mapStateToProps = (state) => ({

});

export { ViolinChart };
export default connect(mapStateToProps, {})(ViolinChart);
