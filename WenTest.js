/**
 * Created by ScarVaapad on 11/14/17.
 */
//Test
var svg_map;

//derived from https://bl.ocks.org/andrew-reid/496078bd5e37fd22a9b43fd6be84b36b
function scale (scaleFactor, width, height) {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point((x - width/2) * scaleFactor + width/2 , (y - height/2) * scaleFactor + height/2);
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
    var fill = d3.scaleLinear()
        .domain([7, 27804]) //based on real data retrieved, now it is the area of the state
        .range(["#f6dcd5", "#9e3d22"]);

    svg_map = d3.select("#geo-map")
        .append("svg")
        .attr("width", width_map)
        .attr("height", height_map);

    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;

        var path = d3.geoPath().projection(scale(0.8, width_map, height_map));

        svg_map.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(d){return fill(path.area(d));});

    });



}