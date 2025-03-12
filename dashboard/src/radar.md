---
theme: dashboard
title: radar
toc: false
---

# Earthquake Reports

```js

const reports = await FileAttachment("data/damage_std.csv").csv({typed: true,
});

function scaling(data, keys) {
  const scale = {};
  keys.forEach(key => {
    const values = reports.map(d => d[key]).filter(v => v !== undefined && v !== null);
    const min = Math.min(...values);
    const max = Math.max(...values);
    scale[key] = (data[key] !== undefined && data[key] !== null) ? (data[key] - min) / (max - min) : 0; 
  });
  return scale;
}

const damage = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity" 
];


```


```js

function createRadarChart(location) {

  const locationData = reports.find(d => d.location == location);
  const scaled = scaling(locationData, damage);

  const angles = damage.map((_, i) => (i / damage.length) * 2 * Math.PI);


  return Plot.plot({
    width: 450,
    height: 450,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [0, -90],
      domain: d3.geoCircle().center([0, 90]).radius(1)()
    },
    color: {legend:true},
    marks: [
      Plot.geo([0.2, 0.4, 0.6, 0.8, 1.0], {
        geometry: r => d3.geoCircle().center([0, 90]).radius(r)(),
        stroke: "grey",
        fill: "grey",
        strokeOpacity: 0.3,
        fillOpacity: 0.03,
        strokeWidth: 0.5
      }),

    ]
  });
}


function renderRadarCharts() {
  const container = document.getElementById("radar-charts-container");


  [...new Set(reports.map(d => d.location))].forEach(location => {

    const chartDiv = document.createElement("div");
    chartDiv.className = "radar-chart";

    const radarChart = createRadarChart(location);

    chartDiv.appendChild(radarChart);

    container.appendChild(chartDiv);
  });
}

renderRadarCharts();

```

<div class="grid grid-cols-1">
  <div class="card" id="radar-charts-container">
  </div>
</div>
