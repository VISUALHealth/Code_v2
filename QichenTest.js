/*
 1. build chart, waiting for to get data to draw line/plot box
 2. switch tab to get the desired data and do calculation
 3. draw line/plot box
*/

// build primary chart outlook
    var height = 500;
    var width = 500;
    var margin = 40;

// Create the SVG canvas that will be used to render the visualization.

    var svg = d3.select("#tab-1-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

// Define a variety of scales x axis and y axis.
    var x = d3.time.scale().range([0, width]);
    var y = d3.scaleLinear().range([height-margin,0]);

// Add axes.  First the X axis and label.
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,"+(500-margin)+")")
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("class", "axis-label")
        .attr("y", 495)
        .attr("x",0 + (500 / 2))
        .style("text-anchor", "middle")
        .text("Year");

// Now the Y axis and label.
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+margin+",0)")
        .call(d3.axisLeft(y))

    svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("class", "axis-label")
        .attr("y", -5)
        .attr("x",0 + (500 / 2))
        .style("text-anchor", "middle")

