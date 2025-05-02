---
theme: dashboard
toc: true
title: "Interactive Dashboard"
---

# St. Himark Earthquake Interactive Dashboard

This dashboard brings together multiple visualizations with shared filters and cross-visualization interactivity to provide a comprehensive view of the earthquake damage in St. Himark.

## Global Filters

<div id="global-filters-container"></div>

## Dashboard Highlights

<div id="highlights-container"></div>

## Geographic Damage Assessment

<div class="dashboard-row">
  <div class="dashboard-card">
    <div class="dashboard-title">
      <i class="fas fa-map-marked-alt"></i> Geographic Heatmap
    </div>
    <div id="mini-heatmap" class="mini-visualization"></div>
  </div>
  
  <div class="dashboard-card">
    <div class="dashboard-title">
      <i class="fas fa-chart-radar"></i> Damage by Category
    </div>
    <div id="mini-radar" class="mini-visualization"></div>
  </div>
</div>

## Temporal Analysis

<div class="dashboard-row">
  <div class="dashboard-card full-width">
    <div class="dashboard-title">
      <i class="fas fa-film"></i> Damage Progression
    </div>
    <div id="mini-animation" class="mini-visualization"></div>
  </div>
</div>

## Key Statistics

<div class="dashboard-row">
  <div class="dashboard-card stat-card">
    <div class="dashboard-title">
      <i class="fas fa-exclamation-triangle"></i> Most Affected Areas
    </div>
    <div id="most-affected-areas" class="stat-content"></div>
  </div>
  
  <div class="dashboard-card stat-card">
    <div class="dashboard-title">
      <i class="fas fa-chart-line"></i> Damage Trends
    </div>
    <div id="damage-trends" class="stat-content"></div>
  </div>
  
  <div class="dashboard-card stat-card">
    <div class="dashboard-title">
      <i class="fas fa-hospital"></i> Critical Services
    </div>
    <div id="critical-services" class="stat-content"></div>
  </div>
</div>

## Summary and Recommendations

<div class="dashboard-card full-width">
  <div class="dashboard-title">
    <i class="fas fa-clipboard-list"></i> Analysis and Recommendations
  </div>
  <div id="recommendations" class="recommendations-content">
    <div class="recommendation-section">
      <h3>Key Findings</h3>
      <ul>
        <li>The earthquake caused significant damage across St. Himark, with the most severe impacts in the Northwestern districts.</li>
        <li>Power infrastructure and road networks were the most affected services, with average damage scores above 6.5.</li>
        <li>Damage patterns show a correlation between building structural damage and municipal service disruption.</li>
        <li>Recovery efforts were most effective in the densely populated Central districts, while remote areas lagged behind.</li>
      </ul>
    </div>
    
    <div class="recommendation-section">
      <h3>Response Priorities</h3>
      <ol>
        <li><strong>Emergency Service Routes:</strong> Clear and repair key transportation corridors connecting most affected areas to medical facilities.</li>
        <li><strong>Power Restoration:</strong> Focus on restoring power to areas with functioning medical facilities and water treatment plants.</li>
        <li><strong>Temporary Housing:</strong> Establish shelters in the less affected Southern districts while building repairs progress in the North.</li>
        <li><strong>Water Systems:</strong> Deploy mobile water purification units to areas with damaged sewer and water infrastructure.</li>
      </ol>
    </div>
    
    <div class="recommendation-section">
      <h3>Long-term Recommendations</h3>
      <p>Based on the damage patterns observed, future infrastructure development should prioritize:</p>
      <ul>
        <li>Decentralized power generation with improved grid resilience</li>
        <li>Redundant water distribution systems</li>
        <li>Retrofitting of older buildings in the Northwestern districts</li>
        <li>Improved emergency response coordination between districts</li>
      </ul>
    </div>
  </div>
</div>

```js
// Import dashboard state management
import dashboardState, { createGlobalFilterPanel, createHighlightsBox, applyGlobalFilters } from "/components/dashboard-state.js";
import { dashboardColors, getDamageColor, applyDashboardStyles } from "/components/dashboard-styles.js";

// Apply common dashboard styles
applyDashboardStyles();

// Wait for full page load
window.addEventListener('load', initDashboard);

async function initDashboard() {
  // Add global filters and highlights box
  const filtersContainer = document.getElementById('global-filters-container');
  const highlightsContainer = document.getElementById('highlights-container');
  
  if (filtersContainer) {
    filtersContainer.appendChild(createGlobalFilterPanel());
  }
  
  if (highlightsContainer) {
    highlightsContainer.appendChild(createHighlightsBox());
  }
  
  // Load D3.js
  await loadScript('https://d3js.org/d3.v7.min.js');
  
  // Load Leaflet for map visualization
  await Promise.all([
    loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
    loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
  ]);
  
  // Load Chart.js for charts
  await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js');
  
  // Load data
  const [geoData, radarData, reportData] = await Promise.all([
    FileAttachment("st_himark_color_extracted_pixels_with_update2.geojson").json(),
    FileAttachment("radar_chart_data.json").json(),
    FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
      const data = d3.csvParse(text.replace(/\r\n/g, "\n").trim(), d3.autoType);
      const parse = d3.timeParse("%d/%m/%Y %H:%M");
      
      // Process data
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
      
      return data.filter(d => d.time && !isNaN(d.time));
    })
  ]);
  
  // Initialize mini-visualizations
  initMiniHeatmap(geoData, radarData);
  initMiniRadarChart(radarData);
  initMiniAnimation(reportData);
  
  // Initialize statistics
  updateStatistics(radarData, reportData);
  
  // Subscribe to filter changes to update all visualizations
  dashboardState.subscribe('filters', () => {
    // Update all visualizations when filters change
    initMiniHeatmap(geoData, radarData);
    initMiniRadarChart(radarData);
    initMiniAnimation(reportData);
    updateStatistics(radarData, reportData);
  });
}

// Initialize mini heatmap visualization
function initMiniHeatmap(geoData, radarData) {
  const container = document.getElementById('mini-heatmap');
  if (!container) return;
  
  // Clear previous content
  container.innerHTML = '';
  
  // Apply global filters to data
  const filters = dashboardState.getState('filters');
  const filteredRadarData = applyGlobalFilters(radarData, {
    locationKey: 'location',
    metricKeys: {
      'combined_damage': ['damage_score'],
      'sewer_and_water': ['sewer_and_water'],
      'power': ['power'],
      'roads_and_bridges': ['roads_and_bridges'],
      'medical': ['medical'],
      'buildings': ['buildings']
    }
  });
  
  // Create map
  const mapHeight = 300;
  const map = L.map(container, {
    crs: L.CRS.Simple,
    minZoom: -2,
    center: [0, 0],
    zoom: -1
  });
  
  // Define the image bounds
  const width = 1000, height = 800;
  const bounds = [[0, 0], [height, width]];
  map.setMaxBounds(bounds);
  map.fitBounds(bounds);
  
  // Build damage score map
  const damageMap = {};
  filteredRadarData.forEach(d => {
    // Use selected metric if specified, otherwise use damage_score
    const metricKey = filters.metric || 'damage_score';
    damageMap[d.location] = filters.metric ? d[filters.metric] : (d.damage_score || 
      ((d.sewer_and_water + d.power + d.roads_and_bridges + d.medical + d.buildings) / 5));
  });
  
  // Merge damage score into each GeoJSON feature
  const mapGeoData = JSON.parse(JSON.stringify(geoData)); // Deep clone
  mapGeoData.features.forEach(feature => {
    const regionName = feature.properties.name;
    if (damageMap.hasOwnProperty(regionName)) {
      feature.properties.damage_score = damageMap[regionName];
    }
  });
  
  // Function to convert pixel coordinates to Leaflet latlngs
  function pixelPolygonToLatLngs(coords) {
    return coords.map(pt => [height - pt[1], pt[0]]);
  }
  
  // Create a layer group for the polygons
  const layerGroup = L.layerGroup().addTo(map);
  
  // Create polygons for each feature
  mapGeoData.features.forEach(feature => {
    const regionName = feature.properties.name;
    const damageScore = feature.properties.damage_score;
    
    // Skip if filtered out or no data
    if (damageScore === undefined) return;
    
    const polygons = feature.geometry.coordinates;
    const ring = polygons[0];
    const latLngRing = pixelPolygonToLatLngs(ring);
    
    // Create polygon with styling
    const poly = L.polygon(latLngRing, {
      color: "white",
      weight: 2,
      fillColor: getDamageColor(damageScore),
      fillOpacity: 0.7
    }).addTo(layerGroup);
    
    // Interactive behaviors for cross-visualization communication
    poly.on('click', () => {
      // Update the shared state
      dashboardState.setState('visualizationStates.heatmap.selectedDistrict', regionName);
      
      // Also set this as a global filter
      dashboardState.setState('filters.location', regionName);
      
      // Update the UI
      const locationFilter = document.getElementById('location-filter');
      if (locationFilter) locationFilter.value = regionName;
    });
    
    poly.on('mouseover', () => {
      poly.setStyle({ fillOpacity: 0.9, weight: 3 });
      dashboardState.setState('visualizationStates.heatmap.hoveredDistrict', regionName);
    });
    
    poly.on('mouseout', () => {
      poly.setStyle({ fillOpacity: 0.7, weight: 2 });
      dashboardState.setState('visualizationStates.heatmap.hoveredDistrict', null);
    });
    
    // Add tooltip
    poly.bindTooltip(`
      <strong>${regionName}</strong><br>
      ${filters.metric ? getMetricLabel(filters.metric) : 'Damage Score'}: ${damageScore.toFixed(2)}
    `);
  });
  
  // Add a legend
  const legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 2, 4, 6, 8];
    const labels = [];
    
    // Create legend content
    div.innerHTML = '<div style="background: rgba(0,0,0,0.6); padding: 5px; border-radius: 5px;">';
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += 
        '<i style="background:' + getDamageColor(grades[i] + 1) + '; opacity: 0.7;"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    div.innerHTML += '</div>';
    
    return div;
  };
  legend.addTo(map);
  
  // Add link to full visualization
  container.innerHTML += `
    <div class="view-full-link">
      <a href="heatmap" target="_self">View Full Map</a>
    </div>
  `;
}

// Initialize mini radar chart
function initMiniRadarChart(radarData) {
  const container = document.getElementById('mini-radar');
  if (!container) return;
  
  // Clear previous content
  container.innerHTML = '<canvas id="miniRadarCanvas" width="400" height="300"></canvas>';
  
  // Apply global filters
  const filters = dashboardState.getState('filters');
  const filteredData = applyGlobalFilters(radarData, {
    locationKey: 'location'
  });
  
  // If no data after filtering, show message
  if (filteredData.length === 0) {
    container.innerHTML = '<div class="no-data-message">No data available for the current filters</div>';
    return;
  }
  
  // Prepare data for radar chart
  const metrics = [
    { key: 'sewer_and_water', displayName: 'Sewer & Water' },
    { key: 'power', displayName: 'Power' },
    { key: 'roads_and_bridges', displayName: 'Roads & Bridges' },
    { key: 'medical', displayName: 'Medical' },
    { key: 'buildings', displayName: 'Buildings' }
  ];
  
  // If we have a location filter, show data for just that location
  // Otherwise show average across all locations
  let chartData;
  let chartTitle;
  
  if (filters.location) {
    // Show data for selected location
    const locationData = filteredData.find(d => d.location === filters.location);
    
    if (!locationData) {
      container.innerHTML = '<div class="no-data-message">No data available for the selected location</div>';
      return;
    }
    
    chartData = {
      labels: metrics.map(m => m.displayName),
      datasets: [{
        label: locationData.location,
        data: metrics.map(m => locationData[m.key]),
        backgroundColor: 'rgba(42, 157, 143, 0.2)',
        borderColor: dashboardColors.primary,
        borderWidth: 2,
        pointBackgroundColor: dashboardColors.primary
      }]
    };
    
    chartTitle = `Damage Metrics for ${filters.location}`;
  } else {
    // Calculate averages for each metric
    const avgData = {};
    metrics.forEach(metric => {
      avgData[metric.key] = d3.mean(filteredData, d => d[metric.key]);
    });
    
    // Create dataset
    chartData = {
      labels: metrics.map(m => m.displayName),
      datasets: [{
        label: 'Average Across Districts',
        data: metrics.map(m => avgData[m.key]),
        backgroundColor: 'rgba(231, 111, 81, 0.2)',
        borderColor: dashboardColors.secondary,
        borderWidth: 2,
        pointBackgroundColor: dashboardColors.secondary
      }]
    };
    
    chartTitle = 'Average Damage Metrics Across Districts';
  }
  
  // Draw the radar chart
  const ctx = document.getElementById('miniRadarCanvas').getContext('2d');
  const radarChart = new Chart(ctx, {
    type: 'radar',
    data: chartData,
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            backdropColor: 'rgba(0,0,0,0.3)',
            color: '#fff'
          },
          pointLabels: {
            color: '#fff',
            font: {
              size: 10
            }
          },
          grid: {
            color: 'rgba(255,255,255,0.2)'
          },
          angleLines: {
            color: 'rgba(255,255,255,0.2)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          color: '#fff',
          font: {
            size: 14
          }
        },
        legend: {
          labels: {
            color: '#fff',
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
  
  // Add interaction to update highlights on hover
  ctx.canvas.onmousemove = function(e) {
    const points = radarChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
    if (points.length) {
      const dataIndex = points[0].index;
      const metric = metrics[dataIndex];
      dashboardState.setState('visualizationStates.radarChart.hoveredMetric', metric.displayName);
    } else {
      dashboardState.setState('visualizationStates.radarChart.hoveredMetric', null);
    }
  };
  
  // Add link to full visualization
  container.innerHTML += `
    <div class="view-full-link">
      <a href="radar-chart" target="_self">View Full Chart</a>
    </div>
  `;
}

// Initialize mini animation graph
function initMiniAnimation(reportData) {
  const container = document.getElementById('mini-animation');
  if (!container) return;
  
  // Clear previous content
  container.innerHTML = '';
  
  // Apply global filters
  const filters = dashboardState.getState('filters');
  const filteredData = applyGlobalFilters(reportData, {
    locationKey: 'location',
    timeKey: 'time'
  });
  
  // Group data by time
  const groupedByTime = d3.group(filteredData, d => d3.timeHour(d.time));
  const timestamps = Array.from(groupedByTime.keys()).sort((a, b) => a - b);
  
  // If no data after filtering, show message
  if (timestamps.length === 0) {
    container.innerHTML = '<div class="no-data-message">No data available for the current filters</div>';
    return;
  }
  
  // Create controls
  container.innerHTML = `
    <div class="mini-controls">
      <button id="mini-play-btn" class="dashboard-button mini-btn">
        <i class="fas fa-play"></i>
      </button>
      <button id="mini-pause-btn" class="dashboard-button mini-btn">
        <i class="fas fa-pause"></i>
      </button>
      <div class="mini-timeline">
        <input type="range" id="mini-timeline-slider" min="0" max="${timestamps.length - 1}" value="0" class="timeline-range">
      </div>
      <div id="mini-time-display" class="mini-time-display">-</div>
    </div>
    <div id="mini-animation-chart" class="mini-chart-container"></div>
  `;
  
  // Create initial visualization
  const currentIndex = 0;
  renderMiniAnimationFrame(timestamps[currentIndex], groupedByTime);
  
  // Set up control listeners
  const timeSlider = document.getElementById('mini-timeline-slider');
  const timeDisplay = document.getElementById('mini-time-display');
  const playBtn = document.getElementById('mini-play-btn');
  const pauseBtn = document.getElementById('mini-pause-btn');
  
  let animationInterval;
  
  playBtn.addEventListener('click', () => {
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(() => {
      let index = parseInt(timeSlider.value);
      index = (index + 1) % timestamps.length;
      timeSlider.value = index;
      renderMiniAnimationFrame(timestamps[index], groupedByTime);
      updateTimeDisplay(timestamps[index]);
    }, 1000);
    
    dashboardState.setState('visualizationStates.animationGraph.playState', 'playing');
  });
  
  pauseBtn.addEventListener('click', () => {
    if (animationInterval) clearInterval(animationInterval);
    dashboardState.setState('visualizationStates.animationGraph.playState', 'paused');
  });
  
  timeSlider.addEventListener('input', () => {
    const index = parseInt(timeSlider.value);
    renderMiniAnimationFrame(timestamps[index], groupedByTime);
    updateTimeDisplay(timestamps[index]);
  });
  
  function updateTimeDisplay(timestamp) {
    const timeFormat = d3.timeFormat("%b %d, %Y %H:%M");
    timeDisplay.textContent = timeFormat(timestamp);
    dashboardState.setState('visualizationStates.animationGraph.currentTime', timeFormat(timestamp));
  }
  
  // Add link to full visualization
  container.innerHTML += `
    <div class="view-full-link">
      <a href="animation_graph" target="_self">View Full Animation</a>
    </div>
  `;
  
  // Initial update
  updateTimeDisplay(timestamps[0]);
}

// Render a frame for the mini animation
function renderMiniAnimationFrame(timestamp, groupedByTime) {
  const container = document.getElementById('mini-animation-chart');
  if (!container) return;
  
  // Get data points for this timestamp
  const points = groupedByTime.get(timestamp) || [];
  
  // Get the selected metric or use combined damage
  const filters = dashboardState.getState('filters');
  const selectedMetric = filters.metric || 'combined_damage';
  
  // Calculate average damage by location
  const locationDamage = Array.from(
    d3.rollup(
      points, 
      v => {
        if (selectedMetric === 'combined_damage') {
          return d3.mean(v, d => 
            (d.sewer_and_water + d.power + d.roads_and_bridges + 
             d.medical + d.buildings + d.shake_intensity) / 6
          );
        } else {
          return d3.mean(v, d => d[selectedMetric] || 0);
        }
      }, 
      d => d.location
    ),
    ([location, value]) => ({ location, value })
  );
  
  // Sort by damage score descending
  locationDamage.sort((a, b) => b.value - a.value);
  
  // Create SVG
  const margin = { top: 10, right: 10, bottom: 20, left: 100 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;
  
  // Clear container
  container.innerHTML = '';
  
  // Create SVG
  const svg = d3.create('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(locationDamage, d => d.value) || 10])
    .nice()
    .range([0, width]);
  
  const y = d3.scaleBand()
    .domain(locationDamage.map(d => d.location))
    .range([0, height])
    .padding(0.2);
  
  // Axes
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5))
    .call(g => g.selectAll('.tick text').attr('fill', '#fff'));
  
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .call(g => g.selectAll('.tick text').attr('fill', '#fff'));
  
  // Bars
  g.selectAll('.bar')
    .data(locationDamage)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => y(d.location))
    .attr('width', d => x(d.value))
    .attr('height', y.bandwidth())
    .attr('fill', d => getDamageColor(d.value))
    .attr('rx', 3)
    .attr('ry', 3);
  
  // Add to DOM
  container.appendChild(svg.node());
}

// Update statistics panels
function updateStatistics(radarData, reportData) {
  // Apply global filters
  const filters = dashboardState.getState('filters');
  const filteredRadarData = applyGlobalFilters(radarData, {
    locationKey: 'location'
  });
  
  // ---- Most Affected Areas ----
  const mostAffectedContainer = document.getElementById('most-affected-areas');
  if (mostAffectedContainer) {
    // Calculate overall damage scores and sort
    const areaDamage = filteredRadarData.map(d => ({
      location: d.location,
      score: d.damage_score || 
        ((d.sewer_and_water + d.power + d.roads_and_bridges + d.medical + d.buildings) / 5)
    }));
    
    areaDamage.sort((a, b) => b.score - a.score);
    
    // Get top 5 most affected areas
    const topAreas = areaDamage.slice(0, 5);
    
    let html = '<div class="stat-list">';
    topAreas.forEach((area, index) => {
      html += `
        <div class="stat-item" ${index === 0 ? 'style="border-bottom: 2px solid ' + dashboardColors.secondary + ';"' : ''}>
          <div class="stat-rank">${index + 1}</div>
          <div class="stat-name">${area.location}</div>
          <div class="stat-value" style="color: ${getDamageColor(area.score)}">
            ${area.score.toFixed(1)}
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    mostAffectedContainer.innerHTML = html;
  }
  
  // ---- Damage Trends ----
  const trendsContainer = document.getElementById('damage-trends');
  if (trendsContainer) {
    // Calculate average damage by type across all filtered data
    const metrics = [
      { key: 'sewer_and_water', displayName: 'Sewer & Water' },
      { key: 'power', displayName: 'Power' },
      { key: 'roads_and_bridges', displayName: 'Roads & Bridges' },
      { key: 'medical', displayName: 'Medical' },
      { key: 'buildings', displayName: 'Buildings' }
    ];
    
    const avgDamage = {};
    metrics.forEach(metric => {
      avgDamage[metric.key] = d3.mean(filteredRadarData, d => d[metric.key]);
    });
    
    // Sort by damage score
    const sortedMetrics = [...metrics].sort((a, b) => 
      avgDamage[b.key] - avgDamage[a.key]
    );
    
    let html = '<div class="stat-list">';
    sortedMetrics.forEach((metric, index) => {
      const score = avgDamage[metric.key];
      html += `
        <div class="stat-item">
          <div class="stat-name">${metric.displayName}</div>
          <div class="stat-bar-container">
            <div class="stat-bar" style="width: ${score * 10}%; background-color: ${getDamageColor(score)}">
              ${score.toFixed(1)}
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    trendsContainer.innerHTML = html;
  }
  
  // ---- Critical Services ----
  const servicesContainer = document.getElementById('critical-services');
  if (servicesContainer) {
    // Focus on medical and infrastructure services
    const criticalMetrics = [
      { key: 'medical', displayName: 'Medical Facilities' },
      { key: 'power', displayName: 'Power Systems' },
      { key: 'sewer_and_water', displayName: 'Water Systems' }
    ];
    
    // Calculate percentage of areas with critical damage for each service
    const criticalThreshold = 7; // Score of 7+ is critical
    
    const criticalStats = criticalMetrics.map(metric => {
      const criticalCount = filteredRadarData.filter(d => d[metric.key] >= criticalThreshold).length;
      const totalCount = filteredRadarData.length;
      const percentage = (criticalCount / totalCount) * 100;
      
      return {
        ...metric,
        criticalCount,
        totalCount,
        percentage
      };
    });
    
    let html = '<div class="stat-list">';
    criticalStats.forEach(stat => {
      html += `
        <div class="critical-service">
          <div class="service-header">
            <div class="service-name">${stat.displayName}</div>
            <div class="service-percentage">${stat.percentage.toFixed(0)}% Critical</div>
          </div>
          <div class="service-bar-container">
            <div class="service-bar" style="width: ${stat.percentage}%; background-color: ${
              stat.percentage > 50 ? dashboardColors.secondary : dashboardColors.primary
            }"></div>
          </div>
          <div class="service-detail">
            ${stat.criticalCount} of ${stat.totalCount} areas with damage score > ${criticalThreshold}
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    servicesContainer.innerHTML = html;
  }
}

// Helper function to load a script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Helper function to load a stylesheet
function loadStylesheet(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

// Helper function to get display label for a metric
function getMetricLabel(metric) {
  const labels = {
    "combined_damage": "Combined Damage Score",
    "sewer_and_water": "Sewer & Water Damage",
    "power": "Power System Damage",
    "roads_and_bridges": "Roads & Bridges Damage",
    "medical": "Medical Facility Damage",
    "buildings": "Building Damage",
    "shake_intensity": "Earthquake Intensity"
  };
  
  return labels[metric] || metric;
}
```

<style>
/* Global dashboard layout */
.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.dashboard-card {
  background: var(--bg-card);
  border: 1px solid var(--bg-card-border);
  border-radius: 8px;
  padding: 1.5rem;
  flex: 1;
  min-width: 300px;
}

.dashboard-card.full-width {
  flex-basis: 100%;
  width: 100%;
}

.dashboard-card.stat-card {
  flex: 1;
  min-width: 250px;
}

/* Mini visualizations */
.mini-visualization {
  height: 300px;
  position: relative;
}

.view-full-link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 15px;
  z-index: 1000;
}

.view-full-link a {
  color: white;
  text-decoration: none;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.view-full-link a:hover {
  text-decoration: underline;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.mini-btn {
  padding: 0.3rem 0.6rem !important;
  font-size: 0.8rem;
}

.mini-timeline {
  flex: 1;
  margin: 0 0.5rem;
}

.mini-time-display {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.mini-chart-container {
  height: 220px;
}

.no-data-message {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: var(--text-muted);
  font-style: italic;
}

/* Global filters */
.global-filter-panel {
  background: var(--bg-card);
  border: 1px solid var(--bg-card-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-status {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* Dashboard highlights box */
.dashboard-highlights-box {
  background: var(--bg-card);
  border: 1px solid var(--bg-card-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.highlights-header {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.highlights-content {
  color: var(--text-light);
  font-size: 0.95rem;
}

.highlight-item {
  margin-bottom: 0.5rem;
}

.highlight-item strong {
  color: var(--secondary-color);
}

/* Statistics styling */
.stat-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-rank {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.stat-name {
  flex: 1;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.stat-bar-container {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 10px;
}

.critical-service {
  margin-bottom: 1rem;
}

.service-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.service-name {
  font-size: 0.9rem;
}

.service-percentage {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.service-bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.service-bar {
  height: 100%;
  border-radius: 4px;
}

.service-detail {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Recommendations */
.recommendations-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recommendation-section h3 {
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.recommendation-section ul,
.recommendation-section ol {
  margin-top: 0;
  padding-left: 1.5rem;
}

.recommendation-section li {
  margin-bottom: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-row {
    flex-direction: column;
  }
  
  .dashboard-card {
    min-width: 100%;
  }
  
  .global-filter-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-section {
    flex-wrap: wrap;
  }
  
  .recommendations-content {
    grid-template-columns: 1fr;
  }
}
</style>