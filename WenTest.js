/**
 * Created by ScarVaapad on 11/14/17.
 */
//Test
var svg_map;
var topojson_data;
var map_tip;

//derived from https://bl.ocks.org/andrew-reid/496078bd5e37fd22a9b43fd6be84b36b
function scale (scaleFactor, width, height) {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point((x - 1*width/3) * scaleFactor + 1*width/3 , (y - 1*height/3) * scaleFactor+ 1*height/3);
        }
    });
}

function initVisMap() {
    var width_map = $("#geo-map").width();
    var height_map = width_map*600/960;//original ratio

    //fill color based on data
    //colors -->
    //orange: dark #9e3d22, light: #f6dcd5
    //Rep red: #ca223c
    //Dem blue: #2a5783
    //Shift orange: #FF8C00
    //grey: #f2f2f2
    var fill = function(area){
        var state_id = area.id;
        var d = full_data;
        d = d.filter(function(d,i) {return (d.id==area.id);});

        if(d[0].Shift_Flag == "Democratic")
            return "#2a5783";
        if(d[0].Shift_Flag=="Republican")
            return "#ca223c";
        if(d[0].Shift_Flag=="Shifter")
            return "#FF8C00";

    };

    svg_map = d3.select("#geo-map")
        .append("svg")
        .attr("width", width_map)
        .attr("height", height_map);

    //Legend * 3
    var lg1 = svg_map.append("g")
        .attr("class","legend1")
        .attr("transform","translate(0,30)");

    lg1.append("text")
        .text("Republican")
        .attr("y",-5)
        .attr("font-size", "15px")
        .attr("fill", "#ca223c");

    var lg2 = svg_map.append("g")
        .attr("class","legend2")
        .attr("transform","translate("+width_map/3+",30)");

    lg2.append("text").text("Democratic")
        .attr("y",-5)
        .attr("font-size", "15px")
        .attr("fill", "#2a5783");

    var lg3 = svg_map.append("g")
        .attr("class","legend3")
        .attr("transform","translate("+width_map/3*2+",30)");

    lg3.append("text").text("Shifter")
        .attr("y",-5)
        .attr("font-size", "15px")
        .attr("fill", "#FF8C00");

    var legend_color_scale = d3.scaleLinear();
    legend_color_scale
        .domain([0,0.2])
        .interpolate(d3.interpolateRgb);

    legend_color_scale.range(["#ffffff","#ca223c"]);

    var legend = lg1.selectAll(".legend1")
        .data(legend_color_scale.ticks(5))
        .enter().append("g")
        .attr("class", "legend1")
        .attr("transform", function(d, i) { return "translate(" + (i * 20) + "," + (0) + ")"; })
        .attr("stroke","grey");

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", legend_color_scale);

    var labels = ["0%","","","","20%"];

    legend.append("text")
        .attr("x",0)
        .attr("y",30)
        .attr("dy", ".35em")
        .text(function(d,i){return labels[i]});

    legend_color_scale.range(["#ffffff","#2a5783"]);
    var legend = lg2.selectAll(".legend2")
        .data(legend_color_scale.ticks(5))
        .enter().append("g")
        .attr("class", "legend2")
        .attr("transform", function(d, i) { return "translate(" + (i * 20) + "," + (0) + ")"; })
        .attr("stroke","grey");

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", legend_color_scale);

    var labels = ["0%","","","","20%"];


    legend.append("text")
        .attr("x",0)
        .attr("y",30)
        .attr("dy", ".35em")
        .text(function(d,i){return labels[i]});

    legend_color_scale.range(["#ffffff","#FF8C00"]);
    var legend = lg3.selectAll(".legend3")
        .data(legend_color_scale.ticks(5))
        .enter().append("g")
        .attr("class", "legend3")
        .attr("transform", function(d, i) { return "translate(" + (i * 20) + "," + (0) + ")"; })
        .attr("stroke","grey");

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", legend_color_scale);

    var labels = ["0%","","","","20%"];

    legend.append("text")
        .attr("x",0)
        .attr("y",30)
        .attr("dy", ".35em")
        .text(function(d,i){return labels[i]});


    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        topojson_data = topojson.feature(us, us.objects.states).features;
        if (error) throw error;

        var path = d3.geoPath().projection(scale(0.75, width_map, height_map));

        var states_cube = svg_map.append("g")

            .attr("id","states_map")
            .attr("class", "states")
            //.call(map_tip)
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features);


        states_cube.enter()
            .append("path")
            .attr("d", path)
            .attr("stroke","black")
            .on("mouseover", function(d){

            })
            .on("mouseout",function(d){
                //map_tip.hide();
                //d3.select(this).attr("stroke","black");
            })
            .style("fill", function(d,i){return fill(d)});



        states_cube
            .style("fill", function(d,i){return fill(d)});


    });



}