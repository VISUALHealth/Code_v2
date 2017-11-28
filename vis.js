//visualization code start from here
//get data general by year(s) and field
function getData(_full_data, _prefix, _years) {
    var dataset = [];
    for (i = 0; i<_years.length; i++) {
        var data = _full_data.map(function(d){
            return d[_years[i]+"_"+_prefix];
        });
        dataset.push(data);
    }
    return dataset;
}
//get employ total premium by year(s)
function getPremium(_full_data, _years) {
    var dataset = [];
    for (i = 0; i<_years.length; i++) {
        var data = _full_data.map(function(d){
            return d[_years[i]+"_Employee_Contribution"] + d[_years[i]+"_Deductible"];
        });
        dataset.push(data);
    }
    return dataset;
}
//get employ premium increase by year(s)
//years array should start from 2011 to 2015, 2016 is not valid since 2017 data does not exist
function getPremiumIncrease(_full_data, _years) {
    var dataset = [];
    for (i = 0; i<_years.length && _years[0]<2016; i++) {
        var data = _full_data.map(function(d){
            var premium_inc_1  = d[_years[i]+"_Employee_Contribution"] + d[_years[i]+"_Deductible"];
            var premium_inc_2  = d[(_years[i]+1)+"_Employee_Contribution"] + d[(_years[i]+1)+"_Deductible"];
            return parseFloat((premium_inc_2-premium_inc_1)/premium_inc_1);
        });
        dataset.push(data);
    }
    return dataset;
}
//get employ premium vs income by year(s)
function getPremiumIncome(_full_data, _years) {
    var dataset = [];
    for (i = 0; i<_years.length; i++) {
        var data = _full_data.map(function(d){
            return (d[_years[i]+"_Employee_Contribution"] + d[_years[i]+"_Deductible"])/d[_years[i]+"_Income"];
        });
        dataset.push(data);
    }
    return dataset;
}
//get tab index
function getSelectedTab() {
    return $("#chart-tabs").tabs("option", "active");
}
//get checked states
function getSelectedStates() {
    return $("#state-set input[name='states']:checked").val();
}
//get checked states' label
function getSelectedStatesLabel() {
    var states = getSelectedStates();
    switch (states) {
        case "rep": return "Republican States";
        case "dem": return "Democratic States";
        case "shifter": return "Shifter States";
        default: return "All states";
    }
}
//get checked visualization option
function getSelectedVis() {
    return $("#visual-option input[name='tab-viz-option']:checked").val();
}
//get tab title
function getCurTabTitle() {
    return $("#chart-tabs ul li[tabindex='0'] a").text();
}
//get current year from slider
function getCurYear() {
    return $("#year-slider").slider("option", "value");
}
//get tab id
function getTabId(_current_tab) {
    var class_id;
    switch (_current_tab) {
        case 0:
            class_id = "#tab-1-chart";
            break;
        case 1:
            class_id = "#tab-2-chart";
            break;
        case 2:
            class_id = "#tab-3-chart";
            break;
        default:
            class_id = "#tab-1-chart";
    }
    return class_id;
}
//filter data
//filter data by selected data
function filterSelected(data, states) {
    var filtered_data = data.filter(function(d) {
        switch (states) {
            case "rep": return d["2016_Votes"] == "Republican";
            case "dem": return d["2016_Votes"] == "Democratic";
            case "shifter": return d["Shift_Flag"] == "Shifter";
            default: return true;
        }
    });
    return filtered_data;
}
//filter data by other data
function filterOthers(data, states) {
    var other_data = data.filter(function(d) {
        switch (states) {
            case "rep": return d["2016_Votes"] != "Republican";
            case "dem": return d["2016_Votes"] != "Democratic";
            case "shifter": return d["Shift_Flag"] != "Shifter";
            default: return false;
        }
    });
    return other_data;
}
//switch tab for data of premium, premium increase, income ratio
function datasetByTab(_current_tab, _years, _filtered_data, _other_data) {
    var data_selected;
    var data_other;
    switch (_current_tab) {
        case 0:
            data_selected = getPremium(_filtered_data, _years);
            data_other = getPremium(_other_data, _years);
            break;
        case 1:
            data_selected = getPremiumIncrease(_filtered_data, _years);
            data_other = getPremiumIncrease(_other_data, _years);
            break;
        case 2:
            data_selected = getPremiumIncome(_filtered_data, _years);
            data_other = getPremiumIncome(_other_data, _years);
            break;
        default:
            data_selected = getPremium(_filtered_data, _years);
            data_other = getPremium(_other_data, _years);
    }
    return {data_selected: data_selected, data_other: data_other};
}

//zip 3 arrays
function zip(_data1, _data2, _data3) {
    var n = _data1.length;
    var m = (typeof _data3[0] === 'undefined')? 1:2;
    var result = [];
    for(var i=0; i<m; i++) {
        result[i] = [];
        for(var j=0; j<n; j++) {
            if(i === 0) {
                result[i].push({year: _data1[j], value: _data2[j]});
            } else {
                result[i].push({year: _data1[j], value: _data3[j]});
            }
        }
    }
    return result;
}

//create svg for comparison panel
var margin = {top: 40, right: 30, left: 40, bottom: 40};
var svg_comp;
//create svg for line chart panel
var width_line, height_line;
var svg_trend_tab_1, svg_trend_tab_2, svg_trend_tab_3;
var min_line = [];
var max_line = [];

function initVisComp() {
    var width_comp = $("#tab-comparison").width();
    var height_comp = width_comp*0.8;
    svg_comp = d3.select("#tab-comparison")
        .append("svg")
        .attr("width", width_comp)
        .attr("height", height_comp);
}

//initialize line chart, default first tab
function initVisLineChart(_full_data) {
    //initialize svg for the 3 tabs
    var years = [];
    var dataset = [];
    width_line = $("#tab-1-chart").width();
    height_line = width_line*0.5;

    for(var i=0; i<3; i++) {
        var svg;
        switch(i) {
            case 0:
                years = [2011, 2012, 2013, 2014, 2015, 2016];
                dataset = getPremium(_full_data, years);
                break;
            case 1:
                years = [2011, 2012, 2013, 2014, 2015];
                dataset = getPremiumIncrease(_full_data, years);
                break;
            case 2:
                years = [2011, 2012, 2013, 2014, 2015, 2016];
                dataset = getPremiumIncome(_full_data, years);
                break;
        }
        min_line[i] = d3.min(dataset, function(d) {return d3.min(d);});
        max_line[i] = d3.max(dataset, function(d) {return d3.max(d);});

        this["svg_trend_tab_"+(i+1)] = d3.select(getTabId(i))
            .append("svg")
            .attr("width", width_line)
            .attr("height", height_line);

        var x = d3.scaleLinear()
            .domain([2011, d3.max(years)])
            .range([0, width_line - margin.left - margin.right]);

        var y = d3.scaleLinear()
            .domain([min_line[i], max_line[i]])
            .range([height_line - margin.top - margin.bottom, 0]);

        //add axises
        var xAxis = this["svg_trend_tab_"+(i+1)].append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (height_line - margin.bottom) + ')');
        if(i === 1) {
            xAxis.call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));
        } else {
            xAxis.call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));
        }
        var yAxis = this["svg_trend_tab_"+(i+1)].append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        if(i === 0) {
            yAxis.call(d3.axisLeft(y).tickFormat(d3.format("d")));
        } else {
            yAxis.call(d3.axisLeft(y).tickFormat(d3.format(".0%")));
        }
    }
    //plot the line chart
    drawTrend(_full_data, years, "all-states", 0, svg_trend_tab_1);
}

//compare panel
var compare = function (event, ui) {
    //remove svg
    $("#comp-svg").remove();

    var full_data = event.data.dataset;
    var states = getSelectedStates();
    var current_tab = getSelectedTab();
    var year = getCurYear();
    var filtered_data = filterSelected(full_data, states);
    var other_data = filterOthers(full_data, states);
    var dataset = datasetByTab(current_tab, [year], filtered_data, other_data);
    var data_selected = dataset.data_selected;
    var data_other = dataset.data_other;

    if (current_tab == 1 && year == 2016) {
        $("#tab-comparison").html("<strong>We don't have 2017's data yet. You can select data from 2011 to 2015 to view the increase ratio.</strong>");
        $("#comp-result").css("display", "none");
        return;
    } else {
        $("#tab-comparison strong").css("display", "none");
        $("#comp-result").css("display", "block");
    }
    var min_data = d3.min([d3.min(data_selected[0]),d3.min(data_other[0])]);
    var max_data = d3.max([d3.max(data_selected[0]),d3.max(data_other[0])]);
    var width_comp = $("#tab-comparison").width();
    var height_comp = width_comp*0.9;
    var bin_count = 6;

    var x = d3.scaleLinear()
        .domain([min_data, max_data])
        .rangeRound([margin.left, width_comp-margin.right]);

    var bins_selected = d3.histogram()
        .domain(x.domain())
        .thresholds(d3.range(min_data, max_data, (max_data - min_data)/bin_count))
        (data_selected[0]);

    var bins_other = d3.histogram()
        .domain(x.domain())
        .thresholds(d3.range(min_data, max_data, (max_data - min_data)/bin_count))
        (data_other[0]);

    var y_height = d3.max([d3.max(bins_selected, function(d){ return d.length/data_selected[0].length}),d3.max(bins_other, function(d){ return d.length/data_other[0].length})]);

    var y = d3.scaleLinear()
        .domain([0, y_height])
        .range([height_comp-margin.bottom, margin.top]);

    svg_comp = d3.select("#tab-comparison")
        .append("svg")
        .attr("id", "comp-svg")
        .attr("width", width_comp)
        .attr("height", height_comp);

    //add legend
    var g_legend = svg_comp.append("g");
    g_legend.append("rect")
        .attr("x", margin.left)
        .attr("y", 2)
        .attr("width", "8")
        .attr("height", "8")
        .attr("fill", "#56a0d3");
    g_legend.append("text")
        .attr("class", "axis-label")
        .attr("x", margin.left+15)
        .attr("y", 10)
        .style("font-size", "0.8em")
        .text("Selected States: " + getSelectedStatesLabel());
    g_legend.append("rect")
        .attr("x", margin.left)
        .attr("y", 20)
        .attr("width", "8")
        .attr("height", "8")
        .attr("fill", "#cccccc");
    g_legend.append("text")
        .attr("class", "axis-label")
        .attr("x", margin.left+15)
        .attr("y", 28)
        .style("font-size", "0.8em")
        .text("Unselected States");

    svg_comp.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0, "+(height_comp-margin.bottom)+")")
        .call(d3.axisBottom(x));

    svg_comp.append("text")
        .attr("class", "axis-label")
        .attr("y", height_comp-5)
        .attr("x", width_comp/2)
        .style("text-anchor", "middle")
        .style("font-size", "0.8em")
        .text(getCurTabTitle());

    var tip_comp_1 = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Number of States: </strong>"+d.length+"<br><strong>Percentage: </strong>"+(d.length/data_other[0].length*100).toFixed(2)+"%"+"<br><Strong>Max: </Strong>"+d.x1.toFixed(2)+"<br><Strong>Min: </Strong>"+d.x0.toFixed(2);
        });

    var tip_comp_2 = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Number of States: </strong>"+d.length+"<br><strong>Percentage: </strong>"+(d.length/data_selected[0].length*100).toFixed(2)+"%"+"<br><Strong>Max: </Strong>"+d.x1.toFixed(2)+"<br><Strong>Min: </Strong>"+d.x0.toFixed(2);
        });

    svg_comp.call(tip_comp_1);
    svg_comp.call(tip_comp_2);

    //others bar
    if (data_other[0].length != 0) {
        var bar_other = svg_comp.selectAll(".bar-other").data(bins_other);
        bar_other.enter().append("g")
            .attr("class", "bar-other")
            .attr("transform", function(d){return "translate(0,"+y(d.length/data_other[0].length)+")";})
            .append("rect")
            .attr("x", 1)
            .attr("width", (x(bins_other[0].x1) - x(bins_other[0].x0) - 1))
            .attr("height", function(d) { return height_comp-margin.bottom - y(d.length/data_other[0].length); })
            .attr("fill", function(d) { return "#cccccc"; }) //#286c9b
            .attr("fill-opacity", 0.8)
            .on("mouseover", tip_comp_1.show)
            .on("mouseout", tip_comp_1.hide)
            .transition()
                .duration(500)
                .attr("transform", function(d){return "translate("+x(d.x0)+",0)"; });
    }

    //selected bar
    var bar = svg_comp.selectAll(".bar").data(bins_selected);
    bar.enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d){return "translate(0,"+y(d.length/data_selected[0].length)+")";})
        .append("rect")
        .attr("x", 1)
        .attr("width", (x(bins_selected[0].x1) - x(bins_selected[0].x0) - 1))
        .attr("height", function(d) { return height_comp-margin.bottom - y(d.length/data_selected[0].length); })
        .attr("fill", function(d) { return "#56a0d3"; })
        .attr("fill-opacity", 0.6)
        .on("mouseover", tip_comp_2.show)
        .on("mouseout", tip_comp_2.hide)
        .transition()
            .duration(500)
            .attr("transform", function(d){return "translate("+x(d.x0)+",0)"; });

    //show compare result
    if(data_other[0].length != 0) {
        tTest(data_selected[0], data_other[0]);
    }
};

// t test
function tTest(sample_1, sample_2) {
    var p = ss.tTestTwoSample(sample_1, sample_2, 0);
    if(Math.abs(p) <= 0.05) {
        if(p<0) {
            $("#comp-result img").attr("src", "Images/face_1.png");
            $("#comp-p").html("The situation of the states selected is significantly <span style='color: green; font-weight: 600;'>better</span> than the rest.");
        } else {
            $("#comp-result img").attr("src", "Images/face_2.png");
            $("#comp-p").html("The situation of the states selected is significantly <span style='color: red; font-weight: 600;'>worse</span> than the rest.");
        }
    } else {
        $("#comp-result img").attr("src", "Images/face_3.png");
        if(p<0) {
            $("#comp-p").html("Compared the average between the states selected and the rest, the situation of those is <span style='color: green;font-weight: 600;'>better</span> but not significant.");
        } else {
            $("#comp-p").html("Compared the average between the states selected and the rest, the situation of those is <span style='color: red;font-weight: 600;'>worse</span> but not significant.");
        }
    }
}

//trend panel
var trend = function (event, ui) { //initialize the svg as needed
    //refresh the control items
    var full_data = event.data.dataset;
    var states = getSelectedStates();
    var current_tab = getSelectedTab();
    var vis_option = getSelectedVis();
    var years = (current_tab === 1)? [2011, 2012, 2013, 2014, 2015]:[2011, 2012, 2013, 2014, 2015, 2016];

    //plot the line chart to the right svg
    switch(current_tab) {
        case 0: drawTrend(full_data, years, states, current_tab, svg_trend_tab_1); break;
        case 1: drawTrend(full_data, years, states, current_tab, svg_trend_tab_2); break;
        case 2: drawTrend(full_data, years, states, current_tab, svg_trend_tab_3); break;
    }
};

var drawTrend = function(_full_data, _years, _states, _current_tab, _svg) {
    //get dataset
    var filtered_data = filterSelected(_full_data, _states);
    var other_data = filterOthers(_full_data, _states);
    var dataset = datasetByTab(_current_tab, _years, filtered_data, other_data);
    var data_selected = dataset.data_selected;
    var data_other = dataset.data_other;

    //calculate the average for line chart
    var data_selected_avg = data_selected.map(function (d) {return d3.mean(d);});
    var data_other_avg = data_other.map(function (d) {return d3.mean(d);});
    var trend_data = zip(_years, data_selected_avg, data_other_avg);

    var color = ["#56a0d3", "#cccccc"];
    var tip_trend = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            var f = d3.format(",.2%");
            if(d.value < 1) {
                return "<strong>Year: </strong>"+d.year+"<br><strong>Average: </strong>"+f(d.value);
            } else {
                return "<strong>Year: </strong>"+d.year+"<br><strong>Average: </strong>"+d.value.toFixed(2);
            }
        });
    _svg.call(tip_trend);

    var x = d3.scaleLinear()
        .domain([2011, d3.max(_years)])
        .range([0, width_line - margin.left - margin.right]);

    var y = d3.scaleLinear()
        .domain([min_line[_current_tab], max_line[_current_tab]])
        .range([height_line - margin.top - margin.bottom, 0]);

    // define the line
    var values = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.value); });

    var line_chart = _svg.selectAll(".line").data(trend_data);

    line_chart.exit()
        .remove();

    line_chart.enter()
        .append('path')
        .merge(line_chart)
            .attr('class', 'line')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('d', function(d){return values(d);})
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('stroke', function(d, i) {return color[i]});

    //define point
    var dots_selected = _svg.selectAll('.dot_selected').data(trend_data[0]);
    dots_selected.exit()
        .remove();
    dots_selected.enter()
        .append('circle')
        .merge(dots_selected)
            .attr('class', 'dot_selected')
            .attr('r', 5)
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('cx', function(d){ return x(d.year);})
            .attr('cy', function(d){ return y(d.value);})
            .attr('fill', "#56a0d3")
            .attr("fill-opacity", 0.8)
            .on('mouseover', function(d, i){
                d3.select(this)
                    .transition(300)
                    .attr("fill-opacity", 1)
                    .attr('r', 8);
                $("#year-slider").slider( "option", "value", d.year);
                tip_trend.show(d, i);
            })
            .on('mouseout', function(d){
                d3.select(this)
                    .transition(300)
                    .attr("fill-opacity", 0.8)
                    .attr('r', 5);
                tip_trend.hide(d);
            });

    if(_states !== 'all-states') {
        var dots_others = _svg.selectAll('.dot_others').data(trend_data[1]);
        dots_others.exit()
            .remove();
        dots_others.enter()
            .append('circle')
            .merge(dots_others)
                .attr('class', 'dot_others')
                .attr('r', 5)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('cx', function(d){ return x(d.year);})
                .attr('cy', function(d){ return y(d.value);})
                .attr('fill', "#cccccc")
                .attr("fill-opacity", 0.8)
                .on('mouseover', function(d, i){
                    d3.select(this)
                        .transition(300)
                        .attr("fill-opacity", 1)
                        .attr('r', 8);
                    $("#year-slider").slider( "option", "value", d.year );
                    tip_trend.show(d, i);
                })
                .on('mouseover', tip_trend.show)
                .on('mouseout', function(d){
                    d3.select(this)
                        .transition(300)
                        .attr("fill-opacity", 0.8)
                        .attr('r', 5);
                    tip_trend.hide(d);
                })
    }
};
