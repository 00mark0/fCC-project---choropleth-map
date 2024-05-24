// URLs for the data
const EDUCATION_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const COUNTIES_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

// Dimensions
const width = 960;
const height = 600;

// Load the data
Promise.all([d3.json(EDUCATION_URL), d3.json(COUNTIES_URL)]).then(
  ([educationData, us]) => {
    // Create a lookup table for education data
    const educationLookup = {};
    educationData.forEach((d) => {
      educationLookup[d.fips] = d;
    });

    // Create a color scale
    const colorScale = d3.scaleQuantize([0, 100], d3.schemeBlues[9]);

    // Create a projection
    const projection = d3
      .geoAlbersUsa()
      .scale(width)
      .translate([width / 2, height / 2]);

    // Draw the map
    const svg = d3
      .select("#choropleth")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    const path = d3.geoPath();
    svg
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => educationLookup[d.id].bachelorsOrHigher)
      .attr("fill", (d) => colorScale(educationLookup[d.id].bachelorsOrHigher))
      .attr("d", path)
      .on("mouseover", function (d) {
        // Show tooltip
        const tooltip = d3.select("#tooltip");
        tooltip.style("visibility", "visible");
        tooltip.html(
          educationLookup[d.id].area_name +
            ", " +
            educationLookup[d.id].state +
            ": " +
            educationLookup[d.id].bachelorsOrHigher +
            "%"
        );
        tooltip.attr("data-education", educationLookup[d.id].bachelorsOrHigher);
      })
      .on("mouseout", function () {
        // Hide tooltip
        d3.select("#tooltip").style("visibility", "hidden");
      });

    // Draw the legend
    const legend = d3
      .select("#legend")
      .append("svg")
      .attr("width", 300)
      .attr("height", 50);

    const legendScale = d3.scaleLinear().domain([0, 100]).rangeRound([0, 300]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .tickSize(13)
      .tickValues([0, 20, 40, 60, 80, 100])
      .tickFormat((d) => d + "%");

    legend
      .selectAll("rect")
      .data(colorScale.range().map((d) => colorScale.invertExtent(d)))
      .enter()
      .append("rect")
      .attr("height", 8)
      .attr("x", (d) => legendScale(d[0]))
      .attr("width", (d) => legendScale(d[1]) - legendScale(d[0]))
      .attr("fill", (d) => colorScale(d[0]));
    legend.call(legendAxis).select(".domain").remove();
  }
);
