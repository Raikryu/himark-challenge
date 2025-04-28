# St. Himark Districts - Damage Scores Heatmap

<div id="map" style="width: 100%; height: 600px;"></div>

```js
// 1. Initialize the Leaflet map in a simple CRS (pixel coordinates).
 var map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -2,
      center: [0, 0],
      zoom: 0
    });

    // 2. Define the image bounds (example: 1000px x 800px)
    var width = 1000, height = 800;
    var bounds = [[0, 0], [height, width]];
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    // 3. Load both GeoJSON and radar data using D3.
    Promise.all([
       FileAttachment("data/st_himark_color_extracted_pixels_with_update2.geojson").json(),
      FileAttachment("data/radar_chart_data.json").json()
    ]).then(function([geoData, radarData]) {

      // Build a dictionary: key by region name (ensure both files use the same key).
      var damageMap = {};
      radarData.forEach(function(d) {
        // If radar data "location" is a name, then key by that.
        damageMap[d.location] = d.damage_score ||
          // If damage_score is not provided, compute it:
          (d.sewer_and_water + d.power + d.roads_and_bridges + d.medical + d.buildings) / 5;
      });

      // Merge damage_score into each GeoJSON feature by matching name.
      geoData.features.forEach(function(feature) {
        var regionName = feature.properties.name;  // e.g. "Northwest"
        if (damageMap.hasOwnProperty(regionName)) {
          feature.properties.damage_score = damageMap[regionName];
        } else {
          console.log('No damage score found for region', regionName);
        }
      });

      // Compute min and max damage scores for the color scale.
      var damageScores = geoData.features.map(function(feature) {
        return feature.properties.damage_score;
      });
      var minDamage = d3.min(damageScores);
      var maxDamage = d3.max(damageScores);

      // Create a color scale using D3: lower damage => lighter red, higher damage => darker red.
      var colorScale = d3.scaleSequential()
                         .domain([minDamage, maxDamage])
                         .interpolator(d3.interpolateReds);

      // Function to convert pixel coordinates to Leaflet latlngs (inverting Y).
      function pixelPolygonToLatLngs(coords) {
        return coords.map(function(pt) {
          var x = pt[0], y = pt[1];
          return [height - y, x];
        });
      }

      // Create a layer group for the polygons.
      var layerGroup = L.layerGroup().addTo(map);

      // Create a polygon for each feature, using the color scale.
      geoData.features.forEach(function(feature) {
        var polygons = feature.geometry.coordinates;
        // Assuming a single ring for demonstration.
        var ring = polygons[0];
        var latLngRing = pixelPolygonToLatLngs(ring);

        // Set fillColor based on the damage score.
        var poly = L.polygon(latLngRing, {
          color: "white",
          weight: 2,
          fillColor: colorScale(feature.properties.damage_score),
          fillOpacity: 0.6
        }).addTo(layerGroup);

        // Add hover effects.
        poly.on("mouseover", function(e) {
          e.target.setStyle({ fillOpacity: 0.9 });
          info.update(feature.properties);
        });
        poly.on("mouseout", function(e) {
          e.target.setStyle({ fillOpacity: 0.6 });
          info.update();
        });
      });

      // Create an info control for hover information.
      // Create an info control for hover information.
var info = L.control({ position: 'topright' });
info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};
info.update = function(props) {
  this._div.innerHTML = props
    ? `<b>${props.name}</b><br/>Damage Score: ${props.damage_score}`
    : "Hover over a district";
};
info.addTo(map);

// Create a layer group for the polygons.
var layerGroup = L.layerGroup().addTo(map);

// Create a polygon for each feature, using the color scale.
geoData.features.forEach(function(feature) {
  var polygons = feature.geometry.coordinates;
  // Assuming a single ring for demonstration.
  var ring = polygons[0];
  var latLngRing = pixelPolygonToLatLngs(ring);

  // Create the polygon with the calculated style.
  var poly = L.polygon(latLngRing, {
    color: "white",
    weight: 2,
    fillColor: colorScale(feature.properties.damage_score),
    fillOpacity: 0.6
  }).addTo(layerGroup);

  // Bind a tooltip to show the region name and damage score on hover.
  poly.bindTooltip(`
    <b>${feature.properties.name}</b><br>
    Damage Score: ${feature.properties.damage_score}
  `);

  // Existing hover event listeners that update the info control.
  poly.on("mouseover", function(e) {
    e.target.setStyle({ fillOpacity: 0.9 });
    info.update(feature.properties);
  });
  poly.on("mouseout", function(e) {
    e.target.setStyle({ fillOpacity: 0.6 });
    info.update();
  });
});




      // Optionally, add a legend.
      var legend = L.control({position: 'bottomright'});
      legend.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'info legend'),
              grades = d3.range(minDamage, maxDamage, (maxDamage-minDamage)/5),
              labels = [];
          // loop through our damage intervals and generate a label with a colored square for each interval
          for (var i = 0; i < grades.length; i++) {
              var from = grades[i].toFixed(2);
              var to = grades[i + 1] ? grades[i + 1].toFixed(2) : maxDamage.toFixed(2);
              div.innerHTML +=
                  '<i style="background:' + colorScale(grades[i] + (maxDamage-minDamage)/10) + '"></i> ' +
                  from + (to ? '&ndash;' + to + '<br>' : '+');
          }
          return div;
      };
      legend.addTo(map);



    }).catch(function(err) {
      console.error("Error loading files: hello", err);
      console.log("hello")
    });
```