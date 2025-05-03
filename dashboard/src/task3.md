---
theme: dashboard
title: Region Conditions and Uncertainty Overtime
toc: false
---

# Region Conditions and Uncertainty Overtime

This dashboard visualizes the change in conditions and uncertainty of reportings overtime. To track damage reporting consistently over time intervals across all days, the mean is used to represent this. Additionally, to measure how uncertainty fluctuates over specific time periods, relevant uncertainty statistics are utilized.

```js
// Import required libraries
import * as Plot from "npm:@observablehq/plot"
import * as d3 from "npm:d3"
```

```js
// Define color scheme for consistent visualization
const colors = {
  primary: "#2a9d8f",
  secondary: "#e76f51",
  tertiary: "#e9c46a",
  background: {
    dark: "#264653",
    card: "rgba(42, 157, 143, 0.1)",
    cardBorder: "rgba(42, 157, 143, 0.2)"
  },
  damage: {
    sewer_and_water: "#2a9d8f",
    power: "#e76f51",
    roads_and_bridges: "#e9c46a",
    medical: "#8ac926",
    buildings: "#6a4c93",
    shake_intensity: "#1982c4"
  }
};

// Define damage type labels for better readability
const damageTypeLabels = {
  sewer_and_water: "Sewer & Water",
  power: "Power",
  roads_and_bridges: "Roads & Bridges",
  medical: "Medical",
  buildings: "Buildings",
  shake_intensity: "Shake Intensity"
};
```

```js
// Load uncertainty data
const uncertaintyData = await FileAttachment("data/uncertainty.csv").csv({typed: true});

// Parse time and format data for visualization
const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

// Create flattened data for heatmap
const heatmapData = uncertaintyData.flatMap(d =>
  Object.keys(d)
    .filter(key => key !== "time_5min")
    .map(damageType => ({
      time: parseTime(d.time_5min),
      time_string: d.time_5min,
      damageType: damageType,
      value: +d[damageType]
    }))
);

// Extract unique days for filtering
const formatDate = d3.timeFormat("%Y-%m-%d");
const uniqueDays = [...new Set(heatmapData.map(d => formatDate(d.time)))].sort();

// Ensure uniqueDays has at least one default value
if (!uniqueDays || uniqueDays.length === 0) {
  uniqueDays.push("2023-01-01"); // Default day if no data
  console.warn("No unique days found in data, using default value");
}

// Group data by day
const dayGroups = {};
uniqueDays.forEach((date, index) => {
  dayGroups[`day${index+1}`] = heatmapData.filter(d => formatDate(d.time) === date);
});

// Log day groups to verify data
console.log("Day groups:", Object.keys(dayGroups));
console.log("First day data:", dayGroups.day1 ? dayGroups.day1.slice(0, 5) : "No data for day1");
console.log("Unique days count:", uniqueDays.length);
console.log("Unique days:", uniqueDays);

// Group data by hour for hourly trends
const hourlyGroups = d3.groups(heatmapData, d => d.time.getHours());
const hourlyData = hourlyGroups.map(([hour, values]) => {
  const result = { hour };

  // Group by damage type
  const byDamageType = d3.groups(values, d => d.damageType);
  byDamageType.forEach(([type, typeValues]) => {
    result[type] = d3.mean(typeValues, d => d.value);
  });

  return result;
}).sort((a, b) => a.hour - b.hour);

// Define time periods
const timePeriods = [
  { name: "Morning", start: 6, end: 11, values: {} },
  { name: "Afternoon", start: 12, end: 17, values: {} },
  { name: "Evening", start: 18, end: 23, values: {} },
  { name: "Night", start: 0, end: 5, values: {} }
];

// Aggregate data by time period
timePeriods.forEach(period => {
  Object.keys(damageTypeLabels).forEach(type => {
    const relevantHours = hourlyData.filter(d =>
      d.hour >= period.start && d.hour <= period.end && d[type] !== undefined);

    const validValues = relevantHours
      .map(d => d[type])
      .filter(v => v !== null && v !== undefined);

    period.values[type] = validValues.length > 0
      ? d3.mean(validValues)
      : null;
  });
});

// Calculate max values for scales
const heatmapMax = d3.max(heatmapData.map(d => d.value));

// Create dashboard state for interactivity
const createDashboardState = () => ({
  selectedDay: "day1", // Default to first day
  damageTypeFilter: "all",
  timePeriodFilter: "all",
  uncertaintyThreshold: 3.0,
  visibleDamageTypes: new Set(Object.keys(damageTypeLabels)),
  timeWindowPosition: 0 // Position in the time window slider
});

// Initialize dashboard state
const dashboardState = createDashboardState();

console.log("Loaded uncertainty data:", uncertaintyData.slice(0, 3));
console.log("Hourly data:", hourlyData);
console.log("Time periods:", timePeriods);
console.log("Unique days:", uniqueDays);
console.log("Heatmap max value:", heatmapMax);
```

```js
// Load average damage data (location-based)
const avgDamageData = await FileAttachment("data/avgdamage.csv").csv({typed: true});

// Prepare data for network diagram
const locations = Array.from({ length: 19 }, (_, i) => i + 1);
const timeValues = [...new Set(avgDamageData.map(d => d.time_5min))].sort((a, b) =>
  new Date(a) - new Date(b)
);

// Define neighbor links for network diagram
const neighborLinks = {
  1: [2, 5],
  2: [1, 5, 6, 3],
  3: [2, 15, 14, 4],
  4: [3, 14, 19, 18, 13, 12],
  5: [1, 2, 6, 16, 19, 17],
  6: [2, 5, 16, 15],
  7: [12, 11, 8],
  8: [9, 10, 11, 7],
  9: [17, 13, 10, 8],
  10: [8, 9, 13, 12, 11],
  11: [10, 13, 12, 7, 8],
  12: [4, 13, 10, 11, 7],
  13: [4, 12, 18, 17, 9, 10, 11],
  14: [3, 4, 19, 16, 15, 18],
  15: [2, 3, 14, 19, 16, 6],
  16: [6, 15, 14, 19, 5],
  17: [19, 18, 13, 9, 5],
  18: [4, 14, 19, 17, 13],
  19: [14, 4, 18, 17, 5, 16, 15]
};

// Calculate node positions in a circular layout
const layoutRadius = 1.5;
const angleStep = (2 * Math.PI) / locations.length;
const locationPositions = Object.fromEntries(
  locations.map((loc, i) => [
    loc,
    {
      x: Math.cos(i * angleStep) * layoutRadius,
      y: Math.sin(i * angleStep) * layoutRadius
    }
  ])
);

// Load location-based uncertainty data
const locationUncertaintyData = await FileAttachment("data/uncertainty2.csv").csv({typed: true});

// Create flattened data for bubble chart
const bubbleData = locationUncertaintyData.flatMap(d =>
  Object.keys(d)
    .filter(key => key !== "location" && key !== "time_5min")
    .map(damageType => ({
      time: parseTime(d.time_5min),
      location: +d.location,
      damageType: damageType,
      value: +d[damageType],
      size: +d[damageType]
    }))
);

console.log("Average damage data:", avgDamageData.slice(0, 3));
console.log("Location uncertainty data:", locationUncertaintyData.slice(0, 3));
```

```js
// Create dashboard CSS
const dashboardStyle = html`<style>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Default even columns if not specified inline */
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr !important; /* Override any inline column settings on mobile */
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
}

.dashboard-overview {
  background: rgba(42, 157, 143, 0.1);
  border: 1px solid rgba(42, 157, 143, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.analysis-card {
  background: rgba(38, 70, 83, 0.1);
  border: 1px solid rgba(38, 70, 83, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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
  align-items: flex-start;
  justify-content: space-between;
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow control groups to shrink below 180px on small screens */
  flex: 1 1 150px; /* Grow, shrink, and base width */
  max-width: 200px; /* Maximum width to prevent too wide controls */
  margin-bottom: 0.5rem;
}

.control-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${colors.primary};
  display: block;
  font-size: 0.9rem;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Value display for sliders */
.control-value-display {
  text-align: center;
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: white;
  background-color: rgba(42, 157, 143, 0.2);
  border-radius: 4px;
  padding: 2px 4px;
}

/* Action buttons */
.action-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.action-button:hover {
  background-color: #38b2a0;
}

.action-button:active {
  transform: translateY(1px);
}

h2, h3 {
  color: ${colors.primary};
  margin-top: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  height: 100%;
  table-layout: fixed;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
  vertical-align: middle;
}

th {
  background-color: rgba(42, 157, 143, 0.2);
  font-weight: bold;
  height: 50px;
}

/* Ensure rows take up available space */
tbody {
  height: 100%;
}

tbody tr {
  height: calc(100% / 4); /* For 4 time periods */
}

tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05);
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.data-cell {
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

/* Make first column larger since it contains the time period name */
table th:first-child,
table td:first-child {
  width: 30%;
  font-weight: bold;
}

/* Heatmap */
.heatmap-container {
  overflow-x: auto;
  margin: 1.5rem 0;
}

#overview-heatmap-container {
  height: 180px !important;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

#day-heatmap-container {
  height: auto !important; /* Auto height to fit content */
  min-height: 0 !important; /* Remove min-height constraint */
  overflow-x: auto; /* Allow only horizontal scrolling */
  overflow-y: hidden; /* Prevent vertical scrolling */
  max-width: 100%;
}

.heatmap-table {
  width: 100%;
  height: 800px;
  border-collapse: collapse;
  table-layout: fixed;
}

.heatmap-table th {
  background-color: ${colors.background.dark};
  text-align: center;
  padding: 16px;
  font-size: 1.4rem; /* Increased font size */
}

.heatmap-table td {
  padding: 20px;
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem; /* Increased font size */
  cursor: pointer;
  transition: transform 0.2s;
}

.heatmap-table td:hover {
  transform: scale(1.1);
  z-index: 10;
}

/* Selected row */
.selected-row {
  background-color: rgba(42, 157, 143, 0.2) !important;
}

/* Legend */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.legend-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.legend-item.inactive {
  opacity: 0.4;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Network diagram */
.network-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.network-slider-container {
  margin-top: 10px;
}

.network-time-label {
  margin-top: 5px;
  font-style: italic;
}

/* Range input styling */
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

/* Bubble chart controls */
.bubble-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

/* Above threshold */
.above-threshold {
  border: 2px solid ${colors.secondary} !important;
}

/* Debug info */
.debug-info {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-controls {
    flex-direction: row; /* Keep row layout but ensure wrapping */
    justify-content: flex-start;
  }

  .control-group {
    flex: 1 1 120px; /* Slightly smaller on mobile */
  }

  .legend {
    flex-direction: column;
    align-items: flex-start;
  }

  /* Adjust overview heatmap for smaller screens */
  #overview-heatmap-container {
    height: 150px !important;
  }

  /* Smaller margins */
  .dashboard-card {
    padding: 1rem;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .dashboard-controls {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .control-group {
    flex: 1 1 100%; /* Full width on very small screens */
    max-width: 100%;
  }

  /* Stack controls more efficiently */
  .dashboard-grid {
    gap: 1rem;
  }
}
</style>`;

// Apply styles
display(dashboardStyle);
```

```js
// Create HTML containers for the dashboard
html`
<div class="dashboard-overview">
  <h2>Temporal Patterns in Uncertainty Data</h2>
  <p>
    This dashboard analyzes how uncertainty in damage reports changes over time following the earthquake.
    We examine patterns by hour of day and compare trends across different damage types.
  </p>
</div>

<div class="dashboard-controls">
  <div class="control-group">
    <label for="damage-type-filter">Damage Type</label>
    <select id="damage-type-filter">
      <!-- This will be populated with damage types programmatically -->
      <option value="all">All Damage Types</option>
    </select>
  </div>

  <div class="control-group">
    <label for="time-period">Time Period</label>
    <select id="time-period">
      <option value="all">All Time Periods</option>
      <option value="morning">Morning (6:00-11:59)</option>
      <option value="afternoon">Afternoon (12:00-17:59)</option>
      <option value="evening">Evening (18:00-23:59)</option>
      <option value="night">Night (00:00-5:59)</option>
    </select>
  </div>

  <div class="control-group">
    <label for="day-select">Day</label>
    <select id="day-select">
      <!-- This will be populated with options either through template or JavaScript -->
      <option value="day1">Loading days...</option>
    </select>
  </div>

  <div class="control-group">
    <label for="time-window">Time Window</label>
    <div class="control-value-display">
      <span id="time-window-value">0-24</span>
    </div>
    <input type="range" id="time-window-slider" min="0" max="0" step="1" value="0" title="Slide to navigate through time periods">
  </div>

  <div class="control-group">
    <label for="uncertainty-threshold">Uncertainty Threshold</label>
    <div class="control-value-display">
      <span id="threshold-value">3.0</span>
    </div>
    <input type="range" id="uncertainty-threshold" min="0" max="5" step="0.1" value="3.0" title="Adjust threshold for highlighting high uncertainty">
  </div>

  <div class="control-group">
    <label>Actions</label>
    <button id="reset-button" class="action-button">Reset Filters</button>
  </div>
</div>

<h2>Uncertainty Overtime by Damage Type</h2>

<div class="analysis-card dashboard-card full-width">
  <div class="dashboard-title">Timeline Overview</div>
  <p>This compact overview shows the entire timeline. Click on a region to focus on those hours.</p>
  <div id="overview-heatmap-container" style="height: 180px; overflow-x: auto; overflow-y: hidden; margin-bottom: 20px; background-color: rgba(38, 70, 83, 0.3); border-radius: 4px; padding: 10px 0;"></div>

  <div class="dashboard-title">Daily Uncertainty Heatmap (24hr Window)</div>
  <p>This detailed heatmap shows how uncertainty levels vary by damage type throughout the day. Cells represent the standard deviation in reported values.</p>
  <div id="day-heatmap-container"></div>
</div>

<div class="dashboard-card full-width">
  <div class="dashboard-title">Hourly Uncertainty Patterns</div>
  <div id="hourly-chart-container" style="width: 100%;"></div>
  <div id="hourly-legend" class="legend"></div>
</div>

<div class="dashboard-card full-width">
  <div class="dashboard-title">Time Period Analysis</div>
  <div id="time-period-container" style="min-height: 300px; width: 100%;"></div>
</div>

<h2>Region Damage Change Overtime</h2>

<div class="analysis-card dashboard-card full-width">
  <div class="dashboard-title">Network Diagram of Region Damage</div>
  <p>This interactive diagram shows how damage spreads across neighboring regions over time.</p>
  <div id="network-container" class="network-container"></div>
</div>

<h2>Damage Uncertainty by Location</h2>

<div class="analysis-card dashboard-card full-width">
  <div class="dashboard-title">Bubble Chart: Uncertainty by Location</div>
  <p>This chart shows how uncertainty in damage reports varies by location over time.</p>
  <div id="bubble-chart-container" class="bubble-chart-container"></div>
</div>
`
```

```js
// Function to get color for uncertainty value
function getUncertaintyColor(value) {
  if (value === null || value === undefined) return "#444444";
  // Use the same high-contrast color scale as the heatmaps
  const scale = d3.scaleLinear()
    .domain([0, heatmapMax * 0.3, heatmapMax])
    .range(["#f7fbff", "#fdae61", "#d73027"]);
  return scale(value);
}

// Function to get text color based on background color
function getTextColor(value) {
  if (value === null || value === undefined) return "black";
  return value > heatmapMax/2 ? "white" : "black";
}

// Function to create an enlarged heatmap for a specific day using D3
function renderDayHeatmap() {
  const container = document.getElementById("day-heatmap-container");

  // Clear previous content
  container.innerHTML = "";

  // Get data for the selected day
  const selectedDayData = dayGroups[dashboardState.selectedDay] || [];

  console.log("Rendering heatmap for day:", dashboardState.selectedDay);
  console.log("Selected day data count:", selectedDayData.length);

  if (selectedDayData.length === 0) {
    container.innerHTML = `<div class="debug-info">No data available for selected day: ${dashboardState.selectedDay}</div>`;
    return;
  }

  // Extract only HH:MM from the time_string
  const timeFormat = d => {
    const timeString = d.time_string;
    return timeString.split(" ")[1].substring(0, 5); // Just get HH:MM
  };

  // Group by unique time strings
  const timeGroups = d3.groups(selectedDayData, timeFormat);
  timeGroups.sort((a, b) => {
    const timeA = a[0];
    const timeB = b[0];
    return timeA.localeCompare(timeB);
  });

  // Filter to show only 24 hours of data
  // If there are more than 24 time points, we'll use a slider later
  let uniqueTimes = timeGroups.map(group => group[0]);

  // If we have too many time points, limit to 24 (or fewer if that's all we have)
  const maxTimePoints = 24;
  const allTimePoints = uniqueTimes.length;

  // Update the time window slider's max value
  const timeWindowSlider = document.getElementById("time-window-slider");
  if (timeWindowSlider) {
    // Max position is the number of possible starting positions
    const maxSliderValue = Math.max(0, allTimePoints - maxTimePoints);
    timeWindowSlider.max = maxSliderValue;
    timeWindowSlider.disabled = maxSliderValue <= 0;
  }

  if (allTimePoints > maxTimePoints) {
    // Use the dashboard state's time window position
    const maxStartIndex = allTimePoints - maxTimePoints;
    const startIndex = Math.min(Math.max(0, dashboardState.timeWindowPosition), maxStartIndex);

    // Take only 24 consecutive times
    uniqueTimes = uniqueTimes.slice(startIndex, startIndex + maxTimePoints);

    // Update the display value
    const timeWindowValue = document.getElementById("time-window-value");
    if (timeWindowValue) {
      timeWindowValue.textContent = `${startIndex+1}-${startIndex+uniqueTimes.length} of ${allTimePoints}`;
    }

    console.log(`Showing time window ${startIndex+1}-${startIndex+uniqueTimes.length} of ${allTimePoints} total time points`);
  } else {
    // Update the display value for small datasets
    const timeWindowValue = document.getElementById("time-window-value");
    if (timeWindowValue) {
      timeWindowValue.textContent = `All ${allTimePoints} time points`;
    }
  }

  // Get sorted list of damage types, filtered if a specific one is selected
  let damageTypes = Object.keys(damageTypeLabels);

  // Filter to show only the selected damage type if one is specifically chosen
  if (dashboardState.damageTypeFilter !== "all") {
    console.log("Filtering heatmap to show only:", dashboardState.damageTypeFilter);
    damageTypes = [dashboardState.damageTypeFilter];
  }

  // Prepare data for D3 heatmap
  const heatmapData = [];

  damageTypes.forEach((damageType, row) => {
    uniqueTimes.forEach((time, col) => {
      // Find the value for this damage type and time
      const values = timeGroups[col][1];
      const found = values.find(d => d.damageType === damageType);
      const value = found ? found.value : null;

      heatmapData.push({
        row,
        col,
        damageType,
        time,
        value,
        isAboveThreshold: value !== null && value > dashboardState.uncertaintyThreshold
      });
    });
  });

  // Get container width
  const containerWidth = container.clientWidth || 800;

  // Adjusted margins - increased top margin for label positioning
  const margin = { top: 90, right: 40, bottom: 80, left: 180 };
  const availableWidth = containerWidth - margin.left - margin.right;

  // Set much smaller fixed cell width for a more compact display
  // This reduces the need for horizontal scrolling
  const cellWidth = 60; // Much smaller fixed width for each cell

  // Decrease cell height to make more compact
  const cellHeight = 120;

  const width = uniqueTimes.length * cellWidth + margin.left + margin.right;
  const height = damageTypes.length * cellHeight + margin.top + margin.bottom;

  // Create SVG with actual height and scrollable width
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width) // Use actual calculated width for horizontal scrolling
    .attr("height", height) // Use actual calculated height
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid meet") // Use xMin to align left
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define color scale with higher contrast
  const colorScale = d3.scaleLinear()
    .domain([0, heatmapMax * 0.3, heatmapMax]) // Use three-point scale for higher contrast in middle ranges
    .range(["#f7fbff", "#fdae61", "#d73027"]) // White -> Orange -> Red for better contrast
    .clamp(true)
    .unknown("#444444"); // Darker gray for missing values for better contrast

  // Add row labels (damage types) - Adjusted font size for smaller cells
  svg.selectAll(".row-label")
    .data(damageTypes)
    .enter()
    .append("text")
    .attr("class", "row-label")
    .attr("x", -20)
    .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "16px") // Smaller font size for more compact display
    .attr("font-weight", d => (dashboardState.damageTypeFilter === d) ? "bold" : "normal")
    .attr("fill", "white")
    .text(d => damageTypeLabels[d])
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      // Toggle damage type filter
      dashboardState.damageTypeFilter = (dashboardState.damageTypeFilter === d) ? "all" : d;

      // Update the dropdown to match
      document.getElementById("damage-type-filter").value = dashboardState.damageTypeFilter;

      // Re-render all components
      updateDashboard();
    });

  // Add column labels (times) - Positioned higher to avoid overlap with cells
  svg.selectAll(".col-label")
    .data(uniqueTimes)
    .enter()
    .append("text")
    .attr("class", "col-label")
    .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
    .attr("y", -35) // Moved significantly higher up to avoid overlapping with cells
    .attr("transform", (d, i) => `rotate(-60, ${i * cellWidth + cellWidth / 2}, -35)`) // Adjusted rotation point
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("fill", "white")
    .text(d => d);

  // Create cell groups for the heatmap
  const cells = svg.selectAll(".cell")
    .data(heatmapData)
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr("transform", d => `translate(${d.col * cellWidth}, ${d.row * cellHeight})`)
    .style("cursor", "pointer");

  // Add cell rectangles with values - more compact grid appearance
  cells.append("rect")
    .attr("width", cellWidth - 1) // Minimal gap between cells
    .attr("height", cellHeight - 1)
    .attr("fill", d => d.value === null ? colorScale.unknown() : colorScale(d.value))
    .attr("stroke", d => d.isAboveThreshold ? colors.secondary : "none")
    .attr("stroke-width", d => d.isAboveThreshold ? 2 : 0)
    .attr("rx", 2) // Less rounded corners for more grid-like appearance
    .attr("ry", 2);

  // No text in cells, just comprehensive tooltips
  cells.append("title")
    .text(d => `${damageTypeLabels[d.damageType]} at ${d.time}: ${d.value === null ? "N/A" : d.value.toFixed(2)}`);

  // Add a color legend - smaller for more compact display
  const legendWidth = 200;
  const legendHeight = 15;

  const legendX = (uniqueTimes.length * cellWidth - legendWidth) / 2;
  const legendY = damageTypes.length * cellHeight + 30;

  // Create gradient for legend
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "heatmap-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale.range()[0]);

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale.range()[1]);

  // Legend rectangle
  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#heatmap-gradient)");

  // Legend axis - more ticks
  const legendScale = d3.scaleLinear()
    .domain([0, heatmapMax])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d => d.toFixed(1));

  svg.append("g")
    .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
    .call(legendAxis)
    .selectAll("text")
    .style("fill", "white")
    .style("font-size", "12px");

  // Legend title
  svg.append("text")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", "14px")
    .text("Uncertainty Value");

  // Add threshold indicator on legend
  svg.append("line")
    .attr("x1", legendX + legendScale(dashboardState.uncertaintyThreshold))
    .attr("y1", legendY - 10)
    .attr("x2", legendX + legendScale(dashboardState.uncertaintyThreshold))
    .attr("y2", legendY + legendHeight + 10)
    .attr("stroke", colors.secondary)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,2");

  svg.append("text")
    .attr("x", legendX + legendScale(dashboardState.uncertaintyThreshold))
    .attr("y", legendY + legendHeight + 30)
    .attr("text-anchor", "middle")
    .attr("fill", colors.secondary)
    .attr("font-size", "12px")
    .text(`Threshold: ${dashboardState.uncertaintyThreshold.toFixed(1)}`);

  // Add highlighting interaction
  cells.on("mouseover", function(event, d) {
    // Highlight row
    svg.selectAll(".cell")
      .filter(cell => cell.row === d.row)
      .select("rect")
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Highlight column
    svg.selectAll(".cell")
      .filter(cell => cell.col === d.col)
      .select("rect")
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Also highlight the corresponding row label
    svg.selectAll(".row-label")
      .filter((_, i) => i === d.row)
      .attr("font-weight", "bold")
      .attr("fill", colors.primary);

    // And highlight column label
    svg.selectAll(".col-label")
      .filter((_, i) => i === d.col)
      .attr("font-weight", "bold")
      .attr("fill", colors.primary);
  });

  cells.on("mouseout", function(event, d) {
    // Reset row
    svg.selectAll(".cell")
      .filter(cell => cell.row === d.row)
      .select("rect")
      .attr("opacity", 1)
      .attr("stroke", cell => cell.isAboveThreshold ? colors.secondary : "none")
      .attr("stroke-width", cell => cell.isAboveThreshold ? 2 : 0);

    // Reset column
    svg.selectAll(".cell")
      .filter(cell => cell.col === d.col)
      .select("rect")
      .attr("opacity", 1)
      .attr("stroke", cell => cell.isAboveThreshold ? colors.secondary : "none")
      .attr("stroke-width", cell => cell.isAboveThreshold ? 2 : 0);

    // Reset row label
    svg.selectAll(".row-label")
      .filter((_, i) => i === d.row)
      .attr("font-weight", label => (dashboardState.damageTypeFilter === damageTypes[d.row]) ? "bold" : "normal")
      .attr("fill", "white");

    // Reset column label
    svg.selectAll(".col-label")
      .filter((_, i) => i === d.col)
      .attr("font-weight", "normal")
      .attr("fill", "white");
  });

  // Add click action for cells
  cells.on("click", (event, d) => {
    // Toggle damage type filter
    dashboardState.damageTypeFilter = (dashboardState.damageTypeFilter === d.damageType) ? "all" : d.damageType;

    // Update the dropdown to match
    document.getElementById("damage-type-filter").value = dashboardState.damageTypeFilter;

    // Re-render all components
    updateDashboard();
  });
}

// Render hourly trends chart
function renderHourlyChart() {
  const container = document.getElementById("hourly-chart-container");
  container.innerHTML = '';

  // Create legend items
  const legendContainer = document.getElementById("hourly-legend");
  legendContainer.innerHTML = Object.entries(damageTypeLabels)
    .map(([key, label]) => {
      const isActive = dashboardState.visibleDamageTypes.has(key);
      return `
        <div class="legend-item ${isActive ? '' : 'inactive'}" data-type="${key}">
          <div class="legend-color" style="background-color: ${colors.damage[key]};"></div>
          <span>${label}</span>
        </div>
      `;
    })
    .join('');

  // Add click events to legend items
  legendContainer.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', function() {
      const damageType = this.getAttribute('data-type');

      // Toggle visibility
      if (dashboardState.visibleDamageTypes.has(damageType)) {
        dashboardState.visibleDamageTypes.delete(damageType);
        this.classList.add('inactive');
      } else {
        dashboardState.visibleDamageTypes.add(damageType);
        this.classList.remove('inactive');
      }

      // Re-render the chart
      renderHourlyChart();
    });
  });

  // Filter for visible damage types
  const visibleTypes = Array.from(dashboardState.visibleDamageTypes);

  // Set up dimensions - responsive
  const width = container.clientWidth;
  const height = Math.max(350, Math.min(500, window.innerHeight * 0.4));
  const margin = {top: 30, right: 50, bottom: 60, left: 60};

  // Create SVG with responsive sizing
  const svg = d3.select(container)
    .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const x = d3.scaleLinear()
    .domain([0, 23])
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(hourlyData, d => {
      return d3.max(visibleTypes, type => d[type] || 0);
    }) * 1.1])
    .range([height - margin.top - margin.bottom, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(h => `${h}:00`))
    .selectAll("text")
      .style("fill", "white");

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("fill", "white");

  // Add labels
  svg.append("text")
    .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${height - margin.top})`)
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text("Hour of Day");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -((height - margin.top - margin.bottom) / 2))
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text("Uncertainty (Std Dev)");

  // Add threshold line
  svg.append("line")
    .attr("x1", 0)
    .attr("y1", y(dashboardState.uncertaintyThreshold))
    .attr("x2", width - margin.left - margin.right)
    .attr("y2", y(dashboardState.uncertaintyThreshold))
    .attr("stroke", colors.secondary)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

  // Add lines for each visible damage type
  visibleTypes.forEach(type => {
    // Filter out null values
    const lineData = hourlyData
      .map(d => ({hour: d.hour, value: d[type]}))
      .filter(d => d.value !== null && d.value !== undefined);

    if (lineData.length < 2) return; // Need at least 2 points for a line

    // Add line
    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", colors.damage[type])
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(d => x(d.hour))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX)
      );

    // Add points
    svg.selectAll(`.point-${type}`)
      .data(lineData)
      .enter()
      .append("circle")
        .attr("class", `point-${type}`)
        .attr("cx", d => x(d.hour))
        .attr("cy", d => y(d.value))
        .attr("r", 5)
        .attr("fill", colors.damage[type])
        .attr("stroke", "white")
        .attr("stroke-width", 1);
  });
}

// Render time period analysis table
function renderTimePeriodTable() {
  const container = document.getElementById("time-period-container");

  // Get container width - same approach as hourly chart
  const containerWidth = container.clientWidth || window.innerWidth - 40;

  // Create table headers
  const headers = ['Time Period', ...Object.values(damageTypeLabels)].map(
    (header, index) => {
      // First column (Time Period) gets appropriate width, but not too much
      const width = index === 0 ? '15%' : `${85 / Object.values(damageTypeLabels).length}%`;
      return `<th style="width: ${width};">${header}</th>`;
    }
  ).join('');

  // Create table rows
  const rows = timePeriods.map(period => {
    // Check if this period is selected
    const isSelected = dashboardState.timePeriodFilter === period.name.toLowerCase();
    const rowClass = isSelected ? 'selected-row' : '';

    // Create cells
    const cells = Object.keys(damageTypeLabels).map(type => {
      const value = period.values[type];
      const displayValue = value !== null ? value.toFixed(2) : "N/A";

      // Check if value is above threshold
      const isAboveThreshold = value !== null && value > dashboardState.uncertaintyThreshold;

      // Create cell with appropriate styling
      // Add background color with higher contrast based on value intensity
      let bgColor = "transparent";
      if (value !== null) {
        // Use the same high-contrast color scale as the heatmaps
        let color;
        if (value <= heatmapMax * 0.3) {
          // Linear interpolation between white and orange
          const intensity = value / (heatmapMax * 0.3);
          color = d3.interpolateRgb("#f7fbff", "#fdae61")(intensity);
        } else {
          // Linear interpolation between orange and red
          const intensity = (value - heatmapMax * 0.3) / (heatmapMax * 0.7);
          color = d3.interpolateRgb("#fdae61", "#d73027")(intensity);
        }
        // Add transparency for background
        const rgb = d3.color(color).rgb();
        bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`; // Higher opacity for better contrast
      }

      const cellClass = isAboveThreshold ? 'above-threshold' : '';
      return `<td class="data-cell ${cellClass}" style="background-color: ${bgColor};">${displayValue}</td>`;
    }).join('');

    return `<tr class="${rowClass}" data-period="${period.name.toLowerCase()}" style="cursor: pointer; transition: background-color 0.2s;">
              <td style="font-size: 1.1rem;">${period.name}<br><span style="font-size: 0.8rem; opacity: 0.8;">(${period.start}:00-${period.end}:59)</span></td>
              ${cells}
            </tr>`;
  }).join('');

  // Create the table with precise width matching the hourly chart
  container.innerHTML = `
    <table style="width: ${containerWidth}px; height: 100%;">
      <thead>
        <tr>${headers}</tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  // Add click event to rows
  container.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', function() {
      const period = this.getAttribute('data-period');

      // Update filter
      dashboardState.timePeriodFilter =
        dashboardState.timePeriodFilter === period ? "all" : period;

      // Update selector
      document.getElementById("time-period").value = dashboardState.timePeriodFilter;

      // Re-render all components
      updateDashboard();
    });
  });
}

// Function to render network diagram - FULLY FIXED to remove N/A
function renderNetworkDiagram() {
  const container = document.getElementById("network-container");

  // Create controls
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "network-controls";

  // Damage type dropdown
  const damageTypeLabel = document.createElement("label");
  damageTypeLabel.textContent = "Damage Type:";
  damageTypeLabel.setAttribute("for", "network-damage-type");

  const damageTypeSelect = document.createElement("select");
  damageTypeSelect.id = "network-damage-type";

  Object.entries(damageTypeLabels).forEach(([key, label]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    damageTypeSelect.appendChild(option);
  });

  // Time slider
  const sliderLabel = document.createElement("label");
  sliderLabel.textContent = "Time:";
  sliderLabel.setAttribute("for", "network-time-slider");

  const sliderContainer = document.createElement("div");
  sliderContainer.className = "network-slider-container";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = "network-time-slider";
  slider.min = "0";
  slider.max = (timeValues.length - 1).toString();
  slider.value = "0";

  const timeLabel = document.createElement("div");
  timeLabel.className = "network-time-label";
  timeLabel.textContent = `Time: ${timeValues[0]}`;

  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(timeLabel);

  // Add controls to container
  controlsDiv.appendChild(damageTypeLabel);
  controlsDiv.appendChild(damageTypeSelect);
  controlsDiv.appendChild(sliderLabel);
  controlsDiv.appendChild(sliderContainer);

  container.innerHTML = '';
  container.appendChild(controlsDiv);

  // Create diagram container - responsive height
  const diagramContainer = document.createElement("div");
  diagramContainer.id = "network-diagram";
  diagramContainer.style.width = "100%";
  diagramContainer.style.height = Math.max(600, Math.min(800, window.innerHeight * 0.6)) + "px";
  diagramContainer.style.backgroundColor = "#4292c6";
  container.appendChild(diagramContainer);

  // Function to create network diagram
  function createNetworkDiagram() {
    const selectedTime = timeValues[slider.value];
    const selectedDamage = damageTypeSelect.value;

    timeLabel.textContent = `Time: ${selectedTime}`;

    // Get data for the selected time
    const dataAtTime = Object.fromEntries(
      avgDamageData
        .filter(d => d.time_5min === selectedTime)
        .map(d => [d.location, d])
    );

    // Calculate max value for scaling
    const values = Object.values(dataAtTime)
      .map(d => parseFloat(d[selectedDamage]))
      .filter(v => !isNaN(v));

    const maxValue = values.length > 0 ? Math.max(...values) : 1;

    // Function to scale circle size
    function scaleSize(value, maxValue) {
      if (value === null || value === undefined || isNaN(value)) return 20; // Default size for missing data

      const minRadius = 20;
      const maxRadius = 100;
      // Normalize the value
      const normalizedValue = maxValue > 0 ? value / maxValue : 0.5;
      return minRadius + (normalizedValue * (maxRadius - minRadius));
    }

    // Create nodes and links
    const nodes = locations.map(loc => {
      const locData = dataAtTime[loc];
      let value = locData ? parseFloat(locData[selectedDamage]) : null;
      const isMissing = value === null || value === undefined || isNaN(value);

      // Keep the raw value for display - CHANGED: use empty string instead of "N/A"
      const displayValue = isMissing ? "" : value.toFixed(2);

      // Set a default value for visualization purpose if missing
      if (isMissing) value = 0;

      return {
        id: loc,
        x: locationPositions[loc].x,
        y: locationPositions[loc].y,
        r: scaleSize(value, maxValue),
        fill: isMissing ? "#e76f51" : "#4292c6", // Red for missing, blue for data
        opacity: isMissing ? 0.7 : 0.9,
        stroke: "white",
        strokeWidth: 1,
        value: displayValue,
        isMissing: isMissing
      };
    });

    const links = [];
    for (const [source, targets] of Object.entries(neighborLinks)) {
      for (const target of targets) {
        // Create links in both directions for better visualization
        links.push({
          source: +source,
          target,
          x1: locationPositions[source].x,
          y1: locationPositions[source].y,
          x2: locationPositions[target].x,
          y2: locationPositions[target].y
        });
      }
    }

    // Clear previous diagram
    d3.select("#network-diagram").html("");

    // Set up dimensions
    const width = diagramContainer.clientWidth;
    const height = diagramContainer.clientHeight;

    // Create SVG
    const svg = d3.select("#network-diagram")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "-2 -2 4 4")
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Add links
    svg.selectAll("line")
      .data(links)
      .enter()
      .append("line")
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke", "white")
        .attr("stroke-width", 0.02)
        .attr("stroke-opacity", 0.5);

    // Add node groups
    const nodeGroups = svg.selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Add circles for nodes
    nodeGroups.append("circle")
      .attr("r", d => d.r / 100) // Scale down for the viewBox
      .attr("fill", d => d.fill)
      .attr("opacity", d => d.opacity)
      .attr("stroke", d => d.stroke)
      .attr("stroke-width", d => d.strokeWidth / 100);

    // Add labels for IDs only
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.0em")
      .attr("fill", "white")
      .attr("font-size", "0.15px")
      .attr("font-weight", "bold")
      .text(d => d.id);

    // Add labels for values - BUT ONLY FOR NON-MISSING VALUES
    nodeGroups.filter(d => !d.isMissing)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "white")
      .attr("font-size", "0.12px")
      .text(d => d.value);

    // Add title element for tooltip
    nodeGroups.append("title")
      .text(d => {
        const tooltipValue = d.isMissing ? "No data available" : d.value;
        return `Location: ${d.id}\nValue: ${tooltipValue}`;
      });
  }

  // Set up event listeners
  damageTypeSelect.addEventListener("change", createNetworkDiagram);
  slider.addEventListener("input", createNetworkDiagram);

  // Initial render
  createNetworkDiagram();
}

// Function to render bubble chart
function renderBubbleChart() {
  const container = document.getElementById("bubble-chart-container");

  // Create controls
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "bubble-controls";

  // Damage type dropdown
  const damageTypeLabel = document.createElement("label");
  damageTypeLabel.textContent = "Damage Type:";
  damageTypeLabel.setAttribute("for", "bubble-damage-type");

  const damageTypeSelect = document.createElement("select");
  damageTypeSelect.id = "bubble-damage-type";

  Object.entries(damageTypeLabels).forEach(([key, label]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    damageTypeSelect.appendChild(option);
  });

  // Add controls to container
  controlsDiv.appendChild(damageTypeLabel);
  controlsDiv.appendChild(damageTypeSelect);

  container.innerHTML = '';
  container.appendChild(controlsDiv);

  // Create chart container - responsive height
  const chartContainer = document.createElement("div");
  chartContainer.id = "bubble-chart";
  // Responsive height based on viewport
  chartContainer.style.height = Math.max(500, Math.min(700, window.innerHeight * 0.5)) + "px";
  container.appendChild(chartContainer);

  // Function to update the bubble chart
  function updateBubbleChart() {
    const selectedDamage = damageTypeSelect.value;

    // Filter data for selected damage type
    const filteredData = bubbleData.filter(d => d.damageType === selectedDamage);

    // Get unique locations for y-axis
    const locationDomain = [...new Set(filteredData.map(d => d.location))].sort((a, b) => a - b);

    // Set up dimensions - fully responsive
    const containerWidth = chartContainer.clientWidth || window.innerWidth - 40;
    const containerHeight = chartContainer.clientHeight || 500;

    const width = containerWidth;
    const height = containerHeight;
    const margin = {top: 30, right: 20, bottom: 60, left: 60};

    // Clear previous chart
    d3.select("#bubble-chart").html("");

    // Create chart using Plot library - with responsive settings
    const chart = Plot.plot({
      width: width,
      height: height,
      marginLeft: margin.left,
      marginRight: margin.right,
      marginTop: margin.top,
      marginBottom: margin.bottom,
      style: {
        width: "100%",
        height: "100%",
        aspectRatio: "auto",
        maxHeight: "100%"
      },
      x: {
        type: "utc",
        label: "Time",
        tickFormat: d3.timeFormat("%m/%d %H:%M"),
        grid: true
      },
      y: {
        domain: locationDomain,
        label: "Location",
        grid: true
      },
      marks: [
        Plot.dot(filteredData, {
          x: "time",
          y: "location",
          r: d => Math.max(3, Math.sqrt(d.value) * 5),
          fill: "value",
          opacity: 0.7,
          title: d => `Location: ${d.location}\nTime: ${d3.timeFormat("%Y-%m-%d %H:%M")(d.time)}\nUncertainty: ${d.value.toFixed(2)}`
        })
      ],
      color: {
        type: "linear",
        domain: [0, d3.max(filteredData, d => d.value) * 0.3, d3.max(filteredData, d => d.value)],
        range: ["#f7fbff", "#fdae61", "#d73027"],
        legend: true
      }
    });

    d3.select("#bubble-chart").node().appendChild(chart);
  }

  // Set up event listeners
  damageTypeSelect.addEventListener("change", updateBubbleChart);

  // Initial render
  updateBubbleChart();
}

// Function to create an overview heatmap showing the entire timeline
function renderOverviewHeatmap() {
  const container = document.getElementById("overview-heatmap-container");

  // Clear previous content
  container.innerHTML = "";

  // Get data for the selected day
  const selectedDayData = dayGroups[dashboardState.selectedDay] || [];

  if (selectedDayData.length === 0) {
    container.innerHTML = `<div class="debug-info">No data available for selected day</div>`;
    return;
  }

  // Extract only HH:MM from the time_string
  const timeFormat = d => {
    const timeString = d.time_string;
    return timeString.split(" ")[1].substring(0, 5); // Just get HH:MM
  };

  // Group by unique time strings
  const timeGroups = d3.groups(selectedDayData, timeFormat);
  timeGroups.sort((a, b) => {
    const timeA = a[0];
    const timeB = b[0];
    return timeA.localeCompare(timeB);
  });

  const allTimes = timeGroups.map(group => group[0]);

  // Get the total number of time points and the current window
  const maxTimePoints = 24;
  const selectedTimeStart = Math.min(dashboardState.timeWindowPosition, Math.max(0, allTimes.length - maxTimePoints));
  const selectedTimeEnd = Math.min(selectedTimeStart + maxTimePoints, allTimes.length);

  // Get sorted list of damage types
  const damageTypes = Object.keys(damageTypeLabels);

  // Calculate average uncertainty for each time point (across all damage types)
  const averagesByTime = allTimes.map((time, timeIndex) => {
    const timeData = timeGroups[timeIndex][1];
    const values = timeData.map(d => d.value).filter(v => v !== null && v !== undefined);
    return {
      time,
      timeIndex,
      value: values.length > 0 ? d3.mean(values) : 0,
      isInSelectedWindow: timeIndex >= selectedTimeStart && timeIndex < selectedTimeEnd
    };
  });

  // Set up dimensions for overview heatmap - much more compact
  const cellWidth = 8; // Extremely narrow cells for overview to see trend at a glance
  const cellHeight = 120; // Full height for the overview
  const margin = { top: 40, right: 20, bottom: 40, left: 60 };

  const width = allTimes.length * cellWidth + margin.left + margin.right;
  const height = cellHeight + margin.top + margin.bottom;

  // Create SVG
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define color scale with higher contrast - matching the main heatmap
  const colorScale = d3.scaleLinear()
    .domain([0, heatmapMax * 0.3, heatmapMax]) // Use three-point scale for higher contrast
    .range(["#f7fbff", "#fdae61", "#d73027"]) // White -> Orange -> Red for better contrast
    .clamp(true)
    .unknown("#444444"); // Darker gray for missing values

  // Add time labels (just a few for reference) - show fewer with narrower cells
  const labelStep = Math.max(1, Math.floor(allTimes.length / 5)); // Show at most 5 labels with narrower cells
  svg.selectAll(".overview-time-label")
    .data(allTimes.filter((_, i) => i % labelStep === 0))
    .enter()
    .append("text")
    .attr("class", "overview-time-label")
    .attr("x", (d, i) => i * labelStep * cellWidth + cellWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "white")
    .text(d => {
      // Only show hours without minutes for more concise labels
      const timeParts = d.split(':');
      return timeParts[0]; // Just return hours part
    });

  // Add overview title on the Y axis
  svg.append("text")
    .attr("x", -cellHeight / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "white")
    .text("Avg Uncertainty");

  // Create cells for the heatmap
  const cells = svg.selectAll(".overview-cell")
    .data(averagesByTime)
    .enter()
    .append("g")
    .attr("class", "overview-cell")
    .attr("transform", d => `translate(${d.timeIndex * cellWidth}, 0)`)
    .style("cursor", "pointer");

  // Add rectangles for cells
  cells.append("rect")
    .attr("width", cellWidth - 1)
    .attr("height", cellHeight)
    .attr("fill", d => colorScale(d.value))
    .attr("stroke", d => d.isInSelectedWindow ? "white" : "none")
    .attr("stroke-width", d => d.isInSelectedWindow ? 2 : 0);

  // Add selection highlight - make it more visible with narrower cells
  svg.append("rect")
    .attr("class", "selection-highlight")
    .attr("x", selectedTimeStart * cellWidth)
    .attr("y", 0)
    .attr("width", Math.min(maxTimePoints, allTimes.length - selectedTimeStart) * cellWidth)
    .attr("height", cellHeight)
    .attr("fill", "rgba(255, 255, 255, 0.15)") // Slight fill for better visibility
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2") // Smaller dash pattern for narrower cells
    .attr("pointer-events", "none");

  // Add click handler to select time window
  cells.on("click", (event, d) => {
    // Calculate new position ensuring we show a full window if possible
    const newPosition = Math.min(d.timeIndex, allTimes.length - maxTimePoints);
    dashboardState.timeWindowPosition = Math.max(0, newPosition);

    // Update the slider
    const timeWindowSlider = document.getElementById("time-window-slider");
    if (timeWindowSlider) {
      timeWindowSlider.value = dashboardState.timeWindowPosition;
    }

    // Rerender the heatmaps
    renderDayHeatmap();
    renderOverviewHeatmap();
  });

  // Add tooltips
  cells.append("title")
    .text(d => `Time: ${d.time}\nAvg Uncertainty: ${d.value.toFixed(2)}`);
}

// Update dashboard based on filters
function updateDashboard() {
  // Get filter values
  const damageTypeFilter = document.getElementById("damage-type-filter").value;
  const timePeriodFilter = document.getElementById("time-period").value;
  const uncertaintyThreshold = parseFloat(document.getElementById("uncertainty-threshold").value);

  // Check if day-select element exists and has options before getting its value
  let selectedDay = "day1"; // Default value
  const daySelectElement = document.getElementById("day-select");

  // If dropdown has no options or only the placeholder, try to populate it
  if (daySelectElement && (daySelectElement.options.length === 0 ||
     (daySelectElement.options.length === 1 && daySelectElement.options[0].text === "Loading days..."))) {
    console.warn("Day select element has no options or only placeholder, populating now");

    // Clear existing options (including placeholder)
    daySelectElement.innerHTML = "";

    // Add new options if we have unique days data
    if (uniqueDays && uniqueDays.length > 0) {
      uniqueDays.forEach((day, index) => {
        const option = document.createElement("option");
        option.value = `day${index+1}`;
        option.textContent = day;
        daySelectElement.appendChild(option);
      });
      console.log("Added", uniqueDays.length, "day options to dropdown");
    } else {
      // If no unique days data, add a default option
      const option = document.createElement("option");
      option.value = "day1";
      option.textContent = "Day 1";
      daySelectElement.appendChild(option);
      console.log("No unique days found, added default day option");
    }
  }

  // Now get the selected value
  if (daySelectElement && daySelectElement.options.length > 0) {
    selectedDay = daySelectElement.value;
    console.log("Selected day:", selectedDay, "from dropdown with", daySelectElement.options.length, "options");
  } else {
    console.warn("Day select element still has issues, using default day1");
  }

  console.log("Updating dashboard with filters:", {
    damageTypeFilter,
    timePeriodFilter,
    uncertaintyThreshold,
    selectedDay
  });

  // Update state
  dashboardState.damageTypeFilter = damageTypeFilter;
  dashboardState.timePeriodFilter = timePeriodFilter;
  dashboardState.uncertaintyThreshold = uncertaintyThreshold;
  dashboardState.selectedDay = selectedDay;

  // Update visibleDamageTypes based on the filter selection
  if (damageTypeFilter === "all") {
    // Show all damage types
    dashboardState.visibleDamageTypes = new Set(Object.keys(damageTypeLabels));
  } else {
    // Show only the selected damage type
    dashboardState.visibleDamageTypes = new Set([damageTypeFilter]);
  }

  // Log current state for debugging
  console.log("Dashboard state updated:", {
    damageType: dashboardState.damageTypeFilter,
    timePeriod: dashboardState.timePeriodFilter,
    threshold: dashboardState.uncertaintyThreshold,
    day: dashboardState.selectedDay
  });

  // Display current threshold value
  document.getElementById("threshold-value").textContent = uncertaintyThreshold.toFixed(1);

  // Render all components
  renderOverviewHeatmap(); // Render the overview first
  renderDayHeatmap();
  renderHourlyChart();
  renderTimePeriodTable();

  // Render network and bubble charts separately to avoid UI freezing
  setTimeout(() => {
    try {
      renderNetworkDiagram();
      console.log("Network diagram rendered successfully");
    } catch (e) {
      console.error("Error rendering network diagram:", e);
    }
  }, 100);

  setTimeout(() => {
    try {
      renderBubbleChart();
      console.log("Bubble chart rendered successfully");
    } catch (e) {
      console.error("Error rendering bubble chart:", e);
    }
  }, 200);
}

// Initialize event listeners
function initializeEventListeners() {
  // Damage type filter - make sure it updates the dashboard
  document.getElementById("damage-type-filter").addEventListener("change", function() {
    console.log("Damage type changed to:", this.value);
    dashboardState.damageTypeFilter = this.value;
    updateDashboard();
  });

  // Time period filter
  document.getElementById("time-period").addEventListener("change", function() {
    updateDashboard();
  });

  // Day select
  document.getElementById("day-select").addEventListener("change", function() {
    // Reset time window position when day changes
    dashboardState.timeWindowPosition = 0;
    if (document.getElementById("time-window-slider")) {
      document.getElementById("time-window-slider").value = 0;
    }
    updateDashboard();
  });

  // Time window slider
  document.getElementById("time-window-slider").addEventListener("input", function() {
    dashboardState.timeWindowPosition = parseInt(this.value);
    updateDashboard();
  });

  // Uncertainty threshold
  document.getElementById("uncertainty-threshold").addEventListener("input", function() {
    updateDashboard();
  });

  // Reset button
  document.getElementById("reset-button").addEventListener("click", function() {
    console.log("Resetting dashboard filters");

    // Reset state to initial values
    Object.assign(dashboardState, createDashboardState());

    // Reset form elements
    document.getElementById("damage-type-filter").value = "all";
    document.getElementById("time-period").value = "all";
    document.getElementById("uncertainty-threshold").value = "3.0";
    document.getElementById("day-select").value = Object.keys(dayGroups)[0];
    document.getElementById("time-window-slider").value = "0";

    // Update dashboard
    updateDashboard();
  });

  // Add robust window resize handler
  window.addEventListener("resize", function() {
    // Debounce resize events
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(function() {
      console.log("Window resized, updating all visualizations");

      // First update critical responsiveness charts
      renderHourlyChart(); // This should happen first to establish new width
      renderTimePeriodTable(); // Then this uses the same width

      // Then update other visualizations
      renderDayHeatmap();
      renderNetworkDiagram();
      renderBubbleChart();

      // Check container sizes after resize
      const containers = [
        "#day-heatmap-container",
        "#hourly-chart-container",
        "#network-diagram",
        "#bubble-chart"
      ];

      containers.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
          console.log(`${selector} size after resize:`, el.clientWidth, "x", el.clientHeight);
        }
      });
    }, 300); // Slightly longer timeout for complete resize
  });
}

// Initialize the dashboard
function initializeDashboard() {
  console.log("Initializing dashboard...");

  try {
    // Log data availability to debug
    console.log("Available data:");
    console.log("- Uncertainty data records:", uncertaintyData.length);
    console.log("- Average damage data records:", avgDamageData.length);
    console.log("- Location uncertainty data records:", locationUncertaintyData.length);
    console.log("- Unique days:", uniqueDays);
    console.log("- Time values length:", timeValues.length);

    // Check if we need to manually populate the day selector
    // This is a safeguard in case the HTML template interpolation didn't work
    const daySelect = document.getElementById("day-select");
    if (daySelect && daySelect.options.length === 0 && uniqueDays && uniqueDays.length > 0) {
      console.log("Day select has no options, populating manually");
      uniqueDays.forEach((day, index) => {
        const option = document.createElement("option");
        option.value = `day${index+1}`;
        option.textContent = day;
        daySelect.appendChild(option);
      });
      console.log("Added day options:", daySelect.options.length);
    }

    // Set up event listeners
    initializeEventListeners();

    // Ensure all inputs are populated with initial values
    // Check and populate the damage type filter dropdown
    const damageTypeFilter = document.getElementById("damage-type-filter");
    if (damageTypeFilter) {
      // Clear existing options (except the "All" option)
      const allOption = damageTypeFilter.querySelector('option[value="all"]');
      damageTypeFilter.innerHTML = '';

      // Re-add the "All" option
      if (allOption) {
        damageTypeFilter.appendChild(allOption);
      } else {
        // Create it if it doesn't exist
        const option = document.createElement('option');
        option.value = 'all';
        option.textContent = 'All Damage Types';
        damageTypeFilter.appendChild(option);
      }

      // Add all damage types
      Object.entries(damageTypeLabels).forEach(([key, label]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = label;
        damageTypeFilter.appendChild(option);
      });

      // Set the selected value
      damageTypeFilter.value = dashboardState.damageTypeFilter;
    }

    if (document.getElementById("time-period")) {
      document.getElementById("time-period").value = dashboardState.timePeriodFilter;
    }

    if (document.getElementById("uncertainty-threshold")) {
      document.getElementById("uncertainty-threshold").value = dashboardState.uncertaintyThreshold;
    }

    if (daySelect && daySelect.options.length > 0) {
      daySelect.value = dashboardState.selectedDay;
    }

    // Make sure the Network diagram controls are populated
    setTimeout(() => {
      const networkDamageType = document.getElementById("network-damage-type");
      if (networkDamageType && networkDamageType.options.length > 0) {
        networkDamageType.selectedIndex = 0;
      }

      const bubbleDamageType = document.getElementById("bubble-damage-type");
      if (bubbleDamageType && bubbleDamageType.options.length > 0) {
        bubbleDamageType.selectedIndex = 0;
      }
    }, 100);

    // Initialize the dashboard
    renderOverviewHeatmap(); // Ensure overview is created first
    updateDashboard();

    console.log("Dashboard initialized successfully with overview and detail views");
  } catch (e) {
    console.error("Error initializing dashboard:", e);
  }
}

// Start the dashboard initialization
initializeDashboard();
```