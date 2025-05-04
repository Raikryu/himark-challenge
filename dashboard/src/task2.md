---
theme: dashboard
title: Neighborhood Report Uncertainty
toc: false
---

# Neighborhood Report Uncertainty

This dashboard visualizes the uncertainty in neighborhood reports based on preprocessed metrics. Higher reliability scores indicate more consistent and complete reports, while missing data rates and damage variability help assess uncertainty.

```js
import * as Plot from "npm:@observablehq/plot"
import * as d3 from "npm:d3"
import Inputs from "npm:@observablehq/inputs"
```

```js
const colors = {
  primary: "#2a9d8f",
  secondary: "#e76f51",
  tertiary: "#e9c46a",
  highlight: "rgba(42, 157, 143, 0.1)",
  reliability: {
    high: "#2a9d8f",
    medium: "#e9c46a",
    low: "#e76f51"
  },
  background: {
    dark: "#264653",
    card: "rgba(42, 157, 143, 0.1)",
    cardBorder: "rgba(42, 157, 143, 0.2)"
  }
};
```

```js
const metrics = ["missing_data_rate", "report_frequency", "damage_variability", "reliability_score"];
```

```js
const metricLabels = {
  missing_data_rate: "Missing Data Rate (%)",
  report_frequency: "Report Frequency (min)",
  damage_variability: "Damage Variability",
  reliability_score: "Reliability Score"
};
```

```js
function formatMetric(metric, value) {
  switch(metric) {
    case "missing_data_rate":
      return `${value.toFixed(1)}%`;
    case "report_frequency":
      return `${value.toFixed(1)} min`;
    case "damage_variability":
      return value.toFixed(2);
    case "reliability_score":
      return value.toFixed(2);
    default:
      return value.toFixed(2);
  }
}
```

```js
function createFallbackData() {
  return Array.from({ length: 19 }, (_, i) => ({
    neighborhood: String(i + 1),
    missing_data_rate: Math.random() * 30,
    report_frequency: 5 + Math.random() * 25,
    damage_variability: 0.1 + Math.random() * 1.9,
    reliability_score: 2 + Math.random() * 8
  }));
}
```

```js
const data = await FileAttachment("data/processed_neighborhood_reliability.json").json().catch(() => {
  console.warn("Error loading data, using fallback placeholder data");
  return createFallbackData();
});

console.log("Loaded neighborhood data:", data);
```

```js
const stats = {};
for (const metric of metrics) {
  const values = data.map(d => d[metric]).sort(d3.ascending);
  stats[metric] = {
    min: d3.min(values),
    max: d3.max(values),
    mean: d3.mean(values),
    median: d3.median(values),
    q1: d3.quantile(values, 0.25),
    q3: d3.quantile(values, 0.75)
  };
}

console.log("Calculated statistics:", stats);
```

```js
const dashboardStyle = html`<style>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-card {
  background: ${colors.background.card};
  border-radius: 8px;
  border: 1px solid ${colors.background.cardBorder};
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.dashboard-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${colors.background.card};
  border-radius: 8px;
  border: 1px solid ${colors.background.cardBorder};
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 180px;
}

.control-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${colors.primary};
  display: block;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 992px) {
  .metric-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .metric-cards {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background: ${colors.background.card};
  border-radius: 8px;
  border: 1px solid ${colors.background.cardBorder};
  padding: 1rem;
  text-align: center;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.metric-label {
  font-size: 0.9rem;
  color: #aaa;
}

.bar-chart-container {
  margin-bottom: 2rem;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.selected-item {
  background: ${colors.primary};
  color: white;
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-item button {
  background: none;
  border: none;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.selected-item button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.scatter-container {
  min-height: 400px;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 0.5rem;
}

.category-badge.high {
  background: ${colors.reliability.high};
  color: white;
}

.category-badge.medium {
  background: ${colors.reliability.medium};
  color: #333;
}

.category-badge.low {
  background: ${colors.reliability.low};
  color: white;
}

.header-with-legend {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.legend {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.85rem;
  pointer-events: none;
  z-index: 100;
  max-width: 250px;
}

.comparison-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin-top: 1rem;
}

.comparison-table th:first-child,
.comparison-table td:first-child {
  width: 20%;
}

.comparison-table th,
.comparison-table td {
  width: 16%;
}

.comparison-table th {
  padding: 0.7rem;
  border-bottom: 1px solid ${colors.background.cardBorder};
  font-weight: 600;
  text-align: center;
}

.comparison-table td {
  padding: 0.7rem;
  border-bottom: 1px solid ${colors.background.cardBorder};
  text-align: center;
}

.score-bar {
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  position: relative;
  overflow: hidden;
}

.score-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
}

.radar-chart {
  height: 500px;
  width: 100%;
}

.no-selection {
  text-align: center;
  padding: 2rem;
  color: #aaa;
  font-style: italic;
}

.checkbox-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

input[type="range"] {
  width: 100%;
  margin: 0.5rem 0;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: rgba(42, 157, 143, 0.2);
  border-radius: 4px;
  border: 1px solid ${colors.background.cardBorder};
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${colors.primary};
  cursor: pointer;
  border: 2px solid white;
  margin-top: -6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-thumb {
  background: ${colors.secondary};
}

#threshold-value {
  display: inline-block;
  padding: 4px 20px;
  background-color: ${colors.secondary};
  color: white;
  font-weight: bold;
  border-radius: 6px;
  font-size: 0.95rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  min-width: 60px;
  text-align: center;
}

select {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${colors.background.cardBorder};
  background-color: rgba(42, 157, 143, 0.1);
  color: white;
  font-size: 1rem;
  width: 100%;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' viewBox='0 0 12 6'%3E%3Cpath fill='%23ffffff' d='M0 0h12L6 6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  transition: background-color 0.2s, border-color 0.2s;
}

select:hover, select:focus {
  background-color: rgba(42, 157, 143, 0.2);
  border-color: ${colors.primary};
  outline: none;
}

select option {
  background-color: ${colors.background.dark};
  color: white;
}

.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  border: none;
  background: ${colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  height: 38px;
}

.btn:hover {
  background: ${colors.secondary};
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(0,0,0,0.2);
  background: ${colors.reliability.high};
}

.heatmap {
  height: 350px;
}
</style>`;

// Apply styles
display(dashboardStyle);
```

```js
// Create HTML containers for the dashboard
html`
<div class="dashboard-controls">
  <div class="control-group">
    <label for="reliability-filter">Reliability Category</label>
    <select id="reliability-filter">
      <option value="All Categories">All Categories</option>
      <option value="High">High Reliability</option>
      <option value="Medium">Medium Reliability</option>
      <option value="Low">Low Reliability</option>
    </select>
  </div>

  <div class="control-group">
    <label for="missing-data-threshold">Missing Data Threshold</label>
    <div style="text-align: center; margin-bottom: 5px;">
      <span id="threshold-value">20%</span>
    </div>
    <input type="range" id="missing-data-threshold" min="0" max="50" step="1" value="20">
  </div>

  <div class="control-group">
    <label for="neighborhood-select">Compare Neighborhood</label>
    <select id="neighborhood-select">
      <option value="">Select to add...</option>
    </select>
  </div>

  <div class="control-group">
    <label>Actions</label>
    <div style="display: flex; align-items: center; height: 42px;">
      <button id="reset-button" class="btn" style="margin-top: 0;">Reset All Filters</button>
    </div>
  </div>
</div>

<div id="summary-stats-container"></div>

<div id="selected-neighborhoods-container" class="dashboard-card full-width">
  <div class="dashboard-title">
    <span>Selected Neighborhoods for Comparison</span>
  </div>
  <div id="selected-neighborhoods-list" class="selected-list"></div>
  <div id="no-selection-message" class="no-selection">Click on neighborhoods in the charts below to select them for comparison</div>
</div>

<div class="dashboard-grid">
  <div class="dashboard-card">
    <div class="dashboard-title">Scatter Plot: Reliability vs. Missing Data</div>
    <div id="scatter-plot-container" class="scatter-container"></div>
  </div>

  <div class="dashboard-card">
    <div class="dashboard-title">Metrics Correlation Heatmap</div>
    <div id="heatmap-container" class="heatmap"></div>
  </div>
</div>

<div id="metric-analysis-container" class="dashboard-card full-width">
  <div class="header-with-legend">
    <div class="dashboard-title">Neighborhood Metrics Analysis</div>
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background: ${colors.reliability.low}"></div>
        <span>Low Reliability</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: ${colors.reliability.medium}"></div>
        <span>Medium Reliability</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: ${colors.reliability.high}"></div>
        <span>High Reliability</span>
      </div>
    </div>
  </div>

  <p style="margin-top: 0.5rem; font-style: italic; color: #aaa;">
    These visualizations show different metrics for each neighborhood. Click on bars to select neighborhoods for comparison.
  </p>

  <div id="missing-data-chart" class="bar-chart-container"></div>
  <div id="reliability-score-chart" class="bar-chart-container"></div>
  <div id="damage-variability-chart" class="bar-chart-container"></div>
</div>

<div class="dashboard-grid">
  <div class="dashboard-card full-width">
    <div class="dashboard-title">Comparison Radar Chart</div>
    <div id="radar-chart-container" class="radar-chart"></div>
  </div>
</div>

<div id="neighborhood-comparison-container" class="dashboard-card full-width">
  <div class="dashboard-title">Detailed Comparison</div>
  <div id="comparison-table"></div>
</div>
`
```

```js
// Main visualization code
// Assign reliability categories
const neighborhoods = data.map(n => ({
  ...n,
  reliability_category: n.reliability_score > stats.reliability_score.q3 ? "High" :
                         n.reliability_score < stats.reliability_score.q1 ? "Low" : "Medium",
  reliability_color: n.reliability_score > stats.reliability_score.q3 ? colors.reliability.high :
                      n.reliability_score < stats.reliability_score.q1 ? colors.reliability.low :
                      colors.reliability.medium
}));

// Track selected neighborhoods - initialize with a few example neighborhoods for demonstration
const selectedNeighborhoods = new Set(["Old Town", "Wilson Forest", "Palace Hills"]);

// Define width for charts
const width = 800;

// Set up filter elements
const filters = {
  reliability: "All Categories",
  missingData: 20
};

// Get DOM elements
const reliabilityFilter = document.getElementById("reliability-filter");
const missingDataThreshold = document.getElementById("missing-data-threshold");
const thresholdValue = document.getElementById("threshold-value");
const neighborhoodSelect = document.getElementById("neighborhood-select");
const resetButton = document.getElementById("reset-button");
const selectedNeighborhoodsList = document.getElementById("selected-neighborhoods-list");
const noSelectionMessage = document.getElementById("no-selection-message");

// Populate neighborhood dropdown
function populateNeighborhoodDropdown() {
  // Clear existing options except the first one
  while (neighborhoodSelect.options.length > 1) {
    neighborhoodSelect.remove(1);
  }

  // Add neighborhood options
  const filteredData = getFilteredData();
  filteredData.forEach(n => {
    // Skip already selected neighborhoods
    if (selectedNeighborhoods.has(n.neighborhood)) return;

    const option = document.createElement("option");
    option.value = n.neighborhood;
    option.textContent = n.neighborhood;
    neighborhoodSelect.appendChild(option);
  });
}

// Initialize event listeners
reliabilityFilter.addEventListener("change", () => {
  filters.reliability = reliabilityFilter.value;
  renderDashboard();
});

missingDataThreshold.addEventListener("input", () => {
  filters.missingData = parseInt(missingDataThreshold.value);
  thresholdValue.textContent = `${filters.missingData}%`;
  renderDashboard();
});

neighborhoodSelect.addEventListener("change", () => {
  const selected = neighborhoodSelect.value;
  if (selected) {
    selectedNeighborhoods.add(selected);
    renderDashboard();
    // Reset select to placeholder
    neighborhoodSelect.value = "";
  }
});

resetButton.addEventListener("click", () => {
  // Reset filters to default
  filters.reliability = "All Categories";
  filters.missingData = 20;

  // Reset DOM elements
  reliabilityFilter.value = filters.reliability;
  missingDataThreshold.value = filters.missingData;
  thresholdValue.textContent = `${filters.missingData}%`;

  // Clear selections
  selectedNeighborhoods.clear();

  // Re-render dashboard
  renderDashboard();
});

// Filter updates
function updateFilters(type, value) {
  filters[type] = value;
  renderDashboard();
  return filters;
}

// Apply filters and handle reset
function getFilteredData(resetFlag = false) {
  // Reset selections if reset is true
  if (resetFlag) selectedNeighborhoods.clear();

  // Filter data
  const reliabilitySetting = filters.reliability === "All Categories" ? "all" :
    filters.reliability;

  return neighborhoods.filter(n =>
    (reliabilitySetting === "all" || n.reliability_category === reliabilitySetting) &&
    n.missing_data_rate <= filters.missingData
  );
}

// Event handler function for clicking on neighborhoods
function handleClick(neighborhood) {
  if (selectedNeighborhoods.has(neighborhood)) {
    selectedNeighborhoods.delete(neighborhood);
  } else {
    selectedNeighborhoods.add(neighborhood);
  }
  renderDashboard();
}

// Function to render all visualizations
function renderDashboard() {
  // Recalculate filtered data based on current filters
  const filteredData = getFilteredData();

  // Update dropdown with filtered neighborhoods
  populateNeighborhoodDropdown();

  // Render all visualizations
  renderSummaryStats();
  renderSelectedNeighborhoods();
  renderScatterPlot(filteredData);
  renderHeatmap();
  renderMetricCharts(filteredData);
  renderRadarChart();
  renderComparisonTable();
}

// Render summary statistics
function renderSummaryStats() {
  const container = document.getElementById("summary-stats-container");

  // Calculate the count of each reliability category
  const categoryCounts = {
    High: neighborhoods.filter(n => n.reliability_category === "High").length,
    Medium: neighborhoods.filter(n => n.reliability_category === "Medium").length,
    Low: neighborhoods.filter(n => n.reliability_category === "Low").length
  };

  // Create HTML for summary stats
  container.innerHTML = `
    <div class="metric-cards">
      <div class="metric-card">
        <div class="metric-label">Average Missing Data Rate</div>
        <div class="metric-value" style="color: ${colors.secondary}">${stats.missing_data_rate.mean.toFixed(1)}%</div>
        <div class="metric-label">Range: ${stats.missing_data_rate.min.toFixed(1)}% - ${stats.missing_data_rate.max.toFixed(1)}%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Average Report Frequency</div>
        <div class="metric-value" style="color: ${colors.primary}">${stats.report_frequency.mean.toFixed(1)} min</div>
        <div class="metric-label">Range: ${stats.report_frequency.min.toFixed(1)} - ${stats.report_frequency.max.toFixed(1)} min</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Average Damage Variability</div>
        <div class="metric-value" style="color: ${colors.tertiary}">${stats.damage_variability.mean.toFixed(2)}</div>
        <div class="metric-label">Range: ${stats.damage_variability.min.toFixed(2)} - ${stats.damage_variability.max.toFixed(2)}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Reliability Distribution</div>
        <div class="metric-value">
          <span class="category-badge high">${categoryCounts.High}</span>
          <span class="category-badge medium">${categoryCounts.Medium}</span>
          <span class="category-badge low">${categoryCounts.Low}</span>
        </div>
        <div class="metric-label">High / Medium / Low</div>
      </div>
    </div>
  `;
}

// Render selected neighborhoods list
function renderSelectedNeighborhoods() {
  const container = selectedNeighborhoodsList;

  if (selectedNeighborhoods.size === 0) {
    container.innerHTML = '';
    noSelectionMessage.style.display = 'block';
    return;
  }

  noSelectionMessage.style.display = 'none';

  // Create HTML for selected neighborhoods
  container.innerHTML = '';

  selectedNeighborhoods.forEach(neighborhood => {
    const n = neighborhoods.find(d => d.neighborhood === neighborhood);
    const item = document.createElement('div');
    item.className = 'selected-item';
    item.style.backgroundColor = n.reliability_color;

    item.innerHTML = `
      <span>${neighborhood}</span>
      <button class="remove-btn" data-neighborhood="${neighborhood}">×</button>
    `;

    container.appendChild(item);
  });

  // Add event listeners to remove buttons
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const neighborhood = btn.getAttribute('data-neighborhood');
      selectedNeighborhoods.delete(neighborhood);
      renderDashboard();
    });
  });
}

// Render scatter plot
function renderScatterPlot(filteredData) {
  const container = document.getElementById("scatter-plot-container");
  container.innerHTML = "";

  // Set up dimensions
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const chartWidth = 500 - margin.left - margin.right;
  const chartHeight = 350 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select(container)
    .append("svg")
      .attr("width", "100%")
      .attr("height", chartHeight + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.missing_data_rate) * 1.1])
    .range([0, chartWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.reliability_score) * 1.1])
    .range([chartHeight, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}%`))
    .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "white");

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "white");

  // X axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom - 10)
    .style("fill", "white")
    .text("Missing Data Rate (%)");

  // Y axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-margin.left + 15},${chartHeight / 2}) rotate(-90)`)
    .style("fill", "white")
    .text("Reliability Score");

  // Add grid lines
  svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
      .tickSize(-chartWidth)
      .tickFormat("")
    )
    .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.1)");

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x)
      .tickSize(-chartHeight)
      .tickFormat("")
    )
    .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.1)");

  // Add dots
  svg.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
      .attr("cx", d => x(d.missing_data_rate))
      .attr("cy", d => y(d.reliability_score))
      .attr("r", d => selectedNeighborhoods.has(d.neighborhood) ? 8 : 6)
      .attr("fill", d => d.reliability_color)
      .attr("stroke", d => selectedNeighborhoods.has(d.neighborhood) ? "white" : "none")
      .attr("stroke-width", 2)
      .attr("opacity", d => selectedNeighborhoods.has(d.neighborhood) ? 1 : 0.7)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", selectedNeighborhoods.has(d.neighborhood) ? 10 : 8);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");

        tooltip.html(`
          <strong>${d.neighborhood}</strong><br>
          Reliability: ${d.reliability_score.toFixed(2)}<br>
          Missing Data: ${d.missing_data_rate.toFixed(1)}%<br>
          Category: ${d.reliability_category}
        `);
      })
      .on("mousemove", function(event) {
        d3.select(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("r", selectedNeighborhoods.has(d.neighborhood) ? 8 : 6);
        d3.select(".tooltip").remove();
      })
      .on("click", (event, d) => {
        handleClick(d.neighborhood);
      });

  // Add neighborhood labels for selected neighborhoods
  svg.selectAll(".neighborhood-label")
    .data(filteredData.filter(d => selectedNeighborhoods.has(d.neighborhood)))
    .enter()
    .append("text")
      .attr("class", "neighborhood-label")
      .attr("x", d => x(d.missing_data_rate) + 10)
      .attr("y", d => y(d.reliability_score) - 10)
      .text(d => d.neighborhood)
      .style("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", "bold");
}

// Render correlation heatmap
function renderHeatmap() {
  const container = document.getElementById("heatmap-container");
  container.innerHTML = "";

  // Calculate correlation matrix
  const correlationMatrix = [];
  const metricNames = ["Missing Data", "Report Freq.", "Damage Var.", "Reliability"];

  // Calculate correlations between each pair of metrics
  for (let i = 0; i < metrics.length; i++) {
    correlationMatrix[i] = [];
    for (let j = 0; j < metrics.length; j++) {
      if (i === j) {
        correlationMatrix[i][j] = 1; // Diagonal is always 1 (perfect correlation with self)
      } else {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        const values1 = neighborhoods.map(d => d[metric1]);
        const values2 = neighborhoods.map(d => d[metric2]);

        // Calculate Pearson correlation
        const correlation = calculateCorrelation(values1, values2);
        correlationMatrix[i][j] = correlation;
      }
    }
  }

  // Set up dimensions
  const margin = {top: 30, right: 50, bottom: 50, left: 70};
  const size = 240;
  const cellSize = size / metrics.length;

  // Create SVG
  const svg = d3.select(container)
    .append("svg")
      .attr("width", "100%")
      .attr("height", size + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${size + margin.left + margin.right} ${size + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create color scale
  const colorScale = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range([colors.secondary, "#FFFFFF", colors.primary]);

  // Create cells
  svg.selectAll()
    .data(correlationMatrix.flatMap((row, i) => row.map((value, j) => ({i, j, value}))))
    .enter()
    .append("rect")
      .attr("x", d => d.j * cellSize)
      .attr("y", d => d.i * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => colorScale(d.value))
      .attr("stroke", "white")
      .attr("stroke-width", 1);

  // Add text to cells
  svg.selectAll()
    .data(correlationMatrix.flatMap((row, i) => row.map((value, j) => ({i, j, value}))))
    .enter()
    .append("text")
      .attr("x", d => d.j * cellSize + cellSize/2)
      .attr("y", d => d.i * cellSize + cellSize/2 + 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", d => Math.abs(d.value) > 0.6 ? "white" : "black")
      .text(d => d.value.toFixed(2));

  // Add row labels
  svg.selectAll(".row-label")
    .data(metricNames)
    .enter()
    .append("text")
      .attr("class", "row-label")
      .attr("x", -5)
      .attr("y", (d, i) => i * cellSize + cellSize/2 + 5)
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "white")
      .text(d => d);

  // Add column labels
  svg.selectAll(".col-label")
    .data(metricNames)
    .enter()
    .append("text")
      .attr("class", "col-label")
      .attr("x", (d, i) => i * cellSize + cellSize/2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "white")
      .style("transform", "rotate(-45deg)")
      .text(d => d);

  // Add title
  svg.append("text")
    .attr("x", size / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "white")
    .text("Correlation between Metrics");

  // Add color scale legend
  const legendWidth = 200;
  const legendHeight = 10;

  const legendX = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, legendWidth]);

  const legend = svg.append("g")
    .attr("transform", `translate(${(size - legendWidth) / 2}, ${size + 20})`);

  // Create gradient
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "correlation-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colors.secondary);

  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "#FFFFFF");

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colors.primary);

  // Add gradient rectangle
  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#correlation-gradient)");

  // Add legend axis
  const legendAxis = d3.axisBottom(legendX)
    .tickValues([-1, -0.5, 0, 0.5, 1])
    .tickFormat(d3.format(".1f"));

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis)
    .selectAll("text")
      .style("font-size", "8px")
      .style("fill", "white");
}

// Function to calculate Pearson correlation
function calculateCorrelation(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Render the metric analysis charts (bar charts)
function renderMetricCharts(filteredData) {
  console.log("Rendering metric charts with filtered data:", filteredData);

  // Missing Data Rate Chart
  const missingDataContainer = document.getElementById("missing-data-chart");
  missingDataContainer.innerHTML = ""; // Clear previous content

  const sortedMissingData = [...filteredData].sort((a, b) => b.missing_data_rate - a.missing_data_rate);

  // Set up dimensions
  const margin = {top: 40, right: 30, bottom: 90, left: 60};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = 300 - margin.top - margin.bottom;

  // Create SVG for missing data chart
  const missingDataSvg = d3.select(missingDataContainer)
    .append("svg")
      .attr("width", "100%")
      .attr("height", 300)
      .attr("viewBox", `0 0 ${width} 300`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const x = d3.scaleBand()
    .domain(sortedMissingData.map(d => d.neighborhood))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(sortedMissingData, d => d.missing_data_rate) * 1.1])
    .range([chartHeight, 0]);

  // Add title
  missingDataSvg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Missing Data Rate by Neighborhood");

  // Add X axis
  missingDataSvg.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "white");

  // Add Y axis
  missingDataSvg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => `${d}%`))
    .selectAll("text")
      .style("fill", "white");

  // Add horizontal grid lines
  missingDataSvg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
      .tickSize(-chartWidth)
      .tickFormat("")
    )
    .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.1)");

  // Add bars
  missingDataSvg.selectAll("rect")
    .data(sortedMissingData)
    .enter()
    .append("rect")
      .attr("x", d => x(d.neighborhood))
      .attr("y", d => y(d.missing_data_rate))
      .attr("width", x.bandwidth())
      .attr("height", d => chartHeight - y(d.missing_data_rate))
      .attr("fill", d => selectedNeighborhoods.has(d.neighborhood) ? colors.secondary : d.reliability_color)
      .attr("stroke", d => selectedNeighborhoods.has(d.neighborhood) ? "white" : "none")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");

        tooltip.html(`
          <strong>${d.neighborhood}</strong><br>
          Missing Data: ${d.missing_data_rate.toFixed(1)}%<br>
          Reliability: ${d.reliability_score.toFixed(2)}<br>
          Category: ${d.reliability_category}
        `);
      })
      .on("mousemove", function(event) {
        d3.select(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        d3.select(".tooltip").remove();
      })
      .on("click", (event, d) => {
        handleClick(d.neighborhood);
      });

  // Add threshold line
  missingDataSvg.append("line")
    .attr("x1", 0)
    .attr("y1", y(filters.missingData))
    .attr("x2", chartWidth)
    .attr("y2", y(filters.missingData))
    .attr("stroke", colors.secondary)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4,4");

  // Add threshold label
  missingDataSvg.append("text")
    .attr("x", chartWidth - 10)
    .attr("y", y(filters.missingData) - 5)
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", colors.secondary)
    .text(`Threshold: ${filters.missingData}%`);

  // Reliability Score Chart
  const reliabilityContainer = document.getElementById("reliability-score-chart");
  reliabilityContainer.innerHTML = ""; // Clear previous content

  const sortedReliabilityData = [...filteredData].sort((a, b) => b.reliability_score - a.reliability_score);

  // Create SVG for reliability chart
  const reliabilitySvg = d3.select(reliabilityContainer)
    .append("svg")
      .attr("width", "100%")
      .attr("height", 300)
      .attr("viewBox", `0 0 ${width} 300`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const xR = d3.scaleBand()
    .domain(sortedReliabilityData.map(d => d.neighborhood))
    .range([0, chartWidth])
    .padding(0.2);

  const yR = d3.scaleLinear()
    .domain([0, d3.max(sortedReliabilityData, d => d.reliability_score) * 1.1])
    .range([chartHeight, 0]);

  // Add title
  reliabilitySvg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Reliability Score by Neighborhood");

  // Add X axis
  reliabilitySvg.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xR))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "white");

  // Add Y axis
  reliabilitySvg.append("g")
    .call(d3.axisLeft(yR))
    .selectAll("text")
      .style("fill", "white");

  // Add horizontal grid lines
  reliabilitySvg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yR)
      .tickSize(-chartWidth)
      .tickFormat("")
    )
    .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.1)");

  // Add bars
  reliabilitySvg.selectAll("rect")
    .data(sortedReliabilityData)
    .enter()
    .append("rect")
      .attr("x", d => xR(d.neighborhood))
      .attr("y", d => yR(d.reliability_score))
      .attr("width", xR.bandwidth())
      .attr("height", d => chartHeight - yR(d.reliability_score))
      .attr("fill", d => selectedNeighborhoods.has(d.neighborhood) ? colors.primary : d.reliability_color)
      .attr("stroke", d => selectedNeighborhoods.has(d.neighborhood) ? "white" : "none")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");

        tooltip.html(`
          <strong>${d.neighborhood}</strong><br>
          Reliability: ${d.reliability_score.toFixed(2)}<br>
          Missing Data: ${d.missing_data_rate.toFixed(1)}%<br>
          Category: ${d.reliability_category}
        `);
      })
      .on("mousemove", function(event) {
        d3.select(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        d3.select(".tooltip").remove();
      })
      .on("click", (event, d) => {
        handleClick(d.neighborhood);
      });

  // Add threshold lines for quartiles
  reliabilitySvg.append("line")
    .attr("x1", 0)
    .attr("y1", yR(stats.reliability_score.q1))
    .attr("x2", chartWidth)
    .attr("y2", yR(stats.reliability_score.q1))
    .attr("stroke", colors.reliability.low)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4,4");

  reliabilitySvg.append("line")
    .attr("x1", 0)
    .attr("y1", yR(stats.reliability_score.q3))
    .attr("x2", chartWidth)
    .attr("y2", yR(stats.reliability_score.q3))
    .attr("stroke", colors.reliability.high)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4,4");

  // Add quartile labels
  reliabilitySvg.append("text")
    .attr("x", chartWidth - 10)
    .attr("y", yR(stats.reliability_score.q3) - 5)
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", colors.reliability.high)
    .text(`Q3: ${stats.reliability_score.q3.toFixed(2)}`);

  reliabilitySvg.append("text")
    .attr("x", chartWidth - 10)
    .attr("y", yR(stats.reliability_score.q1) - 5)
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", colors.reliability.low)
    .text(`Q1: ${stats.reliability_score.q1.toFixed(2)}`);

  // Damage Variability Chart
  const damageContainer = document.getElementById("damage-variability-chart");
  damageContainer.innerHTML = ""; // Clear previous content

  const sortedDamageData = [...filteredData].sort((a, b) => b.damage_variability - a.damage_variability);

  // Create SVG for damage variability chart
  const damageSvg = d3.select(damageContainer)
    .append("svg")
      .attr("width", "100%")
      .attr("height", 300)
      .attr("viewBox", `0 0 ${width} 300`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const xD = d3.scaleBand()
    .domain(sortedDamageData.map(d => d.neighborhood))
    .range([0, chartWidth])
    .padding(0.2);

  const yD = d3.scaleLinear()
    .domain([0, d3.max(sortedDamageData, d => d.damage_variability) * 1.1])
    .range([chartHeight, 0]);

  // Add title
  damageSvg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Damage Variability by Neighborhood");

  // Add X axis
  damageSvg.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xD))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "white");

  // Add Y axis
  damageSvg.append("g")
    .call(d3.axisLeft(yD))
    .selectAll("text")
      .style("fill", "white");

  // Add horizontal grid lines
  damageSvg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yD)
      .tickSize(-chartWidth)
      .tickFormat("")
    )
    .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.1)");

  // Add bars
  damageSvg.selectAll("rect")
    .data(sortedDamageData)
    .enter()
    .append("rect")
      .attr("x", d => xD(d.neighborhood))
      .attr("y", d => yD(d.damage_variability))
      .attr("width", xD.bandwidth())
      .attr("height", d => chartHeight - yD(d.damage_variability))
      .attr("fill", d => selectedNeighborhoods.has(d.neighborhood) ? colors.tertiary : d.reliability_color)
      .attr("stroke", d => selectedNeighborhoods.has(d.neighborhood) ? "white" : "none")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");

        tooltip.html(`
          <strong>${d.neighborhood}</strong><br>
          Damage Variability: ${d.damage_variability.toFixed(2)}<br>
          Reliability: ${d.reliability_score.toFixed(2)}<br>
          Category: ${d.reliability_category}
        `);
      })
      .on("mousemove", function(event) {
        d3.select(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        d3.select(".tooltip").remove();
      })
      .on("click", (event, d) => {
        handleClick(d.neighborhood);
      });
}

// Render radar chart for comparing selected neighborhoods
function renderRadarChart() {
  const container = document.getElementById("radar-chart-container");
  container.innerHTML = "";

  if (selectedNeighborhoods.size === 0) {
    container.innerHTML = `
      <div class="no-selection">
        Select neighborhoods in the charts above to compare them in this radar chart
      </div>
    `;
    return;
  }

  // Get selected neighborhoods data
  const selectedData = neighborhoods.filter(n =>
    selectedNeighborhoods.has(n.neighborhood)
  );

  // Normalize data for radar chart
  const chartData = selectedData.map(n => ({
    neighborhood: n.neighborhood,
    color: n.reliability_color,
    metrics: [
      { key: "missing_data_rate", value: n.missing_data_rate_norm * 10, label: metricLabels.missing_data_rate },
      { key: "report_frequency", value: n.report_frequency_norm * 10, label: metricLabels.report_frequency },
      { key: "damage_variability", value: n.damage_variability_norm * 10, label: metricLabels.damage_variability },
      { key: "reliability_score", value: n.reliability_score_norm * 10, label: metricLabels.reliability_score }
    ]
  }));

  // Set up dimensions
  const size = 500;
  const margin = { top: 70, right: 50, bottom: 50, left: 50 }; // Increased top margin
  const chartSize = size - margin.top - margin.bottom;
  const center = { x: chartSize / 2 + margin.left, y: chartSize / 2 + margin.top + 10 }; // Shifted center down
  const radius = chartSize / 2;

  // Create SVG - make sure it fills the container
  container.style.width = "100%";

  const svg = d3.select(container)
    .append("svg")
      .attr("width", "100%")
      .attr("height", 500)
      .attr("viewBox", `0 0 ${size + 50} ${size + 50}`) // Added padding to viewBox
      .attr("preserveAspectRatio", "xMidYMid meet");

  // Scales
  const angleScale = d3.scaleLinear()
    .domain([0, 4])
    .range([0, 2 * Math.PI]);

  const radiusScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, radius]);

  // Draw radar grid
  const levels = 5; // 5 levels for the grid

  for (let level = 1; level <= levels; level++) {
    const r = radius * level / levels;

    // Draw level circles
    svg.append("circle")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.1)");

    // Add level labels (only for even levels)
    if (level % 2 === 0) {
      svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y - r - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "11px") // Increased font size
        .style("fill", "rgba(255,255,255,0.7)") // Slightly more visible
        .text((level * 2).toString());
    }
  }

  // Draw radar axes
  for (let i = 0; i < 4; i++) {
    const angle = angleScale(i) - Math.PI / 2;
    const lineX = center.x + radius * Math.cos(angle);
    const lineY = center.y + radius * Math.sin(angle);

    svg.append("line")
      .attr("x1", center.x)
      .attr("y1", center.y)
      .attr("x2", lineX)
      .attr("y2", lineY)
      .attr("stroke", "rgba(255,255,255,0.3)");

    // Add axis labels with better positioning
    const labelRadius = radius + 40; // Further increased label distance
    const metric = chartData[0].metrics[i];

    // Custom positioning based on angle
    let xOffset = 0;
    let yOffset = 0;
    let textAnchor = "middle";
    let dominantBaseline = "middle";

    // Adjust position based on quadrant to prevent overlap
    if (angle === -Math.PI/2) { // Top
      yOffset = -20; // More space at top
      dominantBaseline = "text-after-edge";
    } else if (angle === Math.PI/2) { // Bottom
      yOffset = 15;
      dominantBaseline = "hanging";
    } else if (angle === 0) { // Right
      xOffset = 15;
      textAnchor = "start";
    } else if (angle === Math.PI) { // Left
      xOffset = -15;
      textAnchor = "end";
    }

    svg.append("text")
      .attr("x", center.x + labelRadius * Math.cos(angle) + xOffset)
      .attr("y", center.y + labelRadius * Math.sin(angle) + yOffset)
      .attr("text-anchor", textAnchor)
      .attr("dominant-baseline", dominantBaseline)
      .style("font-size", "14px") // Increased font size
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(metric.label.replace(" (%)", "").replace(" (min)", ""));
  }

  // Draw radar paths
  const lineGenerator = d3.lineRadial()
    .radius(d => radiusScale(d.value))
    .angle((d, i) => angleScale(i) - Math.PI / 2)
    .curve(d3.curveCardinalClosed);

  const radarGroups = svg.selectAll(".radar-group")
    .data(chartData)
    .enter()
    .append("g")
      .attr("class", "radar-group")
      .attr("transform", `translate(${center.x}, ${center.y})`);

  // Draw filled areas
  radarGroups.append("path")
    .attr("d", d => lineGenerator(d.metrics))
    .attr("fill", d => d.color)
    .attr("fill-opacity", 0.3)
    .attr("stroke", d => d.color)
    .attr("stroke-width", 2);

  // Draw points
  chartData.forEach(item => {
    const pointGroup = svg.append("g")
      .attr("transform", `translate(${center.x}, ${center.y})`);

    item.metrics.forEach((metric, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(metric.value);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      pointGroup.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 6) // Larger data points
        .attr("fill", item.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
    });
  });

  // Add legend - moved lower
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${center.x}, ${size - 15})`);

  chartData.forEach((item, i) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(${(i - chartData.length / 2) * 120}, 0)`);

    legendItem.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 7) // Larger circles
      .attr("fill", item.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    legendItem.append("text")
      .attr("x", 10)
      .attr("y", 5)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(item.neighborhood);
  });

  // No title needed here as we already have a title in the container
}

// Render comparison table
function renderComparisonTable() {
  const container = document.getElementById("comparison-table");

  if (selectedNeighborhoods.size === 0) {
    container.innerHTML = `
      <div class="no-selection">
        Select neighborhoods in the charts above to compare them in detail
      </div>
    `;
    return;
  }

  // Get selected neighborhoods data
  const selectedData = neighborhoods.filter(n =>
    selectedNeighborhoods.has(n.neighborhood)
  );

  // Create HTML table - full width and centered
  let html = `
    <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center;">
      <table class="comparison-table" style="width: 100%; max-width: 100%;">
        <thead>
          <tr>
            <th style="text-align: center;">Neighborhood</th>
            <th style="text-align: center;">Missing Data</th>
            <th style="text-align: center;">Report Frequency</th>
            <th style="text-align: center;">Damage Variability</th>
            <th style="text-align: center;">Reliability Score</th>
            <th style="text-align: center;">Category</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Add rows for each neighborhood
  selectedData.forEach(n => {
    html += `
      <tr>
        <td style="text-align: center;">${n.neighborhood}</td>
        <td style="text-align: center;">
          ${n.missing_data_rate.toFixed(1)}%
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${n.missing_data_rate_norm * 100}%; background-color: ${colors.secondary}"></div>
          </div>
        </td>
        <td style="text-align: center;">
          ${n.report_frequency.toFixed(1)} min
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${n.report_frequency_norm * 100}%; background-color: ${colors.primary}"></div>
          </div>
        </td>
        <td style="text-align: center;">
          ${n.damage_variability.toFixed(2)}
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${n.damage_variability_norm * 100}%; background-color: ${colors.tertiary}"></div>
          </div>
        </td>
        <td style="text-align: center;">
          ${n.reliability_score.toFixed(3)}
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${n.reliability_score_norm * 100}%; background-color: ${n.reliability_color}"></div>
          </div>
        </td>
        <td style="text-align: center;">
          <span class="category-badge ${n.reliability_category.toLowerCase()}">${n.reliability_category}</span>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

// Initial render of the dashboard
renderDashboard();
```


```js
// All visualizations render automatically
```