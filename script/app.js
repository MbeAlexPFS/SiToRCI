//------ Données ------
//------ Rendre la carte ------

//taille du cadre
var width = window.innerWidth,
    height = window.innerHeight;

//-- creation de la carte dans un svg --
var svg = d3.select("#my_dataviz")
    .attr("width", width)
    .attr("height", height)
    .on("click",reset)

// map et projection
var projection
var path

// charge la carte
d3.json("../data/gadm41_CIV_1.json").then(function (data) {
    // Ajuster la projection
    projection = d3.geoMercator().fitSize([width, height], data);
    path = d3.geoPath().projection(projection);

    // Créer un groupe pour chaque regions
    var regionGroups = svg.selectAll("g.region")
        .data(data.features)
        .enter()
        .append("g")
        .attr("class", "region")
        .on("click", zoomToFeature);

    // Dessiner les paths
    regionGroups.append("path")
        .attr("class", d => `${d.geometry.type} no-checked ${d.properties.NAME_1}`)
        .attr("name", d => d.properties.NAME_1)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("d", path);


    // Ajouter les textes
    regionGroups.append("text")
        .attr("class","region-label")
        .attr("text-anchor", "middle")
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
        .append("a").attr("href",d => "page/"+d.properties.NAME_1+"/site.html").text(d => d.properties.NAME_1)
});

//-- Fonction de zoom --
//Zoom sur une region
function zoomToFeature(event, d) {
    if (! event.target.classList.contains("no-checked")) { //ne pas zoomer lors de la deselection
        // Empêche le reset aussi
        event.stopPropagation();

        svg.transition()
            .duration(750)
            .call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(2)  // Zoom ×2
                    .translate(-path.centroid(d)[0], -path.centroid(d)[1])
            );
    }
}

//système de navigation
const zoom = d3.zoom()
    .scaleExtent([0.5, 8])
    .on('zoom', zoomed);

svg.call(zoom);

function zoomed(event) {
    svg.selectAll('path')
        .attr('transform', event.transform);

    svg.selectAll(".region-label").attr('transform', event.transform);
}

function reset() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}