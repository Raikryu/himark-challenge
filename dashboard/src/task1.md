---
theme: dashboard
title: Task 1
toc: false
---

# St. Himark Disaster Assessment Dashboard

## Treemap Visualization

<script src="https://d3js.org/d3.v7.min.js"></script>

<svg id="treemapChart" style="width: 100%; height: auto;"
     viewBox="0 0 800 600"
     preserveAspectRatio="xMidYMid meet"></svg>

<style>
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
  svg#treemapChart {
    display: block;
    margin: auto;
  }
  text {
    font-size: 12px;
    fill: #fff;
    pointer-events: none;
  }
</style>

```js
const width = 800;
const height = 600;

const svgElement = document.getElementById("treemapChart");

const svg = d3.select(svgElement);

const data = await FileAttachment("data/treemap.json").json();

const root = d3.hierarchy(data)
  .sum(d => d.value);

d3.treemap()
  .size([width, height])
  .padding(1)(root);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const leaves = svg.selectAll("g")
  .data(root.leaves())
  .enter()
  .append("g")
  .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

leaves.append("rect")
  .attr("width", d => d.x1 - d.x0)
  .attr("height", d => d.y1 - d.y0)
  .attr("fill", d => color(d.parent.data.name))

leaves.append("text")
  .attr("x", 5)
  .attr("y", 15)
  .style("font-size", "10px")
  .text(d => d.data.name);

leaves.append("text")
  .attr("x", 5)
  .attr("y", 30)
  .text(d => d.data.value);
```

## St. Himark Districts - Damage Scores Heatmap

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

## Box Plot of Selected Variable by Date 📊

<div class="section">
  <label for="location-select"><strong>Select a Location:</strong></label>
  <select id="location-select"></select>
</div>

<div class="section">
  <label for="metric-select"><strong>Select a Variable:</strong></label>
  <select id="metric-select">
    <option value="shake_intensity">Shake Intensity</option>
    <option value="sewer_and_water">Sewer & Water</option>
    <option value="power">Power</option>
    <option value="roads_and_bridges">Roads & Bridges</option>
    <option value="medical">Medical</option>
    <option value="buildings">Buildings</option>
  </select>
</div>

<div class="section">
  <div id="chart-container" class="chart-box"></div>
</div>

```js
FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
  const raw = d3.csvParse(text.replace(/\r\n/g, "\n").trim(), d3.autoType);
  const parseDate = d3.timeParse("%d/%m/%Y %H:%M");

  raw.forEach(d => {
    d.numericDate = parseDate(d.time);
    d.location = String(d.location).trim();
    d.date = d.numericDate ? d.numericDate.toISOString().split("T")[0] : null;
  });

  const rangeStart = new Date("2020-04-06");
  const rangeEnd = new Date("2020-04-10");
  const validData = raw.filter(d => d.numericDate >= rangeStart && d.numericDate <= rangeEnd);

  const locations = [...new Set(validData.map(d => d.location))].sort((a, b) => +a - +b);
  const locationSelect = document.getElementById("location-select");
  locationSelect.innerHTML = "";
  locations.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = `Neighborhood ${loc}`;
    locationSelect.appendChild(option);
  });

  const metricSelect = document.getElementById("metric-select");

  function draw() {
    const selectedLocation = locationSelect.value;
    const selectedMetric = metricSelect.value;

    const filtered = validData.filter(d =>
      d.location === selectedLocation && !isNaN(d[selectedMetric])
    );

    const chart = Plot.plot({
      width: 800,
      height: 500,
      x: { label: "Date", type: "band" },
      y: { label: selectedMetric, grid: true },
      marks: [
        Plot.ruleY([0]),
        Plot.boxY(filtered, {
          x: "date",
          y: selectedMetric,
          fill: "steelblue",
          opacity: 0.7
        })
      ]
    });

    const container = document.getElementById("chart-container");
    container.innerHTML = "";
    container.appendChild(chart);
  }

  locationSelect.addEventListener("change", draw);
  metricSelect.addEventListener("change", draw);

  setTimeout(() => {
    locationSelect.selectedIndex = 0;
    draw();
  }, 100);
});
```

## Animated Playback of Damage Over Time ⏱️

<div class="section">
  <label for="step-select"><strong>Step Size (hours):</strong></label>
  <select id="step-select">
    <option value="1">1</option>
    <option value="3">3</option>
    <option value="6">6</option>
    <option value="12" selected>12</option>
    <option value="24">24</option>
  </select>
</div>

<div class="section">
  <button id="play-button">▶️ Play</button>
  <button id="pause-button">⏸️ Pause</button>
</div>

<div class="section">
  <div id="animated-bar-container" class="chart-box"></div>
</div>

```js
FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
  const data = d3.csvParse(text.replace(/\r\n/g, "\n").trim(), d3.autoType);
  const parse = d3.timeParse("%d/%m/%Y %H:%M");

  data.forEach(d => {
    d.time = parse(d.time);
    d.combined_damage = (
      d.sewer_and_water +
      d.power +
      d.roads_and_bridges +
      d.medical +
      d.buildings +
      d.shake_intensity
    ) / 6;
  });

  const valid = data.filter(d => d.time);
  const grouped = d3.group(valid, d => d3.timeHour(d.time));
  const timestamps = Array.from(grouped.keys()).sort((a, b) => a - b);

  let current = 0;
  let step = 12;

  function render(ts) {
    const points = grouped.get(ts) || [];
    const avg = Array.from(
      d3.rollup(points, v => d3.mean(v, d => d.combined_damage), d => d.location),
      ([location, combined_damage]) => ({ location, combined_damage })
    );

    const chart = Plot.plot({
      title: `Damage at ${ts.toLocaleString()}`,
      height: 500,
      marginLeft: 80,
      x: { label: "Combined Damage (0–10)", domain: [0, 10] },
      y: {
        label: "Neighborhood",
        reverse: true,
        tickFormat: d => `Neighborhood ${d}`
      },
      marks: [
        Plot.barX(avg, {
          x: "combined_damage",
          y: "location",
          fill: "combined_damage",
          tip: true
        })
      ],
      color: { scheme: "reds" }
    });

    const container = document.getElementById("animated-bar-container");
    container.innerHTML = "";
    container.appendChild(chart);
  }

  function next() {
    if (current >= timestamps.length) current = 0;
    render(timestamps[current]);
    const now = timestamps[current];
    const later = new Date(now.getTime() + step * 60 * 60 * 1000);
    const nextIndex = timestamps.findIndex(t => t.getTime() >= later.getTime());
    current = nextIndex === -1 ? 0 : nextIndex;
  }

  setTimeout(() => {
    const play = document.getElementById("play-button");
    const pause = document.getElementById("pause-button");
    const stepInput = document.getElementById("step-select");

    if (!play || !pause || !stepInput) return;

    play.addEventListener("click", () => {
      if (window.animInterval) clearInterval(window.animInterval);
      window.animInterval = setInterval(next, 1000);
    });

    pause.addEventListener("click", () => {
      clearInterval(window.animInterval);
    });

    stepInput.addEventListener("change", e => {
      step = parseInt(e.target.value);
    });

    render(timestamps[0]);
  }, 100);
});
```

## Radar Chart with Dropdown

This notebook visualizes different metrics using a radar chart. Select a metric from the dropdown to update the chart.

### Metric Selection

<select id="metricSelect">
  <option value="sewer_and_water">Sewer & Water</option>
  <option value="power">Power</option>
  <option value="roads_and_bridges">Roads & Bridges</option>
  <option value="medical">Medical</option>
  <option value="buildings">Buildings</option>
  <option value="damage_score">Damage Score</option>
</select>

### Radar Chart

<canvas id="radarChart" width="600" height="600"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

```js
const metricSelect = document.getElementById("metricSelect");
const canvas = document.getElementById("radarChart");
const ctx = canvas.getContext("2d");

// 2. Load data
const data = await FileAttachment("data/radar_chart_data.json").json();
console.log("Radar data loaded:", data);

// 3. Create initial dataset
const defaultMetric = "sewer_and_water";
const initialDataset = {
  label: metricDisplayName(defaultMetric),
  data: data.map(d => d[defaultMetric]),
  borderColor: "rgba(255, 99, 132, 1)",
  backgroundColor: "rgba(255, 99, 132, 0.2)"
};

// 4. Create the chart
window.myRadarChart = new Chart(ctx, {
  type: "radar",
  data: {
    labels: data.map(d => d.locationName),
    datasets: [{
      label: "Roads & Bridges",
      data: data.map(d => d.roads_and_bridges),
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: "#fff"
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: "#fff",
          backdropColor: "transparent",
          showLabelBackdrop: false,
          font: {
            size: 12
          },
          callback: (value) => `${value}/10`
        },
        angleLines: {
          color: "#444"
        },
        grid: {
          color: "#666"
        },
        pointLabels: {
          color: "#fff",
          font: {
            size: 13
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "#fff"
        }
      },
      title: {
        display: true,
        text: "Damage Assessment by Location (Single Metric)",
        color: "#fff",
        font: {
          size: 16
        }
      }
    }
  }
});

// 5. Listen for dropdown changes
metricSelect.addEventListener("change", event => {
  updateChartMetric(event.target.value);
});

// 6. The update function
function updateChartMetric(metric) {
  const chart = window.myRadarChart;
  chart.data.datasets[0].label = metricDisplayName(metric);
  chart.data.datasets[0].data = data.map(d => d[metric]);
  chart.update();
}

function metricDisplayName(metricKey) {
  switch(metricKey) {
    case "sewer_and_water": return "Sewer & Water";
    case "power": return "Power";
    case "roads_and_bridges": return "Roads & Bridges";
    case "medical": return "Medical";
    case "buildings": return "Buildings";
    case "damage_score": return "Damage Score";
    default: return metricKey;
  }
}
```