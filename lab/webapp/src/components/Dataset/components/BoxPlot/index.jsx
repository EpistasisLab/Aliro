import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";

class BoxPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidMount() {
    //this.createBarGraph();
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createBarGraph();
  }

  createBoxPlot(tempKey){
    const { dataset, dataPreview } = this.props;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    let valByRowObj = this.getDataValByRow();
    let dataKeys;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
    }

    let svg = d3.select("#test_chart_" + tempKey)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "aliceblue")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let data_sorted = valByRowObj[tempKey].sort(d3.ascending);
    let q1 = d3.quantile(data_sorted, .25);
    let median = d3.quantile(data_sorted, .5);
    let q3 = d3.quantile(data_sorted, .75);
    let interQuantileRange = q3 - q1;
    let min = q1 - 1.5 * interQuantileRange;
    let max = q1 + 1.5 * interQuantileRange;
    let y = d3.scaleLinear()
      .domain([min, max])
      .range([height, 0]);
    svg.call(d3.axisLeft(y));
    let center = 200;
    width = 200;
    svg.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min) )
      .attr("y2", y(max) )
      .attr("stroke", "black");

    // Show the box
    svg.append("rect")
      .attr("x", center - width/2)
      .attr("y", y(q3) )
      .attr("height", (y(q1)-y(q3)) )
      .attr("width", width )
      .attr("stroke", "black")
      .style("fill", "#69b3a2")
      .on("mouseover", function(){d3.select(this).style("fill", "yellow");})
      .on("mouseout", function(){d3.select(this).style("fill", "#69b3a2");});

    // show median, min and max horizontal lines
    svg.selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
      .attr("x1", center-width/2)
      .attr("x2", center+width/2)
      .attr("y1", function(d){ return(y(d))} )
      .attr("y2", function(d){ return(y(d))} )
      .attr("stroke", "black");

    svg.enter()
       .append("text")
       .text("test text")
       .attr("x", center)
       .attr("dy", 12)
       .style("text-anchor", "end");
  }

  render() {
    const { dataset, dataPreview, valByRowObj, tempKey } = this.props;
    return (
      <div>
        <Header>
          Box_Plot
        </Header>
        <div id={"test_box_plot_" + tempKey}>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BoxPlot };
export default connect(mapStateToProps, {})(BoxPlot);
