/**
 * Created by ScarVaapad on 11/14/17.
 */
//Test
var svg_map;

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
    //grey: #f2f2f2
    var fill = function(area){
        var state_id = area.id;
        var d = full_data;
        d = d.filter(function(d) {return (d.id==area.id);});

        if(d[0].Shift_Flag == "Democratic")
            return "#2a5783";
        if(d[0].Shift_Flag=="Republican")
            return "#ca223c";
        if(d[0].Shift_Flag=="Shifter")
            return "yellow";

    };

    svg_map = d3.select("#geo-map")
        .append("svg")
        .attr("width", width_map)
        .attr("height", height_map);


    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;

        var path = d3.geoPath().projection(scale(0.75, width_map, height_map));

        var pathes = svg_map.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features);

        pathes.enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d){return fill(d)});

        console.log(us.objects.states.id)
    });



}