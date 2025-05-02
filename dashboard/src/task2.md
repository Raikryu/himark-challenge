---
theme: dashboard
title: Neighborhood Report Uncertainty
toc: false
---

# Neighborhood Report Uncertainty

This dashboard visualizes the uncertainty in neighborhood reports based on preprocessed metrics. Higher reliability scores indicate more consistent and complete reports, while missing data rates and damage variability help assess uncertainty.

```js
// Import dashboard state for cross-component communication
import dashboardState from "./components/dashboard-state.js";

// Initialize integration with dashboard state
function initDashboardStateIntegration() {
  // Subscribe to filter changes from global dashboard
  dashboardState.subscribe('filters', (filters) => {
    console.log("Dashboard state filters updated:", filters);
    
    // Update reliability filter if location filter changes
    if (filters.location) {
      const reliabilityFilter = document.getElementById("reliability-filter");
      if (reliabilityFilter) {
        // Find the neighborhood in our data
        const neighborhood = neighborhoods.find(n => n.neighborhood === filters.location);
        if (neighborhood && neighborhood.reliability_category) {
          reliabilityFilter.value = neighborhood.reliability_category;
        }
      }
    }
    
    // Update threshold slider if threshold filter changes
    if (filters.threshold !== null) {
      const thresholdSlider = document.getElementById("missing-data-threshold");
      const thresholdValue = document.getElementById("threshold-value");
      if (thresholdSlider && thresholdValue) {
        thresholdSlider.value = filters.threshold;
        thresholdValue.textContent = `${filters.threshold}%`;
      }
    }
    
    // Apply filters to update visualizations
    applyFilters();
  });
  
  // Subscribe to cross-visualization highlight events
  dashboardState.subscribe('visualizationStates', (states) => {
    console.log("Dashboard visualization states updated:", states);
    
    // Handle highlighted district from other visualizations
    if (states.heatmap.selectedDistrict) {
      // Find the neighborhood in our data that matches the district
      const districtNumber = states.heatmap.selectedDistrict;
      
      // Clear current selection if we're selecting something different
      if (!selectedNeighborhoods.has(districtNumber)) {
        selectedNeighborhoods.clear();
        selectedNeighborhoods.add(districtNumber);
        
        // Update all charts with the new selection
        chartUpdaters.updateAll();
      }
    }
  });
  
  // Notify dashboard state when selections change in this visualization
  function updateDashboardState() {
    // Only update if we have exactly one neighborhood selected
    if (selectedNeighborhoods.size === 1) {
      const selectedDistrict = Array.from(selectedNeighborhoods)[0];
      
      // Update the visualization state
      dashboardState.setState('visualizationStates.uncertainty.selectedDistrict', selectedDistrict);
      
      // Also update heatmap district for cross-visualization coordination
      dashboardState.setState('visualizationStates.heatmap.selectedDistrict', selectedDistrict);
    } else if (selectedNeighborhoods.size === 0) {
      // Clear selections in state
      dashboardState.setState('visualizationStates.uncertainty.selectedDistrict', null);
      dashboardState.setState('visualizationStates.heatmap.selectedDistrict', null);
    }
  }
  
  // Register the update function with our updaters
  chartUpdaters.register(updateDashboardState);
}

// Call this function when the visualization is ready
// In Observable, we need a longer timeout
setTimeout(initDashboardStateIntegration, 2000);

// Apply dashboard styles
html`<style>
:root {
  --primary-color: #2a9d8f;
  --secondary-color: #e76f51;
  --tertiary-color: #e9c46a;
  --bg-dark: #264653;
  --text-light: #e9e9e9;
  --text-muted: #a8a8a8;
  --bg-card: rgba(42, 157, 143, 0.1);
  --bg-card-border: rgba(42, 157, 143, 0.2);
  --bg-highlight: rgba(231, 111, 81, 0.1);
}
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-light);
  line-height: 1.6;
}
h1, h2, h3, h4, h5, h6 {
  color: var(--text-light);
  margin-bottom: 1rem;
}
h1 {
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
h3 {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-light);
}
.card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--bg-card-border);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.15);
}
.dashboard-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.grid-cols-2 {
  grid-template-columns: 1fr 1fr;
}
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: var(--bg-highlight);
  padding: 1rem;
  border-radius: 8px;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.filter-label {
  font-weight: 500;
  color: var(--text-light);
}
.filter-select, .filter-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--text-light);
}
.threshold-slider {
  width: 150px;
  accent-color: var(--primary-color);
}
.metric-card {
  background: linear-gradient(135deg, rgba(42, 157, 143, 0.15), rgba(42, 157, 143, 0.05));
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--bg-card-border);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}
.metric-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}
.highlight {
  background-color: var(--bg-highlight);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border-left: 3px solid var(--secondary-color);
  margin: 1rem 0;
}
.tooltip {
  position: absolute;
  padding: 0.5rem;
  background: rgba(38, 70, 83, 0.9);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  font-size: 0.8rem;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  max-width: 250px;
}
.tooltip h4 {
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 0.3rem;
}
.tooltip p {
  margin: 0.3rem 0;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0 0.25rem;
}
.badge-primary {
  background-color: var(--primary-color);
  color: white;
}
.badge-secondary {
  background-color: var(--secondary-color);
  color: white;
}
.badge-tertiary {
  background-color: var(--tertiary-color);
  color: black;
}
.tab-container {
  margin-bottom: 1rem;
}
.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.tab-button {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}
.tab-button.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  border-bottom: 3px solid white !important;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-3px);
}
.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  border-bottom: 3px solid var(--secondary-color) !important;
}
.tab-content {
  display: none;
}
.tab-content.active {
  display: block;
}
.insight-card {
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
@media (max-width: 1200px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>`;

// Load Font Awesome for icons
html`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">`;

// Load Inter font
html`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">`;

// Define dashboard colors for plots
const dashboardColors = {
  primary: '#2a9d8f',
  secondary: '#e76f51',
  tertiary: '#e9c46a',
  dark: '#264653',
  light: '#e9e9e9',
  muted: '#a8a8a8',
  background: {
    card: 'rgba(42, 157, 143, 0.1)',
    cardBorder: 'rgba(42, 157, 143, 0.2)',
    highlight: 'rgba(231, 111, 81, 0.1)'
  },
  text: {
    light: '#e9e9e9',
    muted: '#a8a8a8'
  },
  charts: {
    missingData: '#e76f51',     // Secondary color (orange)
    reportFrequency: '#2a9d8f', // Primary color (teal)
    damage: '#e9c46a',          // Yellow (tertiary)
    reliability: '#8ab17d',     // Green
    categories: [
      '#2a9d8f', '#e76f51', '#e9c46a', '#8ab17d',
      '#6c8ea0', '#ba5c32', '#d4ae2d', '#5d926f'
    ]
  },
  reliability: {
    high: '#2a9d8f',    // Primary (teal)
    medium: '#e9c46a',  // Tertiary (yellow)
    low: '#e76f51'      // Secondary (orange)
  }
};

// Load data asynchronously
const neighborhoodsData = FileAttachment("data/processed_neighborhood_reliability.json");
// We use a Promise to ensure data is loaded before we use it
const neighborhoods = await neighborhoodsData.json();

// Define metrics structure for visualization
const metrics = ["missing_data_rate", "report_frequency", "damage_variability", "reliability_score"];
const metricLabels = {
  missing_data_rate: "Missing Data Rate (%)",
  report_frequency: "Report Frequency (min)",
  damage_variability: "Damage Variability",
  reliability_score: "Reliability Score"
};

// Function to format metric values with appropriate units
function formatMetricValue(metric, value) {
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

// Calculate summary statistics for metrics
const summaryStats = {};
metrics.forEach(metric => {
  const values = neighborhoods.map(d => d[metric]);
  summaryStats[metric] = {
    min: d3.min(values),
    max: d3.max(values),
    mean: d3.mean(values),
    median: d3.median(values),
    q1: d3.quantile(values.sort(d3.ascending), 0.25),
    q3: d3.quantile(values.sort(d3.ascending), 0.75)
  };
});

// Classify neighborhoods based on reliability
neighborhoods.forEach(n => {
  // Calculate a reliability category based on multiple metrics
  if (n.reliability_score > summaryStats.reliability_score.q3) {
    n.reliability_category = "High";
    n.reliability_color = dashboardColors.reliability.high;
  } else if (n.reliability_score < summaryStats.reliability_score.q1) {
    n.reliability_category = "Low";
    n.reliability_color = dashboardColors.reliability.low;
  } else {
    n.reliability_category = "Medium";
    n.reliability_color = dashboardColors.reliability.medium;
  }
});

// Store selected neighborhoods for cross-filtering
const selectedNeighborhoods = new Set();
let filteredData = [...neighborhoods];

// This object will store all update functions
const chartUpdaters = {
  functions: [],

  // Register an update function
  register: function(fn) {
    this.functions.push(fn);
  },

  // Call all registered update functions
  updateAll: function() {
    this.functions.forEach(fn => fn(filteredData));
  }
};

// Create enhanced interactive filtering elements with inline event handlers
const filterContainer = html`
<div class="filter-container" style="background: rgba(231, 111, 81, 0.15); padding: 1.5rem; border-radius: 10px; border: 1px solid rgba(231, 111, 81, 0.3); display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; align-items: center;">
  <div class="filter-title" style="flex: 100%; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
    <i class="fas fa-filter" style="color: var(--secondary-color);"></i>
    <span style="font-weight: 600; font-size: 1.1rem;">Filter Dashboard Data</span>
  </div>
  
  <div class="filter-group" style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
    <label class="filter-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
      <i class="fas fa-certificate" style="margin-right: 0.5rem; color: var(--primary-color);"></i>
      Reliability Category:
    </label>
    <select onchange=${(event) => {
      console.log("Reliability filter changed:", event.target.value);
      
      // Get current values
      const threshold = parseFloat(document.getElementById("missing-data-threshold").value);
      const thresholdValue = document.getElementById("threshold-value");
      thresholdValue.textContent = `${threshold}%`;
      
      // Apply filters to data
      filteredData = neighborhoods.filter(n => {
        const passesReliability = event.target.value === "all" || n.reliability_category === event.target.value;
        const passesMissingData = n.missing_data_rate <= threshold;
        return passesReliability && passesMissingData;
      });
      
      // Update all charts
      chartUpdaters.updateAll();
    }} id="reliability-filter" class="filter-select" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: var(--text-light); font-family: 'Inter', sans-serif; cursor: pointer;">
      <option value="all">All Categories</option>
      <option value="High">High Reliability</option>
      <option value="Medium">Medium Reliability</option>
      <option value="Low">Low Reliability</option>
    </select>
  </div>
  
  <div class="filter-group" style="flex: 1.5; min-width: 300px; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
    <label class="filter-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
      <i class="fas fa-chart-bar" style="margin-right: 0.5rem; color: var(--secondary-color);"></i>
      Missing Data Threshold: <span id="threshold-value" style="font-weight: 600; color: var(--primary-color);">20%</span>
    </label>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <span style="font-size: 0.8rem; color: var(--text-muted);">0%</span>
      <input type="range" oninput=${(event) => {
        console.log("Threshold changed:", event.target.value);
        const threshold = parseFloat(event.target.value);
        const thresholdValue = document.getElementById("threshold-value");
        const reliabilityFilter = document.getElementById("reliability-filter");
        
        // Update threshold display
        thresholdValue.textContent = `${threshold}%`;
        
        // Apply filters to data
        filteredData = neighborhoods.filter(n => {
          const passesReliability = reliabilityFilter.value === "all" || n.reliability_category === reliabilityFilter.value;
          const passesMissingData = n.missing_data_rate <= threshold;
          return passesReliability && passesMissingData;
        });
        
        // Update all charts
        chartUpdaters.updateAll();
      }} id="missing-data-threshold" class="threshold-slider" min="0" max="50" value="20" step="5" 
        style="flex: 1; height: 10px; -webkit-appearance: none; background: linear-gradient(to right, var(--primary-color), var(--secondary-color)); border-radius: 5px; accent-color: var(--secondary-color);">
      <span style="font-size: 0.8rem; color: var(--text-muted);">50%</span>
    </div>
  </div>
  
  <div class="filter-group" style="min-width: 140px; display: flex; align-items: center; justify-content: center;">
    <button onclick=${() => {
      console.log("Reset filters clicked");
      const reliabilityFilter = document.getElementById("reliability-filter");
      const missingDataThreshold = document.getElementById("missing-data-threshold");
      const thresholdValue = document.getElementById("threshold-value");
      
      reliabilityFilter.value = "all";
      missingDataThreshold.value = 20;
      thresholdValue.textContent = "20%";
      selectedNeighborhoods.clear();
      filteredData = [...neighborhoods];
      
      // Update all charts
      chartUpdaters.updateAll();
    }} id="reset-filters" class="tab-button" style="padding: 0.75rem 1.25rem; background: var(--bg-dark); border: 1px solid var(--secondary-color); display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
      <i class="fas fa-sync-alt"></i> Reset Filters
    </button>
  </div>
</div>
`;

// Create summary metrics cards
const summaryCards = html`
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
  <div class="metric-card">
    <div>
      <div class="metric-label">Average Missing Data Rate</div>
      <div class="metric-value">${summaryStats.missing_data_rate.mean.toFixed(1)}%</div>
    </div>
    <i class="fas fa-database fa-2x" style="color: var(--secondary-color); opacity: 0.7;"></i>
  </div>
  <div class="metric-card">
    <div>
      <div class="metric-label">Average Report Frequency</div>
      <div class="metric-value">${summaryStats.report_frequency.mean.toFixed(1)} min</div>
    </div>
    <i class="fas fa-clock fa-2x" style="color: var(--primary-color); opacity: 0.7;"></i>
  </div>
  <div class="metric-card">
    <div>
      <div class="metric-label">High Reliability Neighborhoods</div>
      <div class="metric-value">${neighborhoods.filter(n => n.reliability_category === "High").length}</div>
    </div>
    <i class="fas fa-check-circle fa-2x" style="color: var(--primary-color); opacity: 0.7;"></i>
  </div>
  <div class="metric-card">
    <div>
      <div class="metric-label">Low Reliability Neighborhoods</div>
      <div class="metric-value">${neighborhoods.filter(n => n.reliability_category === "Low").length}</div>
    </div>
    <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--secondary-color); opacity: 0.7;"></i>
  </div>
</div>
`;

// Display dashboard info with interactive filters
display(html`
  <div class="dashboard-title">
    <i class="fas fa-info-circle"></i> Neighborhood Report Analysis Dashboard
  </div>

  <div class="highlight">
    <p><strong>Dashboard Instructions:</strong> Use the filters below to focus on specific reliability categories or set a threshold for missing data. Hover over chart elements for detailed information. Click on neighborhoods in one chart to highlight them across all visualizations.</p>
  </div>

  ${filterContainer}
  ${summaryCards}
`);

// Function to apply filters
function applyFilters() {
  const reliabilityFilter = document.getElementById("reliability-filter");
  const missingDataThreshold = document.getElementById("missing-data-threshold");
  const thresholdValue = document.getElementById("threshold-value");

  if (reliabilityFilter && missingDataThreshold && thresholdValue) {
    const reliabilitySetting = reliabilityFilter.value;
    const threshold = parseFloat(missingDataThreshold.value);

    // Update threshold display
    thresholdValue.textContent = `${threshold}%`;

    // Apply filters to data
    filteredData = neighborhoods.filter(n => {
      const passesReliability = reliabilitySetting === "all" || n.reliability_category === reliabilitySetting;
      const passesMissingData = n.missing_data_rate <= threshold;
      return passesReliability && passesMissingData;
    });

    // Update all charts
    chartUpdaters.updateAll();
    
    // Update dashboard state with these filters
    try {
      // Only update dashboard state if it's available (import succeeded)
      if (typeof dashboardState !== 'undefined') {
        // Update dashboard threshold filter
        dashboardState.setState('filters.threshold', threshold > 0 ? threshold : null, true);
        
        // Update dashboard reliability metadata
        if (reliabilitySetting !== "all") {
          dashboardState.setState('filters.metric', 'reliability', true);
          
          // If a specific reliability is selected, we might want to update the highlights box
          const highlightMessage = `Showing ${reliabilitySetting} reliability neighborhoods with missing data <= ${threshold}%`;
          dashboardState.setState('visualizationStates.uncertainty.highlightMessage', highlightMessage);
        } else {
          // Clear reliability filter if "all" is selected
          dashboardState.setState('visualizationStates.uncertainty.highlightMessage', null);
        }
      }
    } catch (error) {
      console.warn("Could not update dashboard state:", error);
    }
  }
}

// Function to reset filters
function resetFilters() {
  const reliabilityFilter = document.getElementById("reliability-filter");
  const missingDataThreshold = document.getElementById("missing-data-threshold");
  const thresholdValue = document.getElementById("threshold-value");

  if (reliabilityFilter && missingDataThreshold && thresholdValue) {
    reliabilityFilter.value = "all";
    missingDataThreshold.value = 20;
    thresholdValue.textContent = "20%";
    selectedNeighborhoods.clear();
    filteredData = [...neighborhoods];

    // Update all charts
    chartUpdaters.updateAll();
    
    // Reset dashboard state if available
    try {
      if (typeof dashboardState !== 'undefined') {
        // Reset local filters in dashboard state
        dashboardState.setState('filters.threshold', null, true);
        dashboardState.setState('filters.metric', null, true);
        dashboardState.setState('visualizationStates.uncertainty.highlightMessage', null);
        dashboardState.setState('visualizationStates.uncertainty.selectedDistrict', null);
        dashboardState.setState('visualizationStates.heatmap.selectedDistrict', null);
        
        // Optionally use the resetFilters method if you want to reset all filters
        // dashboardState.resetFilters();
      }
    } catch (error) {
      console.warn("Could not reset dashboard state:", error);
    }
  }
}

// In Observable Framework, we use inline handlers for all UI interactions
// We don't need to set up handlers with event listeners as they're already in the HTML
// This block is just kept for debugging but doesn't do any event attaching
setTimeout(() => {
  const reliabilityFilter = document.getElementById("reliability-filter");
  const missingDataThreshold = document.getElementById("missing-data-threshold");
  const resetButton = document.getElementById("reset-filters");

  if (reliabilityFilter && missingDataThreshold && resetButton) {
    console.log("Found filter elements - using inline handlers");
    console.log("Filter elements initialized successfully");
  } else {
    console.error("Failed to find filter elements:", { 
      reliabilityFilter: Boolean(reliabilityFilter),
      missingDataThreshold: Boolean(missingDataThreshold),
      resetButton: Boolean(resetButton)
    });
    
    // No need to try again with event listeners since we're using inline handlers
  }
}, 1000);
```

## Neighborhood Uncertainty Analysis

```js
// Create enhanced tab system for different visualization approaches
const tabContainer = html`
<div class="tab-container">
  <div class="tab-buttons" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
    <button onclick=${() => {
      // Create a direct event handler in the HTML
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-scatter').classList.add('active');
      document.getElementById('tab-content-scatter').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-scatter');
      if (contentElement && contentElement.children.length === 0) {
        createScatterPlot(contentElement, filteredData);
      }
    }} id="tab-scatter" class="tab-button active" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 150px; justify-content: center;">
      <i class="fas fa-chart-scatter"></i> Scatter Plot
    </button>
    <button onclick=${() => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-bubble').classList.add('active');
      document.getElementById('tab-content-bubble').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-bubble');
      if (contentElement && contentElement.children.length === 0) {
        createBubbleChart(contentElement, filteredData);
      }
    }} id="tab-bubble" class="tab-button" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 150px; justify-content: center;">
      <i class="fas fa-circle"></i> Bubble Chart
    </button>
    <button onclick=${() => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-quadrant').classList.add('active');
      document.getElementById('tab-content-quadrant').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-quadrant');
      if (contentElement && contentElement.children.length === 0) {
        createQuadrantAnalysis(contentElement, filteredData);
      }
    }} id="tab-quadrant" class="tab-button" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 150px; justify-content: center;">
      <i class="fas fa-th-large"></i> Quadrant Analysis
    </button>
  </div>
  <div id="tab-content-scatter" class="tab-content active"></div>
  <div id="tab-content-bubble" class="tab-content"></div>
  <div id="tab-content-quadrant" class="tab-content"></div>
</div>
`;

// Function to create enhanced scatter plot
function createScatterPlot(container, data) {
  // Create scatter plot with improved readability
  const scatterPlot = Plot.plot({
    title: "Neighborhood Uncertainty: Missing Data vs Reliability",
    width: 800,
    height: 500,
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 16, // Increased font size
      fontFamily: "'Inter', sans-serif" // Consistent font family
    },
    x: {
      label: "Missing Data Rate (%)",
      grid: true,
      tickFormat: d => `${d}%`,
      labelStyle: { 
        fill: dashboardColors.text.light, 
        fontSize: "14px", 
        fontWeight: "bold" 
      },
      tickSize: 6, // Larger ticks
      gridStyle: { stroke: "rgba(255, 255, 255, 0.2)" } // More visible grid
    },
    y: {
      label: "Reliability Score",
      grid: true,
      labelStyle: { 
        fill: dashboardColors.text.light, 
        fontSize: "14px", 
        fontWeight: "bold" 
      },
      tickSize: 6, // Larger ticks
      gridStyle: { stroke: "rgba(255, 255, 255, 0.2)" } // More visible grid
    },
    color: {
      type: "categorical",
      domain: ["High", "Medium", "Low"],
      range: [dashboardColors.reliability.high, dashboardColors.reliability.medium, dashboardColors.reliability.low],
      legend: true
    },
    marks: [
      // Add soft grid highlighting
      Plot.frame({fill: "rgba(255, 255, 255, 0.03)", stroke: "none"}),
      // Add data points with improved styling
      Plot.dot(data, {
        x: "missing_data_rate",
        y: "reliability_score",
        r: d => 8 + (d.damage_variability * 5), // Larger base size for better visibility
        fill: d => d.reliability_category,
        stroke: d => selectedNeighborhoods.size > 0 && selectedNeighborhoods.has(d.neighborhood) ? "#ffffff" : "rgba(255,255,255,0.5)",
        strokeWidth: d => selectedNeighborhoods.size > 0 && selectedNeighborhoods.has(d.neighborhood) ? 3 : 1.5, // Thicker strokes
        opacity: d => selectedNeighborhoods.size > 0 ? (selectedNeighborhoods.has(d.neighborhood) ? 1 : 0.3) : 0.9, // Higher default opacity
        title: d => `Neighborhood ${d.neighborhood}\nMissing Data: ${formatMetricValue("missing_data_rate", d.missing_data_rate)}\nReliability: ${formatMetricValue("reliability_score", d.reliability_score)}\nDamage Variability: ${formatMetricValue("damage_variability", d.damage_variability)}`
      }),
      // Add neighborhood labels for better identification
      Plot.text(data.filter(d => selectedNeighborhoods.has(d.neighborhood) || selectedNeighborhoods.size === 0), {
        x: "missing_data_rate",
        y: "reliability_score",
        text: d => d.neighborhood,
        fill: "white",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 2,
        dy: -15,
        fontSize: 12,
        fontWeight: "bold"
      }),
      // Add border frame
      Plot.frame({stroke: dashboardColors.background.cardBorder, strokeWidth: 2})
    ],
    // Add margin for better spacing
    margin: {left: 60, right: 40, top: 50, bottom: 50}
  });

  // Append the plot to the container
  container.innerHTML = "";
  container.appendChild(scatterPlot);

  // Add click event listener for cross-filtering
  setTimeout(() => {
    const dots = container.querySelectorAll("circle");
    dots.forEach(dot => {
      if (dot.__data__) {
        dot.style.cursor = "pointer";
        dot.addEventListener("click", function(event) {
          const neighborhood = event.target.__data__.neighborhood;

          // Toggle selection
          if (selectedNeighborhoods.has(neighborhood)) {
            selectedNeighborhoods.delete(neighborhood);
          } else {
            selectedNeighborhoods.add(neighborhood);
          }

          // Update all charts
          chartUpdaters.updateAll();
        });
      }
    });
  }, 100);
}

// Function to create bubble chart (alternative view)
function createBubbleChart(container, data) {
  // Group by reliability category and calculate average values
  const groupedData = [];
  ["High", "Medium", "Low"].forEach(category => {
    const categoryData = data.filter(d => d.reliability_category === category);
    if (categoryData.length > 0) {
      const avgMissingData = d3.mean(categoryData, d => d.missing_data_rate);
      const avgReliability = d3.mean(categoryData, d => d.reliability_score);
      const avgDamageVar = d3.mean(categoryData, d => d.damage_variability);
      const count = categoryData.length;

      groupedData.push({
        category,
        count,
        avgMissingData,
        avgReliability,
        avgDamageVar,
        color: dashboardColors.reliability[category.toLowerCase()]
      });
    }
  });

  // Create bubble chart
  const bubbleChart = Plot.plot({
    title: "Reliability Categories Summary",
    width: 800,
    height: 500,
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 14
    },
    x: {
      label: "Average Missing Data Rate (%)",
      grid: true,
      tickFormat: d => `${d.toFixed(1)}%`,
      labelStyle: { fill: dashboardColors.text.light },
      gridStyle: { stroke: "rgba(255, 255, 255, 0.1)" }
    },
    y: {
      label: "Average Reliability Score",
      grid: true,
      labelStyle: { fill: dashboardColors.text.light },
      gridStyle: { stroke: "rgba(255, 255, 255, 0.1)" }
    },
    marks: [
      Plot.dot(groupedData, {
        x: "avgMissingData",
        y: "avgReliability",
        r: d => 30 + (d.count * 5),
        fill: d => d.color,
        stroke: "white",
        strokeWidth: 1,
        opacity: 0.8
      }),
      Plot.text(groupedData, {
        x: "avgMissingData",
        y: "avgReliability",
        text: d => d.category,
        fill: "white",
        fontSize: 12,
        fontWeight: "bold"
      }),
      Plot.text(groupedData, {
        x: "avgMissingData",
        y: d => d.avgReliability - 10,
        text: d => `${d.count} neighborhoods`,
        fill: "white",
        fontSize: 10
      }),
      Plot.frame({stroke: dashboardColors.background.cardBorder})
    ]
  });

  // Create neighborhood list for each category
  const categoryLists = html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem;">
      ${["High", "Medium", "Low"].map(category => {
        const categoryData = data.filter(d => d.reliability_category === category);
        return html`
          <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
            <h4 style="color: ${dashboardColors.reliability[category.toLowerCase()]}; margin-top: 0;">
              ${category} Reliability (${categoryData.length})
            </h4>
            <div style="max-height: 150px; overflow-y: auto;">
              ${categoryData.length > 0 ?
                html`<ul style="margin: 0; padding-left: 1.5rem;">
                  ${categoryData.map(d => html`
                    <li style="margin-bottom: 0.25rem;">
                      Neighborhood ${d.neighborhood}
                      <span style="font-size: 0.8rem; color: var(--text-muted);">
                        (${formatMetricValue("reliability_score", d.reliability_score)})
                      </span>
                    </li>
                  `)}
                </ul>` :
                html`<p style="color: var(--text-muted);">No neighborhoods in this category</p>`
              }
            </div>
          </div>
        `;
      })}
    </div>
  `;

  // Append to container
  container.innerHTML = "";
  container.appendChild(bubbleChart);
  container.appendChild(categoryLists);
}

// Function to create quadrant analysis
function createQuadrantAnalysis(container, data) {
  // Calculate median values for quadrant thresholds
  const medianMissingData = d3.median(neighborhoods, d => d.missing_data_rate);
  const medianReliability = d3.median(neighborhoods, d => d.reliability_score);

  // Create enhanced quadrant plot with better readability
  const quadrantPlot = Plot.plot({
    title: "Neighborhood Quadrant Analysis",
    width: 800,
    height: 500,
    margin: {left: 60, right: 60, top: 60, bottom: 60},
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif" // Consistent font family
    },
    x: {
      label: "Missing Data Rate (%)",
      grid: true,
      tickFormat: d => `${d}%`,
      domain: [0, Math.max(50, d3.max(data, d => d.missing_data_rate) * 1.1)],
      labelStyle: { 
        fill: dashboardColors.text.light,
        fontSize: "14px", 
        fontWeight: "bold" 
      },
      tickSize: 6,
      gridStyle: { stroke: "rgba(255, 255, 255, 0.15)" } // More visible grid
    },
    y: {
      label: "Reliability Score",
      grid: true,
      domain: [0, Math.max(10, d3.max(data, d => d.reliability_score) * 1.1)],
      labelStyle: { 
        fill: dashboardColors.text.light,
        fontSize: "14px", 
        fontWeight: "bold" 
      },
      tickSize: 6,
      gridStyle: { stroke: "rgba(255, 255, 255, 0.15)" } // More visible grid
    },
    marks: [
      // Add soft background for the chart
      Plot.frame({fill: "rgba(255, 255, 255, 0.03)", stroke: "none"}),
      
      // Quadrant background colors for better visual distinction
      Plot.rect([
        // Q1: Low Missing Data, High Reliability (Top Left)
        {
          x1: 0, x2: medianMissingData,
          y1: medianReliability, y2: Math.max(10, d3.max(data, d => d.reliability_score) * 1.1)
        }
      ], {
        fill: dashboardColors.reliability.high,
        fillOpacity: 0.1
      }),
      Plot.rect([
        // Q2: High Missing Data, High Reliability (Top Right)
        {
          x1: medianMissingData, x2: Math.max(50, d3.max(data, d => d.missing_data_rate) * 1.1),
          y1: medianReliability, y2: Math.max(10, d3.max(data, d => d.reliability_score) * 1.1)
        }
      ], {
        fill: dashboardColors.reliability.medium,
        fillOpacity: 0.1
      }),
      Plot.rect([
        // Q3: Low Missing Data, Low Reliability (Bottom Left)
        {
          x1: 0, x2: medianMissingData,
          y1: 0, y2: medianReliability
        }
      ], {
        fill: dashboardColors.reliability.medium,
        fillOpacity: 0.1
      }),
      Plot.rect([
        // Q4: High Missing Data, Low Reliability (Bottom Right)
        {
          x1: medianMissingData, x2: Math.max(50, d3.max(data, d => d.missing_data_rate) * 1.1),
          y1: 0, y2: medianReliability
        }
      ], {
        fill: dashboardColors.reliability.low,
        fillOpacity: 0.1
      }),
      
      // Quadrant dividing lines with improved visibility
      Plot.ruleX([medianMissingData], {
        stroke: "white", 
        strokeDasharray: "6,4",
        strokeWidth: 2
      }),
      Plot.ruleY([medianReliability], {
        stroke: "white", 
        strokeDasharray: "6,4",
        strokeWidth: 2
      }),

      // Quadrant labels with improved styling
      Plot.text([{x: medianMissingData/2, y: medianReliability + (d3.max(data, d => d.reliability_score) - medianReliability)/2}], {
        text: ["Q1: Low Missing Data,\nHigh Reliability"],
        fill: dashboardColors.reliability.high,
        fontSize: 14,
        fontWeight: "bold",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 3,
        lineWidth: 20,
        textAnchor: "middle"
      }),
      Plot.text([{x: medianMissingData + (d3.max(data, d => d.missing_data_rate) - medianMissingData)/2, y: medianReliability + (d3.max(data, d => d.reliability_score) - medianReliability)/2}], {
        text: ["Q2: High Missing Data,\nHigh Reliability"],
        fill: dashboardColors.reliability.medium,
        fontSize: 14,
        fontWeight: "bold",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 3,
        lineWidth: 20,
        textAnchor: "middle"
      }),
      Plot.text([{x: medianMissingData/2, y: medianReliability/2}], {
        text: ["Q3: Low Missing Data,\nLow Reliability"],
        fill: dashboardColors.reliability.medium,
        fontSize: 14,
        fontWeight: "bold",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 3,
        lineWidth: 20,
        textAnchor: "middle"
      }),
      Plot.text([{x: medianMissingData + (d3.max(data, d => d.missing_data_rate) - medianMissingData)/2, y: medianReliability/2}], {
        text: ["Q4: High Missing Data,\nLow Reliability"],
        fill: dashboardColors.reliability.low,
        fontSize: 14,
        fontWeight: "bold",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 3,
        lineWidth: 20,
        textAnchor: "middle"
      }),

      // Data points with improved styling
      Plot.dot(data, {
        x: "missing_data_rate",
        y: "reliability_score",
        r: 8, // Larger dots
        fill: d => {
          // Assign color based on quadrant
          if (d.missing_data_rate < medianMissingData && d.reliability_score >= medianReliability) {
            return dashboardColors.reliability.high;  // Q1
          } else if (d.missing_data_rate >= medianMissingData && d.reliability_score >= medianReliability) {
            return dashboardColors.reliability.medium; // Q2
          } else if (d.missing_data_rate < medianMissingData && d.reliability_score < medianReliability) {
            return dashboardColors.reliability.medium; // Q3
          } else {
            return dashboardColors.reliability.low;   // Q4
          }
        },
        stroke: d => selectedNeighborhoods.size > 0 && selectedNeighborhoods.has(d.neighborhood) ? "#ffffff" : "rgba(255,255,255,0.5)",
        strokeWidth: d => selectedNeighborhoods.size > 0 && selectedNeighborhoods.has(d.neighborhood) ? 3 : 1.5, // Thicker strokes
        opacity: d => selectedNeighborhoods.size > 0 ? (selectedNeighborhoods.has(d.neighborhood) ? 1 : 0.3) : 0.9, // Higher default opacity
        title: d => `Neighborhood ${d.neighborhood}\nMissing Data: ${formatMetricValue("missing_data_rate", d.missing_data_rate)}\nReliability: ${formatMetricValue("reliability_score", d.reliability_score)}\nQuadrant: Q${
          d.missing_data_rate < medianMissingData && d.reliability_score >= medianReliability ? "1" :
          d.missing_data_rate >= medianMissingData && d.reliability_score >= medianReliability ? "2" :
          d.missing_data_rate < medianMissingData && d.reliability_score < medianReliability ? "3" : "4"
        }`
      }),
      
      // Add neighborhood labels with improved visibility
      Plot.text(data.filter(d => selectedNeighborhoods.has(d.neighborhood) || selectedNeighborhoods.size === 0), {
        x: "missing_data_rate",
        y: "reliability_score",
        text: d => d.neighborhood,
        fill: "white",
        fontSize: 12,
        fontWeight: "bold",
        stroke: "rgba(0,0,0,0.7)",
        strokeWidth: 3,
        dy: -12
      }),
      
      // Add median indicators
      Plot.text([{x: medianMissingData, y: 0}], {
        text: [`Median: ${medianMissingData.toFixed(1)}%`],
        fill: "white",
        fontSize: 12,
        fontWeight: "bold",
        dy: 16,
        textAnchor: "middle"
      }),
      Plot.text([{x: 0, y: medianReliability}], {
        text: [`Median: ${medianReliability.toFixed(2)}`],
        fill: "white",
        fontSize: 12,
        fontWeight: "bold",
        dx: 10,
        dy: -8,
        textAnchor: "start"
      }),
      
      // Add border frame
      Plot.frame({stroke: dashboardColors.background.cardBorder, strokeWidth: 2})
    ]
  });

  // Quadrant statistics
  const q1 = data.filter(d => d.missing_data_rate < medianMissingData && d.reliability_score >= medianReliability);
  const q2 = data.filter(d => d.missing_data_rate >= medianMissingData && d.reliability_score >= medianReliability);
  const q3 = data.filter(d => d.missing_data_rate < medianMissingData && d.reliability_score < medianReliability);
  const q4 = data.filter(d => d.missing_data_rate >= medianMissingData && d.reliability_score < medianReliability);

  const quadrantStats = html`
    <div style="margin-top: 1.5rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
      <h4 style="margin-top: 0; margin-bottom: 0.5rem;">Quadrant Analysis</h4>
      <p style="margin-bottom: 1rem;">
        The plot divides neighborhoods into four quadrants based on median values. Median Missing Data: ${medianMissingData.toFixed(1)}%,
        Median Reliability: ${medianReliability.toFixed(2)}
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div>
          <h5 style="margin: 0; color: ${dashboardColors.reliability.high};">
            Q1: Low Missing Data, High Reliability
          </h5>
          <p style="font-size: 0.9rem; margin: 0.5rem 0;">
            <strong>${q1.length}</strong> neighborhoods
            ${q1.length > 0 ? `(e.g., ${q1.slice(0, 3).map(d => d.neighborhood).join(", ")})` : ""}
          </p>
        </div>
        <div>
          <h5 style="margin: 0; color: ${dashboardColors.reliability.medium};">
            Q2: High Missing Data, High Reliability
          </h5>
          <p style="font-size: 0.9rem; margin: 0.5rem 0;">
            <strong>${q2.length}</strong> neighborhoods
            ${q2.length > 0 ? `(e.g., ${q2.slice(0, 3).map(d => d.neighborhood).join(", ")})` : ""}
          </p>
        </div>
        <div>
          <h5 style="margin: 0; color: ${dashboardColors.reliability.medium};">
            Q3: Low Missing Data, Low Reliability
          </h5>
          <p style="font-size: 0.9rem; margin: 0.5rem 0;">
            <strong>${q3.length}</strong> neighborhoods
            ${q3.length > 0 ? `(e.g., ${q3.slice(0, 3).map(d => d.neighborhood).join(", ")})` : ""}
          </p>
        </div>
        <div>
          <h5 style="margin: 0; color: ${dashboardColors.reliability.low};">
            Q4: High Missing Data, Low Reliability
          </h5>
          <p style="font-size: 0.9rem; margin: 0.5rem 0;">
            <strong>${q4.length}</strong> neighborhoods
            ${q4.length > 0 ? `(e.g., ${q4.slice(0, 3).map(d => d.neighborhood).join(", ")})` : ""}
          </p>
        </div>
      </div>
    </div>
  `;

  // Append to container
  container.innerHTML = "";
  container.appendChild(quadrantPlot);
  container.appendChild(quadrantStats);

  // Add click event listener for cross-filtering
  setTimeout(() => {
    const dots = container.querySelectorAll("circle");
    dots.forEach(dot => {
      if (dot.__data__) {
        dot.style.cursor = "pointer";
        dot.addEventListener("click", function(event) {
          const neighborhood = event.target.__data__.neighborhood;

          // Toggle selection
          if (selectedNeighborhoods.has(neighborhood)) {
            selectedNeighborhoods.delete(neighborhood);
          } else {
            selectedNeighborhoods.add(neighborhood);
          }

          // Update all charts
          chartUpdaters.updateAll();
        });
      }
    });
  }, 100);
}

// In Observable Framework, inline handlers handle the tab switching
// This function is kept to register updaters for content rendering
function setupScatterTabs() {
  const contentScatter = document.getElementById("tab-content-scatter");
  const contentBubble = document.getElementById("tab-content-bubble");
  const contentQuadrant = document.getElementById("tab-content-quadrant");

  if (contentScatter && contentBubble && contentQuadrant) {
    console.log("Found scatter tab content elements, setting up content");
    
    // Initial render
    createScatterPlot(contentScatter, filteredData);
    createBubbleChart(contentBubble, filteredData);
    createQuadrantAnalysis(contentQuadrant, filteredData);

    // Register update functions
    chartUpdaters.register(function(data) {
      createScatterPlot(contentScatter, data);
      createBubbleChart(contentBubble, data);
      createQuadrantAnalysis(contentQuadrant, data);
    });
    
    return true; // Successfully set up
  }
  
  console.log("Scatter tab content elements not found yet");
  return false; // Elements not found
}

// Setup scatter tabs using Observable-compatible approach
// In Observable, we need longer timeouts for DOM manipulation
setTimeout(() => {
  const contentScatter = document.getElementById("tab-content-scatter");
  const contentBubble = document.getElementById("tab-content-bubble");
  const contentQuadrant = document.getElementById("tab-content-quadrant");

  if (contentScatter && contentBubble && contentQuadrant) {
    console.log("Found scatter tab content elements, setting up content");
    
    // Initial render
    createScatterPlot(contentScatter, filteredData);
    createBubbleChart(contentBubble, filteredData);
    createQuadrantAnalysis(contentQuadrant, filteredData);

    // Register update functions
    chartUpdaters.register(function(data) {
      createScatterPlot(contentScatter, data);
      createBubbleChart(contentBubble, data);
      createQuadrantAnalysis(contentQuadrant, data);
    });
    
    console.log("Scatter tabs content setup complete");
  } else {
    console.error("Failed to find scatter tab content elements:", {
      contentScatter: Boolean(contentScatter),
      contentBubble: Boolean(contentBubble),
      contentQuadrant: Boolean(contentQuadrant)
    });
    
    // Try again with a longer delay
    setTimeout(setupScatterTabs, 1500);
  }
}, 1200);

// Display the uncertainty analysis with tabs
display(html`
<div class="card">
  <div class="dashboard-title">
    <i class="fas fa-project-diagram"></i> Uncertainty Relationship Analysis
  </div>
  <p>Explore the relationship between missing data and reliability scores across neighborhoods. Switch between different visualization approaches using the tabs below.</p>
  ${tabContainer}
</div>
`);
```

## Neighborhood Metrics Analysis

```js
// Create enhanced tabbed interface for different metric charts with inline event handlers
const metricTabContainer = html`
<div class="tab-container">
  <div class="tab-buttons" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; flex-wrap: wrap;">
    <button onclick=${() => {
      document.querySelectorAll('.tab-buttons .tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-content-missing, #tab-content-damage, #tab-content-report, #tab-content-comparison').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-missing').classList.add('active');
      document.getElementById('tab-content-missing').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-missing');
      if (contentElement && contentElement.children.length === 0) {
        createMetricBarChart(contentElement, filteredData, "missing_data_rate", dashboardColors.charts.missingData);
      }
    }} id="tab-missing" class="tab-button active" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 120px; justify-content: center;">
      <i class="fas fa-database"></i> Missing Data
    </button>
    <button onclick=${() => {
      document.querySelectorAll('.tab-buttons .tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-content-missing, #tab-content-damage, #tab-content-report, #tab-content-comparison').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-damage').classList.add('active');
      document.getElementById('tab-content-damage').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-damage');
      if (contentElement && contentElement.children.length === 0) {
        createMetricBarChart(contentElement, filteredData, "damage_variability", dashboardColors.charts.damage);
      }
    }} id="tab-damage" class="tab-button" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 120px; justify-content: center;">
      <i class="fas fa-chart-line"></i> Damage Variability
    </button>
    <button onclick=${() => {
      document.querySelectorAll('.tab-buttons .tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-content-missing, #tab-content-damage, #tab-content-report, #tab-content-comparison').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-report').classList.add('active');
      document.getElementById('tab-content-report').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-report');
      if (contentElement && contentElement.children.length === 0) {
        createMetricBarChart(contentElement, filteredData, "report_frequency", dashboardColors.charts.reportFrequency);
      }
    }} id="tab-report" class="tab-button" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 120px; justify-content: center;">
      <i class="fas fa-clock"></i> Report Frequency
    </button>
    <button onclick=${() => {
      document.querySelectorAll('.tab-buttons .tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-content-missing, #tab-content-damage, #tab-content-report, #tab-content-comparison').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-comparison').classList.add('active');
      document.getElementById('tab-content-comparison').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-comparison');
      if (contentElement && contentElement.children.length === 0) {
        createMetricsComparisonChart(contentElement, filteredData);
      }
    }} id="tab-comparison" class="tab-button" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 120px; justify-content: center;">
      <i class="fas fa-exchange-alt"></i> Metric Comparison
    </button>
  </div>
  <div id="tab-content-missing" class="tab-content active"></div>
  <div id="tab-content-damage" class="tab-content"></div>
  <div id="tab-content-report" class="tab-content"></div>
  <div id="tab-content-comparison" class="tab-content"></div>
</div>
`;

// Function to create enhanced bar chart for metrics
function createMetricBarChart(container, data, metric, color) {
  // Sort data by the metric
  const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);

  // Create enhanced bar chart with better readability
  const barChart = Plot.plot({
    title: `${metricLabels[metric]} by Neighborhood`,
    width: 800,
    height: 400,
    margin: {left: 80, right: 40, top: 50, bottom: 100},
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif" // Consistent font family
    },
    x: {
      label: "Neighborhood",
      grid: false, // Remove vertical grid for clarity
      tickRotate: -45, // Rotate labels for better readability
      domain: sortedData.map(d => `Neighborhood ${d.neighborhood}`),
      labelStyle: { 
        fill: dashboardColors.text.light, 
        fontSize: "14px", 
        fontWeight: "bold" 
      },
      tickSize: 4,
      tickPadding: 8
    },
    y: {
      label: metricLabels[metric],
      grid: true,
      labelStyle: { 
        fill: dashboardColors.text.light, 
        fontSize: "14px", 
        fontWeight: "bold" 
      },
      tickFormat: d => metric === "missing_data_rate" ? `${d}%` : d.toFixed(1),
      gridStyle: { stroke: "rgba(255, 255, 255, 0.2)" } // More visible grid
    },
    marks: [
      // Add soft background for the chart
      Plot.frame({fill: "rgba(255, 255, 255, 0.03)", stroke: "none"}),
      
      // Add enhanced bars
      Plot.barY(sortedData, {
        x: d => `Neighborhood ${d.neighborhood}`,
        y: metric,
        fill: d => selectedNeighborhoods.size > 0 ?
              (selectedNeighborhoods.has(d.neighborhood) ? color : "rgba(255,255,255,0.08)") :
              color,
        fillOpacity: 0.9,
        stroke: d => selectedNeighborhoods.has(d.neighborhood) ? "white" : "rgba(255,255,255,0.3)",
        strokeWidth: d => selectedNeighborhoods.has(d.neighborhood) ? 2 : 0.5,
        title: d => `Neighborhood ${d.neighborhood}: ${formatMetricValue(metric, d[metric])}`
      }),
      
      // Add data values on top of bars for better readability
      Plot.text(sortedData.filter(d => d[metric] > (d3.max(sortedData, d => d[metric]) * 0.1)), {
        x: d => `Neighborhood ${d.neighborhood}`,
        y: d => d[metric],
        text: d => formatMetricValue(metric, d[metric]),
        dy: -6,
        fill: "white",
        fontSize: 11,
        fontWeight: "bold",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 2
      }),
      
      // Add threshold line for missing data rate with improved visibility
      ...(metric === "missing_data_rate" ? [
        Plot.ruleY([parseFloat(document.getElementById("missing-data-threshold")?.value || 20)], {
          stroke: "#ff9f1c", // Orange/yellow for better visibility
          strokeWidth: 3,
          strokeDasharray: "6,4"
        }),
        Plot.text([{
          x: sortedData.length / 2,
          y: parseFloat(document.getElementById("missing-data-threshold")?.value || 20)
        }], {
          text: ["Threshold Filter"],
          dy: -8,
          fill: "#ff9f1c",
          fontSize: 12,
          fontWeight: "bold",
          stroke: "rgba(0,0,0,0.7)",
          strokeWidth: 3
        })
      ] : []),
      
      // Add zero baseline
      Plot.ruleY([0], {stroke: "rgba(255,255,255,0.5)", strokeWidth: 1}),
      
      // Add border frame
      Plot.frame({stroke: dashboardColors.background.cardBorder, strokeWidth: 2})
    ]
  });

  // Create statistics for this metric
  const stats = summaryStats[metric];
  const metricStats = html`
    <div style="margin-top: 1.5rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
      <h4 style="margin-top: 0; margin-bottom: 0.5rem;">Statistical Summary</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Average</div>
          <div style="font-size: 1.1rem; font-weight: 500;">${formatMetricValue(metric, stats.mean)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Median</div>
          <div style="font-size: 1.1rem; font-weight: 500;">${formatMetricValue(metric, stats.median)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Minimum</div>
          <div style="font-size: 1.1rem; font-weight: 500;">${formatMetricValue(metric, stats.min)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Maximum</div>
          <div style="font-size: 1.1rem; font-weight: 500;">${formatMetricValue(metric, stats.max)}</div>
        </div>
      </div>
    </div>
  `;

  // Create histogram for distribution
  const histogramChart = Plot.plot({
    title: `Distribution of ${metricLabels[metric]}`,
    width: 400,
    height: 200,
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 12
    },
    x: {
      label: metricLabels[metric],
      labelStyle: { fill: dashboardColors.text.light }
    },
    y: {
      label: "Count",
      grid: true,
      labelStyle: { fill: dashboardColors.text.light },
      gridStyle: { stroke: "rgba(255, 255, 255, 0.1)" }
    },
    marks: [
      Plot.rectY(data,
        Plot.binX(
          { y: "count" },
          { x: metric, thresholds: 10, fill: color, opacity: 0.8 }
        )
      ),
      Plot.ruleX([stats.mean], { stroke: "white", strokeWidth: 2, strokeDasharray: "2,2" }),
      Plot.text([{ x: stats.mean, y: 0 }], {
        text: ["Mean"],
        dy: -5,
        fill: "white",
        fontSize: 10
      }),
      Plot.frame({stroke: dashboardColors.background.cardBorder})
    ]
  });

  // Create a grid for the two visualizations side by side
  const visualizationGrid = html`
    <div style="display: grid; grid-template-columns: 1fr 400px; gap: 1rem; margin-top: 1rem;">
      ${barChart}
      <div>
        ${histogramChart}
        ${metricStats}
      </div>
    </div>
  `;

  // Append to container
  container.innerHTML = "";
  container.appendChild(visualizationGrid);

  // Add click event listener for cross-filtering
  setTimeout(() => {
    const bars = container.querySelectorAll("rect.mark");
    bars.forEach(bar => {
      if (bar.__data__ && bar.__data__.neighborhood) {
        bar.style.cursor = "pointer";
        bar.addEventListener("click", function(event) {
          const neighborhood = event.target.__data__.neighborhood;

          // Toggle selection
          if (selectedNeighborhoods.has(neighborhood)) {
            selectedNeighborhoods.delete(neighborhood);
          } else {
            selectedNeighborhoods.add(neighborhood);
          }

          // Update all charts
          chartUpdaters.updateAll();
        });
      }
    });
  }, 100);
}

// Function to calculate correlation
function correlation(x, y) {
  const n = x.length;
  const meanX = d3.mean(x);
  const meanY = d3.mean(y);
  const cov = d3.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY))) / (n - 1);
  const stdX = d3.deviation(x);
  const stdY = d3.deviation(y);
  return cov / (stdX * stdY);
}

// Function to create metrics comparison chart
function createMetricsComparisonChart(container, data) {
  // Calculate correlation matrix
  const matrix = [];
  metrics.forEach(metric1 => {
    metrics.forEach(metric2 => {
      const x = data.map(d => d[metric1]);
      const y = data.map(d => d[metric2]);
      const corr = correlation(x, y);
      matrix.push({ metric1, metric2, correlation: corr });
    });
  });

  // Create enhanced correlation heatmap with better readability
  const heatmap = Plot.plot({
    title: "Correlation Heatmap of Neighborhood Metrics",
    width: 500,
    height: 400,
    margin: {left: 140, right: 140, bottom: 140, top: 60},
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif" // Consistent font family
    },
    x: {
      domain: metrics,
      label: "",
      tickFormat: d => metricLabels[d] || d,
      labelStyle: { 
        fill: dashboardColors.text.light,
        fontSize: "13px", 
        fontWeight: "bold" 
      },
      tickRotate: -45,
      tickSize: 6,
      tickPadding: 8
    },
    y: {
      domain: metrics,
      label: "",
      tickFormat: d => metricLabels[d] || d,
      labelStyle: { 
        fill: dashboardColors.text.light,
        fontSize: "13px", 
        fontWeight: "bold" 
      },
      tickSize: 6,
      tickPadding: 8
    },
    marks: [
      // Add soft background for the chart
      Plot.frame({fill: "rgba(255, 255, 255, 0.03)", stroke: "none"}),
      
      // Draw a rectangle for each cell in the matrix with improved styling
      Plot.cell(matrix, {
        x: "metric1",
        y: "metric2",
        fill: "correlation",
        rx: 4, // Rounded corners
        ry: 4,
        stroke: "#333",
        strokeWidth: 1,
        title: d => `${metricLabels[d.metric1]} vs ${metricLabels[d.metric2]}: ${d.correlation.toFixed(2)}`,
        inset: 2 // More spacing between cells
      }),
      
      // Add correlation values as text with improved styling
      Plot.text(matrix, {
        x: "metric1",
        y: "metric2",
        text: d => d.correlation.toFixed(2),
        fill: d => Math.abs(d.correlation) > 0.3 ? "white" : "#333",
        fontSize: 12,
        fontWeight: "bold",
        stroke: d => Math.abs(d.correlation) > 0.3 ? "rgba(0,0,0,0.5)" : "none",
        strokeWidth: 2
      }),
      
      // Add highlights for strong correlations
      Plot.frame(matrix.filter(d => Math.abs(d.correlation) > 0.7 && d.metric1 !== d.metric2).map(d => ({
        x: d.metric1,
        y: d.metric2
      })), {
        stroke: "#fff",
        strokeWidth: 2.5,
        strokeDasharray: "3,2",
        rx: 6,
        ry: 6
      }),
      
      // Add diagonal highlighting
      Plot.frame(matrix.filter(d => d.metric1 === d.metric2).map(d => ({
        x: d.metric1,
        y: d.metric2
      })), {
        stroke: "rgba(255,255,255,0.5)",
        strokeWidth: 2,
        rx: 6,
        ry: 6
      }),
      
      // Add border frame
      Plot.frame({stroke: dashboardColors.background.cardBorder, strokeWidth: 2})
    ],
    color: {
      type: "diverging",
      domain: [-1, 0, 1],
      range: [dashboardColors.secondary, "#f8f9fa", dashboardColors.primary],
      label: "Pearson Correlation",
      legend: true
    }
  });

  // Create parallel coordinates plot
  const width = 900;
  const height = 500;
  const margin = { top: 50, right: 70, bottom: 80, left: 70 };

  // Create the SVG container
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("font", "14px 'Inter', sans-serif")
    .style("background", "transparent");

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // x-scale for positioning metrics along the horizontal axis
  const x = d3.scalePoint()
    .domain(metrics)
    .range([0, innerWidth])
    .padding(0.5);

  // y-scales: one for each metric based on its data range
  const yScales = {};
  metrics.forEach(m => {
    const values = data.map(d => d[m]);
    yScales[m] = d3.scaleLinear()
      .domain(d3.extent(values))
      .nice()
      .range([innerHeight, 0]);
  });

  // Append a group element for the plot
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add a background rectangle
  g.append("rect")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .attr("fill", "rgba(42, 157, 143, 0.05)")
    .attr("rx", 8)
    .attr("ry", 8);

  // Draw a line for each neighborhood
  const lines = g.selectAll("path")
    .data(data)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => d.reliability_color)
    .attr("stroke-width", d => selectedNeighborhoods.size > 0 &&
          selectedNeighborhoods.has(d.neighborhood) ? 3 : 1.5)
    .attr("stroke-opacity", d => selectedNeighborhoods.size > 0 ?
          (selectedNeighborhoods.has(d.neighborhood) ? 1 : 0.1) : 0.6)
    .attr("d", d => d3.line()(metrics.map(m => [x(m), yScales[m](d[m])])));

  // Add tooltips to lines
  lines.append("title")
    .text(d => `Neighborhood ${d.neighborhood} (${d.reliability_category} Reliability)`);

  // Draw an axis for each metric
  const axisGroup = g.selectAll("g.axis")
    .data(metrics)
    .join("g")
    .attr("class", "axis")
    .attr("transform", d => `translate(${x(d)},0)`)
    .each(function(d) {
      d3.select(this)
        .call(d3.axisLeft(yScales[d]).ticks(5).tickSize(-5))
        .selectAll("text")
        .attr("fill", dashboardColors.text.light)
        .attr("font-size", "12px");
    });

  // Remove domain path from axes
  axisGroup.selectAll("path")
    .attr("stroke", dashboardColors.background.cardBorder);

  // Add labels for each axis
  axisGroup.append("text")
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .attr("fill", dashboardColors.text.light)
    .style("font-weight", "bold")
    .text(d => metricLabels[d]);

  // Add vertical grid lines
  metrics.forEach(metric => {
    g.append("line")
      .attr("x1", x(metric))
      .attr("x2", x(metric))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", dashboardColors.background.cardBorder)
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "3,3");
  });

  // Add a chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .attr("fill", dashboardColors.text.light)
    .text("Parallel Coordinates Plot of Neighborhood Metrics");

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 150}, ${margin.top})`);

  ["High", "Medium", "Low"].forEach((category, i) => {
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", i * 25)
      .attr("y2", i * 25)
      .attr("stroke", dashboardColors.reliability[category.toLowerCase()])
      .attr("stroke-width", 2);

    legend.append("text")
      .attr("x", 30)
      .attr("y", i * 25)
      .attr("dy", "0.35em")
      .attr("fill", dashboardColors.text.light)
      .style("font-size", "12px")
      .text(`${category} Reliability`);
  });

  // Analysis of correlations
  const correlationAnalysis = html`
    <div style="margin-top: 1rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
      <h4 style="margin-top: 0;">Key Correlation Insights</h4>
      <ul style="margin-top: 0.5rem;">
        ${matrix
          .filter(d => d.metric1 !== d.metric2 && Math.abs(d.correlation) > 0.5)
          .map(d => html`
            <li style="margin-bottom: 0.5rem;">
              <strong>${metricLabels[d.metric1]}</strong> and <strong>${metricLabels[d.metric2]}</strong>
              have a <span style="color: ${d.correlation > 0 ? dashboardColors.primary : dashboardColors.secondary};">
                ${d.correlation > 0 ? "positive" : "negative"} correlation
              </span> of ${d.correlation.toFixed(2)}
            </li>
          `)
        }
      </ul>
    </div>
  `;

  // Create grid for parallel coords and heatmap
  const comparisonGrid = html`
    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
      ${svg.node()}
      <div style="display: grid; grid-template-columns: 500px 1fr; gap: 1rem; margin-top: 1rem;">
        ${heatmap}
        ${correlationAnalysis}
      </div>
    </div>
  `;

  // Append to container
  container.innerHTML = "";
  container.appendChild(comparisonGrid);

  // Add click interactions to lines
  setTimeout(() => {
    const paths = container.querySelectorAll("path");
    paths.forEach(path => {
      if (path.__data__ && path.__data__.neighborhood) {
        path.style.cursor = "pointer";
        path.addEventListener("click", function(event) {
          const neighborhood = event.target.__data__.neighborhood;

          // Toggle selection
          if (selectedNeighborhoods.has(neighborhood)) {
            selectedNeighborhoods.delete(neighborhood);
          } else {
            selectedNeighborhoods.add(neighborhood);
          }

          // Update all charts
          chartUpdaters.updateAll();
        });
      }
    });
  }, 100);
}

// In Observable Framework, inline handlers handle the tab switching
// This function is kept to register updaters for content rendering
function setupMetricTabs() {
  const contentMissing = document.getElementById("tab-content-missing");
  const contentDamage = document.getElementById("tab-content-damage");
  const contentReport = document.getElementById("tab-content-report");
  const contentComparison = document.getElementById("tab-content-comparison");

  if (contentMissing && contentDamage && contentReport && contentComparison) {
    console.log("Found metric tab content elements, setting up content");
    
    // Initial render
    createMetricBarChart(contentMissing, filteredData, "missing_data_rate", dashboardColors.charts.missingData);
    createMetricBarChart(contentDamage, filteredData, "damage_variability", dashboardColors.charts.damage);
    createMetricBarChart(contentReport, filteredData, "report_frequency", dashboardColors.charts.reportFrequency);
    createMetricsComparisonChart(contentComparison, filteredData);

    // Register update function
    chartUpdaters.register(function(data) {
      createMetricBarChart(contentMissing, data, "missing_data_rate", dashboardColors.charts.missingData);
      createMetricBarChart(contentDamage, data, "damage_variability", dashboardColors.charts.damage);
      createMetricBarChart(contentReport, data, "report_frequency", dashboardColors.charts.reportFrequency);
      createMetricsComparisonChart(contentComparison, data);
    });
    
    return true; // Successfully set up
  }
  
  console.log("Metric tab content elements not found yet");
  return false; // Elements not found
}

// Setup metric tabs using Observable-compatible approach
// In Observable, we use longer timeouts for DOM manipulation
setTimeout(() => {
  const contentMissing = document.getElementById("tab-content-missing");
  const contentDamage = document.getElementById("tab-content-damage");
  const contentReport = document.getElementById("tab-content-report");
  const contentComparison = document.getElementById("tab-content-comparison");

  if (contentMissing && contentDamage && contentReport && contentComparison) {
    console.log("Found metric tab content elements, setting up content");
    
    // Initial render
    createMetricBarChart(contentMissing, filteredData, "missing_data_rate", dashboardColors.charts.missingData);
    createMetricBarChart(contentDamage, filteredData, "damage_variability", dashboardColors.charts.damage);
    createMetricBarChart(contentReport, filteredData, "report_frequency", dashboardColors.charts.reportFrequency);
    createMetricsComparisonChart(contentComparison, filteredData);

    // Register update function
    chartUpdaters.register(function(data) {
      createMetricBarChart(contentMissing, data, "missing_data_rate", dashboardColors.charts.missingData);
      createMetricBarChart(contentDamage, data, "damage_variability", dashboardColors.charts.damage);
      createMetricBarChart(contentReport, data, "report_frequency", dashboardColors.charts.reportFrequency);
      createMetricsComparisonChart(contentComparison, data);
    });
    
    console.log("Metric tabs content setup complete");
  } else {
    console.error("Failed to find metric tab content elements:", {
      contentMissing: Boolean(contentMissing),
      contentDamage: Boolean(contentDamage),
      contentReport: Boolean(contentReport),
      contentComparison: Boolean(contentComparison)
    });
    
    // Try again with a longer delay
    setTimeout(setupMetricTabs, 2000);
  }
}, 1400);

// Display the metrics analysis with tabs
display(html`
<div class="card">
  <div class="dashboard-title">
    <i class="fas fa-chart-bar"></i> Neighborhood Metrics Analysis
  </div>
  <p>Analyze individual metrics across neighborhoods and explore their relationships. Use the tabs below to switch between different metrics and views.</p>
  ${metricTabContainer}
</div>
`);
```

## Neighborhood Insights Summary

```js
// Create a summary of key insights function
function createNeighborhoodInsights(data) {
  // Group neighborhoods by reliability category
  const byReliability = d3.group(data, d => d.reliability_category);

  // Calculate insights for each category
  const insights = {};
  for (const [category, neighborhoods] of byReliability.entries()) {
    insights[category] = {
      count: neighborhoods.length,
      avgMissingData: d3.mean(neighborhoods, d => d.missing_data_rate),
      avgReportFreq: d3.mean(neighborhoods, d => d.report_frequency),
      avgDamageVar: d3.mean(neighborhoods, d => d.damage_variability),
      avgReliability: d3.mean(neighborhoods, d => d.reliability_score),
      examples: neighborhoods.slice(0, Math.min(3, neighborhoods.length)).map(d => d.neighborhood)
    };
  }

  // Create category specific insights cards
  return html`
    <div class="grid grid-cols-2" style="margin-top: 1rem; gap: 1rem;">
      ${Object.entries(insights).map(([category, data]) => {
        const categoryColor = dashboardColors.reliability[category.toLowerCase()];
        return html`
          <div class="insight-card" style="border-left: 4px solid ${categoryColor};">
            <h4 style="margin-top: 0; color: ${categoryColor};">
              ${category} Reliability Neighborhoods (${data.count})
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
              <div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Avg. Missing Data</div>
                <div style="font-size: 1.1rem; font-weight: 500;">${data.avgMissingData.toFixed(1)}%</div>
              </div>
              <div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Avg. Report Frequency</div>
                <div style="font-size: 1.1rem; font-weight: 500;">${data.avgReportFreq.toFixed(1)} min</div>
              </div>
            </div>
            <p style="margin-bottom: 0.5rem;">
              <strong>Examples:</strong> ${data.examples.map(n => `Neighborhood ${n}`).join(', ')}
            </p>
            ${category === "Low" ? html`
              <div class="highlight" style="margin: 0.5rem 0; font-size: 0.9rem;">
                <strong><i class="fas fa-exclamation-triangle"></i> Warning:</strong>
                Data from these neighborhoods should be treated with caution due to high uncertainty.
              </div>
            ` : ''}
          </div>
        `;
      })}
    </div>
  `;
}

// Create overall data quality assessment card
function createDataQualityAssessment(data) {
  // Calculate overall metrics
  const overallMissingData = d3.mean(data, d => d.missing_data_rate);
  const highReliabilityPct = (data.filter(d => d.reliability_category === "High").length / data.length) * 100;
  const lowReliabilityPct = (data.filter(d => d.reliability_category === "Low").length / data.length) * 100;

  // Define quality thresholds
  let qualityAssessment = "Good";
  let qualityColor = dashboardColors.primary;

  if (overallMissingData > 25 || lowReliabilityPct > 40) {
    qualityAssessment = "Poor";
    qualityColor = dashboardColors.secondary;
  } else if (overallMissingData > 15 || lowReliabilityPct > 20 || highReliabilityPct < 30) {
    qualityAssessment = "Fair";
    qualityColor = dashboardColors.tertiary;
  }

  // Create assessment card
  return html`
    <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="margin: 0;">Overall Data Quality Assessment</h3>
        <div style="background-color: ${qualityColor}; padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: bold;">
          ${qualityAssessment}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">Average Missing Data</div>
          <div style="font-size: 1.3rem; font-weight: 500; margin-bottom: 0.25rem;">${overallMissingData.toFixed(1)}%</div>
          <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 3px;">
            <div style="height: 100%; width: ${Math.min(100, overallMissingData)}%; background: ${
              overallMissingData > 25 ? dashboardColors.secondary :
              overallMissingData > 15 ? dashboardColors.tertiary :
              dashboardColors.primary
            }; border-radius: 3px;"></div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">High Reliability Coverage</div>
          <div style="font-size: 1.3rem; font-weight: 500; margin-bottom: 0.25rem;">${highReliabilityPct.toFixed(1)}%</div>
          <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 3px;">
            <div style="height: 100%; width: ${highReliabilityPct}%; background: ${
              highReliabilityPct < 30 ? dashboardColors.tertiary :
              highReliabilityPct > 50 ? dashboardColors.primary :
              dashboardColors.primary
            }; border-radius: 3px;"></div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">Low Reliability Coverage</div>
          <div style="font-size: 1.3rem; font-weight: 500; margin-bottom: 0.25rem;">${lowReliabilityPct.toFixed(1)}%</div>
          <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 3px;">
            <div style="height: 100%; width: ${lowReliabilityPct}%; background: ${
              lowReliabilityPct > 40 ? dashboardColors.secondary :
              lowReliabilityPct > 20 ? dashboardColors.tertiary :
              dashboardColors.primary
            }; border-radius: 3px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Create recommendations based on data
function createRecommendations(data) {
  // Get problematic neighborhoods (low reliability or high missing data)
  const problematicNeighborhoods = data.filter(d =>
    d.reliability_category === "Low" || d.missing_data_rate > 25
  ).sort((a, b) => b.missing_data_rate - a.missing_data_rate);

  // Create recommendations list
  const recommendations = [];

  if (problematicNeighborhoods.length > 0) {
    recommendations.push({
      title: "Focus on Improving Data Quality",
      description: `Prioritize data collection in ${problematicNeighborhoods.length} neighborhoods with poor reliability, particularly neighborhoods ${
        problematicNeighborhoods.slice(0, Math.min(3, problematicNeighborhoods.length))
          .map(d => d.neighborhood).join(', ')
      }.`,
      icon: "fa-exclamation-circle"
    });
  }

  // Add general recommendations
  recommendations.push({
    title: "Establish Data Quality Standards",
    description: "Define minimum thresholds for report frequency and completeness across all neighborhoods to improve overall data reliability.",
    icon: "fa-clipboard-check"
  });

  recommendations.push({
    title: "Cross-Validate Critical Information",
    description: "For neighborhoods with high damage variability, implement secondary verification to confirm the accuracy of extreme damage reports.",
    icon: "fa-sync-alt"
  });

  recommendations.push({
    title: "Implement Real-time Data Quality Monitoring",
    description: "Set up automated alerts when missing data rates exceed 20% or when report frequency drops significantly for any neighborhood.",
    icon: "fa-chart-line"
  });

  // Create recommendations cards
  return html`
    <div style="margin-top: 1rem;">
      <h3>Recommendations</h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
        ${recommendations.map(rec => html`
          <div class="insight-card">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <i class="fas ${rec.icon}" style="color: ${dashboardColors.secondary}; font-size: 1.2rem;"></i>
              <h4 style="margin: 0;">${rec.title}</h4>
            </div>
            <p style="margin: 0; font-size: 0.9rem;">${rec.description}</p>
          </div>
        `)}
      </div>
    </div>
  `;
}

// Create enhanced insights tab container with inline event handlers
const insightsTabContainer = html`
<div class="tab-container">
  <div class="tab-buttons" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
    <button onclick=${() => {
      document.querySelectorAll('#tab-insights, #tab-recommendations').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-content-insights, #tab-content-recommendations').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-insights').classList.add('active');
      document.getElementById('tab-content-insights').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-insights');
      if (contentElement && contentElement.children.length === 0) {
        contentElement.appendChild(createNeighborhoodInsights(filteredData));
      }
    }} id="tab-insights" class="tab-button active" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 200px; justify-content: center; flex: 1;">
      <i class="fas fa-chart-pie"></i> Neighborhood Insights
    </button>
    <button onclick=${() => {
      document.querySelectorAll('#tab-insights, #tab-recommendations').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-content-insights, #tab-content-recommendations').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-recommendations').classList.add('active');
      document.getElementById('tab-content-recommendations').classList.add('active');
      
      // Make sure content is rendered
      const contentElement = document.getElementById('tab-content-recommendations');
      if (contentElement && contentElement.children.length === 0) {
        contentElement.appendChild(createRecommendations(filteredData));
      }
    }} id="tab-recommendations" class="tab-button" style="padding: 0.8rem 1.2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 3px solid transparent; border-radius: 6px 6px 0 0; transition: all 0.2s; margin-right: 0.25rem; min-width: 200px; justify-content: center; flex: 1;">
      <i class="fas fa-lightbulb"></i> Recommendations
    </button>
  </div>
  <div id="tab-content-insights" class="tab-content active"></div>
  <div id="tab-content-recommendations" class="tab-content"></div>
</div>
`;

// In Observable Framework, inline handlers handle the tab switching
// This function is kept to register updaters for content rendering
function setupInsightsTabs() {
  const contentInsights = document.getElementById("tab-content-insights");
  const contentRecommendations = document.getElementById("tab-content-recommendations");

  if (contentInsights && contentRecommendations) {
    console.log("Found insights tab content elements, setting up content");
    
    // Initial rendering
    contentInsights.appendChild(createNeighborhoodInsights(filteredData));
    contentRecommendations.appendChild(createRecommendations(filteredData));

    // Register update function
    chartUpdaters.register(function(data) {
      // Update insights
      contentInsights.innerHTML = "";
      contentInsights.appendChild(createNeighborhoodInsights(data));

      // Update recommendations
      contentRecommendations.innerHTML = "";
      contentRecommendations.appendChild(createRecommendations(data));

      // Update quality assessment
      const qualityContainer = document.querySelector("#quality-assessment-container");
      if (qualityContainer) {
        qualityContainer.innerHTML = "";
        qualityContainer.appendChild(createDataQualityAssessment(data));
      }
    });
    
    return true; // Successfully set up
  }
  
  console.log("Insights tab content elements not found yet");
  return false; // Elements not found
}

// Setup insights tabs using Observable-compatible approach
// In Observable, use longer timeouts for DOM manipulation
setTimeout(() => {
  const contentInsights = document.getElementById("tab-content-insights");
  const contentRecommendations = document.getElementById("tab-content-recommendations");

  if (contentInsights && contentRecommendations) {
    console.log("Found insights tab content elements, setting up content");
    
    // Initial rendering
    contentInsights.appendChild(createNeighborhoodInsights(filteredData));
    contentRecommendations.appendChild(createRecommendations(filteredData));

    // Register update function
    chartUpdaters.register(function(data) {
      // Update insights
      contentInsights.innerHTML = "";
      contentInsights.appendChild(createNeighborhoodInsights(data));

      // Update recommendations
      contentRecommendations.innerHTML = "";
      contentRecommendations.appendChild(createRecommendations(data));

      // Update quality assessment
      const qualityContainer = document.querySelector("#quality-assessment-container");
      if (qualityContainer) {
        qualityContainer.innerHTML = "";
        qualityContainer.appendChild(createDataQualityAssessment(data));
      }
    });
    
    console.log("Insights tabs content setup complete");
  } else {
    console.error("Failed to find insights tab content elements:", {
      contentInsights: Boolean(contentInsights),
      contentRecommendations: Boolean(contentRecommendations)
    });
    
    // Try again with a longer delay
    setTimeout(setupInsightsTabs, 2000);
  }
}, 1600);

// Display the insights section
display(html`
  <div class="card">
    <div class="dashboard-title">
      <i class="fas fa-lightbulb"></i> Insights & Recommendations
    </div>

    <div id="quality-assessment-container">
      ${createDataQualityAssessment(filteredData)}
    </div>

    ${insightsTabContainer}
  </div>
`);
```

## Earthquake Reports Timeline

```js
// Create date selector for heatmap with inline event handlers
const dateSelector = html`
  <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; justify-content: center; flex-wrap: wrap;">
    <button onclick=${() => {
      document.querySelectorAll('[id^="date-btn-"]').forEach(btn => btn.classList.remove('active'));
      document.getElementById('date-btn-1').classList.add('active');
      updateHeatmap("2020-04-06");
    }} id="date-btn-1" class="tab-button active" data-date="2020-04-06" style="min-width: 110px; padding: 10px 15px; font-size: 15px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-calendar-day" style="margin-right: 8px;"></i> Apr 6
    </button>
    <button onclick=${() => {
      document.querySelectorAll('[id^="date-btn-"]').forEach(btn => btn.classList.remove('active'));
      document.getElementById('date-btn-2').classList.add('active');
      updateHeatmap("2020-04-07");
    }} id="date-btn-2" class="tab-button" data-date="2020-04-07" style="min-width: 110px; padding: 10px 15px; font-size: 15px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-calendar-day" style="margin-right: 8px;"></i> Apr 7
    </button>
    <button onclick=${() => {
      document.querySelectorAll('[id^="date-btn-"]').forEach(btn => btn.classList.remove('active'));
      document.getElementById('date-btn-3').classList.add('active');
      updateHeatmap("2020-04-08");
    }} id="date-btn-3" class="tab-button" data-date="2020-04-08" style="min-width: 110px; padding: 10px 15px; font-size: 15px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-calendar-day" style="margin-right: 8px;"></i> Apr 8
    </button>
    <button onclick=${() => {
      document.querySelectorAll('[id^="date-btn-"]').forEach(btn => btn.classList.remove('active'));
      document.getElementById('date-btn-4').classList.add('active');
      updateHeatmap("2020-04-09");
    }} id="date-btn-4" class="tab-button" data-date="2020-04-09" style="min-width: 110px; padding: 10px 15px; font-size: 15px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-calendar-day" style="margin-right: 8px;"></i> Apr 9
    </button>
    <button onclick=${() => {
      document.querySelectorAll('[id^="date-btn-"]').forEach(btn => btn.classList.remove('active'));
      document.getElementById('date-btn-5').classList.add('active');
      updateHeatmap("2020-04-10");
    }} id="date-btn-5" class="tab-button" data-date="2020-04-10" style="min-width: 110px; padding: 10px 15px; font-size: 15px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-calendar-day" style="margin-right: 8px;"></i> Apr 10
    </button>
  </div>
`;

// Create container for the current heatmap
const heatmapContainer = html`<div id="current-heatmap"></div>`;

// Create map between neighborhood numbers and reliability categories
function setupNeighborhoodReliabilityMap() {
  const neighborhoodReliabilityMap = {};
  neighborhoods.forEach(n => {
    neighborhoodReliabilityMap[n.neighborhood] = {
      category: n.reliability_category,
      color: n.reliability_color
    };
  });
  return neighborhoodReliabilityMap;
}

// Create a more informative legend with reliability categories
function createCustomLegend() {
  // Create reports legend
  const reportsLegend = html`
    <div style="margin-bottom: 1rem;">
      <h4 style="margin-bottom: 0.5rem;">Reports Density</h4>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="display: flex; height: 20px; width: 300px; border-radius: 4px; overflow: hidden;">
          ${Array(10).fill().map((_, i) => {
            const color = d3.interpolate("#f7fbff", dashboardColors.secondary)(i/9);
            return html`<div style="flex: 1; background-color: ${color};"></div>`;
          })}
        </div>
        <div style="display: flex; justify-content: space-between; width: 300px;">
          <span style="font-size: 0.8rem;">Low</span>
          <span style="font-size: 0.8rem;">Medium</span>
          <span style="font-size: 0.8rem;">High</span>
        </div>
      </div>
    </div>
  `;

  // Create reliability legend
  const reliabilityLegend = html`
    <div>
      <h4 style="margin-bottom: 0.5rem;">Reliability Categories</h4>
      <div style="display: flex; gap: 1rem;">
        ${["High", "Medium", "Low"].map(category => html`
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 16px; height: 16px; background-color: ${dashboardColors.reliability[category.toLowerCase()]}; border-radius: 50%;"></div>
            <span style="font-size: 0.8rem;">${category} Reliability</span>
          </div>
        `)}
      </div>
    </div>
  `;

  return html`
    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      ${reportsLegend}
      ${reliabilityLegend}
    </div>
  `;
}

// Function to create enhanced heatmap
function createEnhancedHeatmap(data, neighborhoodReliabilityMap, {width} = {}) {
  // If no data, show message
  if (!data || data.length === 0) {
    return html`
      <div style="padding: 2rem; text-align: center;">
        <p>No data available for this date.</p>
      </div>
    `;
  }

  // Get all unique times for proper time axis
  const times = [...new Set(data.map(d => d.time))].sort((a, b) => a - b);
  const regions = Array.from({length: 19}, (_, i) => String(i + 1));

  // Create a value accessor that maps null/undefined to 0
  const valueAccessor = d => d?.value || 0;

  // Create the heatmap
  return Plot.plot({
    width,
    height: 500,
    marginLeft: 60,
    marginRight: 20,
    marginTop: 40,
    marginBottom: 70,
    style: {
      background: "transparent",
      color: dashboardColors.text.light,
      fontSize: 12
    },
    x: {
      type: "band",
      label: "Time",
      domain: times,
      tickFormat: d3.timeFormat("%H:%M"),
      labelStyle: { fill: dashboardColors.text.light },
      tickRotate: -45
    },
    y: {
      label: "Region",
      domain: regions,
      labelStyle: { fill: dashboardColors.text.light }
    },
    color: {
      type: "log",
      domain: [1, d3.max(data, valueAccessor) || 100],
      range: ["#f7fbff", dashboardColors.primary, dashboardColors.secondary],
      legend: true,
      label: "Number of Reports"
    },
    marks: [
      Plot.cell(data, {
        x: "time",
        y: "region",
        fill: valueAccessor,
        stroke: d => selectedNeighborhoods.size > 0 &&
                    selectedNeighborhoods.has(d.region) ?
                    "white" : null,
        strokeWidth: d => selectedNeighborhoods.size > 0 &&
                          selectedNeighborhoods.has(d.region) ?
                          2 : 0,
        title: d => {
          const reliability = neighborhoodReliabilityMap[d.region];
          const reliabilityInfo = reliability ?
            `\nReliability: ${reliability.category}` : '';

          return `Time: ${d3.timeFormat("%Y-%m-%d %H:%M")(d.time)}
Region: ${d.region}${reliabilityInfo}
Reports: ${d.value || 0}`;
        }
      }),
      Plot.frame({stroke: dashboardColors.background.cardBorder})
    ],
    // Add panning/zooming for interactive exploration
    interactions: [Plot.zoom({
      extent: [[0, 0], [width, 500]],
      bound: "partial",
      clip: false
    })]
  });
}

// Function to load and process heatmap data
function loadHeatmapData() {
  return new Promise((resolve, reject) => {
    FileAttachment("data/heatmap_data.csv").csv({typed: true})
      .then(reports => {
        try {
          const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

          // Transform data for heatmap
          const heatmap_data = reports.flatMap(d =>
            Object.keys(d)
              .filter(key => key !== "time_30min")
              .map(region => ({
                time: parseTime(d.time_30min),
                region: region,
                value: +d[region] || 0 // Handle NaN values
              }))
          );

          // Filter out invalid data points
          const validData = heatmap_data.filter(d => d.time && !isNaN(d.value));
          const formatDate = d3.timeFormat("%Y-%m-%d");

          // Group data by days
          const days = {
            "2020-04-06": validData.filter(d => formatDate(d.time) === "2020-04-06"),
            "2020-04-07": validData.filter(d => formatDate(d.time) === "2020-04-07"),
            "2020-04-08": validData.filter(d => formatDate(d.time) === "2020-04-08"),
            "2020-04-09": validData.filter(d => formatDate(d.time) === "2020-04-09"),
            "2020-04-10": validData.filter(d => formatDate(d.time) === "2020-04-10")
          };

          resolve(days);
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });
}

// Variables to store heatmap state
let heatmapDays = {};
let currentHeatmapDate = "2020-04-06";
const neighborhoodReliabilityMap = setupNeighborhoodReliabilityMap();

// Function to update heatmap based on date and selections
function updateHeatmap(date) {
  const heatmapElement = document.getElementById("current-heatmap");
  if (!heatmapElement) return;

  currentHeatmapDate = date;
  const dateData = heatmapDays[date];

  const chart = createEnhancedHeatmap(dateData, neighborhoodReliabilityMap, {
    width: heatmapElement.clientWidth || 800
  });

  heatmapElement.innerHTML = "";
  heatmapElement.appendChild(chart);

  // Update date display
  const dateDisplay = document.getElementById("current-date-display");
  if (dateDisplay) {
    dateDisplay.textContent = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Add click event listeners to heatmap cells
  setTimeout(() => {
    const cells = heatmapElement.querySelectorAll("rect.mark");
    cells.forEach(cell => {
      if (cell.__data__ && cell.__data__.region) {
        cell.style.cursor = "pointer";
        cell.addEventListener("click", function(event) {
          const region = event.target.__data__.region;

          // Toggle selection
          if (selectedNeighborhoods.has(region)) {
            selectedNeighborhoods.delete(region);
          } else {
            selectedNeighborhoods.add(region);
          }

          // Update all charts
          chartUpdaters.updateAll();
        });
      }
    });
  }, 100);
}

// In Observable Framework, we don't need this function since we use inline handlers
// This function is causing duplicate event handling with the inline handlers
function setupDateButtons() {
  console.log("Using inline event handlers for date buttons instead of traditional event listeners");
  // No longer attaching duplicate event listeners
}

// Register heatmap updater function
chartUpdaters.register(function(data) {
  // We don't use filteredData for the heatmap
  // but we do update to reflect selections
  if (heatmapDays[currentHeatmapDate]) {
    updateHeatmap(currentHeatmapDate);
  }
});

// Initialize heatmap data
function initHeatmap() {
  // Set up loading state
  const heatmapElement = document.getElementById("current-heatmap");
  if (heatmapElement) {
    heatmapElement.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <p><i class="fas fa-spinner fa-spin"></i> Loading heatmap data...</p>
      </div>
    `;
  }

  // Load data
  loadHeatmapData()
    .then(days => {
      heatmapDays = days;
      updateHeatmap("2020-04-06");
      // Don't call setupDateButtons() as we're using inline handlers
    })
    .catch(error => {
      console.error("Error loading heatmap data:", error);

      if (heatmapElement) {
        heatmapElement.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: ${dashboardColors.secondary};">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Error loading heatmap data: ${error.message}</p>
          </div>
        `;
      }
    });
}

// Initialize heatmap using Observable-compatible approach
// In Observable, we use longer timeouts for DOM initialization
setTimeout(() => {
  const heatmapElement = document.getElementById("current-heatmap");
  
  if (heatmapElement) {
    console.log("Found heatmap element, starting initialization");
    initHeatmap();
  } else {
    console.error("Failed to find heatmap element, will retry");
    
    // Try again with an even longer delay
    setTimeout(() => {
      const heatmapElement = document.getElementById("current-heatmap");
      if (heatmapElement) {
        console.log("Found heatmap element on second attempt, starting initialization");
        initHeatmap();
      } else {
        console.error("Still failed to find heatmap element");
      }
    }, 2500);
  }
}, 1800);

// Display timeline section with enhanced controls
display(html`
  <div class="card" style="margin-top: 50px;">
    <div class="dashboard-title">
      <i class="fas fa-calendar-alt"></i> Earthquake Reports Timeline
    </div>
    <p>This heatmap shows report density by region and time. Darker colors indicate a higher number of reports.
    Select a neighborhood in any chart to highlight it across all visualizations.</p>

    ${createCustomLegend()}

    <h3 id="current-date-display" style="text-align: center; margin-bottom: 1rem;">Loading date...</h3>

    ${dateSelector}

    ${heatmapContainer}

    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted); text-align: center;">
      <i class="fas fa-info-circle"></i> Tip: Use scroll wheel to zoom and drag to pan the heatmap. Click on a cell to select that neighborhood.
    </div>
  </div>
`);
```