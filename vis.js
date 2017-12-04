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
    var filtered_data = data.filter(function(d,i) {
        switch (states) {
            case "rep": return d["2016_Votes"] == "Republican";
            case "dem": return d["2016_Votes"] == "Democratic";
            case "shifter": return d["Shift_Flag"] == "Shifter";
            default: return true;
        }
    });
    return filtered_data;
}

//tagging states from shift flag, for map visualization SUBJECT TO CHANGE
function filterMapSelected(data, states) {
    var filtered_data = data.filter(function(d,i) {
        switch (states) {
            case "rep": return d["Shift_Flag"] == "Republican";
            case "dem": return d["Shift_Flag"] == "Democratic";
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

//Set State Color
function state_color(flag, num){
    var color="";
    switch(flag){
        case "Democratic"://Dem blue: #2a5783
            color = "#2a5783";break;
        case "Republican"://Rep red: #ca223c
            color = "#ca223c"; break;
        case "Shifter"://Shift orange: #FF8C00
            color = "#FF8C00"; break;
        default:
            color = "grey";
    }
    var color_scale = d3.scaleLinear()
        .domain([0,0.2]) //tunable
        .range(["#FFFFFF",color]);
    return color_scale(num);
}

//create svg for comparison panel
var margin_comp = {top: 40, right: 10, left: 10, bottom: 40};
var margin_trend = {top: 30, right: 15, left: 40, bottom: 20};
var svg_comp;
//create svg for line chart panel
var width_line, height_line;
var svg_trend_tab_1, svg_trend_tab_2, svg_trend_tab_3;
var min_line = [];
var max_line = [];
var clip_id = 0;

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
        min_line[i] = d3.min(dataset, function(d) {return d3.mean(d);});
        max_line[i] = d3.max(dataset, function(d) {return d3.mean(d);});
        if(i===0 || i===2) {
            min_line[i] = min_line[i]*0.9;
            max_line[i] = max_line[i]*1.1;
        } else {
            min_line[i] = min_line[i]*1.1;
            max_line[i] = max_line[i]*1.2;
        }

        this["svg_trend_tab_"+(i+1)] = d3.select(getTabId(i))
            .append("svg")
            .attr("width", width_line)
            .attr("height", height_line);

        var x = d3.scaleLinear()
            .domain([2011, d3.max(years)])
            .range([0, width_line - margin_trend.left - margin_trend.right]);

        var y = d3.scaleLinear()
            .domain([min_line[i], max_line[i]])
            .range([height_line - margin_trend.top - margin_trend.bottom, 0]);

        //add axises
        var xAxis = this["svg_trend_tab_"+(i+1)].append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin_trend.left + ',' + (height_line - margin_trend.bottom) + ')');
        if(i === 1) {
            xAxis.call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));
        } else {
            xAxis.call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));
        }
        var yAxis = this["svg_trend_tab_"+(i+1)].append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin_trend.left + ',' + margin_trend.top + ')');
        if(i === 0) {
            yAxis.call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("d")));
        } else {
            yAxis.call(d3.axisLeft(y).ticks(8).tickFormat(d3.format(".0%")));
        }

        //add legend
        var g_legend = this["svg_trend_tab_"+(i+1)].append("g");
        g_legend.append("circle")
            .attr("cx", 30)
            .attr("cy", 10)
            .attr("r", "8")
            .attr("fill", "#56a0d3");
        g_legend.append("text")
            .attr("id", "legend-text"+(i+1))
            .attr("x", 45)
            .attr("y", 15)
            .style("font-size", "0.8em")
            .text("Selected States: " + getSelectedStatesLabel());
        g_legend.append("circle")
            .attr("cx", 250)
            .attr("cy", 10)
            .attr("r", "8")
            .attr("fill", "#cccccc");
        g_legend.append("text")
            .attr("x", 265)
            .attr("y", 15)
            .style("font-size", "0.8em")
            .text("Unselected States");
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

    if (current_tab === 1 && year === 2016) {
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
    var height_comp = width_comp*0.6;
    var bin_count = 6;

    var x = d3.scaleLinear()
        .domain([min_data, max_data])
        .rangeRound([margin_comp.left, width_comp-margin_comp.right]);

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
        .range([height_comp-margin_comp.bottom, margin_comp.top]);

    svg_comp = d3.select("#tab-comparison")
        .append("svg")
        .attr("id", "comp-svg")
        .attr("width", width_comp)
        .attr("height", height_comp);

    //add legend
    var g_legend = svg_comp.append("g");
    g_legend.append("rect")
        .attr("x", margin_comp.left)
        .attr("y", 2)
        .attr("width", "8")
        .attr("height", "8")
        .attr("fill", "#56a0d3");
    g_legend.append("text")
        .attr("x", margin_comp.left+15)
        .attr("y", 10)
        .style("font-size", "0.8em")
        .text("Selected States: " + getSelectedStatesLabel());
    g_legend.append("rect")
        .attr("x", margin_comp.left)
        .attr("y", 20)
        .attr("width", "8")
        .attr("height", "8")
        .attr("fill", "#cccccc");
    g_legend.append("text")
        .attr("x", margin_comp.left+15)
        .attr("y", 28)
        .style("font-size", "0.8em")
        .text("Unselected States");

    svg_comp.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0, "+(height_comp-margin_comp.bottom)+")")
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
    if (data_other[0].length !== 0) {
        var bar_other = svg_comp.selectAll(".bar-other").data(bins_other);
        bar_other.enter().append("g")
            .attr("class", "bar-other")
            .attr("transform", function(d){return "translate(0,"+y(d.length/data_other[0].length)+")";})
            .append("rect")
            .attr("x", 3)
            .attr("width", (x(bins_other[0].x1) - x(bins_other[0].x0) - 3))
            .attr("height", function(d) { return height_comp-margin_comp.bottom - y(d.length/data_other[0].length); })
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
        .attr("x", 3)
        .attr("width", (x(bins_selected[0].x1) - x(bins_selected[0].x0) - 3))
        .attr("height", function(d) { return height_comp-margin_comp.bottom - y(d.length/data_selected[0].length); })
        .attr("fill", function(d) { return "#56a0d3"; })
        .attr("fill-opacity", 0.6)
        .on("mouseover", tip_comp_2.show)
        .on("mouseout", tip_comp_2.hide)
        .transition()
            .duration(500)
            .attr("transform", function(d){return "translate("+x(d.x0)+",0)"; });

    //show compare result
    if(data_other[0].length !== 0) {
        tTest(data_selected[0], data_other[0]);
    }
};

//visualize us-map
var map_refresh = function(event,ui){
    var full_data = event.data.dataset;
    var states = getSelectedStates();
    var year = getCurYear();
    var filtered_data = filterMapSelected(full_data, states);

    //Rep red: #ca223c
    //Dem blue: #2a5783
    //Shift orange: #FF8C00
    var color = "";
    switch(states){
        case "rep": color = "#ca223c"; break;
        case "dem": color = "#2a5783"; break;
        case "shifter": color = "#FF8C00"; break;
        default: break;
    }
    // console.log(topojson_data);
    // console.log(filtered_data);

    //This is out target for map manipulation
    //Prepare data for inserting into json
    var link_id = [];
    var ranges = [];
    var rate_pool =[];//to find max value
    filtered_data.forEach(function(d){
        link_id.push(d.id);
        var uni = String(year)+"_Uninsured";
        var pop = String(year)+"_Total_population";
        var uninsured = d[uni];
        var population = d[pop];
        var uninsured_rate = uninsured/population;
        var temp = {};
        temp.id = d.id;
        temp.rate = uninsured_rate;
        temp.flag = d.Shift_Flag;
        temp.location = d.Location;
        rate_pool.push(uninsured_rate);
        ranges.push(temp);
    });

    console.log(rate_pool);

    var getinfo = function(x){
        return ranges.filter(function(z){return z.id == x});
    };

    var states_data = topojson_data;

    states_data = states_data.filter(function(d){
        return link_id.includes(+d.id);
    });


    //insert data into topojson for show
    states_data.forEach(function(d){d.uninsured_rate = getinfo(d.id)});
    console.log(states_data);
    states_data.filter(function(d){return d.uninsured_rate!=undefined});
    states_data.forEach(function(d){ d.flag = d.uninsured_rate[0].flag;d.location = d.uninsured_rate[0].location;d.uninsured_rate=d.uninsured_rate[0].rate;});
    //console.log(states_data);

    //Visualize on the map
    map_tip = d3.tip().attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            var _rate = d.uninsured_rate;
            return "<strong>"+d.location +"</strong><br>Uninsured Percentage:"+(_rate*100).toFixed(2)+"%";
        });
    svg_map.call(map_tip);

    var pathes = svg_map.selectAll("path")
        .data(states_data,function(d){return d.id});

    pathes.exit()
        .transition()
        .duration(800)
        .attr("opacity",0.1)
        .attr("stroke","white");

    pathes
        .transition()
        .duration(800)
        .attr("opacity",1)
        .style("fill",function(d){return state_color(d.flag,d.uninsured_rate)})
        .attr("stroke","black");

    pathes
        .on("mouseover",function(d, i){
            d3.select(this).attr("stroke","gold").attr("stroke-width",5);
            map_tip.show(d, i);
        })
        .on("mouseout",function(d){
            d3.select(this).attr("stroke","black").attr("stroke-width",1);
            map_tip.hide(d);
        });



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

    _svg.selectAll("#legend-text"+(_current_tab+1)).text("Selected States: " + getSelectedStatesLabel());

    var x = d3.scaleLinear()
        .domain([2011, d3.max(_years)])
        .range([0, width_line - margin_trend.left - margin_trend.right]);

    var y = d3.scaleLinear()
        .domain([min_line[_current_tab], max_line[_current_tab]])
        .range([height_line - margin_trend.top - margin_trend.bottom, 0]);

    // define the line
    var values = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.value); });

    _svg.selectAll("clipPath").remove();
    _svg.selectAll("rect").remove();
    _svg.append("clipPath")
        .attr("id", "clipper"+clip_id)
        .append("rect")
        .attr("id", "clip-rect"+clip_id)
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height_line)
        .attr("width", 0);

    var line_chart = _svg.selectAll(".line").data(trend_data);
    line_chart.attr("clip-path", "url(#clipper"+clip_id+")");

    line_chart.exit()
        .remove();

    line_chart.enter()
        .append('path')
        .merge(line_chart)
            .attr('class', 'line')
            .attr('transform', 'translate(' + margin_trend.left + ',' + margin_trend.top + ')')
            .attr('d', function(d){return values(d);})
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('stroke', function(d, i) {return color[i]});

    _svg.select("#clip-rect"+clip_id)
        .attr("width", 0)
        .transition()
            .duration(1500)
            .attr("width", width_line);
    clip_id++;

    //define point
    var dots_selected = _svg.selectAll('.dot_selected').data(trend_data[0]);
    var dots_others = _svg.selectAll('.dot_others');

    dots_selected.exit()
        .remove();
    dots_selected.enter()
        .append('circle')
        .merge(dots_selected)
            .attr('class', 'dot_selected')
            .attr('r', 5)
            .attr('transform', 'translate(' + margin_trend.left + ',' + margin_trend.top + ')')
            .attr('cx', function(d){ return x(d.year);})
            .attr('cy', function(d){ return y(d.value);})
            .attr('fill', "#56a0d3")
            .attr("fill-opacity", 0.8)
            .on('mouseover', function(d, i){
                d3.select(this)
                    .transition()
                    .attr("fill-opacity", 1)
                    .attr('r', 10);
                $("#year-slider").slider( "option", "value", d.year);
                tip_trend.show(d, i);
            })
            .on('mouseout', function(d){
                d3.select(this)
                    .transition()
                    .attr("fill-opacity", 0.8)
                    .attr('r', 5);
                tip_trend.hide(d);
            });


    if(_states !== 'all-states') {
        var dots_others_data = dots_others.data(trend_data[1]);
        dots_others_data.exit()
            .remove();
        dots_others_data.enter()
            .append('circle')
            .merge(dots_others_data)
                .attr('class', 'dot_others')
                .attr('r', 5)
                .attr('transform', 'translate(' + margin_trend.left + ',' + margin_trend.top + ')')
                .attr('cx', function(d){ return x(d.year);})
                .attr('cy', function(d){ return y(d.value);})
                .attr('fill', "#cccccc")
                .attr("fill-opacity", 0.8)
                .on('mouseover', function(d, i){
                    d3.select(this)
                        .transition()
                        .attr("fill-opacity", 1)
                        .attr('r', 10);
                    $("#year-slider").slider( "option", "value", d.year );
                    tip_trend.show(d, i);
                })
                .on('mouseout', function(d){
                    d3.select(this)
                        .transition()
                        .attr("fill-opacity", 0.8)
                        .attr('r', 5);
                    tip_trend.hide(d);
                });
    } else {
        dots_others.remove();
    }
};
