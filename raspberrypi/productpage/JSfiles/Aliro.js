var showScatter = true;
var showBars = false;
var showDecTree = false;

// var showScatter = false; var showBars = true; var showDecTree = false; this
// js file includes data in the code.

function pingURL() {

    // Aliro URL
    var URL = "http://localhost:5080"
    // var URL = "http://localhost:8000" var URL = "http://google.com" var URL =
    // "http://www.daum.net"
    var settings = {

        // Defines the configurations for the request

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

                const sele = document.getElementById('loadingbutton');
                // make button with id temp always same size sele.style.width = "100%";
                // sele.style.height = "100%";

                console.log(sele.innerHTML)
                sele.innerHTML = "Aliro is ready to run";

                // Add URL to the button id temp href
                sele.href = URL;

                // Create flashing/glowing button effect to the button id temp if mouse is on
                // the element with id temp, then make the innerHTML bold

                sele.addEventListener('mouseover', function () {
                    sele.style.fontWeight = 'bold';
                });

                // if mouse is not on the element with id temp, then make the innerHTML normal
                sele.addEventListener('mouseout', function () {
                    sele.style.fontWeight = 'normal';
                });

                // make loadingeds text changed
                const sele2 = document.getElementById('loadingeds');

                // make the loadingeds clickable and link to the URL

                sele2.innerHTML = "Aliro is ready to run";
                sele2.href = URL;

                // make the mouse cursor pointer like hand
                sele2.style.cursor = "pointer";

                sele2.addEventListener('click', function () {
                    // move to the URL
                    window.location.href = URL;
                });

                const selcir = document.getElementsByClassName('blinkingcir')

                for (var i = 0; i < selcir.length; i++) {
                    // selcir.setAttribute("r", "10");
                    selcir[i].setAttribute("r", "7");
                }

            },
            0: function () {
                this.url = URL;
                if (this.tryCount++ < this.tryLimit) {

                    $.ajax(this);
                }
            }
        }
    };

    $.ajax(settings)

}

function pingURL_DOWNLOAD() {

    // Aliro URL
    var URL = "http://localhost:5080"
    // var URL = "http://localhost:8000" var URL = "http://google.com" var URL =
    // "http://www.daum.net"
    var settings = {

        // Defines the configurations for the request

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

                const sele = document.getElementById('loadingbutton');
                // make button with id temp always same size sele.style.width = "100%";
                // sele.style.height = "100%";

                if (sele != null) {

                    console.log(sele.innerHTML)
                    sele.innerHTML = "Aliro is ready to run";

                    // Add URL to the button id temp href
                    sele.href = URL;

                    // Create flashing/glowing button effect to the button id temp if mouse is on
                    // the element with id temp, then make the innerHTML bold

                    sele.addEventListener('mouseover', function () {
                        sele.style.fontWeight = 'bold';
                    });

                    // if mouse is not on the element with id temp, then make the innerHTML normal
                    sele.addEventListener('mouseout', function () {
                        sele.style.fontWeight = 'normal';
                    });
                }

                // make loadingeds text changed
                const sele2 = document.getElementById('loadingeds');

                // make the loadingeds clickable and link to the URL

                sele2.innerHTML = "Aliro is ready to run";
                sele2.href = URL;

                // make the mouse cursor pointer like hand
                sele2.style.cursor = "pointer";

                sele2.addEventListener('click', function () {
                    // move to the URL
                    window.location.href = URL;
                });

                const selcir = document.getElementsByClassName('blinkingcir')

                for (var i = 0; i < selcir.length; i++) {
                    // selcir.setAttribute("r", "10");
                    selcir[i].setAttribute("r", "7");
                }

            },
            0: function () {
                this.url = URL;
                if (this.tryCount++ < this.tryLimit) {

                    $.ajax(this);
                }
            }
        }
    };

    $.ajax(settings)

}

// Below is the code for information visualization with D3.js

function colorClass(class_cat) {
    if (class_cat == 0) {
        // return "#ffbe0b";
        return "#ffbe0b";
    } else if (class_cat == 1) {
        // return "#ff006e";
        return "#ff006e";
    } else {
        return "#8338ec";
    }

}

function locationByColorClass(class_cat) {
    if (class_cat == 0) {
        return 100;
    } else if (class_cat == 1) {
        return 200;
    } else {
        return 300;
    }

}

function oneDPlot_v2() {

    // var margin = {top: 30, right:30, bottom: 30, left: 0}, width = 400 -
    // margin.left - margin.right, height = 300 - margin.top - margin.bottom;

    var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 0
        },
        width = 500 - margin.left - margin.right,
        height = 350 * 600 / 500 - margin.top - margin.bottom;

    var svg = d3v4.select("#dataviz_area_div_scatterplot")

    var x = d3v4
        .scaleLinear()
        .domain([0, 0])
        // get width from viewbox width
        .range([0, width]);

    // Add Y axis
    var y = d3v4
        .scaleLinear()
        .domain([0, 10])
        // .domain([0, 0])
        .range([height, 0]);

    x.domain([0, 9])
    svg
        .select(".myXaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3v4.axisBottom(x));

    y.domain([0, 10])
    svg
        .select(".myYaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "0")
        .call(d3v4.axisLeft(y));

    svg
        .selectAll("circle")
        .transition()
        .delay(function (d, i) {
            return (i * 3)
        })
        .duration(1000)
        .attr("cx", function (d) {
            return x(d['petal-length']);
        })
        .attr("cy", function (d) {
            return y(0);
        })

        // give color to the dots based on the class
        .style("fill", function (d) {
            return colorClass(d['class'])
        });

}

function twoDPlot_v2() {
    // console.log("mouseleave"); var margin = {top: 30, right:30, bottom: 30, left:
    // 0}, width = 400 - margin.left - margin.right, height = 300 - margin.top -
    // margin.bottom;
    var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 0
        },
        width = 500 - margin.left - margin.right,
        height = 350 * 600 / 500 - margin.top - margin.bottom;

    var svg = d3v4.select("#dataviz_area_div_scatterplot")

    var x = d3v4
        .scaleLinear()
        .domain([0, 0])
        // get width from viewbox width
        .range([0, width]);

    // Add Y axis
    var y = d3v4
        .scaleLinear()
        .domain([0, 10])
        // .domain([0, 0])
        .range([height, 0]);

    x.domain([0, 9])
    svg
        .select(".myXaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3v4.axisBottom(x));

    y.domain([0, 10])
    svg
        .select(".myYaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3v4.axisLeft(y));

    svg
        .selectAll("circle")
        .transition()
        .delay(function (d, i) {
            return (i * 3)
        })
        .duration(1000)
        .attr("cx", function (d) {
            return x(d['petal-length']);
        })
        .attr("cy", function (d) {
            return y(d['sepal-length']);
        })

        // give color to the dots based on the class
        .style("fill", function (d) {
            return colorClass(d['class'])
        });

    // mouseover the circles
    svg
        .selectAll("circle")
        .on("mouseover", function (d) {
            console.log(x(d['petal-length']));
            console.log(y(d['sepal-length']));
        })

}

function remove_boundaries_on2d_plot() {
    var svg = d3v4.select("#dataviz_area_div_svg")
    // make a box brom 0,0 to 123, 138 on the svg seclt all class named boundaries
    svg
        .selectAll(".boundaries")
        .transition()
        .duration(1000)
        .attr("opacity", "0")
}

function drawing_boundaries_on_2d_plot() {

    console.log("drawing boundaries on 2d plot");

    // var margin = {top: 30, right:30, bottom: 30, left: 0}, width = 400 -
    // margin.left - margin.right, height = 300 - margin.top - margin.bottom;
    var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 0
        },
        width = 500 - margin.left - margin.right,
        height = 350 * 600 / 500 - margin.top - margin.bottom;

    var svg = d3v4.select("#dataviz_area_div")

    var x = d3v4
        .scaleLinear()
        .domain([0, 0])
        // get width from viewbox width
        .range([0, width]);

    // Add Y axis
    var y = d3v4
        .scaleLinear()
        .domain([0, 10])
        // .domain([0, 0])
        .range([height, 0]);

    x.domain([0, 9])
    svg
        .select(".myXaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3v4.axisBottom(x));

    y.domain([0, 10])
    svg
        .select(".myYaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3v4.axisLeft(y));

    svg
        .selectAll("circle")
        .transition()
        .delay(function (d, i) {
            return (i * 3)
        })
        .duration(1000)
        .attr("cx", function (d) {
            return x(d['petal-length']);
        })
        .attr("cy", function (d) {
            return y(d['sepal-length']);
        })

        // give color to the dots based on the class
        .style("fill", function (d) {
            return colorClass(d['class'])
        });

    var svg = d3v4.select("#dataviz_area_div_svg")
    // make a box brom 0,0 to 123, 138 on the svg

    var data_class1 = [
        [
            [
                0, 0
            ],
            [
                156.7, height
            ]
        ]

    ];

    var rects_class1 = svg
        .selectAll("hey")
        .data(data_class1)
        .enter()
        .append("rect")
        .attr("class", "boundaries")
        .attr("x", d => d[0][0])
        .attr("y", d => d[0][1])
        .transition()
        .duration(2000)
        .attr("width", d => d[1][0] - d[0][0])
        .attr("height", d => d[1][1] - d[0][1])
        .attr("fill", "#ffbe0b")
        .attr("opacity", 0.2)
        .attr("id", "drawn_boundaries_1");

    // 209.66666666666666 120
    var data_class2 = [
        [
            [
                156.7, 0
            ],
            [
                266.4, height
            ]
        ]
    ];

    var rects_class2 = svg
        .selectAll("hey")
        .data(data_class2)
        .enter()
        .append("rect")
        .attr("class", "boundaries")
        .attr("x", d => d[0][0])
        .attr("y", d => d[0][1])
        .transition()
        .duration(2000)
        .attr("width", d => d[1][0] - d[0][0])
        .attr("height", d => d[1][1] - d[0][1])
        // .attr("fill", "#ff006e")
        .attr("fill", "#ff006e")
        .attr("opacity", 0.2)
        .attr("id", "drawn_boundaries_2");

    var data_class3 = [
        [
            [
                266.4, 0
            ],
            [
                500, height
            ]
        ]
    ];

    var rects_class3 = svg
        .selectAll("hey")
        .data(data_class3)
        .enter()
        .append("rect")
        .attr("class", "boundaries")
        .attr("x", d => d[0][0])
        .attr("y", d => d[0][1])
        .transition()
        .duration(2000)
        .attr("width", d => d[1][0] - d[0][0])
        .attr("height", d => d[1][1] - d[0][1])
        .attr("fill", "#8338ec!important")
        .attr("opacity", 0.2)
        .attr("id", "drawn_boundaries_3");

}

function show_or_block_each_part() {

    // from FSI to adding nuance
    d3v4
        .select("#fromfsitoaddn")
        .on("click", function () {

            // non "Adding nuance" div
            document
                .getElementById("intuition_exp")
                .style
                .display = "none";
            // block "Frist, some intuition" div
            document
                .getElementById("addingnuance")
                .style
                .display = "block";

            // plot the data on 2D plane
            twoDPlot_v2()

        });

    // document.getElementById("addingnuance").style.display = "none"; from adding
    // nuance to FSI
    d3v4
        .select("#fromaddntofsi")
        .on("click", function () {

            // none "Frist, some intuition" div
            document
                .getElementById("addingnuance")
                .style
                .display = "none";
            // block "Adding nuance" div
            document
                .getElementById("intuition_exp")
                .style
                .display = "block";

            // project the data on 1D
            oneDPlot_v2()

        });

    // from adding nuance to drawing boundaris
    d3v4
        .select("#fromaddntodrawb")
        .on("click", function () {

            // block "Adding nuance" div
            document
                .getElementById("drawingboundaries")
                .style
                .display = "block";
            // none "Frist, some intuition" div
            document
                .getElementById("addingnuance")
                .style
                .display = "none";

            // draw boundaries on the 2D plane
            drawing_boundaries_on_2d_plot()

        });

    // from drawing boundaris to adding nuance
    d3v4
        .select("#fromdrawbtoaddn")
        .on("click", function () {

            // block "Adding nuance" div
            document
                .getElementById("addingnuance")
                .style
                .display = "block";
            // none "Frist, some intuition" div
            document
                .getElementById("drawingboundaries")
                .style
                .display = "none";

            // plot the data on 2D plane
            remove_boundaries_on2d_plot()
            twoDPlot_v2()

        });

}

// scatter plot
function onedplotToTwodPlot() {

    var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 0
        },
        width = 500 - margin.left - margin.right,
        height = 350 * 600 / 500 - margin.top - margin.bottom;

    console.log("width-scatter", width)
    console.log("height-scatter", height)

    // make interactive and responsive viewBox append the svg object to the body of
    // the page var svg = d3v4.select("#dataviz_area")   .append("svg")
    // .attr("width", width + margin.left + margin.right)     .attr("height", height
    // + margin.top + margin.bottom)   .append("g")     .attr("transform",
    // "translate(" + margin.left + "," + margin.top + ")")

    var svg = d3v4
        .select("#dataviz_area_div_scatterplot")
        .append("svg")
        .attr("id", "dataviz_area_div_svg_scatterplot")
        // .attr("width", width + margin.left + margin.right) .attr("height", height +
        // margin.top + margin.bottom) .attr("viewBox", `-25 -15 400 250`)
        .attr("viewBox", `-25 -10 500 400`)

    // .attr("viewBox", "0 0 " + width + " " + height ) Read the data
    // "data/datasets/pmlb_small/iris/iris_Comma.csv"
    // "data/datasets/pmlb_small/iris/iris_two_classes.csv" commenting out d3.csv
    // call d3.csv("data/datasets/pmlb_small/iris/iris_Comma.csv", function (data) {
    // console.log(data) 0:Setosa, Virginica Versicolor Add X axis
    var x = d3v4
        .scaleLinear()
        .domain([0, 0])
        // get width from viewbox width
        .range([0, width]);

    svg
        .append("g")
        .attr("class", "myXaxis_scatter") // Note that here we give a class to the X axis, to be able to call it later and modify it
        // .attr("transform", "translate(0," + height + ")")
        .attr("transform", "translate(0," + height + ")")
        .call(d3v4.axisBottom(x))
        .attr("opacity", "0")
        .attr("stroke", "black")
        .append("text")
        .attr("fill", "black") //set the fill here
        // make the title of x axis always located in the middle of the x axis
        .attr("transform", "translate(" + width / 2 + " ," + (
            margin.bottom - 3
        ) + ")")
        // .attr("transform","translate(150, 30)")
        .text("petal-length");

    // Add Y axis
    var y = d3v4
        .scaleLinear()
        // .domain([0, 9])
        .domain([0, 10])
        // .domain([0, 0])
        .range([height, 0]);

    // svg.append("g") .call(d3v4.axisLeft(y))

    svg
        .append("g")
        .attr("class", "myYaxis_scatter") // Note that here we give a class to the X axis, to be able to call it later and modify it
        // .attr("transform", "translate(0, 0)") .attr("transform", "translate"+"(" +
        // width +",0" + ")") .attr("transform", "translate"+"(" + -width +",0" + ")")
        // .attr("transform", "translate(0," + width + ")")
        .attr("transform", "translate(0,0)")
        .call(d3v4.axisLeft(y))
        .attr("opacity", "0")
        // make y axis white .attr("fill", "white")
        .attr("stroke", "black")
        // .attr("stroke-width", "1px") .attr("stroke-width", "1px") .attr('text','y
        // axis')
        .append("text")
        .attr("fill", "black") //set the fill here

        // make the title of y axis always located in the end of the y axis. But make
        // the title of y axia and the y axis not overlap .attr("transform",
        // "translate(" + -margin.left + " ," + height / 2 + ")rotate(-90)")
        .attr("transform", "translate(" + -18 + " ," + height / 2 + ")rotate(-90)")
        .text("sepal-length");;

    // Add dots
    svg
        .append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        // sepal-length', 'sepal-width', 'petal-length', 'petal-width best
        .attr("cx", function (d) {
            return x(0) + 165;
        })
        .attr("cy", function (d) {
            return y(d['sepal-length']);
        })

        // .attr("r", 2)
        .attr("r", 3.5)
        .style("fill", "#69b3a2")
        .style("stroke", "black")
        .attr("class", function (d) {
            return (d['class']);
        })

    // new X axis x.domain([0,9]) svg.select(".myXaxis") .transition()
    // .duration(2000) .attr("opacity", "1") .call(d3v4.axisBottom(x));

    svg
        .selectAll("circle")
        .transition()
        .delay(function (d, i) {
            return (i * 3)
        })
        .duration(1000)
        .attr("cx", function (d) {
            return x(0) + 165;
        })
        .attr("cy", function (d) {
            return y(d['sepal-length']);
        })

        // give color to the dots based on the class
        .style("fill", function (d) {
            return colorClass(d['class'])
        })

    // svg.selectAll("circle") .transition() .delay(function (d, i) { return (i *
    // 10) }) .duration(1000) .attr("cx", function (d) { return
    // x(d['petal-length']); }) .attr("cy", function (d) { return y(0); })  give
    // color to the dots based on the class .style("fill", function (d) { return
    // colorClass(d['class']) }); svg.selectAll("circle") .transition()
    // .delay(function(d,i){return(i*3)}) .duration(5000) .attr("cx", function (d) {
    // return x(d['petal-length']); } ) .attr("cy", function (d) { return
    // y(d['sepal-length']); } )  give color to the dots based on the class
    // .style("fill", function(d){ return colorClass(d['class']) });
    // console.log(num_circles); var tooltip = d3v4.select("#dataviz_area")
    // .append("div") .style("opacity", 0) .attr("class", "tooltip")
    // .style("background-color", "white") .style("border", "solid")
    // .style("border-width", "1px") .style("border-radius", "5px")
    // .style("padding", "10px") A function that change this tooltip when the user
    // hover a point. Its opacity is set to 1: we can now see it. Plus it set the
    // text and position of tooltip depending on the datapoint (d)

    var project_x_axis_scatter = function (d) {

        console.log("project_x_axis_scatter");

        x.domain([0, 9])
        svg
            .select(".myXaxis_scatter")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisBottom(x));

        y.domain([0, 10])
        svg
            .select(".myYaxis_scatter")
            .transition()
            .duration(2000)
            .attr("opacity", "0")
            .call(d3v4.axisLeft(y));

        // make each circle access to the axis
        svg
            .selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 10)
            })
            .duration(1000)
            .attr("cx", function (d) {
                return x(d['petal-length']);
            })
            .attr("cy", function (d) {
                return y(0);
            })

            // give color to the dots based on the class
            .style("fill", function (d) {
                return colorClass(d['class'])
            });

        // console.log("mouseover"); tooltip   .style("opacity", 1)
        // console.log(trial_mouseover) if (trial_mouseover>5) {    new X axis
        // x.domain([0,9])   svg.select(".myXaxis")   .transition()   .duration(2000)
        // .attr("opacity", "1")   .call(d3v4.axisBottom(x));   svg.selectAll("circle")
        // .transition()   .delay(function(d,i){return(i*3)})   .duration(1000)
        // .attr("cx", function (d) { return x(d['petal-length']); } )   .attr("cy",
        // function (d) { return y(d['sepal-length']); } )    give color to the dots
        // based on the class   .style("fill", function(d){ return
        // colorClass(d['class']) }); }

    }

    var project_y_axis_scatter = function (d) {

        console.log("project_y_axis_scatter");

        remove_boundaries_on2d_plot();

        x.domain([0, 9])
        svg
            .select(".myXaxis_scatter")
            .transition()
            .duration(2000)
            .attr("opacity", "0")
            .call(d3v4.axisBottom(x));

        y.domain([0, 10])
        svg
            .select(".myYaxis_scatter")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisLeft(y));

        // make each circle access to the axis
        svg
            .selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 10)
            })
            .duration(1000)
            .attr("cx", function (d) {
                return x(0);
            })
            .attr("cy", function (d) {
                return y(d['sepal-length']);
            })

            // give color to the dots based on the class
            .style("fill", function (d) {
                return colorClass(d['class'])
            });

        // console.log("mouseover"); tooltip   .style("opacity", 1)
        // console.log(trial_mouseover) if (trial_mouseover>5) {    new X axis
        // x.domain([0,9])   svg.select(".myXaxis")   .transition()   .duration(2000)
        // .attr("opacity", "1")   .call(d3v4.axisBottom(x));   svg.selectAll("circle")
        // .transition()   .delay(function(d,i){return(i*3)})   .duration(1000)
        // .attr("cx", function (d) { return x(d['petal-length']); } )   .attr("cy",
        // function (d) { return y(d['sepal-length']); } )    give color to the dots
        // based on the class   .style("fill", function(d){ return
        // colorClass(d['class']) }); }

    }

    var mousemove = function (d) {
        console.log("mousemove");
        // tooltip   .html("The exact value of<br>the Ground Living area is: " +
        // d['sepal-length'])   .style("left", (d3v4.mouse(this)[0]+90) + "px")  It is
        // important to put the +90: other wise the tooltip is exactly where the point
        // is an it creates a weird effect   .style("top", (d3v4.mouse(this)[1]) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set
    // opacity to 0 again
    var twoDPlot_scatter = function (d) {
        console.log("scatter 2d plot");

        x.domain([0, 9])
        svg
            .select(".myXaxis_scatter")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisBottom(x));

        y.domain([0, 10])
        svg
            .select(".myYaxis_scatter")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisLeft(y));

        svg
            .selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 3)
            })
            .duration(1000)
            .attr("cx", function (d) {
                return x(d['petal-length']);
            })
            .attr("cy", function (d) {
                return y(d['sepal-length']);
            })

            // give color to the dots based on the class
            .style("fill", function (d) {
                return colorClass(d['class'])
            });

        // tooltip   .transition()   .duration(200)   .style("opacity", 0)
    }

    // Add dots svg.append('g')   .selectAll("dot")
    // .data(data.filter(function(d,i){return i<100000}))  the .filter part is just
    // to keep a few dots on the chart, not all of them   .enter()
    // .append("circle")     .attr("cx", function (d) { return x(d['petal-length']);
    // } )     .attr("cy", function (d) { return y(d['sepal-length']); } )
    // .attr("r", 2)     .style("fill", "#69b3a2")     .style("opacity", 0.1)
    // .style("stroke", "white")   .on("mouseover", mouseover )   .on("mousemove",
    // mousemove )   .on("mouseleave", mouseleave );  svg.selectAll("circle")
    // d3v4.select("#dataviz_area") .on("mouseover", project_y_axis )
    // .on("mousemove", mousemove ) .on("mouseleave", twoDPlot );
    // d3v4.select("#next") .on("mouseover", mouseover ) .on("mouseleave",
    // mouseleave ); click d3v4.select("#next") .on("click", function() {
    // console.log("click"); }); force to click on the button #projectxaxia

    d3v4
        .select("#projectxaxia_scatter")
        // .on("mousemove", mousemove )
        .on("click", project_x_axis_scatter);

    d3v4
        .select("#projectyaxia_scatter")
        // .on("mousemove", mousemove )
        .on("click", project_y_axis_scatter);

    d3v4
        .select("#twoDPlot_scatter")
        // .on("mouseover", function() {   console.log("mouseover_next"); });
        .on("click", twoDPlot_scatter);

    // }) if user mouse over the dot, show the class

}

// function all_possible_corr() { } box plot, second chart
function boxplot_direct_from_y() {

    var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 0
        },
        width = 500 - margin.left - margin.right,
        height = 350 * 600 / 500 - margin.top - margin.bottom;

    console.log("width-boxplot", width)
    console.log("height-boxplot", height)

    d3v4 = d3v4
    console.log("inside!!!!_d3version4")
    console.log(d3v4.version)

    console.log("inside!!!!_d3v3")
    console.log(d3v3.version)

    var svg = d3v4
        .select("#dataviz_area_div_boxplot")
        .append("svg")
        .attr("id", "dataviz_area_div_svg_boxplot")
        // .attr("width", width + margin.left + margin.right) .attr("height", height +
        // margin.top + margin.bottom) .attr("viewBox", `-25 -15 400 250`)
        .attr("viewBox", `-25 -20 500 400`)

    // Add X axis
    var x = d3v4
        .scaleLinear()
        .domain([0, 0])
        // get width from viewbox width
        .range([0, width]);

    svg
        .append("g")
        .attr("class", "myXaxis_boxplot") // Note that here we give a class to the X axis, to be able to call it later and modify it
        // .attr("transform", "translate(0," + height + ")")
        .attr("transform", "translate(0," + height + ")")
        .call(d3v4.axisBottom(x))
        .attr("opacity", "0")

        // show white axis
        .attr("stroke", "black")

    // Add Y axis scaleLinear show integer number var formatxAxis =
    // d3v4.format('.0f');

    var y = d3v4
        .scaleLinear()
        // .domain([0, 10])
        .domain([4, 8.5])
        // .domain([0, 0]) format in y axis is integer .tickFormat(formatxAxis)
        .range([height, 0]);

    // svg.append("g") .call(d3v4.axisLeft(y))

    svg
        .append("g")
        .attr("class", "myYaxis_boxplot") // Note that here we give a class to the X axis, to be able to call it later and modify it
        // .attr("transform", "translate(0, 0)") .attr("transform", "translate"+"(" +
        // width +",0" + ")") .attr("transform", "translate"+"(" + -width +",0" + ")")
        // .attr("transform", "translate(0," + width + ")")
        .attr("transform", "translate(0,0)")
        .call(d3v4.axisLeft(y))
        .attr("opacity", "1")
        .attr("stroke", "black")
        // .attr("stroke-width", "1px") .attr("stroke-width", "1px") .attr('text','y
        // axis')
        .append("text")
        .attr("fill", "black") //set the fill here

        // make the title of y axis always located in the end of the y axis. But make
        // the title of y axia and the y axis not overlap .attr("transform",
        // "translate(" + -margin.left + " ," + height / 2 + ")rotate(-90)")
        .attr("transform", "translate(" + 30 + " ," + -10 + ")")
        .text("sepal-length");

    // draw triangles 4, 8.5 i=0; while (i<=2) {   svg.append("path")   .attr("d",
    // d3v4.symbol().type(d3v4.symbolTriangle).size(100))    .attr("transform",
    // function(d) { return "translate(" + x(0) + "," + 120+i + ")"; })
    // .attr("transform", "rotate(90)")    rotate and translate   .attr("transform",
    // "rotate(90) translate(" + x(0) + "," + y(4+i) + ")")    .attr("transform",
    // function(d) { return "translate(" + x(0) + "," + y(4+i) + ") rotate(90)"; })
    // .attr("fill", "black")   .attr("opacity", "0.5")   .attr("id", "triangle" +
    // i)   i+=30 } translate(-1,119.7666625976562510)
    // translate(1,238.7666625976562510) Add rect
    svg
        .append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("rect")
        // sepal-length', 'sepal-width', 'petal-length', 'petal-width best .attr("x",
        // function (d) { return x(0)+165; } )
        .attr("x", function (d) {
            return locationByColorClass(d['class'])
        })
        // .attr("x", function(d){ return x(d['petal-length']) })
        .attr("y", function (d) {
            return y(d['sepal-length']);
        })
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", 5)
        .attr("height", 5)
        .attr("class", function (d) {
            return "class " + d['class']
        })
        .style("fill", "#69b3a2")
        // opacity
        .attr("opacity", "0.3")

    // new X axis x.domain([0,9]) svg.select(".myXaxis") .transition()
    // .duration(2000) .attr("opacity", "1") .call(d3v4.axisBottom(x));

    svg
        .selectAll("rect")
        .transition()
        .delay(function (d, i) {
            return (i * 3)
        })
        .duration(1000)

        // .attr("x", function (d) { return x(0)+165; } )
        .attr("x", function (d) {
            console.log("x", x(d['petal-length']))
            return locationByColorClass(d['class'])
        })
        // .attr("y", function (d) { return y(d['sepal-length']); } ) .attr("x",
        // function(d){ return x(d['petal-length']) })
        .attr("y", function (d) {
            return y(d['sepal-length']);
        })
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("width", 30)
        .attr("height", 5)

        // give color to the dots based on the class
        .style("fill", function (d) {
            return colorClass(d['class'])
        })
        .attr("opacity", "0.5")

    var num_rect = svg
        .selectAll("rect")
        .size();
    console.log("num_rect: ", num_rect)
    //

    var project_x_axis = function (d) {

        console.log("project_x_axis_boxplot");

        x.domain([0, 9])
        svg
            .select(".myXaxis")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisBottom(x));

        y.domain([0, 10])
        svg
            .select(".myYaxis")
            .transition()
            .duration(2000)
            .attr("opacity", "0")
            .call(d3v4.axisLeft(y));

        // make each circle access to the axis
        svg
            .selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 10)
            })
            .duration(1000)
            .attr("cx", function (d) {
                return x(d['petal-length']);
            })
            .attr("cy", function (d) {
                return y(0);
            })

            // give color to the dots based on the class
            .style("fill", function (d) {
                return colorClass(d['class'])
            });

        // console.log("mouseover"); tooltip   .style("opacity", 1)
        // console.log(trial_mouseover) if (trial_mouseover>5) {    new X axis
        // x.domain([0,9])   svg.select(".myXaxis")   .transition()   .duration(2000)
        // .attr("opacity", "1")   .call(d3v4.axisBottom(x));   svg.selectAll("circle")
        // .transition()   .delay(function(d,i){return(i*3)})   .duration(1000)
        // .attr("cx", function (d) { return x(d['petal-length']); } )   .attr("cy",
        // function (d) { return y(d['sepal-length']); } )    give color to the dots
        // based on the class   .style("fill", function(d){ return
        // colorClass(d['class']) }); }

    }

    var project_y_axis_boxplot = function (d) {

        // console.log("mouseover");

        remove_boundaries_on2d_plot();

        x.domain([0, 9])
        svg
            .select(".myXaxis_boxplot")
            .transition()
            .duration(2000)
            .attr("opacity", "0")
            .call(d3v4.axisBottom(x));

        y.domain([0, 10])
        svg
            .select(".myYaxis_boxplot")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisLeft(y));

        // make each circle access to the axis
        svg
            .selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 10)
            })
            .duration(1000)
            .attr("cx", function (d) {
                return x(0);
            })
            .attr("cy", function (d) {
                return y(d['sepal-length']);
            })

            // give color to the dots based on the class
            .style("fill", function (d) {
                return colorClass(d['class'])
            });

        // console.log("mouseover"); tooltip   .style("opacity", 1)
        // console.log(trial_mouseover) if (trial_mouseover>5) {    new X axis
        // x.domain([0,9])   svg.select(".myXaxis")   .transition()   .duration(2000)
        // .attr("opacity", "1")   .call(d3v4.axisBottom(x));   svg.selectAll("circle")
        // .transition()   .delay(function(d,i){return(i*3)})   .duration(1000)
        // .attr("cx", function (d) { return x(d['petal-length']); } )   .attr("cy",
        // function (d) { return y(d['sepal-length']); } )    give color to the dots
        // based on the class   .style("fill", function(d){ return
        // colorClass(d['class']) }); }

    }

    var barchart = function (d) {

        console.log("rotate_project_on_x_axis");

        // x.domain([0,9]) svg.select(".myXaxis") .transition() .duration(2000)
        // .attr("opacity", "1") .call(d3v4.axisBottom(x)); y.domain([0, 10])
        // svg.select(".myYaxis") .transition() .duration(2000) .attr("opacity", "0")
        // .call(d3v4.axisLeft(y)); x.domain([4,8.5])
        x.domain([4, 8.5])
        svg
            .select(".myXaxis_boxplot")
            .transition()
            .duration(2000)
            .attr("opacity", "0")
            .call(d3v4.axisBottom(x));

        svg
            .select(".myYaxis_boxplot")
            .transition()
            .duration(2000)
            .attr("opacity", "1")

        // calculate frequency of each class by data[1]['sepal-length']
        var frequency_class1 = {};
        var frequency_class2 = {};
        var frequency_class3 = {};

        for (var i = 0; i < data.length; i++) {
            // data[i]['class'] == '0'

            if (data[i]['class'] == '0') {
                // add count to frequency_class1[data[i]['sepal-length']]
                if (frequency_class1[data[i]['sepal-length']] == undefined) {
                    frequency_class1[data[i]['sepal-length']] = 1;
                } else {
                    frequency_class1[data[i]['sepal-length']] += 1;
                }
            } else if (data[i]['class'] == '1') {
                // add count to frequency_class2[data[i]['sepal-length']]
                if (frequency_class2[data[i]['sepal-length']] == undefined) {
                    frequency_class2[data[i]['sepal-length']] = 1;
                } else {
                    frequency_class2[data[i]['sepal-length']] += 1;
                }
            } else if (data[i]['class'] == '2') {
                // add count to frequency_class3[data[i]['sepal-length']]
                if (frequency_class3[data[i]['sepal-length']] == undefined) {
                    frequency_class3[data[i]['sepal-length']] = 1;
                } else {
                    frequency_class3[data[i]['sepal-length']] += 1;
                }
            }

        }

        // console.log(frequency_class1[4.3]);
        console.log(frequency_class1);
        // get all keys of frequency_class1
        var keys_1 = Object.keys(frequency_class1);
        console.log(frequency_class2);
        var keys_2 = Object.keys(frequency_class2);
        console.log(frequency_class3);
        var keys_3 = Object.keys(frequency_class3);

        //  set union keys_1, keys_2, keys_3
        var keys = keys_1.concat(keys_2, keys_3);
        keys = [...new Set(keys)];
        // sort keys
        keys.sort(function (a, b) {
            return a - b
        });
        console.log("keys:", keys);
        // show length of keys
        console.log("length of keys:", keys.length);

        //  print if frequency_class1 show how many rectangles exist
        console.log("number of rectangles:", svg.selectAll("rect").size());

        // remove any rectangles if the keys.length is less than the number of
        // rectangles that is, for example, if keys.length is 35, only 35 rectangles
        // should be shown when rectangles are removed, make it fade out

        if (keys.length < svg.selectAll("rect").size()) {

            console.log("remove rectangles");
            // svg.selectAll("rect") .data(keys) .transition() .duration(1000)
            // .attr("opacity", "0") .remove();
            console.log("after number of rectangles:", svg.selectAll("rect").size());

            svg
                .selectAll("rect")
                .data(keys)
                .exit()
                .remove();

        }

        // rotate 90 degree of rectangles
        svg
            .selectAll("rect")
            // .attr('opacity',0)
            .transition()
            .delay(function (d, i) {
                return (i * 5)
            })
            .duration(1000)

            // .attr("cx", function (d) { return x(d['petal-length']); } ) .attr("cy",
            // function (d) { return y(0); } )  give color to the dots based on the class
            // .style("fill", function(d){ return colorClass(d['class']) });
            // .attr('transform', 'translate(400,100)rotate(90)') .attr('transform',
            // 'translate(300,100) rotate(90)') .attr('transform', 'translate(400,100)')
            // .attr('transform', 'rotate(90)') .attr('transform',
            // 'translate(100,400)rotate(-90)') .attr('transform',
            // 'rotate(-90)translate(10,200)')
            .attr('opacity', 0.5)
            // .attr("x", function(d){ return x(0) });
            .transition()
            .delay(function (d, i) {
                return (i * 5)
            })
            .duration(1000)
            .attr("x", function (d) {
                // console.log("x(6)") console.log(x(6))
                return x(4);
            })
        // console.log("mouseover"); tooltip   .style("opacity", 1)
        // console.log(data[1]['petal-length']); console.log(data[1]['sepal-length']);
        // console.log(data); console.log(data[1]['sepal-length']);

        svg
            .selectAll("rect")
            //  get each rectangle's class attribute
            .filter(function (d, i) {
                return d3v4
                    .select(this)
                    .attr("class") == "class 0"
            })
            // .transition() .delay(function(d,i){return(i*10)}) .duration(1000)  change
            // each rectangle's height based on frequency_class3 dictionary
            .attr("width", function (d, i) {

                console.log(frequency_class1[keys_1[i]])
                return 20 * frequency_class1[keys_1[i]]
            })

        svg
            .selectAll("rect")
            //  get each rectangle's class attribute
            .filter(function (d, i) {
                return d3v4
                    .select(this)
                    .attr("class") == "class 1"
            })
            // .transition() .delay(function(d,i){return(i*10)}) .duration(1000)  change
            // each rectangle's height based on frequency_class3 dictionary
            .attr("width", function (d, i) {

                console.log(frequency_class2[keys_2[i]])
                return 20 * frequency_class2[keys_2[i]]

            })

        svg
            .selectAll("rect")
            //  get each rectangle's class attribute
            .filter(function (d, i) {
                return d3v4
                    .select(this)
                    .attr("class") == "class 2"
            })
            // .transition() .delay(function(d,i){return(i*10)}) .duration(1000)  change
            // each rectangle's height based on frequency_class3 dictionary
            .attr("width", function (d, i) {

                console.log(frequency_class3[keys_3[i]])
                return 20 * frequency_class3[keys_3[i]]

            })

        // plot rectangles based on frequency_class1, frequency_class2, frequency_class3
        // each rectangle has height frequency_class1 each rectangle has width 0.5 each
        // rectangle has x = data[i]['sepal-length'] plot rectangles based on the
        // frequency console.log(trial_mouseover) if (trial_mouseover>5) {    new X axis
        // x.domain([0,9])   svg.select(".myXaxis")   .transition()   .duration(2000)
        // .attr("opacity", "1")   .call(d3v4.axisBottom(x));   svg.selectAll("circle")
        // .transition()   .delay(function(d,i){return(i*3)})   .duration(1000)
        // .attr("cx", function (d) { return x(d['petal-length']); } )   .attr("cy",
        // function (d) { return y(d['sepal-length']); } )    give color to the dots
        // based on the class   .style("fill", function(d){ return
        // colorClass(d['class']) }); }

    }

    var mousemove = function (d) {
        console.log("mousemove");
        // tooltip   .html("The exact value of<br>the Ground Living area is: " +
        // d['sepal-length'])   .style("left", (d3v4.mouse(this)[0]+90) + "px")  It is
        // important to put the +90: other wise the tooltip is exactly where the point
        // is an it creates a weird effect   .style("top", (d3v4.mouse(this)[1]) + "px")
    }

    var mouseover = function (d) {
        console.log("mouseover y axis");
    }

    var showboundaries_boxplot = function (d) {

        // check there are d3v4.symbolCircle or not if there are d3v4.symbolCircle, then
        // change the candicate_points. translate(-1,119.7666625976562510)
        // translate(1,238.7666625976562510)

        candiate_points = [
            [
                1, 176
            ],
            [
                1, 240
            ],
            [
                1, 112
            ],
            [
                1, 264
            ]
        ]

        for (i = 0; i < candiate_points.length; i++) {
            svg
                .append("path")
                .attr("d", d3v4.symbol().type(d3v4.symbolCircle).size(95))
                .attr("transform", function (d) {
                    console.log("x point", d3v4.mouse(this)[0])
                    console.log("y point", d3v4.mouse(this)[1])
                    return "translate(" + candiate_points[i][0] + "," +
                            candiate_points[i][1] + ")";
                })
                // show fade in effect
                .style("opacity", 0)
                .transition()
                .duration(2000)
                // .style("opacity", 0.5)
                .style("opacity", function (d) {
                    if (i / 2 < 1) {
                        return 0.5
                    } else if (i / 2 >= 1) {
                        return 0
                    }
                })
                // .style("fill", "red") .style("stroke", "red")
                .style("fill", "rgb(37, 14, 14)")
                .style("stroke", "rgb(37, 14, 14)")
                .style("stroke-width", 1)
                // .attr("class", "circle_symbol_indicator")
                .attr("id", "indicator" + i)
                .attr("class", function (d) {
                    if (i / 2 < 1) {
                        return "circle_symbol_indicator_first"
                    } else if (i / 2 >= 1) {
                        return "circle_symbol_indicator_second"
                    }

                })

            // make rectangles
            svg
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 0)
                .attr("height", 0)
                .attr("transform", function (d) {
                    return "translate(" + candiate_points[i][0] + "," +
                            candiate_points[i][1] + ")";
                })
                .style("opacity", 0)
                .transition()
                .duration(2000)
                // .style("opacity", 0.5)
                .style("opacity", function (d) {
                    if (i / 2 < 1) {
                        return 0.5
                    } else if (i / 2 >= 1) {
                        return 0
                    }
                })
                // .style("fill", "red") .style("stroke", "red")
                .style("fill", "rgb(37, 14, 14)")
                .style("stroke", "rgb(37, 14, 14)")
                .style("stroke-width", 1)
                // .attr("class", "rect_indicator")
                .attr("id", "indicator")
                .attr("class", function (d) {
                    if (i / 2 < 1) {
                        return "rect_indicator_first"
                    } else if (i / 2 >= 1) {
                        return "rect_indicator_second"
                    }
                })
                .attr("width", 500)
                .attr("height", 0.5)
            // .attr("x", -50) .attr("y", -50)

        }
        // svg.append("path")  .attr("d",
        // d3v4.symbol().type(d3v4.symbolDiamond).size(95)) .attr("d",
        // d3v4.symbol().type(d3v4.symbolCircle).size(95)) .attr("transform",
        // function(d) {   console.log("x point",d3v4.mouse(this)[0])   console.log("y
        // point",d3v4.mouse(this)[1])   return "translate(" + 1+ "," + 200 + ")"; })
        // .style("fill", "black") .style("stroke", "black") .style("stroke-width", 1)
        // .style("opacity", 0.5) .attr("class", "tri_temp")

    }

    var showboundariesSecondBound_boxplot = function (d) {

        console.log("showboundariesSecondBound")

        // circle_symbol_indicator_first rect_indicator_first make class
        // circle_symbol_indicator_first and rect_indicator_first to fade away
        d3v4
            .selectAll(".circle_symbol_indicator_first")
            .transition()
            .duration(2000)
            .style("opacity", 0)
            .style("fill", "red")
            .style("stroke", "red")
            .style("stroke-width", 1)

        d3v4
            .selectAll(".rect_indicator_first")
            .transition()
            .duration(2000)
            .style("opacity", 0)
            // .style("fill", "red") .style("stroke", "red")
            .style("fill", "rgb(37, 14, 14)")
            .style("stroke", "rgb(37, 14, 14)")
            .style("stroke-width", 1)

        d3v4
            .selectAll(".circle_symbol_indicator_second")
            .transition()
            .duration(2000)
            .style("opacity", 0.5)
            // .style("fill", "red") .style("stroke", "red")
            .style("fill", "rgb(37, 14, 14)")
            .style("stroke", "rgb(37, 14, 14)")
            .style("stroke-width", 1)

        d3v4
            .selectAll(".rect_indicator_second")
            .transition()
            .duration(2000)
            .style("opacity", 0.5)
            // .style("fill", "red") .style("stroke", "red")
            .style("fill", "rgb(37, 14, 14)")
            .style("stroke", "rgb(37, 14, 14)")
            .style("stroke-width", 1)

    }

    var showpiechart_v1 = function (d) {
        console.log("showpiechart")

        var margin = {
                top: 30,
                right: 30,
                bottom: 30,
                left: 0
            },
            width = 500 - margin.left - margin.right,
            height = 350 * 600 / 500 - margin.top - margin.bottom;

        var svg = d3v4
            .select("#dataviz_area_div_second_boxplot")
            .append("svg")
            .attr("id", "dataviz_area_div_svg_second")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .attr("viewBox", `-25 -15 400 250`)
            .attr("viewBox", `-200 -180 500 400`)

        // generate random show pie chart
        var data_pc = [10, 20, 100];

        // var width = 960,     height = 500,     radius = Math.min(width, height) / 2;
        // var width = 960, height = 500,
        var radius = Math.min(width, height) / 3;

        var color = d3v4
            .scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888"]);

        var arc = d3v4
            .arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var labelArc = d3v4
            .arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3v4
            .pie()
            .sort(null)
            .value(function (d) {
                return d;
            });

        var g = svg
            .selectAll(".arc")
            .data(pie(data_pc))
            .enter()
            .append("g")
            // show fade in effect  .style("opacity", 1) .style("opacity", 0) .transition()
            // .duration(2000)
            .style("opacity", 0)
            .attr("class", "arc")
            .attr("id", "first_piechart");

        g
            .append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data);
            });

        g
            .append("text")
            // fade in effect
            .style("opacity", 0)
            .transition()
            .duration(2000)
            .style("opacity", 1)
            .attr("transform", function (d) {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function (d) {
                return d.data;
            });

        // fade in effect
        g
            .style("opacity", 0)
            .transition()
            .duration(2000)
            .style("opacity", 1)

    }

    var showpiechart_v1_reset = function (d) {
        console.log("showpiechart")

        var margin = {
                top: 30,
                right: 30,
                bottom: 30,
                left: 0
            },
            width = 500 - margin.left - margin.right,
            height = 350 * 600 / 500 - margin.top - margin.bottom;

        // remove all under svg id = dataviz_area_div_svg_second with fade out effect
        d3v4
            .select("#dataviz_area_div_svg_second")
            .selectAll("*")
            .transition()
            .duration(2000)
            .style("opacity", 0)
            .remove()

        // remove svg id = dataviz_area_div_svg_second
        d3v4
            .select("#dataviz_area_div_svg_second")
            .remove()

        // d3v4.select("#dataviz_area_div_svg_second").selectAll("*").remove();

        var svg = d3v4
            .select("#dataviz_area_div_second_boxplot")
            .append("svg")
            .attr("id", "dataviz_area_div_svg_second")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .attr("viewBox", `-25 -15 400 250`)
            .attr("viewBox", `-200 -180 500 400`)

        // generate random show pie chart
        var data_pc = [30, 10, 90];

        // var width = 960,     height = 500,     radius = Math.min(width, height) / 2;
        // var width = 960, height = 500,
        var radius = Math.min(width, height) / 3;

        var color = d3v4
            .scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888"]);

        var arc = d3v4
            .arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var labelArc = d3v4
            .arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3v4
            .pie()
            .sort(null)
            .value(function (d) {
                return d;
            });

        var g = svg
            .selectAll(".arc")
            .data(pie(data_pc))
            .enter()
            .append("g")
            // show fade in effect  .style("opacity", 1) .style("opacity", 0) .transition()
            // .duration(2000)
            .style("opacity", 0)
            .attr("class", "arc")
            .attr("id", "first_piechart");

        g
            .append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data);
            });

        g
            .append("text")
            // fade in effect
            .style("opacity", 0)
            .transition()
            .duration(2000)
            .style("opacity", 1)
            .attr("transform", function (d) {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function (d) {
                return d.data;
            });

        // fade in effect
        g
            .style("opacity", 0)
            .transition()
            .duration(2000)
            .style("opacity", 1)

        // make pie chart fade effecy when change the data of the pie chart
        // d3v4.selectAll("#first_piechart") .transition() .duration(2000)
        // .style("opacity", 0) .remove() var data_pc_second = [25, 100, 10]; var g =
        // svg.selectAll(".arc")     .data(pie(data_pc_second))     .enter()
        // .append("g")       show fade in effect       .style("opacity", 1)
        // .style("opacity", 0)      .transition()      .duration(2000)
        // .style("opacity", 0)     .attr("class", "arc")
        // .attr("id","first_piechart"); g.append("path")     .attr("d", arc)
        // .style("fill", function(d) { return color(d.data); }); g.append("text")
        // fade in effect     .style("opacity", 0)     .transition()     .duration(2000)
        // .style("opacity", 1)     .attr("transform", function(d) { return "translate("
        // + labelArc.centroid(d) + ")"; })     .attr("dy", ".35em")
        // .text(function(d) { return d.data; });  fade in effect g.style("opacity", 0)
        // .transition() .duration(2000) .style("opacity", 1)

    }

    var showpiechart_v2 = function (d) {
        console.log("showpiechart")

    }

    var showdonumchart = function (d) {

        var dataset = {
            apples: [
                53245, 28479, 19697, 24037, 40245
            ],
            oranges: [200, 200, 200, 200]
        };

        var width = 960,
            height = 500,
            radius = Math.min(width, height) / 2;

        var enterClockwise = {
            startAngle: 0,
            endAngle: 0
        };

        var enterAntiClockwise = {
            startAngle: Math.PI * 2,
            endAngle: Math.PI * 2
        };

        var color = d3v4
            .scale
            .category20();

        var pie = d3v4
            .layout
            .pie()
            .sort(null);

        var arc = d3v4
            .svg
            .arc()
            .innerRadius(radius - 100)
            .outerRadius(radius - 20);

        var svg = d3v4
            .select('#Donut-chart')
            .append('svg')
            .attr('id', 'Donut-chart-render')
            .attr("width", '100%')
            .attr("height", '100%')
            .attr(
                'viewBox',
                (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height
            )
            .attr('preserveAspectRatio', 'xMinYMin')

        var path = svg
            .selectAll("path")
            .data(pie(dataset.apples))
            .enter()
            .append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", arc(enterClockwise))
            .each(function (d) {
                this._current = {
                    data: d.data,
                    value: d.value,
                    startAngle: enterClockwise.startAngle,
                    endAngle: enterClockwise.endAngle
                }
            });

        path
            .transition()
            .duration(750)
            .attrTween("d", arcTween);

        d3v4
            .selectAll("input")
            .on("change", change);

        var timeout = setTimeout(function () {
            d3v4
                .select("input[value=\"oranges\"]")
                .property("checked", true)
                .each(change);
        }, 2000);

        function change() {
            clearTimeout(timeout);
            path = path.data(pie(dataset[this.value]));
            path
                .enter()
                .append("path")
                .attr("fill", function (d, i) {
                    return color(i);
                })
                .attr("d", arc(enterAntiClockwise))
                .each(function (d) {
                    this._current = {
                        data: d.data,
                        value: d.value,
                        startAngle: enterAntiClockwise.startAngle,
                        endAngle: enterAntiClockwise.endAngle
                    };
                }); // store the initial values

            path
                .exit()
                .transition()
                .duration(750)
                .attrTween('d', arcTweenOut)
                .remove() // now remove the exiting arcs

            path
                .transition()
                .duration(750)
                .attrTween("d", arcTween); // redraw the arcs
        }

        function arcTween(a) {
            var i = d3v4.interpolate(this._current, a);
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }
        function arcTweenOut(a) {
            var i = d3v4.interpolate(this._current, {
                startAngle: Math.PI * 2,
                endAngle: Math.PI * 2,
                value: 0
            });
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }

        function type(d) {
            d.value = +d.value;
            return d;
        }

    }

    var test = function (d) {
        console.log("test");
    }

    var thickyaxis_boxplot = function (d) {
        // make it thicker when mouse over on y axis class myYaxis
        d3v4
            .select(".myYaxis_boxplot")
            .style("stroke-width", 3)
            .style("opacity", 1)
    }

    var normalyaxis_boxplot = function (d) {
        // make it thicker when mouse over on y axis class myYaxis
        d3v4
            .select(".myYaxis_boxplot")
            .style("stroke-width", 1)
            .style("opacity", 1)
    }

    // for scatter plot     var twoDPlot = function (d) {
    // console.log("mouseleave_hello");       x.domain([0, 9])
    // svg.select(".myXaxis_scatter")         .transition()         .duration(2000)
    // .attr("opacity", "1")         .call(d3v4.axisBottom(x));       y.domain([0,
    // 10])       svg.select(".myYaxis_scatter")         .transition()
    // .duration(2000)         .attr("opacity", "1")
    // .call(d3v4.axisLeft(y));       svg.selectAll("circle")         .transition()
    // .delay(function (d, i) { return (i * 3) })         .duration(1000)
    // .attr("cx", function (d) { return x(d['petal-length']); })
    // .attr("cy", function (d) { return y(d['sepal-length']); })          give
    // color to the dots based on the class         .style("fill", function (d) {
    // return colorClass(d['class']) });        tooltip          .transition()
    // .duration(200)          .style("opacity", 0)     }
    // d3v4.select("#projectyaxia_boxplot")   .on("click", project_y_axis_boxplot);
    // d3v4.select("#twoDPlot")   .on("click", twoDPlot);
    // d3v4.select("#rotateprojectxaxia") .on("click", rotate_project_on_x_axis );

    d3v4
        .select("#rotateprojectxaxia_boxplot")
        .on("click", barchart);

    // mouse over on the class myYaxis
    d3v4
        .select(".myYaxis_boxplot")
        .on("mouseover", thickyaxis_boxplot)
        .on("mouseout", normalyaxis_boxplot)
        .on("click", showboundaries_boxplot);
    // .on("dblclick", showpiechart_v1); d3v4.select("#show_piechart")
    // .on("click", showpiechart_v1); d3v4.select("#show_piechart_another")
    // .on("click", showpiechart_v1_reset); if select fbbfirsttosecondbound
    d3v4
        .select("#fbbfirsttosecondbound_boxplot")
        .on("click", showboundariesSecondBound_boxplot)
    //  .on("click", showpiechart ); .on("click", test ); })

}

function decisiontree() {

    d3v3 = d3v3

    var label_names;

    var TOTAL_SIZE;
    // default_colors = [   "#c25975", "#d26bff", "#2d5a47", "#093868", "#fcdfe6",
    // "#94a2fa", "#faec94", "#decaee", "#daeeca", "#b54c0a", "#dc1818", "#18dcdc",
    // "#000000", "#340000", "#86194c", "#fef65b", "#ff9b6f", "#491b47", "#171717",
    // "#e8efec", "#1c6047", "#a2bae0", "#4978c3", "#f8fee0", "#dcfb66", "#91fb66",
    // "#29663b", "#b4b7be", "#0088b2", "#88b200", "#c43210", "#f06848", "#f0bc48",
    // "#d293a2", "#cccccc", "#59596a", "#fafae6", "#ffc125", "#ff4e50", "#f0e6fa",
    // "#f6c1c3", "#363636" ]

    default_colors = [
        "#74BFA1",
        "#E37852",
        "#2d5a47",
        "#093868",
        "#fcdfe6",
        "#94a2fa",
        "#faec94",
        "#decaee",
        "#daeeca",
        "#b54c0a",
        "#dc1818",
        "#18dcdc",
        "#000000",
        "#340000",
        "#86194c",
        "#fef65b",
        "#ff9b6f",
        "#491b47",
        "#171717",
        "#e8efec",
        "#1c6047",
        "#a2bae0",
        "#4978c3",
        "#f8fee0",
        "#dcfb66",
        "#91fb66",
        "#29663b",
        "#b4b7be",
        "#0088b2",
        "#88b200",
        "#c43210",
        "#f06848",
        "#f0bc48",
        "#d293a2",
        "#cccccc",
        "#59596a",
        "#fafae6",
        "#ffc125",
        "#ff4e50",
        "#f0e6fa",
        "#f6c1c3",
        "#363636"
    ]

    // default_colors = [   "#18dcdc", "#d26bff", "#2d5a47", "#093868", "#fcdfe6",
    // "#94a2fa", "#faec94", "#decaee", "#daeeca", "#b54c0a", "#dc1818", "#c25975",
    // "#000000", "#340000", "#86194c", "#fef65b", "#ff9b6f", "#491b47", "#171717",
    // "#e8efec", "#1c6047", "#a2bae0", "#4978c3", "#f8fee0", "#dcfb66", "#91fb66",
    // "#29663b", "#b4b7be", "#0088b2", "#88b200", "#c43210", "#f06848", "#f0bc48",
    // "#d293a2", "#cccccc", "#59596a", "#fafae6", "#ffc125", "#ff4e50", "#f0e6fa",
    // "#f6c1c3", "#363636" ] differnt combination of colors default_colors =
    // *************************************
    // Options******************************************************// var file_name
    // = "structureC1.json"  generator_1 var file_namev2 = "structureC2_origin.json"
    // generator_2

    var file_name = "structure_iris_dc_1.json" // generator_1
        var file_namev2 = "structure_iris_dc_1.json" // generator_2

            // var file_name = "structure_iris_dc_1_80_size.json"  generator_1 var
            // file_namev2 = "structure_iris_dc_1_80_size.json"  generator_2 var file_name =
            // "structure.json"  generator_1 var file_namev2 = "structure.json"  generator_2
            var version2 = true // if true json from generator_2 will be used

                var tree_branch = false // if the thickness of the branches depend on the value of targt + color * /
                    var tree_branch_parent = true //  true: thickness from the root if not the direct parent
                        // var tree_branch_color = "black"

                        var tree_branch_color = "#A3A6A8"
                            var strokeness = 120 //  the degree of separation between the nodes
                                var default_strokeness = 50
                                    var hover_percent_parent = false // if the display percentage depends on the direct parent or the root
                                        var square = false
                                            var rect_percent = true //display the percentage or the value in the small rectangles of the labels
                                                var value_percent_top = true /// if we display the value and the percentage above the rectangle /

                                                    var dict_leaf_y = {
                                                            1: 0,
                                                            2: -17.5,
                                                            3: -35,
                                                            4: -52.5,
                                                            5: -70,
                                                            6: -87.5,
                                                            6: -105,
                                                            7: -122.5,
                                                            8: -140,
                                                            9: -157.5,
                                                            10: -175
                                                        }

                                                        /****************************************************************************************************** */

                                                        getDepth = function (obj) {
                                                            var depth = 0;
                                                            if (obj.children) {
                                                                obj
                                                                    .children
                                                                    .forEach(function (d) {
                                                                        var tmpDepth = getDepth(d)
                                                                        if (tmpDepth > depth) {
                                                                            depth = tmpDepth
                                                                        }
                                                                    })
                                                            }
                                                            return 1 + depth
                                                        }

                                                        // var margin = { top: 20, right: 120, bottom: 20, left: 180 },   width = 2000 +
                                                        // 960 - margin.right - margin.left,   height = 800 - margin.top -
                                                        // margin.bottom; current var margin = { top: 30, right: 30, bottom: 30, left: 0
                                                        // },   width = 500 - margin.left - margin.right,   height = 350 * 600 / 500 -
                                                        // margin.top - margin.bottom;

                                                        var margin = {
                                                                top: 30,
                                                                right: 30,
                                                                bottom: 30,
                                                                left: 0
                                                            },
                                                            width = 700 - margin.left - margin.right,
                                                            height = 350 * 600 / 500 - margin.top - margin.bottom;

                                                        console.log("width-decT", width)
                                                        console.log("height-decT", height)

                                                        // console.log("width-decT", width) console.log("height-decT", height)
                                                        var i = 0,
                                                            duration = 550,
                                                            root;

                                                        var tree
                                                        var diagonal
                                                        var svg

                                                        var filetochoose = version2
                                                            ? file_namev2
                                                            : file_name

                                                        // d3v3.json(filetochoose, function (error, flare) {   if (error) throw error;
                                                        // console.log(getDepth(flare))   tree = d3v3.layout.tree()
                                                        // .separation(function (a, b) { return ((a.parent == root) && (b.parent ==
                                                        // root)) ? strokeness : strokeness; })     .size([height, getDepth(flare) *
                                                        // width / 8]);   diagonal = d3v3.svg.diagonal()     .projection(function (d) {
                                                        // return [d.y, d.x]; });    svg = d3v3.select("body").append("svg")
                                                        // .attr("width", getDepth(flare) * width / 8 + margin.right + margin.left)
                                                        // .attr("height", height + margin.top + margin.bottom)      .append("g")
                                                        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                                                        // svg = d3v3.select("#dataviz_area_div")     .append("svg")     .attr("id",
                                                        // "dataviz_area_div_svg")     .attr("width", width + margin.left +
                                                        // margin.right)     .attr("height", height + margin.top + margin.bottom)
                                                        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                                        // .attr("viewBox", `-25 -15 400 250`)      .attr("viewBox", `-30 -30 500 400`)
                                                        // current      .attr("viewBox", `-90 -30 500 400`)      .attr("viewBox", `-90
                                                        // -30 600 800`)        .attr("viewBox", `-90 -30 600 500`)
                                                        // .attr("viewBox", `30 -80 600 600`)   TOTAL_SIZE = flare.size   l =
                                                        // flare.pred.replace(/of/g, "").split(', ')   for (var j = 0; j < l.length;
                                                        // j++) {     l[j] = l[j].split(' ')[2]   }   label_names = l   root = flare;
                                                        // root.x0 = height / 2;   root.y0 = 0;   function collapse(d) {     if
                                                        // (d.children) {       d._children = d.children;
                                                        // d._children.forEach(collapse);       d.children = null;     }   }
                                                        // root.children.forEach(collapse);   update(root, l.length);
                                                        // createLabels(l); }); get data from the iris_tree_data.js

                                                        var iris_tree_Data = {
                                                            "name": "petal length (cm) > 2.45000004768",
                                                            "pred": "100 of no, 50 of yes",
                                                            "children": [
                                                                {
                                                                    "children": [
                                                                        {
                                                                            "children": [
                                                                                {

                                                                                    "name": "The number of data = 43",
                                                                                    "children": [

                                                                                        {

                                                                                            "name": "0 = setosa",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 0,
                                                                                            "pred": "0 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "0 = versicolor",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 0,
                                                                                            "pred": "0 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "43 = virginica",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 43,
                                                                                            "pred": "43 of no, 0 of yes"
                                                                                        }

                                                                                    ],
                                                                                    "side": "right",
                                                                                    "type": "categorical",
                                                                                    "size": 43,
                                                                                    "pred": "0 of no, 0 of yes"
                                                                                }, {

                                                                                    "name": "The number of data = 3",
                                                                                    "children": [

                                                                                        {

                                                                                            "name": "0 = setosa",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 0,
                                                                                            "pred": "0 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "1 = versicolor",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 1,
                                                                                            "pred": "1 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "2 = virginica",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 2,
                                                                                            "pred": "2 of no, 0 of yes"
                                                                                        }

                                                                                    ],
                                                                                    "side": "right",
                                                                                    "type": "categorical",
                                                                                    "size": 3,
                                                                                    "pred": "0 of no, 0 of yes"
                                                                                }

                                                                            ],
                                                                            "name": "petal length (cm) > 4.85000038147",
                                                                            "side": "right",
                                                                            "type": "categorical",
                                                                            "size": 46,
                                                                            "pred": "43 of no, 3 of yes"
                                                                        }, {

                                                                            "name": "petal length (cm) > 4.94999980927",
                                                                            "children": [

                                                                                {

                                                                                    "name": "The number of data = 6",
                                                                                    "children": [

                                                                                        {

                                                                                            "name": "0 = setosa",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 0,
                                                                                            "pred": "0 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "2 = versicolor",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 2,
                                                                                            "pred": "2 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "4 = virginica",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 4,
                                                                                            "pred": "4 of no, 0 of yes"
                                                                                        }

                                                                                    ],
                                                                                    "side": "right",
                                                                                    "type": "categorical",
                                                                                    "size": 6,
                                                                                    "pred": "0 of no, 0 of yes"
                                                                                }, {

                                                                                    "name": "The number of data = 48",
                                                                                    "children": [

                                                                                        {

                                                                                            "name": "0 = setosa",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 0,
                                                                                            "pred": "0 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "47 = versicolor",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 47,
                                                                                            "pred": "47 of no, 0 of yes"
                                                                                        }, {

                                                                                            "name": "1 = virginica",
                                                                                            "children": [],
                                                                                            "side": "right",
                                                                                            "type": "categorical",
                                                                                            "size": 1,
                                                                                            "pred": "1 of no, 0 of yes"
                                                                                        }

                                                                                    ],
                                                                                    "side": "right",
                                                                                    "type": "categorical",
                                                                                    "size": 48,
                                                                                    "pred": "0 of no, 0 of yes"
                                                                                }

                                                                            ],
                                                                            "side": "left",
                                                                            "type": "categorical",
                                                                            "size": 54,
                                                                            "pred": "6 of no, 48 of yes"
                                                                        }
                                                                    ],
                                                                    "name": "petal width (cm) > 1.75",
                                                                    "side": "right",
                                                                    "type": "numerical",
                                                                    "size": 100,
                                                                    "pred": "46 of no, 54 of yes"
                                                                }, {
                                                                    "name": "The number of data = 50",
                                                                    "children": [

                                                                        {

                                                                            "name": "50 = setosa",
                                                                            "children": [],
                                                                            "side": "right",
                                                                            "type": "categorical",
                                                                            "size": 50,
                                                                            "pred": "50 of no, 0 of yes"
                                                                        }, {

                                                                            "name": "0 = versicolor",
                                                                            "children": [],
                                                                            "side": "right",
                                                                            "type": "categorical",
                                                                            "size": 0,
                                                                            "pred": "0 of no, 0 of yes"
                                                                        }, {

                                                                            "name": "0 = virginica",
                                                                            "children": [],
                                                                            "side": "right",
                                                                            "type": "categorical",
                                                                            "size": 0,
                                                                            "pred": "0 of no, 0 of yes"
                                                                        }

                                                                    ],
                                                                    "side": "right",
                                                                    "type": "categorical",
                                                                    "size": 50,
                                                                    "pred": "0 of no, 0 of yes"
                                                                }
                                                            ],
                                                            "side": "right",
                                                            "size": 150
                                                        }

                                                        function loadDataIrisTree(flare) {

                                                            // console.log(getDepth(flare))

                                                            tree = d3v3
                                                                .layout
                                                                .tree()
                                                                .separation(function (a, b) {
                                                                    return ((a.parent == root) && (b.parent == root))
                                                                        ? strokeness
                                                                        : strokeness;
                                                                })
                                                                .size([
                                                                    height, getDepth(flare) * width / 8
                                                                ]);

                                                            diagonal = d3v3
                                                                .svg
                                                                .diagonal()
                                                                .projection(function (d) {
                                                                    return [d.y, d.x];
                                                                });

                                                            // svg = d3v3.select("body").append("svg")   .attr("width", getDepth(flare) *
                                                            // width / 8 + margin.right + margin.left)   .attr("height", height + margin.top
                                                            // + margin.bottom)   .append("g")   .attr("transform", "translate(" +
                                                            // margin.left + "," + margin.top + ")"); width = 500 height = 500 viewBox = `0
                                                            // -100 850 850`

                                                            svg = d3v3
                                                                .select("#dataviz_area_div")
                                                                .append("svg")
                                                                .attr("id", "dataviz_area_div_svg")
                                                                // .attr("width", width + margin.left + margin.right) .attr("height", height +
                                                                // margin.top + margin.bottom) .attr("transform", "translate(" + margin.left +
                                                                // "," + margin.top + ")") .attr("viewBox", `-25 -15 400 250`) .attr("viewBox",
                                                                // `-30 -30 500 400`) current .attr("viewBox", `-90 -30 500 400`)
                                                                // .attr("viewBox", `-90 -30 600 800`) .attr("viewBox", `-90 -30 600 500`)
                                                                // .attr("viewBox", `30 -80 600 600`)
                                                                .attr("viewBox", `-90 -80 900 500`)
                                                            // .attr("transform", "translate(180,50)");

                                                            TOTAL_SIZE = flare.size
                                                            l = flare
                                                                .pred
                                                                .replace(/of/g, "")
                                                                .split(', ')
                                                            for (var j = 0; j < l.length; j++) {
                                                                l[j] = l[j].split(' ')[2]
                                                            }
                                                            label_names = l

                                                            root = flare;
                                                            root.x0 = height / 2;
                                                            root.y0 = 0;

                                                            function collapse(d) {
                                                                if (d.children) {
                                                                    d._children = d.children;
                                                                    d
                                                                        ._children
                                                                        .forEach(collapse);
                                                                    d.children = null;
                                                                }
                                                            }

                                                            root
                                                                .children
                                                                .forEach(collapse);
                                                            update(root, l.length);
                                                            // createLabels(l);
                                                        };

                                                        // make variable for

                                                        loadDataIrisTree(iris_tree_Data)

                                                        // make the

                                                        d3v3
                                                            .select(self.frameElement)
                                                            .style("height", "480px");

                                                        function update(source, n_labels) {

                                                            // Compute the new tree layout.
                                                            var nodes = tree
                                                                    .nodes(root)
                                                                    .reverse(),
                                                                links = tree.links(nodes);
                                                            tpaths = tree.links(nodes);

                                                            // Normalize for fixed-depth.
                                                            nodes.forEach(function (d) {
                                                                d.y = d.depth * 180;
                                                            });

                                                            // Update the nodes…
                                                            var node = svg
                                                                .selectAll("g.node")
                                                                .data(nodes, function (d) {
                                                                    return d.id || (d.id = ++i);
                                                                });

                                                            // Enter any new nodes at the parent's previous position.
                                                            var nodeEnter = node
                                                                .enter()
                                                                .append("g")
                                                                .attr("class", "node")
                                                                .attr("transform", function (d) {
                                                                    return "translate(" + source.y0 + "," + source.x0 + ")";
                                                                })
                                                                .on("click", click);

                                                            nodeEnter
                                                                .append("circle")
                                                                .attr("r", 1e-6)
                                                                .style("fill", function (d) {

                                                                    return d._children
                                                                        ? "lightsteelblue"
                                                                        : "#fff";
                                                                });

                                                            // nodeEnter.append("text")     .attr("x", function(d) { return (d.children ||
                                                            // d._children) || version2 ? -10 : 10; })     .attr("dy", ".35em")
                                                            // .attr("text-anchor", function(d) { return (d.children || d._children) ||
                                                            // version2 ? "end" : "start"; })     .text(function(d) { return d.pred ?
                                                            // d.name+' '+d.pred : d.name; })     .style("fill-opacity", 1e-6);

                                                            function getTextWidth(text, fontSize, fontFace) {
                                                                var a = document.createElement('canvas');
                                                                var b = a.getContext('2d');
                                                                b.font = fontSize + 'px ' + fontFace;
                                                                return b
                                                                    .measureText(text)
                                                                    .width;
                                                            }

                                                            var rect = nodeEnter
                                                                .append("rect")
                                                                .attr("width", 133 + 8)
                                                                .attr("height", 70)
                                                                .attr("x", -80)
                                                                .attr("y", -80)
                                                                .attr("rx", 6)
                                                                .attr("ry", 6)
                                                                .style("fill", function (d) {
                                                                    return (d.children || d._children) || version2
                                                                        ? "#f0f0f0"
                                                                        : "#ffffff"
                                                                })
                                                                .style("stroke", function (d) {
                                                                    return (d.children || d._children) || version2
                                                                        ? "rgb(155, 155, 155)"
                                                                        : "#ffffff"
                                                                })
                                                                .style("visibility", function (d) {
                                                                    return (d.children || d._children) || version2
                                                                        ? "visible"
                                                                        : "hidden"
                                                                })

                                                            // nodeEnter.append("svg:image")   .attr("xlink:href", function (d) { return
                                                            // ((d.children || d._children) || version2) && d.type == 'categorical' ?
                                                            // 'http://fractalytics.io/wp-content/uploads/2019/05/cat.png' :
                                                            // 'http://fractalytics.io/wp-content/uploads/2019/05/num.png' })   .attr("x",
                                                            // "-76")   .attr("y", "-74")   .attr("width", "20")   .attr("height", "20")
                                                            // .style("visibility", function (d) {     if
                                                            // (d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) {       return
                                                            // d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? 'hidden' :
                                                            // 'visible'     }     else return (d.children || d._children) || version2 ?
                                                            // "visible" : "hidden"   });

                                                            nodeEnter
                                                                .append("text")
                                                                .attr("x", function (d) {
                                                                    ttr = 13
                                                                    if (default_colors.length > 5) {
                                                                        ttr = (40 * default_colors.length) / 2
                                                                    }
                                                                    return (d.children || d._children) || version2
                                                                        ? -75 - ((getTextWidth(d.size + " / " + (
                                                                            d.size * 100 / TOTAL_SIZE
                                                                        ).toFixed(0) + "%", 10, 'Verdana') + 5.7) - (133 + 8)) / 2
                                                                        : ttr
                                                                })
                                                                .attr("y", function (d) {
                                                                    ttr = dict_leaf_y[label_names.length] - 15
                                                                    if (default_colors.length > 5) {
                                                                        ttr = -20
                                                                    }
                                                                    return (d.children || d._children) || version2
                                                                        ? -87
                                                                        : ttr;

                                                                })
                                                                .attr("dy", ".35em")
                                                                .attr("text-anchor", "start")
                                                                // .style("font-size", "10px")
                                                                .style("font-size", "12px")
                                                                .style("font-family", "Verdana")
                                                                // .style("stroke", "#c2c2c2") .style("stroke", "#f2efe9")
                                                                .style("stroke", "black")

                                                                // .style("stroke-width", "0.05em")
                                                                .text(function (d) {
                                                                    return true
                                                                        ? d.size + " / " + (
                                                                            d.size * 100 / TOTAL_SIZE
                                                                        ).toFixed(0) + "%"
                                                                        : "";
                                                                })
                                                                .attr('visibility', function () {
                                                                    return value_percent_top
                                                                        ? 'visible'
                                                                        : 'hidden'
                                                                })

                                                            nodeEnter
                                                                .append("text")
                                                                .attr("x", function (d) {
                                                                    if (((d.children || d._children) || version2) && d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].length <= 11) {
                                                                        return (d.children || d._children) || version2
                                                                            ? -75 - (
                                                                                (getTextWidth(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], 14, 'Verdana') +
                                                                                        5.7) - (133 + 8)
                                                                            ) / 2
                                                                            : 0
                                                                    } else 
                                                                        return (d.children || d._children) || version2
                                                                            ? -75 - (
                                                                                (getTextWidth(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].substring(
                                                                                    0,
                                                                                    11
                                                                                ), 14, 'Verdana') + 5.7) - (133 + 8)
                                                                            ) / 2
                                                                            : 0
                                                                    })
                                                                .attr("y", function (d) {
                                                                    if (!d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) 
                                                                        return -65
                                                                    else 
                                                                        return d
                                                                            .name
                                                                            .match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root '
                                                                                ? -55
                                                                                : -65
                                                                        })
                                                                .attr("dy", ".35em")
                                                                .attr("text-anchor", "start")
                                                                .style("font-size", "11px")
                                                                .style("font-family", "Verdana")
                                                                .style("stroke", "black")
                                                                .style("stroke-width", "0.05em")
                                                                .text(function (d) {
                                                                    if ((d.children || d._children) || version2) {
                                                                        return d
                                                                            .name
                                                                            .match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1]
                                                                            .length <= 15
                                                                                ? d
                                                                                    .name
                                                                                    .match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1]
                                                                                : (d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1]).substring(0, 13) + '..'

                                                                    } else 
                                                                        return "";
                                                                    }
                                                                )
                                                                .append('svg:title')
                                                                .text(function (d) {
                                                                    return (d.children || d._children) || version2
                                                                        ? d
                                                                            .name
                                                                            .match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1]
                                                                        : ""
                                                                })

                                                            nodeEnter
                                                                .append("text")
                                                                .attr("x", function (d) {
                                                                    return (d.children || d._children) || version2
                                                                        ? -75 - ((getTextWidth(
                                                                            d.name.replace(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], '').replace('=', ''),
                                                                            14,
                                                                            'Verdana'
                                                                        ) + 5.7) - (133 + 8)) / 2
                                                                        : 0
                                                                })
                                                                .attr("y", -45)
                                                                .attr("dy", ".35em")
                                                                .attr("text-anchor", "start")
                                                                .style("font-size", "12px")
                                                                .style("font-family", "Verdana")
                                                                .style("stroke", "black")
                                                                .style("stroke-width", "0.04em")
                                                                .text(function (d) {

                                                                    var toreturn = (d.children || d._children) || version2
                                                                        ? d
                                                                            .name
                                                                            .replace(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], '')
                                                                            .replace('!=', 'not')
                                                                            .replace(/=|\!=/g, '')
                                                                            .replace('<', '<=')
                                                                        : "";
                                                                    if (!d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) 
                                                                        return toreturn
                                                                    return d
                                                                        .name
                                                                        .match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root '
                                                                            ? ''
                                                                            : toreturn
                                                                })

                                                            var labels_w = 133 / n_labels
                                                            for (var j = 0; j < n_labels; j++) {
                                                                var curr = j

                                                                // function temp(d) {     console.log('temp')     console.log(d)     return d ?
                                                                // 133 : 0   } d=4 val=temp(d) console.log('val') console.log(val)

                                                                nodeEnter
                                                                    .append("rect")
                                                                    .attr("width", function (d) {

                                                                        var v;
                                                                        if (d.pred) {
                                                                            console.log(
                                                                                parseInt(d.pred.split(",")[curr].match(/\d+/)[0]),
                                                                                ' *133/',
                                                                                d.size
                                                                            )
                                                                            v = parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 133 / d.size;
                                                                            console.log("1")
                                                                            console.log(d)
                                                                        } else if (!d.children) {
                                                                            v = 40
                                                                            console.log("2")
                                                                        }

                                                                        if (square) {
                                                                            console.log("3")
                                                                            return (d.children || d._children) || version2 || d == null
                                                                                ? 133 / label_names.length - 4
                                                                                : 40
                                                                        } else {
                                                                            console.log("4")
                                                                            console.log(d)
                                                                            return (d.children || d._children) || version2 || d == null
                                                                                ? v
                                                                                : 40
                                                                        }

                                                                    })
                                                                    .attr("height", 20)
                                                                    .attr('rx', function (d) {
                                                                        return square
                                                                            ? 0
                                                                            : 4
                                                                    })
                                                                    .attr('ry', function (d) {
                                                                        return square
                                                                            ? 0
                                                                            : 4
                                                                    })
                                                                    .attr("x", function (d) {

                                                                        var v;
                                                                        var ttl = 0
                                                                        if (curr > 0) {

                                                                            for (var l = 0; l <= curr - 1; l++) {
                                                                                if (d.pred) {
                                                                                    v = parseInt(d.pred.split(",")[l].match(/\d+/)[0]);
                                                                                } else if (!d.children) 
                                                                                    v = parseInt(d.name.split(",")[l].match(/\d+/)[0]);
                                                                                ttl = ttl + v * 133 / d.size
                                                                            }

                                                                        } else {
                                                                            ttl = 0
                                                                        }

                                                                        ttr = 13
                                                                        if (default_colors.length > 5) {
                                                                            ttr = 10 + j * 45
                                                                        }

                                                                        if (square) 
                                                                            return (d.children || d._children) || version2
                                                                                ? -76 + j * (133 / label_names.length)
                                                                                : ttr
                                                                        else 
                                                                            return (d.children || d._children) || version2
                                                                                ? -76 + ttl
                                                                                : ttr
                                                                        })
                                                                    .attr("y", (function (d) {
                                                                        console.log(default_colors.length)
                                                                        if (default_colors.length > 5) {
                                                                            return (d.children || d._children) || version2
                                                                                ? -34
                                                                                : -10
                                                                        } else 
                                                                            return (d.children || d._children) || version2
                                                                                ? -34
                                                                                : dict_leaf_y[label_names.length] - 4 + 20 * j + j * 4;
                                                                        }
                                                                    ))
                                                                    .style("fill", function (d) {
                                                                        if (default_colors.length == 0) {
                                                                            return default_colors[j]
                                                                        } else {
                                                                            return default_colors[j]
                                                                        }

                                                                    })
                                                                    .attr('visibility', function (d) {

                                                                        if (d.pred) {
                                                                            v = parseInt(d.pred.split(",")[curr].match(/\d+/)[0]);
                                                                        } else if (!d.children) 
                                                                            v = parseInt(d.name.split(",")[curr].match(/\d+/)[0]);
                                                                        v = v * 133 / d.size
                                                                        return v != 0 || !d.children
                                                                            ? "visible"
                                                                            : "hidden"
                                                                    })
                                                                    .attr('opacity', function (d) {
                                                                        var val
                                                                        if (d.pred) {
                                                                            // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
                                                                            val = (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(
                                                                                0
                                                                            )
                                                                        } else if (!d.children) 
                                                                            val = (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(
                                                                                0
                                                                            )
                                                                        return (d.children || d._children) || version2
                                                                            ? 1
                                                                            : val / 100 + 0.3

                                                                    })
                                                                    .append("svg:title")
                                                                    .text(function (d) {
                                                                        if (d.pred) {
                                                                            // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
                                                                            return !rect_percent
                                                                                ? d
                                                                                    .pred
                                                                                    .split(",")[curr]
                                                                                    .match(/\d+/)[0]
                                                                                : (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) +
                                                                                        "%"
                                                                        } else if (!d.children) 
                                                                            return !rect_percent
                                                                                ? d
                                                                                    .name
                                                                                    .split(",")[curr]
                                                                                    .match(/\d+/)[0]
                                                                                : (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) +
                                                                                        "%"

                                                                                })

                                                                var subg = nodeEnter
                                                                    .append("g")
                                                                    .attr("width", labels_w)
                                                                    .attr("height", 20)
                                                                    .attr("x", function (d) {
                                                                        var v;
                                                                        var ttl = 0
                                                                        if (curr > 0) {

                                                                            for (var l = 0; l <= curr - 1; l++) {
                                                                                if (d.pred) {
                                                                                    v = parseInt(d.pred.split(",")[l].match(/\d+/)[0]);
                                                                                } else if (!d.children) 
                                                                                    v = parseInt(d.name.split(",")[l].match(/\d+/)[0]);
                                                                                ttl = ttl + v * 133 / d.size
                                                                            }

                                                                        } else {
                                                                            ttl = 0
                                                                        }

                                                                        return -80 + ttl

                                                                    })
                                                                    .attr("y", -30)

                                                                subg
                                                                    .append("text")
                                                                    .text(function (d) {
                                                                        if (d.pred) {
                                                                            // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
                                                                            return !rect_percent
                                                                                ? d
                                                                                    .pred
                                                                                    .split(",")[curr]
                                                                                    .match(/\d+/)[0]
                                                                                : (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) +
                                                                                        "%"
                                                                        } else if (!d.children) 
                                                                            return !rect_percent
                                                                                ? d
                                                                                    .name
                                                                                    .split(",")[curr]
                                                                                    .match(/\d+/)[0]
                                                                                : (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) +
                                                                                        "%"

                                                                                })
                                                                    .attr("x", (function (d) {

                                                                        var v;
                                                                        var ttl = 0
                                                                        if (curr > 0) {

                                                                            for (var l = 0; l <= curr - 1; l++) {
                                                                                if (d.pred) {
                                                                                    v = parseInt(d.pred.split(",")[l].match(/\d+/)[0]);
                                                                                } else if (!d.children) 
                                                                                    v = parseInt(d.name.split(",")[l].match(/\d+/)[0]);
                                                                                ttl = ttl + v * 133 / d.size
                                                                            }

                                                                        } else {
                                                                            ttl = 0
                                                                        }

                                                                        ttr = 18
                                                                        if (default_colors.length > 5) {
                                                                            ttr = 14 + j * 45
                                                                        }

                                                                        if (square) 
                                                                            return (d.children || d._children) || version2
                                                                                ? -71 + j * (133 / label_names.length)
                                                                                : ttr
                                                                        else 
                                                                            return (d.children || d._children) || version2
                                                                                ? -71 + ttl
                                                                                : ttr
                                                                        }))
                                                                    .attr("y", (function (d) {
                                                                        ttr = dict_leaf_y[label_names.length] + 10 + 20 * j + j * 4
                                                                        if (default_colors.length > 5) {
                                                                            ttr = 5
                                                                        }

                                                                        return (d.children || d._children) || version2
                                                                            ? -19
                                                                            : ttr;

                                                                    }))
                                                                    .style("fill", "white")
                                                                    .style("font-size", "12px")
                                                                    .attr('visibility', function (d) {
                                                                        if (d.pred && !square) {
                                                                            // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
                                                                            return (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(
                                                                                0
                                                                            ) > 20
                                                                                ? "vivible"
                                                                                : "hidden"
                                                                        }
                                                                    })
                                                                    .append("svg:title")
                                                                    .text(function (d) {
                                                                        if (d.pred) {
                                                                            // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
                                                                            return !rect_percent
                                                                                ? d
                                                                                    .pred
                                                                                    .split(",")[curr]
                                                                                    .match(/\d+/)[0]
                                                                                : (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) +
                                                                                        "%"
                                                                        } else if (!d.children) 
                                                                            return !rect_percent
                                                                                ? d
                                                                                    .name
                                                                                    .split(",")[curr]
                                                                                    .match(/\d+/)[0]
                                                                                : (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) +
                                                                                        "%"

                                                                                })

                                                                subg
                                                                    .append('text')
                                                                    .text(function (d) {
                                                                        if (d.pred) {
                                                                            return ''
                                                                        } else if (!d.children) {
                                                                            return label_names[curr]
                                                                        }
                                                                    })
                                                                    .attr("x", (function (d) {
                                                                        ttr = 60
                                                                        if (default_colors.length > 5) {
                                                                            ttr = 18 + j * 45
                                                                        }
                                                                        return (d.children || d._children) || version2
                                                                            ? -66 + j * labels_w
                                                                            : ttr
                                                                    }))
                                                                    .attr("y", (function (d) {
                                                                        ttr = dict_leaf_y[label_names.length] + 10 + 20 * j + j * 4
                                                                        if (default_colors.length > 5) {
                                                                            ttr = 25
                                                                        }
                                                                        return (d.children || d._children) || version2
                                                                            ? -15
                                                                            : ttr;
                                                                    }))
                                                                    .style("font-size", "14px")
                                                                    .style("fill", "rgb(78, 74, 74)")
                                                                    .attr('transform', function (d) {

                                                                        return default_colors.length <= 5
                                                                            ? ''
                                                                            : 'translate(' + (
                                                                                -30 + j * 20
                                                                            ) + ',' + (
                                                                                10 + j * (-37)
                                                                            ) + ') rotate(55 50 50)'
                                                                    })

                                                            }

                                                            // nodeEnter.append("text")   .attr("x", function(d) { return (d.children ||
                                                            // d._children) || version2 ? -10 : 10; })   .attr("dy", ".35em")
                                                            // .attr("text-anchor", function(d) { return (d.children || d._children) ||
                                                            // version2 ? "end" : "start"; })   .text(function(d) { return d.pred ? d.pred :
                                                            // ''; })   .style("fill-opacity", 1e-6) Transition nodes to their new position.
                                                            var nodeUpdate = node
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("transform", function (d) {
                                                                    return "translate(" + d.y + "," + d.x + ")";
                                                                });

                                                            nodeUpdate
                                                                .select("circle")
                                                                .attr("r", 10)
                                                                .style("fill", function (d) {
                                                                    return d._children
                                                                        ? "lightsteelblue"
                                                                        : "#fff";
                                                                });

                                                            nodeUpdate
                                                                .select("text")
                                                                .style("fill-opacity", 1);

                                                            // Transition exiting nodes to the parent's new position.
                                                            var nodeExit = node
                                                                .exit()
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("transform", function (d) {
                                                                    return "translate(" + source.y + "," + source.x + ")";
                                                                })
                                                                .remove();

                                                            nodeExit
                                                                .select("circle")
                                                                .attr("r", 1e-6);

                                                            nodeExit
                                                                .select("text")
                                                                .style("fill-opacity", 1e-6);

                                                            // Update the links…
                                                            var link = svg
                                                                .selectAll("path.link")
                                                                .data(links, function (d) {
                                                                    return d.target.id;
                                                                });

                                                            if (tree_branch) 
                                                                var link_stoke_scale = d3v3
                                                                    .scale
                                                                    .linear()
                                                                    .domain([0, 100])
                                                                    .range([1.5, default_strokeness]);
                                                            else 
                                                                var link_stoke_scale = d3v3
                                                                    .scale
                                                                    .linear()
                                                                    .domain([0, 100])
                                                                    .range([1.5, 8]);
                                                            
                                                            var color = d3v3
                                                                .scale
                                                                .linear()
                                                                .domain([0, 50, 100])
                                                                .range(["rgb(2, 255, 219)", "blue"]);

                                                            // Enter any new links at the parent's previous position.
                                                            link
                                                                .enter()
                                                                .insert("path", "g")
                                                                .attr("class", "link")
                                                                .attr("id", function (d) {
                                                                    return d.target.id;
                                                                })
                                                                .attr("d", function (d) {
                                                                    var o = {
                                                                        x: source.x0,
                                                                        y: source.y0
                                                                    };
                                                                    return diagonal({source: o, target: o});
                                                                })
                                                                .style("stroke-width", function (d) {

                                                                    if (!d.target) {
                                                                        return link_stoke_scale(50)
                                                                    } else {
                                                                        if (tree_branch) {
                                                                            // console.log(d.target.size,'*100/',TOTAL_SIZE,link_stoke_scale(d.target.size*100/TOTAL_SIZE),tree_branch_parent)
                                                                            // console.log(d.target.size,'*100/',d.source.size,link_stoke_scale(d.target.size*100/d.source.size),tree_branch_parent)

                                                                            return tree_branch_parent
                                                                                ? link_stoke_scale(d.target.size * 100 / TOTAL_SIZE)
                                                                                : link_stoke_scale(d.target.size * 100 / d.source.size)
                                                                        } else {

                                                                            return link_stoke_scale(50)
                                                                        }
                                                                    }
                                                                })
                                                                .style("stroke", function (d) {

                                                                    if (!d.target) {
                                                                        return "#fff"
                                                                        // return "#A3A6A8"
                                                                    } else 
                                                                        return tree_branch_color;
                                                                    }
                                                                )
                                                                .append("svg:title")
                                                                .text(function (d, i) {
                                                                    if (hover_percent_parent) {
                                                                        var val = ((d.target.size / TOTAL_SIZE) * 100).toFixed(2);
                                                                    } else {
                                                                        var val = ((d.target.size / d.source.size) * 100).toFixed(2);
                                                                    }

                                                                    return val + "%"
                                                                })

                                                            var tlink = svg
                                                                .selectAll("text.tlink")
                                                                .data(tpaths, function (d) {
                                                                    return d.target.id;
                                                                });

                                                            tlink
                                                                .enter()
                                                                .insert("text", "g")
                                                                .attr("class", "tlink")
                                                                .attr("dy", function (d) {
                                                                    return d.target.side == "left"
                                                                        ? -10
                                                                        : 15;
                                                                })
                                                                .append('textPath')
                                                                .attr("xlink:href", function (d) {
                                                                    return '#' + d.target.id;
                                                                }) //place the ID of the path here
                                                                .style("text-anchor", "middle") //place the text halfway on the arc
                                                                .attr("startOffset", "45%")
                                                                .text(function (d) {
                                                                    return d.target.side == "left"
                                                                        ? "No"
                                                                        : "Yes";
                                                                })
                                                                .attr('visibility', function (d) {
                                                                    return d.target.depth == 1 && !version2
                                                                        ? 'visible'
                                                                        : 'hidden'
                                                                })
                                                                .attr("opacity", 0.5)

                                                            tlink
                                                                .exit()
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("d", function (d) {
                                                                    var o = {
                                                                        x: source.x,
                                                                        y: source.y
                                                                    };
                                                                    return diagonal({source: o, target: o});
                                                                })
                                                                .remove();

                                                            // Transition links to their new position.
                                                            link
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("d", diagonal)
                                                                .style("stroke-width", function (d) {

                                                                    if (!d.target) {
                                                                        return link_stoke_scale(50)
                                                                    } else {
                                                                        if (tree_branch) {
                                                                            // console.log(d.target.size,'*100/',TOTAL_SIZE,link_stoke_scale(d.target.size*100/TOTAL_SIZE),tree_branch_parent)
                                                                            // console.log(d.target.size,'*100/',d.source.size,link_stoke_scale(d.target.size*100/d.source.size),tree_branch_parent)

                                                                            return tree_branch_parent
                                                                                ? link_stoke_scale(d.target.size * 100 / TOTAL_SIZE)
                                                                                : link_stoke_scale(d.target.size * 100 / d.source.size)
                                                                        } else {

                                                                            return link_stoke_scale(50)
                                                                        }
                                                                    }
                                                                });

                                                            // Transition exiting nodes to the parent's new position.
                                                            link
                                                                .exit()
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("d", function (d) {
                                                                    var o = {
                                                                        x: source.x,
                                                                        y: source.y
                                                                    };
                                                                    return diagonal({source: o, target: o});
                                                                })
                                                                .remove();

                                                            // Stash the old positions for transition.
                                                            nodes.forEach(function (d) {
                                                                d.x0 = d.x;
                                                                d.y0 = d.y;
                                                            });

                                                            // Toggle children on click.
                                                            function click(d) {

                                                                // console.log("d", d)  d name has "petal width (cm) > 1.75" var name = d.name;
                                                                // convert d.name to string
                                                                var name = d
                                                                    .name
                                                                    .toString();
                                                                if (name.includes("petal width (cm) > 1.75")) {
                                                                    // console.log("petal width (cm) > 1.75") dis-show mainDTcon
                                                                    if (document.getElementById("mainDTcon").style.display == "none") {

                                                                        document
                                                                            .getElementById("mainDTcon")
                                                                            .style
                                                                            .display = "block";
                                                                        document
                                                                            .getElementById("mainDTfirst")
                                                                            .style
                                                                            .display = "none";
                                                                    } else {
                                                                        document
                                                                            .getElementById("mainDTcon")
                                                                            .style
                                                                            .display = "none";
                                                                        document
                                                                            .getElementById("mainDTfirst")
                                                                            .style
                                                                            .display = "block";

                                                                    }

                                                                }
                                                                // console.log("name", name)

                                                                if (d.children) {
                                                                    d._children = d.children;
                                                                    d.children = null;
                                                                } else {
                                                                    d.children = d._children;
                                                                    d._children = null;
                                                                }
                                                                update(d, n_labels);
                                                            }

                                                        }

                                                        function createLabels(labels) {

                                                            var Size = 400

                                                            var svg1 = d3v3
                                                                .select("body")
                                                                .append("svg")
                                                                .attr("width", Size)
                                                                .attr("height", Size)
                                                                .attr("class", "legends");

                                                            console.log(labels.length)
                                                            console.log(default_colors.slice(0, labels.length))
                                                            default_colors = default_colors.slice(0, labels.length)
                                                            if (default_colors.length == 2) 
                                                                default_colors.push('')
                                                            if (default_colors.length == 0) {
                                                                var c_l = default_colors
                                                            } else {
                                                                var c_l = default_colors
                                                            }

                                                            for (i = 0; i < c_l.length; i++) {

                                                                console.log(labels[i], "", c_l[i])

                                                                var legendG = svg1
                                                                    .append("g")
                                                                    .attr("transform", function (d) {
                                                                        return "translate(" + 0 + "," + (
                                                                            30 * i + Size / 33 + Size / 50
                                                                        ) + ")"; // place each legend on the right and bump each one down 15 pixels
                                                                    })
                                                                    .attr("class", "legend");

                                                                legendG
                                                                    .append("rect") // make a matching color rect
                                                                    .attr("width", 15)
                                                                    .attr("height", 15)
                                                                    .attr("fill", c_l[i])
                                                                    .style('visibility', function () {
                                                                        return labels[i]
                                                                            ? "visible"
                                                                            : "hidden"
                                                                    })

                                                                legendG
                                                                    .append("text") // add the text
                                                                    .text(labels[i])
                                                                    .style("font-size", 30)
                                                                    .attr("y", 12)
                                                                    .attr("x", 21)

                                                            }

                                                        }
                                                    }

                                                    function decisiontree_Version2() {

                                                        d3v3 = d3v3

                                                        // var margin = {top: 20, right: 120, bottom: 20, left: 180},   width = 960 -
                                                        // margin.right - margin.left,   height = 480 - margin.top - margin.bottom;

                                                        var margin = {
                                                                top: 30,
                                                                right: 30,
                                                                bottom: 30,
                                                                left: 0
                                                            },
                                                            width = 700 - margin.left - margin.right,
                                                            height = 350 * 600 / 500 - margin.top - margin.bottom;

                                                        var i = 0,
                                                            duration = 750,
                                                            root;

                                                        var tree = d3v3
                                                            .layout
                                                            .tree()
                                                            .size([height, width]);

                                                        var diagonal = d3v3
                                                            .svg
                                                            .diagonal()
                                                            .projection(function (d) {
                                                                return [d.y, d.x];
                                                            });

                                                        // var svg = d3v3.select("body").append("svg")     .attr("width", width +
                                                        // margin.right + margin.left)     .attr("height", height + margin.top +
                                                        // margin.bottom)   .append("g")     .attr("transform", "translate(" +
                                                        // margin.left + "," + margin.top + ")");

                                                        var svg = d3v3
                                                            .select("#dataviz_area_div")
                                                            .append("svg")
                                                            .attr("id", "dataviz_area_div_svg")
                                                            .attr("width", width + margin.left + margin.right)
                                                            .attr("height", height + margin.top + margin.bottom)
                                                            // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                                            // .attr("viewBox", `-25 -15 400 250`) .attr("viewBox", `-30 -30 500 400`)
                                                            // current .attr("viewBox", `-90 -30 500 400`) .attr("viewBox", `-90 -30 600
                                                            // 800`) .attr("viewBox", `-90 -30 600 500`)
                                                            .attr("viewBox", `30 -80 600 600`)

                                                        // d3v3.json("structure_iris_dc_2.json", function(error, flare) {
                                                        // d3v3.json("structure_iris_dc_2.json", function(error, flare) {   if (error)
                                                        // throw error;   root = flare;   root.x0 = height / 2;   root.y0 = 0;
                                                        // function collapse(d) {     if (d.children) {       d._children = d.children;
                                                        // d._children.forEach(collapse);       d.children = null;     }   }
                                                        // root.children.forEach(collapse);   update(root); });

                                                        var iris_tree_Data2 = {
                                                            "name": "petal length (cm) > 2.45000004768",
                                                            "children": [
                                                                {
                                                                    "name": "petal width (cm) > 1.75",
                                                                    "children": [
                                                                        {
                                                                            "name": "petal length (cm) > 4.85000038147",
                                                                            "children": [
                                                                                {
                                                                                    "name": "0 of setosa, 0 of versicolor, 43 of virginica"
                                                                                }, {
                                                                                    "name": "0 of setosa, 1 of versicolor, 2 of virginica"
                                                                                }
                                                                            ]
                                                                        }, {
                                                                            "name": "petal length (cm) > 4.94999980927",
                                                                            "children": [
                                                                                {
                                                                                    "name": "0 of setosa, 2 of versicolor, 4 of virginica"
                                                                                }, {
                                                                                    "name": "0 of setosa, 47 of versicolor, 1 of virginica"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }, {
                                                                    "name": "50 of setosa, 0 of versicolor, 0 of virginica"
                                                                }
                                                            ]
                                                        }

                                                        function loadDataIrisTree2(flare) {

                                                            root = flare;
                                                            root.x0 = height / 2;
                                                            root.y0 = 0;

                                                            function collapse(d) {
                                                                if (d.children) {
                                                                    d._children = d.children;
                                                                    d
                                                                        ._children
                                                                        .forEach(collapse);
                                                                    d.children = null;
                                                                }
                                                            }

                                                            root
                                                                .children
                                                                .forEach(collapse);
                                                            update(root);
                                                        };

                                                        loadDataIrisTree2(iris_tree_Data2)

                                                        d3v3
                                                            .select(self.frameElement)
                                                            .style("height", "480px");

                                                        function update(source) {

                                                            // Compute the new tree layout.
                                                            var nodes = tree
                                                                    .nodes(root)
                                                                    .reverse(),
                                                                links = tree.links(nodes);

                                                            // Normalize for fixed-depth.
                                                            nodes.forEach(function (d) {
                                                                d.y = d.depth * 180;
                                                            });

                                                            // Update the nodes…
                                                            var node = svg
                                                                .selectAll("g.node")
                                                                .data(nodes, function (d) {
                                                                    return d.id || (d.id = ++i);
                                                                });

                                                            // Enter any new nodes at the parent's previous position.
                                                            var nodeEnter = node
                                                                .enter()
                                                                .append("g")
                                                                .attr("class", "node")
                                                                .attr("transform", function (d) {
                                                                    return "translate(" + source.y0 + "," + source.x0 + ")";
                                                                })
                                                                .on("click", click);

                                                            nodeEnter
                                                                .append("circle")
                                                                .attr("r", 1e-6)
                                                                .style("fill", function (d) {
                                                                    return d._children
                                                                        ? "lightsteelblue"
                                                                        : "#fff";
                                                                });

                                                            nodeEnter
                                                                .append("text")
                                                                .attr("x", function (d) {
                                                                    return d.children || d._children
                                                                        ? -10
                                                                        : 10;
                                                                })
                                                                .attr("dy", ".35em")
                                                                .attr("text-anchor", function (d) {
                                                                    return d.children || d._children
                                                                        ? "end"
                                                                        : "start";
                                                                })
                                                                .text(function (d) {
                                                                    return d.name;
                                                                })
                                                                .style("fill-opacity", 1e-6);

                                                            // Transition nodes to their new position.
                                                            var nodeUpdate = node
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("transform", function (d) {
                                                                    return "translate(" + d.y + "," + d.x + ")";
                                                                });

                                                            nodeUpdate
                                                                .select("circle")
                                                                .attr("r", 4.5)
                                                                .style("fill", function (d) {
                                                                    return d._children
                                                                        ? "lightsteelblue"
                                                                        : "#fff";
                                                                });

                                                            nodeUpdate
                                                                .select("text")
                                                                .style("fill-opacity", 1);

                                                            // Transition exiting nodes to the parent's new position.
                                                            var nodeExit = node
                                                                .exit()
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("transform", function (d) {
                                                                    return "translate(" + source.y + "," + source.x + ")";
                                                                })
                                                                .remove();

                                                            nodeExit
                                                                .select("circle")
                                                                .attr("r", 1e-6);

                                                            nodeExit
                                                                .select("text")
                                                                .style("fill-opacity", 1e-6);

                                                            // Update the links…
                                                            var link = svg
                                                                .selectAll("path.link")
                                                                .data(links, function (d) {
                                                                    return d.target.id;
                                                                });

                                                            // Enter any new links at the parent's previous position.
                                                            link
                                                                .enter()
                                                                .insert("path", "g")
                                                                .attr("class", "link")
                                                                .attr("d", function (d) {
                                                                    var o = {
                                                                        x: source.x0,
                                                                        y: source.y0
                                                                    };
                                                                    return diagonal({source: o, target: o});
                                                                });

                                                            // Transition links to their new position.
                                                            link
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("d", diagonal);

                                                            // Transition exiting nodes to the parent's new position.
                                                            link
                                                                .exit()
                                                                .transition()
                                                                .duration(duration)
                                                                .attr("d", function (d) {
                                                                    var o = {
                                                                        x: source.x,
                                                                        y: source.y
                                                                    };
                                                                    return diagonal({source: o, target: o});
                                                                })
                                                                .remove();

                                                            // Stash the old positions for transition.
                                                            nodes.forEach(function (d) {
                                                                d.x0 = d.x;
                                                                d.y0 = d.y;
                                                            });
                                                        }

                                                        // Toggle children on click.
                                                        function click(d) {
                                                            if (d.children) {
                                                                d._children = d.children;
                                                                d.children = null;
                                                            } else {
                                                                d.children = d._children;
                                                                d._children = null;
                                                            }
                                                            update(d);
                                                        }

                                                    }

// function check_clickedid(clicked_id) {

//   console.log("clicked_id: " + clicked_id)

//   // check whehter clicked_id has catterplot, boxplot or dectree
//   if (clicked_id == "scatterplot_sec") {
//       showScatter = true;
//       showBars = false;
//       showDecTree = false;

//       // make id scatterplot_sec text bold
//       // document.getElementById("scatterplot_sec").style.fontWeight = "bold"; get
//       // text of id scatterplot_sec
//       var scatterplot_sec_text = document
//           .getElementById("scatterplot_sec")
//           .innerHTML;
//       console.log("scatterplot_sec_text: " + scatterplot_sec_text)
//       // make document.getElementById("scatterplot_sec").innerHTML bold
//       document
//           .getElementById("scatterplot_sec")
//           .innerHTML = "<b>" + scatterplot_sec_text + "</b>";
//       // add under line to document.getElementById("scatterplot_sec").innerHTML
//       document
//           .getElementById("scatterplot_sec")
//           .style
//           .textDecoration = "underline";

//       // get text of id boxplot_sec

//       if (boxplot_sec_text = document.getElementById("boxplot_sec") != null) {
//           var boxplot_sec_text = document
//               .getElementById("boxplot_sec")
//               .innerHTML;
//           console.log("boxplot_sec_text: " + boxplot_sec_text)
//           // make document.getElementById("boxplot_sec").innerHTML bold
//           document
//               .getElementById("boxplot_sec")
//               .innerHTML = boxplot_sec_text;
//           // remove under line to document.getElementById("scatterplot_sec").innerHTML
//           document.getElementById("boxplot_sec").style.textDecoration = "none";

//       }

//       if (document.getElementById("dectree_sec") != null) {
//           // get text of id dectree_sec
//           var dectree_sec_text = document
//               .getElementById("dectree_sec")
//               .innerHTML;
//           console.log("dectree_sec_text: " + dectree_sec_text)
//           // make document.getElementById("dectree_sec").innerHTML bold
//           document
//               .getElementById("dectree_sec")
//               .innerHTML = dectree_sec_text;
//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("dectree_sec")
//               .style
//               .textDecoration = "none";
//       }

//   } else if (clicked_id == "boxplot_sec") {
//       showScatter = false;
//       showBars = true;
//       showDecTree = false;

//       if (document.getElementById("scatterplot_sec") != null) {
//           // get text of id scatterplot_sec
//           var scatterplot_sec_text = document
//               .getElementById("scatterplot_sec")
//               .innerHTML;
//           console.log("scatterplot_sec_text: " + scatterplot_sec_text)

//           // remove <b> tag from document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("scatterplot_sec")
//               .innerHTML = scatterplot_sec_text;

//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("scatterplot_sec")
//               .style
//               .textDecoration = "none";
//       }

//       if (document.getElementById("boxplot_sec") != null) {
//           // get text of id boxplot_sec
//           var boxplot_sec_text = document
//               .getElementById("boxplot_sec")
//               .innerHTML;
//           console.log("boxplot_sec_text: " + boxplot_sec_text)

//           // make document.getElementById("boxplot_sec").innerHTML bold
//           document
//               .getElementById("boxplot_sec")
//               .innerHTML = "<b>" + boxplot_sec_text + "</b>";

//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("boxplot_sec")
//               .style
//               .textDecoration = "underline";
//       }

//       if (document.getElementById("dectree_sec") != null) {
//           // get text of id dectree_sec
//           var dectree_sec_text = document
//               .getElementById("dectree_sec")
//               .innerHTML;
//           console.log("dectree_sec_text: " + dectree_sec_text)
//           // make document.getElementById("dectree_sec").innerHTML bold
//           document
//               .getElementById("dectree_sec")
//               .innerHTML = dectree_sec_text;

//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("dectree_sec")
//               .style
//               .textDecoration = "none";

//       }

//   } else if (clicked_id == "dectree_sec") {
//       showScatter = false;
//       showBars = false;
//       showDecTree = true;


//       if (document.getElementById("scatterplot_sec") != null) {

//           // get text of id scatterplot_sec
//           var scatterplot_sec_text = document
//               .getElementById("scatterplot_sec")
//               .innerHTML;
//           console.log("scatterplot_sec_text: " + scatterplot_sec_text)

//           // remove <b> tag from document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("scatterplot_sec")
//               .innerHTML = scatterplot_sec_text;

//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("scatterplot_sec")
//               .style
//               .textDecoration = "none";
//       }

//       if (document.getElementById("boxplot_sec") != null) {

//           // get text of id boxplot_sec
//           var boxplot_sec_text = document
//               .getElementById("boxplot_sec")
//               .innerHTML;
//           console.log("boxplot_sec_text: " + boxplot_sec_text)

//           // make document.getElementById("boxplot_sec").innerHTML bold
//           document
//               .getElementById("boxplot_sec")
//               .innerHTML = boxplot_sec_text;

//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("boxplot_sec")
//               .style
//               .textDecoration = "none";
//       }

//       if (document.getElementById("dectree_sec") != null) {

//           // get text of id dectree_sec
//           var dectree_sec_text = document
//               .getElementById("dectree_sec")
//               .innerHTML;
//           console.log("dectree_sec_text: " + dectree_sec_text)

//           // make document.getElementById("dectree_sec").innerHTML bold
//           document
//               .getElementById("dectree_sec")
//               .innerHTML = "<b>" + dectree_sec_text + "</b>";

//           // add under line to document.getElementById("scatterplot_sec").innerHTML
//           document
//               .getElementById("dectree_sec")
//               .style
//               .textDecoration = "underline";

//       }
//   }

// }

function check_clickedid(clicked_id) {

  // parse clicked_id with - and get the first part
  // var clicked_id = clicked_id.split("-")[0];

  // console.log("clicked_id: " + clicked_id)

  // check whehter clicked_id has catterplot, boxplot or dectree
  if (clicked_id == "scatterplot_sec-one" || clicked_id == "scatterplot_sec-two" || clicked_id == "scatterplot_sec-three") {
      showScatter = true;
      showBars = false;
      showDecTree = false;

      
  } else if (clicked_id == "boxplot_sec-one" || clicked_id == "boxplot_sec-two" || clicked_id == "boxplot_sec-three") {
      showScatter = false;
      showBars = true;
      showDecTree = false;


  } else if (clicked_id == "dectree_sec-one" || clicked_id == "dectree_sec-two" || clicked_id == "dectree_sec-there") {
      showScatter = false;
      showBars = false;
      showDecTree = true;



  }

}

function ShowOnechartOfthem(clicked_id) {

    // check whehter clicked_id has catterplot, boxplot or dectree
    check_clickedid(clicked_id)

    if (showScatter == true) {

        // scatterPlot show section id scatterPlot and hide the others
        document
            .getElementById("scatterPlot")
            .style
            .display = "block";
        document
            .getElementById("boxPlot")
            .style
            .display = "none";
        document
            .getElementById("decTree")
            .style
            .display = "none";

    } else if (showBars == true) {

        document
            .getElementById("scatterPlot")
            .style
            .display = "none";
        document
            .getElementById("boxPlot")
            .style
            .display = "block";
        document
            .getElementById("decTree")
            .style
            .display = "none";

    } else if (showDecTree == true) {

        document
            .getElementById("scatterPlot")
            .style
            .display = "none";
        document
            .getElementById("boxPlot")
            .style
            .display = "none";
        document
            .getElementById("decTree")
            .style
            .display = "block";

    }

}
