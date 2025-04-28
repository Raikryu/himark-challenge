---
toc: false
---

<div class="hero">
  <h1>Himark Earthquake Visualisation</h1>
</div>

---

<style>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

/* Legend Styles */
.info {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  border-radius: 5px;
}
.info h4 {
  margin: 0 0 5px;
  color: #333;
  font-weight: bold;
}
.legend {
  line-height: 22px;
  color: #555;
  background: white;
  background: rgba(255,255,255,0.9);
}
.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}

/* Enhanced Tooltip Styles */
.leaflet-tooltip {
  background-color: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4) !important;
  font-size: 14px !important;
  font-weight: bold !important;
  padding: 10px 12px !important;
  pointer-events: none !important;
  white-space: nowrap !important;
  border-radius: 6px !important;
}
</style>

## St. Himark Districts - Damage Scores Heatmap

<div id="map" style="width: 100%; height: 600px; display: block; margin: 0 auto; position: relative;"></div>

```js
// 1. Initialize the Leaflet map in a simple CRS (pixel coordinates).
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: 0,
  maxZoom: 2,
  center: [400, 500], // Initial center position
  zoom: 0.7
});

// 2. Define the image bounds with adjusted scaling to make the map display larger
var width = 1000, height = 800;
var bounds = [[0, 0], [height, width]];

// Set the bounds but don't automatically fit to them
// This allows our specific centering to take effect
map.setMaxBounds(bounds);

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

    // Bind a tooltip to show the region name and damage score on hover
    poly.bindTooltip(`
      <b>${feature.properties.name}</b><br>
      Damage Score: ${feature.properties.damage_score.toFixed(2)}
    `, {
      permanent: false,
      direction: 'top',
      className: 'district-tooltip',
      opacity: 1.0
    });

    // Add hover effects for highlighting only
    poly.on("mouseover", function(e) {
      e.target.setStyle({ fillOpacity: 0.9 });
    });
    poly.on("mouseout", function(e) {
      e.target.setStyle({ fillOpacity: 0.6 });
    });
  });

  // Add a legend with clear title and styling
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<h4>Damage Severity</h4>';

      var grades = d3.range(minDamage, maxDamage, (maxDamage-minDamage)/5);
      grades.push(maxDamage); // Make sure to include the maximum value

      // Loop through our damage intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length - 1; i++) {
          var from = grades[i].toFixed(2);
          var to = grades[i + 1].toFixed(2);

          div.innerHTML +=
              '<i style="background:' + colorScale(grades[i]) + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
              from + ' &ndash; ' + to + '<br>';
      }

      return div;
  };
  legend.addTo(map);

  // Find the center of the map data
  var allPolygons = [];
  geoData.features.forEach(function(feature) {
    var ring = feature.geometry.coordinates[0];
    var latLngRing = pixelPolygonToLatLngs(ring);
    allPolygons.push(latLngRing);
  });

  // Calculate the center of the map data and set the view
  if (allPolygons.length > 0) {
    // Create a single bounds object from all polygons
    var bounds = L.latLngBounds([]);
    allPolygons.forEach(function(polygon) {
      polygon.forEach(function(point) {
        bounds.extend(point);
      });
    });

    // Center the map on these bounds with appropriate padding
    map.fitBounds(bounds, {
      padding: [10, 10],
      maxZoom: 0.7
    });

    // Optional: add a slight delay and re-center to ensure it takes effect
    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }

}).catch(function(err) {
  console.error("Error loading files:", err);
});
```