/*
1. build chart, waiting for to get data to draw line/plot box
2. switch tab to get the desired data and do calculation
3. draw line/plot box
*/
// based on help from https://greenmzc.github.io/
// & https://stackoverflow.com/questions/47504613/how-to-change-the-label-of-x-axis-in-d3

// build svg for chart
var width = 600;
var height = 600;
var padding = { top: 50, right: 50, bottom: 50, left: 50 };

// test data
var dataset = [[2011, 6224], [2012, 7528], [2013, 7756], [2014, 8632], [2015, 6582], [2016, 8704]];
var min = d3.min(dataset, function(d) {
    return d[1];
})
var max = d3.max(dataset, function(d) {
    return d[1];
});
// switch tab
function positionbyTab(current_tab){
    var class_id;
    switch (_current_tab) {
        case 0:
            class_id = ("#tab-1-chart");
            break;
        case 1:
            class_id = ("#tab-2-chart");
            break;
        case 2:
            class_id = ("#tab-3-chart");
            break;
        default:
            class_id = ("#tab-1-chart");

    }
    return {class_id:class_id};
}
//create the SVG that will be used to render the visualization
var svg = d3.select("#tab-1-chart")//("#tab-2-chart"),("#tab-3-chart)
// var svg = d3.select(positionbyTab())
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//define scale for x & y
var xScale = d3.scaleLinear()
    .domain([2011, 2016])
    .range([0, width - padding.left - padding.right]);

var yScale = d3.scaleLinear()
    .domain([6000, max])
    .range([height - padding.top - padding.bottom, 0]);

var xAxis = d3.axisBottom()
    .scale(xScale).tickFormat(d3.format("d"));;

var yAxis = d3.axisLeft()
    .scale(yScale);

svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
    .call(xAxis);

svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
    .call(yAxis);

// define line
var linePath = d3.line()
    .x(function(d){ return xScale(d[0]) })
    .y(function(d){ return yScale(d[1]) });

svg.append('g')
    .append('path')
    .attr('class', 'line-path')
    .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
    .attr('d', linePath(dataset))
    .attr('fill', 'none')
    .attr('stroke-width', 3)
    .attr('stroke', 'lightblue');

// define point
svg.append('g')
    .selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('transform', function(d){
        return 'translate(' + (xScale(d[0]) + padding.left) + ',' + (yScale(d[1]) + padding.top) + ')'
    })
    .attr('fill', 'lightblue');