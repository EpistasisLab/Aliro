
function pingURL() {

    // Aliro URL
    // var URL = "http://localhost:5080"
    var URL = "http://google.com"
    var settings = {
    
      // Defines the configurations
      // for the request

      cache: false,
      dataType: "jsonp",
      async: true,
      crossDomain: true,
      url: URL,
      method: "GET",
      headers: {
        accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      timeout: 10000,
      tryCount: 0,
      tryLimit: 100,
      // tryLimit: 2,
      statusCode: {
        200: function (response) {
          



          const sele = document.getElementById('temp');
          // make button with id temp always same size
          // sele.style.width = "100%";
          // sele.style.height = "100%";


          sele.innerHTML = "Aliro is running";

          // Add URL to the button id temp href
          sele.href = URL;


          // Create flashing/glowing button effect to the button id temp



          // if mouse is on the element with id temp, then make the innerHTML bold
          
          sele.addEventListener('mouseover', function () {
            sele.style.fontWeight = 'bold';
          });

          // if mouse is not on the element with id temp, then make the innerHTML normal
          sele.addEventListener('mouseout', function () {
            sele.style.fontWeight = 'normal';
          });

          


          // d3.select('#temp').text('Aliro is running');
          // d3.select('#temp').style('color', 'red');
          
          

          
        },
        0: function () {
          this.url = URL;
          if (this.tryCount++ < this.tryLimit) {
          
            $.ajax(this);
          }
        }
      },
    };
    



  $.ajax(settings)
  

}

// d3.select('#temp').text('Aliro is running');
// d3.select('#temp').style('color', 'red');




// Below is the code for information visualization with D3.js


function int_ml_01_titanic_data(){

  var svg = d3.select("#dataviz_area")
  //   svg.append("circle").attr("cx", 2).attr("cy", 2).attr("r", 40).style("fill", "blue");
  //   svg.append("circle").attr("cx", 140).attr("cy", 70).attr("r", 40).style("fill", "red");
  //   svg.append("circle").attr("cx", 300).attr("cy", 100).attr("r", 40).style("fill", "green");

  // make bar chart with random data
  // Add effect to the bar chart when user scroll down, the bar chart will appear
  // data set includes 1 to 30
  var dataset = [ 5, 10, 15, 20, 25,30, 40,2,4,5,6,7,8 ];
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
      return i * 30;
    }
    )
    .attr("y", function(d) {
      return 150 - d * 5;
    }
    )
    .attr("width", 25)
    .attr("height", function(d) {
      return d * 5;
    }
    )
    .attr("fill", "teal");

  // read data from csv file (C:\Users\User\Desktop\python_work\SoftTCBCS\Aliro_ED\Aliro_ED\Aliro_ED_album_template\data\datasets\pmlb_small\titanic.csv)
  // d3.csv("data/datasets/pmlb_small/titanic/titanic.csv", function(data) {

  //   console.log(data["Class	Age	Sex	class"]);
  //   console.log("Hello")
  // });

  var positive_Sex =[]
  var negative_Sex =[]

  d3.csv('data/datasets/pmlb_small/titanic/titanic.csv')
  .then(function(data) {
      // data is now whole data set
      // draw chart in here!
      // console.log(data);
      for (var i = 0; i < data.length; i++) {
        // console.log(data[i]["Class\tAge\tSex\tclass"]);
        // console.log(data[i]["Class\tAge\tSex\tclass"]);
        // parse string with \t
        var str = data[i]["Class\tAge\tSex\tclass"];
        var string_data = str.split("\t");
        // convert string to float
        var float_data = string_data.map(function(x){ return parseFloat(x) });

        // console.log(float_data);
        if (float_data[2]>0)
        {
          positive_Sex.push(float_data);
        }
        else
        {
          negative_Sex.push(float_data);
        }
      }
      console.log(positive_Sex)
      console.log(negative_Sex)

      // make the bar chart sex by class

  })
  .catch(function(error){
     // handle error   
  });


  
  
}






function int_ml_01_iris_data(){

  // var svg = d3.select("#dataviz_area")
  
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  
    var svg = d3.select("#dataviz_area")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  d3.csv('data/datasets/pmlb_small/iris/iris_two_classes.csv')
  .then(function(data) {
      // data is now whole data set
      // draw chart in here!
      // console.log(data);
      for (var i = 0; i < data.length; i++) {
      //  show data column names
      //  console.log(Object.keys(data[i]));
      if (i==0)
      {
        var colunm_names=Object.keys(data[i])[0].split("\t");
        console.log(colunm_names);
      }

      //  console.log(data[i][Object.keys(data[i])]);


       var str = data[i][Object.keys(data[i])];
       var string_data = str.split("\t");
       // convert string to float
       var float_data = string_data.map(function(x){ return parseFloat(x) });
        console.log(float_data);
      }





  })
  .catch(function(error){
     // handle error   
  });


  
  
}






function colorClass(class_cat) {
  if (class_cat==0)
  {
    return "#440154";
  }
  else if (class_cat==1)
  {
    return "#21918c";
  }
  else
  {
    return "#fde725";
  }

}

// if div id = intuition_exp is clicked, then run the function
// the function descrption is below
// when div id = intuition_exp is clicked, show div id addingnuance

function oneDPlot_v2(){

  var margin = {top: 30, right:30, bottom: 30, left: 0},
  width = 400 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var svg = d3.select("#dataviz_area_div")

  var x = d3.scaleLinear()
  .domain([0, 0])
  // get width from viewbox width
  .range([ 0, width ]);


  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 12])
  // .domain([0, 0])
  .range([ height, 0]);



  x.domain([0,9])
  svg.select(".myXaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisBottom(x));     
  
  y.domain([0,12])
  svg.select(".myYaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "0")
  .call(d3.axisLeft(y));      
  
  
  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(1000)

  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(0); } )

  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) });

}


function twoDPlot_v2() {
  // console.log("mouseleave");

  var margin = {top: 30, right:30, bottom: 30, left: 0},
  width = 400 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var svg = d3.select("#dataviz_area_div")

  var x = d3.scaleLinear()
  .domain([0, 0])
  // get width from viewbox width
  .range([ 0, width ]);


  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 12])
  // .domain([0, 0])
  .range([ height, 0]);



  x.domain([0,9])
  svg.select(".myXaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisBottom(x));     
  
  y.domain([0,12])
  svg.select(".myYaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisLeft(y));        
  
  

  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(1000)

  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )

  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) });

}

function remove_boundaries_on2d_plot()
{
  var svg = d3.select("#dataviz_area_div_svg")
  // make a box brom 0,0 to 123, 138 on the svg

 //seclt all class named boundaries
  svg.selectAll(".boundaries")
  .transition()
  .duration(1000)
  .attr("opacity", "0")
}



function drawing_boundaries_on_2d_plot() {

  var margin = {top: 30, right:30, bottom: 30, left: 0},
  width = 400 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var svg = d3.select("#dataviz_area_div")

  var x = d3.scaleLinear()
  .domain([0, 0])
  // get width from viewbox width
  .range([ 0, width ]);


  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 12])
  // .domain([0, 0])
  .range([ height, 0]);



  x.domain([0,9])
  svg.select(".myXaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisBottom(x));     
  
  y.domain([0,12])
  svg.select(".myYaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisLeft(y));        
  
  

  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(1000)

  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )

  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) });




  
  
  // mouseover the circles
  svg.selectAll("circle")
  .on("mouseover", function(d) {
    console.log(x(d['petal-length']));
    console.log(y(d['sepal-length']));
  })
  




var svg = d3.select("#dataviz_area_div_svg")
// make a box brom 0,0 to 123, 138 on the svg

var data_class1 = [
[
  [0,0],
  [123,270]
]

];

var rects_class1 = svg.selectAll("hey")
	.data(data_class1)
	.enter()
	.append("rect")
  .attr("class","boundaries")
	.attr("x", d=> d[0][0])
	.attr("y", d=> d[0][1])
  .transition()
  .duration(2000)
  .attr("width", d=> d[1][0] - d[0][0])
	.attr("height", d=> d[1][1] - d[0][1])
	.attr("fill", "#440154")
  .attr("opacity", 0.2);


  // 209.66666666666666
  // 120
var data_class2 = 
[
  [
    [123,0],
    [209.7,270]
  ]
];
  
var rects_class2 = svg.selectAll("hey")
	.data(data_class2)
	.enter()
	.append("rect")
  .attr("class","boundaries")
	.attr("x", d=> d[0][0])
	.attr("y", d=> d[0][1])
  .transition()
  .duration(2000)
  .attr("width", d=> d[1][0] - d[0][0])
	.attr("height", d=> d[1][1] - d[0][1])
	.attr("fill", "#21918c")
  .attr("opacity", 0.2);

var data_class3 = 
[
  [
    [209.7,0],
    [400,270]
  ]
];

var rects_class3 = svg.selectAll("hey")
	.data(data_class3)
	.enter()
	.append("rect")
  .attr("class","boundaries")
	.attr("x", d=> d[0][0])
	.attr("y", d=> d[0][1])
  .transition()
  .duration(2000)
  .attr("width", d=> d[1][0] - d[0][0])
	.attr("height", d=> d[1][1] - d[0][1])
	.attr("fill", "#fde725")
  .attr("opacity", 0.2);



}



function show_or_block_each_part(){
  
  // console.log("show_or_block is clicked");

  






  // from FSI to adding nuance
  d3.select("#fromfsitoaddn").on("click", function() {
    

    // non "Adding nuance" div
    document.getElementById("intuition_exp").style.display = "none";
    // block "Frist, some intuition" div
    document.getElementById("addingnuance").style.display = "block";
    


    // plot the data on 2D plane
    twoDPlot_v2()

  });

  // document.getElementById("addingnuance").style.display = "none";

  
  
  // from adding nuance to FSI
  d3.select("#fromaddntofsi").on("click", function() {
    

    // none "Frist, some intuition" div
    document.getElementById("addingnuance").style.display = "none";
    // block "Adding nuance" div
    document.getElementById("intuition_exp").style.display = "block";
   

    // project the data on 1D 
    oneDPlot_v2()


  });









  // from adding nuance to drawing boundaris
  d3.select("#fromaddntodrawb").on("click", function() {

    // block "Adding nuance" div
    document.getElementById("drawingboundaries").style.display = "block";
    // none "Frist, some intuition" div
    document.getElementById("addingnuance").style.display = "none";


    // draw boundaries on the 2D plane
    drawing_boundaries_on_2d_plot()


  });





  // from drawing boundaris to adding nuance
  d3.select("#fromdrawbtoaddn").on("click", function() {

    // block "Adding nuance" div
    document.getElementById("addingnuance").style.display = "block";
    // none "Frist, some intuition" div
    document.getElementById("drawingboundaries").style.display = "none";


    // plot the data on 2D plane
    remove_boundaries_on2d_plot()
    twoDPlot_v2()


  });








   
}






function int_ml_01_test_iris_data(){


  
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 560 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#dataviz_area")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
  
  //Read the data
  d3.csv("data/datasets/pmlb_small/iris/iris_two_classes.csv", function(data) {
  
  // show data column names
  // console.log(Object.keys(data[0]));
  console.log("int_ml_01_test_iris_data")
  console.log(data);
  
  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, 0])
  .range([ 0, width ]);
  svg.append("g")
  .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .attr("opacity", "0")
  
  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 15])
  .range([ height, 0]);
  svg.append("g")
  .call(d3.axisLeft(y));
  
  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )
  .attr("r", 2)
  .style("fill", "#69b3a2")
  
  // new X axis
  x.domain([0,15])
  svg.select(".myXaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisBottom(x));
  
  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(2000)
  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )
  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) });



  var tooltip = d3.select("#dataviz_area")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    tooltip
      .html("The exact value of<br>the Ground Living area is: " + d['petal-length'])
      .style("left", (d3.mouse(this)[0]+20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data.filter(function(d,i){return i<50})) // the .filter part is just to keep a few dots on the chart, not all of them
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d['petal-length']); } )
      .attr("cy", function (d) { return y(d['sepal-length']); } )
      .attr("r", 7)
      .style("fill", "#69b3a2")
      .style("opacity", 0.3)
      .style("stroke", "white")
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave );




  


  
  })

  // if user mouse over the dot, show the class

  











  }

  
function int_ml_01_test_iris_data_tooltip_1d_barscatter(){



  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 550 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#dataviz_area")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
  
  //Read the data
  //  "data/datasets/pmlb_small/iris/iris_Comma.csv"
  //  "data/datasets/pmlb_small/iris/iris_two_classes.csv"
  

  d3.csv("data/datasets/pmlb_small/iris/iris_Comma.csv", function(data) {


  
  // show data column names
  // console.log(Object.keys(data[0]));
  // console.log("int_ml_01_test_iris_data_tooltip")
  // console.log(data);
  
  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, 0])
  .range([ 0, width ]);

  svg.append("g")
  .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .attr("opacity", "0")
  
  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 12])
  .range([ height, 0]);
  
  svg.append("g")
  .call(d3.axisLeft(y));
  
  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("rect")
  // sepal-length', 'sepal-width', 'petal-length', 'petal-width

  // sepal-length', 'sepal-width'
  // sepal-length', 'petal-length'
  // sepal-length', 'petal-width
  // 'sepal-width', 'petal-length'
  // 'sepal-width', 'petal-width'
  // 'petal-length', 'petal-width'
  // 
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )
  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // best
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // make the x located in the middle of the rect
  
  .attr('x', 550/8)
  // .attr("cy", function (d) { return y(d['sepal-length']); } )
  .attr('y', function (d) { return y(d['sepal-length']); } )
  .attr('width', 550/2)
  .attr('height',1)


  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )


  // .attr("r", 2)
  .attr("fill", "#69b3a2")
  
  // new X axis
  x.domain([0,9])
  svg.select(".myXaxis")
  .transition()
  .duration(4000)
  .attr("opacity", "0")
  .call(d3.axisBottom(x));
  
  svg.selectAll("rect")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(2000)
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )
  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // best
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )

  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) });



  // var tooltip = d3.select("#dataviz_area")
  // .append("div")
  // .style("opacity", 0)
  // .attr("class", "tooltip")
  // .style("background-color", "white")
  // .style("border", "solid")
  // .style("border-width", "1px")
  // .style("border-radius", "5px")
  // .style("padding", "10px")

  // // A function that change this tooltip when the user hover a point.
  // // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  // var mouseover = function(d) {
  //   console.log("mouseover");
  //   tooltip
  //     .style("opacity", 1)
  // }

  // var mousemove = function(d) {
  //   console.log("mousemove");
  //   tooltip
  //     .html("The exact value of<br>the Ground Living area is: " + d['sepal-length'])
  //     .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
  //     .style("top", (d3.mouse(this)[1]) + "px")
  // }

  // // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  // var mouseleave = function(d) {
  //   tooltip
  //     .transition()
  //     .duration(200)
  //     .style("opacity", 0)
  // }

  // // Add dots
  // svg.append('g')
  //   .selectAll("dot")
  //   .data(data.filter(function(d,i){return i<100000})) // the .filter part is just to keep a few dots on the chart, not all of them
  //   .enter()
  //   .append("circle")
  //     .attr("cx", function (d) { return x(d['petal-length']); } )
  //     .attr("cy", function (d) { return y(d['sepal-length']); } )
  //     .attr("r", 2)
  //     .style("fill", "#69b3a2")
  //     .style("opacity", 0.2)
  //     .style("stroke", "white")
  //   .on("mouseover", mouseover )
  //   .on("mousemove", mousemove )
  //   .on("mouseleave", mouseleave );




  


  
  })

  // if user mouse over the dot, show the class

  











  }
  






function onedplotToTwodPlot(){



  // set the dimensions and margins of the graph
  var margin = {top: 30, right:30, bottom: 30, left: 0},
  width = 400 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  
  // append the svg object to the body of the page
  // var svg = d3.select("#dataviz_area")
  //   .append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //     .attr("transform",
  //           "translate(" + margin.left + "," + margin.top + ")")


  var svg = d3.select("#dataviz_area_div")
      .append("svg")
      .attr("id", "dataviz_area_div_svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `-25 -15 400 250`)
      
      // .attr("viewBox", "0 0 " + width + " " + height )
  
  //Read the data
  //  "data/datasets/pmlb_small/iris/iris_Comma.csv"
  //  "data/datasets/pmlb_small/iris/iris_two_classes.csv"
  

  d3.csv("data/datasets/pmlb_small/iris/iris_Comma.csv", function(data) {

  
  // console.log(data)

  // 0:Setosa, 
  // Virginica
  // Versicolor

  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, 0])
  // get width from viewbox width
  .range([ 0, width ]);

  svg.append("g")
  .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
  // .attr("transform", "translate(0," + height + ")")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .attr("opacity", "0")
  
  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 12])
  // .domain([0, 0])
  .range([ height, 0]);


  // svg.append("g")
  // .call(d3.axisLeft(y))

  svg.append("g")
  .attr("class", "myYaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
  // .attr("transform", "translate(0, 0)")
  // .attr("transform", "translate"+"(" + width +",0" + ")")
  // .attr("transform", "translate"+"(" + -width +",0" + ")")
  // .attr("transform", "translate(0," + width + ")")
  .attr("transform", "translate(0," + "0" + ")")
  .call(d3.axisLeft(y))
  .attr("opacity", "1");


  
  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
  // sepal-length', 'sepal-width', 'petal-length', 'petal-width


  // best
  .attr("cx", function (d) { return x(0)+165; } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )


  
  .attr("r", 2)
  .style("fill", "#69b3a2")
  
  // new X axis
  // x.domain([0,9])
  // svg.select(".myXaxis")
  // .transition()
  // .duration(2000)
  // .attr("opacity", "1")
  // .call(d3.axisBottom(x));




  
  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(1000)
 
  .attr("cx", function (d) { return x(0)+165; } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )
 
  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) })



  



  // svg.selectAll("circle")
  // .transition()
  // .delay(function(d,i){return(i*3)})
  // .duration(5000)
 
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )
 
  // // give color to the dots based on the class
  // .style("fill", function(d){ return colorClass(d['class']) });



  // var tooltip = d3.select("#dataviz_area")
  // .append("div")
  // .style("opacity", 0)
  // .attr("class", "tooltip")
  // .style("background-color", "white")
  // .style("border", "solid")
  // .style("border-width", "1px")
  // .style("border-radius", "5px")
  // .style("padding", "10px")

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  
  var project_x_axis = function(d) {

    console.log("project_x_axis");

    
    x.domain([0,9])
    svg.select(".myXaxis")
    .transition()
    .duration(2000)
    .attr("opacity", "1")
    .call(d3.axisBottom(x));     
    
    y.domain([0,12])
    svg.select(".myYaxis")
    .transition()
    .duration(2000)
    .attr("opacity", "0")
    .call(d3.axisLeft(y));     




   
    // make each circle access to the axis
    svg.selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*10)})
    .duration(1000)
  
    .attr("cx", function (d) { return x(d['petal-length']); } )
    .attr("cy", function (d) { return y(0); } )
  
    // give color to the dots based on the class
    .style("fill", function(d){ return colorClass(d['class']) });

    

    // console.log("mouseover");
    // tooltip
    //   .style("opacity", 1)


    


    // console.log(trial_mouseover)
    // if (trial_mouseover>5)
    // {
    //   // new X axis
    //   x.domain([0,9])
    //   svg.select(".myXaxis")
    //   .transition()
    //   .duration(2000)
    //   .attr("opacity", "1")
    //   .call(d3.axisBottom(x));     
      
      

    //   svg.selectAll("circle")
    //   .transition()
    //   .delay(function(d,i){return(i*3)})
    //   .duration(1000)
    
    //   .attr("cx", function (d) { return x(d['petal-length']); } )
    //   .attr("cy", function (d) { return y(d['sepal-length']); } )
    
    //   // give color to the dots based on the class
    //   .style("fill", function(d){ return colorClass(d['class']) });
    // }

    
  
  }


  var project_y_axis = function(d) {

    console.log("mouseover");

    
    x.domain([0,9])
    svg.select(".myXaxis")
    .transition()
    .duration(2000)
    .attr("opacity", "0")
    .call(d3.axisBottom(x));     
    
    y.domain([0,12])
    svg.select(".myYaxis")
    .transition()
    .duration(2000)
    .attr("opacity", "1")
    .call(d3.axisLeft(y));     




   
    // make each circle access to the axis
    svg.selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*10)})
    .duration(1000)
  
    .attr("cx", function (d) { return x(0); } )
    .attr("cy", function (d) { return y(d['sepal-length']); } )
  
    // give color to the dots based on the class
    .style("fill", function(d){ return colorClass(d['class']) });

    

    // console.log("mouseover");
    // tooltip
    //   .style("opacity", 1)


    


    // console.log(trial_mouseover)
    // if (trial_mouseover>5)
    // {
    //   // new X axis
    //   x.domain([0,9])
    //   svg.select(".myXaxis")
    //   .transition()
    //   .duration(2000)
    //   .attr("opacity", "1")
    //   .call(d3.axisBottom(x));     
      
      

    //   svg.selectAll("circle")
    //   .transition()
    //   .delay(function(d,i){return(i*3)})
    //   .duration(1000)
    
    //   .attr("cx", function (d) { return x(d['petal-length']); } )
    //   .attr("cy", function (d) { return y(d['sepal-length']); } )
    
    //   // give color to the dots based on the class
    //   .style("fill", function(d){ return colorClass(d['class']) });
    // }

    
  
  }

  var mousemove = function(d) {
    console.log("mousemove");
    // tooltip
    //   .html("The exact value of<br>the Ground Living area is: " + d['sepal-length'])
    //   .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    //   .style("top", (d3.mouse(this)[1]) + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var twoDPlot = function(d) {
    console.log("mouseleave");

    x.domain([0,9])
    svg.select(".myXaxis")
    .transition()
    .duration(2000)
    .attr("opacity", "1")
    .call(d3.axisBottom(x));     
    
    y.domain([0,12])
    svg.select(".myYaxis")
    .transition()
    .duration(2000)
    .attr("opacity", "1")
    .call(d3.axisLeft(y));        
    
    

    svg.selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(1000)
  
    .attr("cx", function (d) { return x(d['petal-length']); } )
    .attr("cy", function (d) { return y(d['sepal-length']); } )
  
    // give color to the dots based on the class
    .style("fill", function(d){ return colorClass(d['class']) });

    // tooltip
    //   .transition()
    //   .duration(200)
    //   .style("opacity", 0)
  }

  // Add dots
  // svg.append('g')
  //   .selectAll("dot")
  //   .data(data.filter(function(d,i){return i<100000})) // the .filter part is just to keep a few dots on the chart, not all of them
  //   .enter()
  //   .append("circle")
  //     .attr("cx", function (d) { return x(d['petal-length']); } )
  //     .attr("cy", function (d) { return y(d['sepal-length']); } )
  //     .attr("r", 2)
  //     .style("fill", "#69b3a2")
  //     .style("opacity", 0.1)
  //     .style("stroke", "white")
  //   .on("mouseover", mouseover )
  //   .on("mousemove", mousemove )
  //   .on("mouseleave", mouseleave );


  // // svg.selectAll("circle")
  // d3.select("#dataviz_area")
  // .on("mouseover", project_y_axis )
  // // .on("mousemove", mousemove )
  // .on("mouseleave", twoDPlot );



  // d3.select("#next")
  // .on("mouseover", mouseover )
  // .on("mouseleave", mouseleave );

  // click
  // d3.select("#next")
  // .on("click", function() {
  //   console.log("click");
  
    
  // });



  d3.select("#projectxaxia")
  // .on("mousemove", mousemove )
  .on("click", project_x_axis );


  d3.select("#projectyaxia")
  // .on("mousemove", mousemove )
  .on("click", project_y_axis );



  d3.select("#twoDPlot")
  // .on("mouseover", function() {
  //   console.log("mouseover_next");

  // });
  .on("click", twoDPlot );

 
  })

  // if user mouse over the dot, show the class

  











}


function int_ml_01_test_iris_data_tooltip_2d(){



  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 550 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#dataviz_area")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
  
  //Read the data
  //  "data/datasets/pmlb_small/iris/iris_Comma.csv"
  //  "data/datasets/pmlb_small/iris/iris_two_classes.csv"
  

  d3.csv("data/datasets/pmlb_small/iris/iris_Comma.csv", function(data) {


  
  // show data column names
  // console.log(Object.keys(data[0]));
  console.log("int_ml_01_test_iris_data_tooltip")
  console.log(data);
  
  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, 0])
  .range([ 0, width ]);
  svg.append("g")
  .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .attr("opacity", "0")
  
  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, 12])
  .range([ height, 0]);
  svg.append("g")
  .call(d3.axisLeft(y));
  
  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
  // sepal-length', 'sepal-width', 'petal-length', 'petal-width

  // sepal-length', 'sepal-width'
  // sepal-length', 'petal-length'
  // sepal-length', 'petal-width
  // 'sepal-width', 'petal-length'
  // 'sepal-width', 'petal-width'
  // 'petal-length', 'petal-width'
  // 
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )
  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // best
  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )



  .attr("r", 2)
  .style("fill", "#69b3a2")
  
  // new X axis
  x.domain([0,9])
  svg.select(".myXaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisBottom(x));
  
  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(2000)
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )
  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // best
  .attr("cx", function (d) { return x(d['petal-length']); } )
  .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-length']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )
  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['sepal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['sepal-width']); } )

  // .attr("cx", function (d) { return x(d['petal-length']); } )
  // .attr("cy", function (d) { return y(d['petal-width']); } )
  // ok
  // .attr("cx", function (d) { return x(d['petal-width']); } )
  // .attr("cy", function (d) { return y(d['petal-length']); } )

  // give color to the dots based on the class
  .style("fill", function(d){ return colorClass(d['class']) });



  var tooltip = d3.select("#dataviz_area")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function(d) {
    console.log("mouseover");
    tooltip
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    console.log("mousemove");
    tooltip
      .html("The exact value of<br>the Ground Living area is: " + d['sepal-length'])
      .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data.filter(function(d,i){return i<100000})) // the .filter part is just to keep a few dots on the chart, not all of them
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d['petal-length']); } )
      .attr("cy", function (d) { return y(d['sepal-length']); } )
      .attr("r", 2)
      .style("fill", "#69b3a2")
      .style("opacity", 0.2)
      .style("stroke", "white")
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave );




  


  
  })

  // if user mouse over the dot, show the class

  











}
  


// https://d3-graph-gallery.com/graph/scatter_animation_start.html
function int_ml_01_test_data(){


  
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;
// append the svg object to the body of the page
var svg = d3.select("#dataviz_area")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {

console.log(data);

// Add X axis
var x = d3.scaleLinear()
.domain([0, 0])
.range([ 0, width ]);
svg.append("g")
.attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x))
.attr("opacity", "0")

// Add Y axis
var y = d3.scaleLinear()
.domain([0, 500000])
.range([ height, 0]);
svg.append("g")
.call(d3.axisLeft(y));

// Add dots
svg.append('g')
.selectAll("dot")
.data(data)
.enter()
.append("circle")
  .attr("cx", function (d) { return x(d.GrLivArea); } )
  .attr("cy", function (d) { return y(d.SalePrice); } )
  .attr("r", 1.5)
  .style("fill", "#69b3a2")

// new X axis
x.domain([0, 4000])
svg.select(".myXaxis")
.transition()
.duration(2000)
.attr("opacity", "1")
.call(d3.axisBottom(x));

svg.selectAll("circle")
.transition()
.delay(function(d,i){return(i*3)})
.duration(2000)
.attr("cx", function (d) { return x(d.GrLivArea); } )
.attr("cy", function (d) { return y(d.SalePrice); } )
})

}





function int_ml_01_test_titanic_data(){


  
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#dataviz_area")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
  
  //Read the data
  d3.csv("data/datasets/pmlb_small/titanic/titanic_Comma.csv", function(data) {
  
  console.log(data);
  
  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, 0])
  .range([ 0, width ]);
  svg.append("g")
  .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .attr("opacity", "0")
  
  // Add Y axis
  var y = d3.scaleLinear()
  .domain([-1, 10])
  .range([ height, 0]);
  svg.append("g")
  .call(d3.axisLeft(y));
  
  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function (d) { return x(d.Class); } )
  .attr("cy", function (d) { return y(d.Age); } )
  .attr("r", 1.5)
  .style("fill", "#69b3a2")
  
  // new X axis
  x.domain([-10,10])
  svg.select(".myXaxis")
  .transition()
  .duration(2000)
  .attr("opacity", "1")
  .call(d3.axisBottom(x));
  
  svg.selectAll("circle")
  .transition()
  .delay(function(d,i){return(i*3)})
  .duration(2000)
  .attr("cx", function (d) { return x(d.Class); } )
  .attr("cy", function (d) { return y(d.Age); } )
  })
  
  }