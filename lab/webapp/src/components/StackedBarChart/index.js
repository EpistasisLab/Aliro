import React, { Component } from 'react'
//import './App.css'
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale'
import { max, map } from 'd3-array'
import { axisBottom, axisLeft } from 'd3-axis'
import { stack } from 'd3-shape'
import { select } from 'd3-selection'
import { csv } from 'd3-fetch'

class StackedBarChart extends Component {
   constructor(props){
        super(props)
        this.createBarChart = this.createBarChart.bind(this)
   }
   
   componentDidMount() {
        this.createBarChart()
   }
   
   componentDidUpdate() {
        this.createBarChart()
   }
   
   createBarChart() {
        console.log("Started creating stacked bar chart...")
        var margin = {top: 10, right: 30, bottom: 20, left: 50},
           width = 460 - margin.left - margin.right,
           height = 400 - margin.top - margin.bottom;
        //var width = 500
        //var height = 500

        const node = this.node
        select(node)
            //.append("svg")
            .attr("width", width + margin.left + margin.right + 10)
            .attr("height", height + margin.top + margin.bottom)
            //.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv', function(d) {
            console.log(d)
            //d.Nitrogen = +d.Nitrogen
            //d.normal = +d.normal
            //d.stress = +d.stress
            return d
        }).then(function(data){
        console.log(data)
        const subgroups = data.columns.slice(1)
        let groups = map(data, function(d){return(d.group)})
        
        const x = scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        console.log("width: ", width)
        let axis = select(node).append("g")
            .attr("transform", "translate(0," + height +")")
            //.attr("transform", "translate(" + margin.left + "," + height +")")
            .call(axisBottom(x).tickSizeOuter(0));
        axis.selectAll("line")
            .style("stroke", "white");
        axis.selectAll("path")
            .style("stroke", "orange");
        axis.selectAll("text")
            .style("stroke", "white");

        const y = scaleLinear()
            .domain([0, 60])
            .range([height, 0])

        let yaxis = select(node).append("g")
            .attr("transform", "translate(0,0)")
            .call(axisLeft(y));
        yaxis.selectAll("line")
            .style("stroke", "white");
        yaxis.selectAll("path")
            .style("stroke", "orange");
        yaxis.selectAll("text")
            .style("stroke", "white");

        const color = scaleOrdinal()
            .domain(subgroups)
            .range(['#e41a1c','#377eb8','#4daf4a'])

        const stackedData = stack()
            .keys(subgroups)
            (data)
        console.log("Stacked Data.....")
        console.log(stackedData)
        select(node).append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
              .attr("fill", function(d) { return color(d.key); })
              .selectAll("rect")
              // enter a second time = loop subgroup per subgroup to add all rectangles
              .data(function(d) { return d; })
              .enter().append("rect")
                .attr("x", function(d) { 
                    //console.log("d.data.group: ",d.data.group)
                    console.log("x: ",x(d.data.group))
                    return x(d.data.group);
                })
                .attr("y", function(d) {
                    //console.log("y: ",y(d[1]))
                    return y(d[1]);
                })
                .attr("height", function(d) {
                    //console.log("height: ",y(d[0]) - y(d[1]))
                    return y(d[0]) - y(d[1]);
                })
                .attr("width",x.bandwidth())
        })
    }
   
    render() {
        return <svg ref={node => this.node = node}>
        </svg>
    }
}
export default StackedBarChart