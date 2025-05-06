---
theme: dashboard
toc: true
title: "Geographic Damage Assessment"
---

# St. Himark Geographic Damage Assessment

This visualization shows the damage across different districts of St. Himark. Areas with higher damage scores appear in darker red. Select different damage metrics to see how they affect different regions.

## Damage Metric Selection

<div class="control-panel">
  <label for="metric-select">Select Damage Metric:</label>
  <select id="metric-select" class="dashboard-select">
    <option value="damage_score">Overall Damage Score</option>
    <option value="sewer_and_water">Sewer & Water</option>
    <option value="power">Power</option>
    <option value="roads_and_bridges">Roads & Bridges</option>
    <option value="medical">Medical</option>
    <option value="buildings">Buildings</option>
  </select>
  <button id="show-all-metrics" class="dashboard-button">
    <i class="fas fa-layer-group"></i> Compare All Metrics
  </button>
  <div id="time-range" style="display: none; margin-left: auto;">
    <label for="time-slider">Filter by Report Time:</label>
    <input type="range" id="time-slider" min="0" max="100" value="100" style="width: 200px;">
    <span id="time-display">All Reports</span>
  </div>
</div>

## Geographic Heatmap

<div class="dashboard-card">
  <div id="map" style="width: 100%; height: 600px;"></div>
  <div class="dashboard-legend" id="map-legend">
  </div>
</div>

<div id="metrics-comparison" class="dashboard-card" style="display: none;">
  <div class="dashboard-title">
    <i class="fas fa-chart-bar"></i> Metrics Comparison by District
  </div>
  <div id="metrics-chart" style="width: 100%; height: 400px;"></div>
</div>

<div class="dashboard-card">
  <div class="dashboard-title">
    <i class="fas fa-info-circle"></i> District Information
  </div>
  <div id="district-info">Select a district on the map to see detailed information.</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>

```js
import { dashboardColors, getDamageColor, applyDashboardStyles } from "./components/dashboard-styles.js"
import dashboardState from "./components/dashboard-state.js";
import { loadCommonLibraries, getMetricLabel } from "./components/js.js";

{
  applyDashboardStyles();
  
  async function loadExternalLibraries() {
    const head = document.head;

    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    head.appendChild(leafletJS);
    
    await loadCommonLibraries();
  }

  async function initHeatmap() {
    await loadExternalLibraries();
    
    if (typeof Chart === 'undefined') {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      errorMsg.textContent = 'Failed to load visualization libraries.';
      document.getElementById('metrics-chart').appendChild(errorMsg);
      return;
    }
    
    try {
  let map;
  
  if (typeof L !== 'undefined') {
    map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -2,
      center: [0, 0],
      zoom: 0
    });
  } else {
    return;
  }

  const metricSelect = document.getElementById('metric-select');
  const showAllMetricsBtn = document.getElementById('show-all-metrics');
  const metricsComparisonDiv = document.getElementById('metrics-comparison');
  const districtInfoDiv = document.getElementById('district-info');
  const mapLegendDiv = document.getElementById('map-legend');
  const width = 1000, height = 800;
  const bounds = [[0, 0], [height, width]];
  map.setMaxBounds(bounds);
  map.fitBounds(bounds);

  const metrics = {
    damage_score: {
      displayName: "Overall Damage Score",
      color: dashboardColors.secondary
    },
    sewer_and_water: {
      displayName: "Sewer & Water",
      color: dashboardColors.damage.categories.sewage
    },
    power: {
      displayName: "Power",
      color: dashboardColors.damage.categories.power
    },
    roads_and_bridges: {
      displayName: "Roads & Bridges",
      color: dashboardColors.damage.categories.roads
    },
    medical: {
      displayName: "Medical",
      color: dashboardColors.damage.categories.medical
    },
    buildings: {
      displayName: "Buildings",
      color: dashboardColors.damage.categories.buildings
    }
  };

  let selectedDistrict = null;
  let geoData = null;
  let radarData = null;
  let layerGroup = null;
  let metricsChart = null;
  Promise.all([
    FileAttachment("st_himark_color_extracted_pixels_with_update2.geojson").json(),
    FileAttachment("radar_chart_data.json").json()
  ]).then(function([geoJson, radarJson]) {
    geoData = geoJson;
    radarData = radarJson;

    updateMap(metricSelect.value);
    createMapLegend(metricSelect.value);
    metricSelect.addEventListener('change', function() {
      updateMap(this.value);
      createMapLegend(this.value);
    });

    showAllMetricsBtn.addEventListener('click', function() {
      if (metricsComparisonDiv.style.display === 'none') {
        // Show metrics comparison
        metricsComparisonDiv.style.display = 'block';
        if (selectedDistrict) {
          createMetricsChart(selectedDistrict);
        } else {
          createAverageMetricsChart();
        }
      } else {
        // Hide metrics comparison
        metricsComparisonDiv.style.display = 'none';
      }
    });
  }).catch(function(err) {
  });

  function updateMap(metric) {
    if (layerGroup) {
      map.removeLayer(layerGroup);
    }

    layerGroup = L.layerGroup().addTo(map);

    const damageMap = {};
    radarData.forEach(function(d) {
      damageMap[d.location] = d[metric] || d.damage_score;
    });
    geoData.features.forEach(function(feature) {
      const regionName = feature.properties.name;
      if (damageMap.hasOwnProperty(regionName)) {
        feature.properties[metric] = damageMap[regionName];
      }
    });

    const values = geoData.features.map(f => f.properties[metric]).filter(v => v !== undefined);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    function getColor(value) {
      return getDamageColor(value);
    }

    function pixelPolygonToLatLngs(coords) {
      return coords.map(function(pt) {
        return [height - pt[1], pt[0]];
      });
    }

    geoData.features.forEach(function(feature) {
      const value = feature.properties[metric];
      const polygons = feature.geometry.coordinates;
      const ring = polygons[0];
      const latLngRing = pixelPolygonToLatLngs(ring);

      const poly = L.polygon(latLngRing, {
        color: "white",
        weight: 2,
        fillColor: getColor(value),
        fillOpacity: 0.7
      }).addTo(layerGroup);

      poly.bindTooltip(`
        <strong>${feature.properties.name}</strong><br>
        ${metrics[metric].displayName}: ${value ? value.toFixed(2) : 'N/A'}
      `);

      poly.on('click', function() {
        selectedDistrict = feature.properties.name;

        updateDistrictInfo(feature.properties.name);
        if (metricsComparisonDiv.style.display !== 'none') {
          createMetricsChart(feature.properties.name);
        }

        layerGroup.eachLayer(function(layer) {
          layer.setStyle({ weight: 2 });
        });
        this.setStyle({ weight: 4, color: dashboardColors.light });
      });

      poly.on('mouseover', function() {
        if (feature.properties.name !== selectedDistrict) {
          this.setStyle({ weight: 3, fillOpacity: 0.9 });
        }
      });

      poly.on('mouseout', function() {
        if (feature.properties.name !== selectedDistrict) {
          this.setStyle({ weight: 2, fillOpacity: 0.7 });
        }
      });
    });

    const info = L.control({ position: 'topright' });
    info.onAdd = function() {
      this._div = L.DomUtil.create('div', 'info');
      this._div.innerHTML = `
        <h4>${metrics[metric].displayName}</h4>
        <p>Click on a district for details</p>
      `;
      this._div.style.padding = '6px 8px';
      this._div.style.background = 'rgba(255, 255, 255, 0.8)';
      this._div.style.borderRadius = '4px';
      this._div.style.color = '#333';
      return this._div;
    };
    info.addTo(map);
  }

  function createMapLegend(metric) {
    mapLegendDiv.innerHTML = '';

    const values = radarData.map(d => d[metric] || d.damage_score);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const legendTitle = document.createElement('div');
    legendTitle.className = 'legend-title';
    legendTitle.textContent = `${metrics[metric].displayName} Scale`;
    mapLegendDiv.appendChild(legendTitle);

    const steps = 5;
    const interval = (max - min) / steps;

    for (let i = 0; i <= steps; i++) {
      const value = min + (i * interval);

      const item = document.createElement('div');
      item.className = 'legend-item';

      const colorBox = document.createElement('div');
      colorBox.className = 'legend-color';
      colorBox.style.backgroundColor = getDamageColor(value);

      const label = document.createElement('span');
      label.textContent = value.toFixed(1);

      item.appendChild(colorBox);
      item.appendChild(label);
      mapLegendDiv.appendChild(item);
    }
  }

  function updateDistrictInfo(districtName) {
    const district = radarData.find(d => d.location === districtName);

    if (!district) {
      districtInfoDiv.innerHTML = `<p>No data available for ${districtName}</p>`;
      return;
    }

    let html = `
      <h3>${districtName} District</h3>
      <div class="district-metrics">
        <table class="metrics-table">
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Severity</th>
          </tr>
    `;

    Object.keys(metrics).forEach(metric => {
      if (metric === 'damage_score') return;

      const value = district[metric];
      const severity = getSeverityLabel(value);

      html += `
        <tr>
          <td>${metrics[metric].displayName}</td>
          <td>${value ? value.toFixed(2) : 'N/A'}</td>
          <td>
            <div class="severity-indicator" style="background: ${getDamageColor(value)}">
              ${severity}
            </div>
          </td>
        </tr>
      `;
    });

    html += `
        </table>
      </div>
      <div class="overall-score">
        <h4>Overall Damage Score</h4>
        <div class="score-display" style="background: linear-gradient(to right, #ffffff, ${getDamageColor(district.damage_score)})">
          ${district.damage_score ? district.damage_score.toFixed(2) : 'N/A'}
        </div>
      </div>
    `;

    districtInfoDiv.innerHTML = html;
  }

  function createMetricsChart(districtName) {
    const district = radarData.find(d => d.location === districtName);

    if (!district) {
      document.getElementById('metrics-chart').innerHTML = 'No data available';
      return;
    }

    const labels = [];
    const values = [];
    const backgroundColors = [];

    Object.keys(metrics).forEach(metric => {
      if (metric === 'damage_score') return;

      labels.push(metrics[metric].displayName);
      values.push(district[metric]);
      backgroundColors.push(metrics[metric].color);
    });

    const ctx = document.createElement('canvas');
    ctx.height = 400;
    const container = document.getElementById('metrics-chart');
    container.innerHTML = '';
    container.appendChild(ctx);

    if (metricsChart) {
      metricsChart.destroy();
    }

    metricsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${districtName} District Metrics`,
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Damage Score (0-10)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Damage Assessment for ${districtName} District`,
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  function createAverageMetricsChart() {
    const metricKeys = Object.keys(metrics).filter(m => m !== 'damage_score');
    const labels = metricKeys.map(m => metrics[m].displayName);
    const datasets = [];
    radarData.forEach(district => {
      const data = metricKeys.map(metric => district[metric]);

      datasets.push({
        label: district.location,
        data: data,
        borderColor: getRandomColor(),
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2
      });
    });

    const ctx = document.createElement('canvas');
    ctx.height = 400;
    const container = document.getElementById('metrics-chart');
    container.innerHTML = '';
    container.appendChild(ctx);

    if (metricsChart) {
      metricsChart.destroy();
    }

    metricsChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Comparison of All Districts',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  function getSeverityLabel(value) {
    if (value <= 2) return 'Minimal';
    if (value <= 4) return 'Minor';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Severe';
    return 'Critical';
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  if (typeof dashboardState !== 'undefined') {
    dashboardState.subscribe('filters', (filters) => {
      if (filters.metric) {
        const metricSelect = document.getElementById('metric-select');
        if (metricSelect && metricSelect.querySelector(`option[value="${filters.metric}"]`)) {
          metricSelect.value = filters.metric;
          updateMap(filters.metric);
          createMapLegend(filters.metric);
        }
      }
    });
  }
    
  } catch (error) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'An error occurred while initializing the visualization.';
    document.getElementById('map').appendChild(errorMsg);
  }
}
    
setTimeout(initHeatmap, 1000);
}
```

<style>
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.metrics-table th, .metrics-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--bg-card-border);
}

.metrics-table th {
  text-align: left;
  color: var(--primary-color);
}

.severity-indicator {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  color: white;
  border-radius: 3px;
  font-size: 0.875rem;
  text-align: center;
}

.overall-score {
  margin-top: 1.5rem;
  text-align: center;
}

.score-display {
  font-size: 2rem;
  font-weight: bold;
  padding: 1rem;
  border-radius: 8px;
  color: var(--text-dark);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: inline-block;
  min-width: 100px;
}

.legend-title {
  margin-bottom: 0.5rem;
  color: var(--text-light);
  font-weight: 500;
}
</style>