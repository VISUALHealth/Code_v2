/*
 1. build chart, waiting for to get data to draw line/plot box
 2. switch tab to get the desired data and do calculation
 3. draw line/plot box
*/

// This variable is used to define size of the visualization canvas and the
// margin (or "padding") around the scatter plot.  We use the margin to draw
// things like axis labels.
var height = 500;
var width = 500;
var margin = 40;
//create the SVG canvas that will be used to render the visualization
var svg = d3.select("#tab-1-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a variety of scales, for color, x axis and y axis.
// Poverty rates are all below 30 percent.
var x = d3.scaleLinear()
    .domain([0,30])
    .range([margin,width-margin]);

//life expectancy values all fall between 70 and 90.
var y = d3.scaleLinear()
    .domain([90,70])
    .range([margin,height-margin]);

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
    .text("Poverty Rate");

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
    .text("Life Expectancy");

// Now a clipping plain for the main axes
// Add the clip path.
svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin)
    .attr("y", margin)
    .attr("width", width-2*margin)
    .attr("height", height-2*margin);