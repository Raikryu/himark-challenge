---
theme: dashboard
title: Region Conditions and Uncertainty Overtime
toc: false
---

# Region Conditions and Uncertainty Overtime

This dashboard visualizes the change in conditions and uncertainty of reportings overtime. To track damage reporting consistently over time intervals across all days, the mean is used to represent this. Additionally, to measure how uncertainty fluctuates over specific time periods, relevant uncertainty statistics are utilized.

```js
import * as Plot from "npm:@observablehq/plot"
import * as d3 from "npm:d3"
```

```js
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
const uncertaintyData = await FileAttachment("data/uncertainty.csv").csv({typed: true});

const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

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

const formatDate = d3.timeFormat("%Y-%m-%d");
const uniqueDays = [...new Set(heatmapData.map(d => formatDate(d.time)))].sort();

if (!uniqueDays || uniqueDays.length === 0) {
  uniqueDays.push("2023-01-01");
}

const dayGroups = {};
uniqueDays.forEach((date, index) => {
  dayGroups[`day${index+1}`] = heatmapData.filter(d => formatDate(d.time) === date);
});

const hourlyGroups = d3.groups(heatmapData, d => d.time.getHours());
const hourlyData = hourlyGroups.map(([hour, values]) => {
  const result = { hour };

  const byDamageType = d3.groups(values, d => d.damageType);
  byDamageType.forEach(([type, typeValues]) => {
    result[type] = d3.mean(typeValues, d => d.value);
  });

  return result;
}).sort((a, b) => a.hour - b.hour);

const timePeriods = [
  { name: "Morning", start: 6, end: 11, values: {} },
  { name: "Afternoon", start: 12, end: 17, values: {} },
  { name: "Evening", start: 18, end: 23, values: {} },
  { name: "Night", start: 0, end: 5, values: {} }
];

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

const heatmapMax = d3.max(heatmapData.map(d => d.value));

const createDashboardState = () => ({
  selectedDay: "day1",
  damageTypeFilter: "all",
  timePeriodFilter: "all",
  uncertaintyThreshold: 3.0,
  visibleDamageTypes: new Set(Object.keys(damageTypeLabels)),
  timeWindowPosition: 0
});

const dashboardState = createDashboardState();

```

```js
const avgDamageData = await FileAttachment("data/avgdamage.csv").csv({typed: true});

const locations = Array.from({ length: 19 }, (_, i) => i + 1);
const timeValues = [...new Set(avgDamageData.map(d => d.time_5min))].sort((a, b) =>
  new Date(a) - new Date(b)
);

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

const locationUncertaintyData = await FileAttachment("data/uncertainty2.csv").csv({typed: true});

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

```

```js
const dashboardStyle = html`<style>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
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
  min-width: 0;
  flex: 1 1 150px;
  max-width: 200px;
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

.control-value-display {
  text-align: center;
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: white;
  background-color: rgba(42, 157, 143, 0.2);
  border-radius: 4px;
  padding: 2px 4px;
}

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

tbody {
  height: 100%;
}

tbody tr {
  height: calc(100% / 4);
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

table th:first-child,
table td:first-child {
  width: 30%;
  font-weight: bold;
}

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
  height: auto !important;
  min-height: 0 !important;
  overflow-x: auto;
  overflow-y: hidden;
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
  font-size: 1.4rem;
}

.heatmap-table td {
  padding: 20px;
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.heatmap-table td:hover {
  transform: scale(1.1);
  z-index: 10;
}

.selected-row {
  background-color: rgba(42, 157, 143, 0.2) !important;
}

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

.bubble-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.above-threshold {
  border: 2px solid ${colors.secondary} !important;
}

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

@media (max-width: 768px) {
  .dashboard-controls {
    flex-direction: row;
    justify-content: flex-start;
  }

  .control-group {
    flex: 1 1 120px;
  }

  .legend {
    flex-direction: column;
    align-items: flex-start;
  }

  #overview-heatmap-container {
    height: 150px !important;
  }

  .dashboard-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-controls {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .control-group {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .dashboard-grid {
    gap: 1rem;
  }
}
</style>`;

display(dashboardStyle);
```

```js
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
function getUncertaintyColor(value) {
  if (value === null || value === undefined) return "#444444";
  const scale = d3.scaleLinear()
    .domain([0, heatmapMax * 0.3, heatmapMax])
    .range(["#f7fbff", "#fdae61", "#d73027"]);
  return scale(value);
}

function getTextColor(value) {
  if (value === null || value === undefined) return "black";
  return value > heatmapMax/2 ? "white" : "black";
}

function renderDayHeatmap() {
  const container = document.getElementById("day-heatmap-container");

  container.innerHTML = "";

  const selectedDayData = dayGroups[dashboardState.selectedDay] || [];

  if (selectedDayData.length === 0) {
    container.innerHTML = `<div class="debug-info">No data available for selected day: ${dashboardState.selectedDay}</div>`;
    return;
  }

  const timeFormat = d => {
    const timeString = d.time_string;
    return timeString.split(" ")[1].substring(0, 5);
  };

  const timeGroups = d3.groups(selectedDayData, timeFormat);
  timeGroups.sort((a, b) => {
    const timeA = a[0];
    const timeB = b[0];
    return timeA.localeCompare(timeB);
  });

  let uniqueTimes = timeGroups.map(group => group[0]);

  const maxTimePoints = 24;
  const allTimePoints = uniqueTimes.length;

  const timeWindowSlider = document.getElementById("time-window-slider");
  if (timeWindowSlider) {
    const maxSliderValue = Math.max(0, allTimePoints - maxTimePoints);
    timeWindowSlider.max = maxSliderValue;
    timeWindowSlider.disabled = maxSliderValue <= 0;
  }

  if (allTimePoints > maxTimePoints) {
    const maxStartIndex = allTimePoints - maxTimePoints;
    const startIndex = Math.min(Math.max(0, dashboardState.timeWindowPosition), maxStartIndex);

    uniqueTimes = uniqueTimes.slice(startIndex, startIndex + maxTimePoints);

    const timeWindowValue = document.getElementById("time-window-value");
    if (timeWindowValue) {
      timeWindowValue.textContent = `${startIndex+1}-${startIndex+uniqueTimes.length} of ${allTimePoints}`;
    }
  } else {
    const timeWindowValue = document.getElementById("time-window-value");
    if (timeWindowValue) {
      timeWindowValue.textContent = `All ${allTimePoints} time points`;
    }
  }

  let damageTypes = Object.keys(damageTypeLabels);

  if (dashboardState.damageTypeFilter !== "all") {
    damageTypes = [dashboardState.damageTypeFilter];
  }

  const heatmapData = [];

  damageTypes.forEach((damageType, row) => {
    uniqueTimes.forEach((time, col) => {
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

  const containerWidth = container.clientWidth || 800;

  const margin = { top: 90, right: 40, bottom: 80, left: 180 };
  const availableWidth = containerWidth - margin.left - margin.right;

  const cellWidth = 60;

  const cellHeight = 120;

  const width = uniqueTimes.length * cellWidth + margin.left + margin.right;
  const height = damageTypes.length * cellHeight + margin.top + margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorScale = d3.scaleLinear()
    .domain([0, heatmapMax * 0.3, heatmapMax])
    .range(["#f7fbff", "#fdae61", "#d73027"])
    .clamp(true)
    .unknown("#444444");

  svg.selectAll(".row-label")
    .data(damageTypes)
    .enter()
    .append("text")
    .attr("class", "row-label")
    .attr("x", -20)
    .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", d => (dashboardState.damageTypeFilter === d) ? "bold" : "normal")
    .attr("fill", "white")
    .text(d => damageTypeLabels[d])
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      dashboardState.damageTypeFilter = (dashboardState.damageTypeFilter === d) ? "all" : d;

      document.getElementById("damage-type-filter").value = dashboardState.damageTypeFilter;

      updateDashboard();
    });

  svg.selectAll(".col-label")
    .data(uniqueTimes)
    .enter()
    .append("text")
    .attr("class", "col-label")
    .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
    .attr("y", -35)
    .attr("transform", (d, i) => `rotate(-60, ${i * cellWidth + cellWidth / 2}, -35)`)
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("fill", "white")
    .text(d => d);

  const cells = svg.selectAll(".cell")
    .data(heatmapData)
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr("transform", d => `translate(${d.col * cellWidth}, ${d.row * cellHeight})`)
    .style("cursor", "pointer");

  cells.append("rect")
    .attr("width", cellWidth - 1)
    .attr("height", cellHeight - 1)
    .attr("fill", d => d.value === null ? colorScale.unknown() : colorScale(d.value))
    .attr("stroke", d => d.isAboveThreshold ? colors.secondary : "none")
    .attr("stroke-width", d => d.isAboveThreshold ? 2 : 0)
    .attr("rx", 2)
    .attr("ry", 2);

  cells.append("title")
    .text(d => `${damageTypeLabels[d.damageType]} at ${d.time}: ${d.value === null ? "N/A" : d.value.toFixed(2)}`);

  const legendWidth = 200;
  const legendHeight = 15;

  const legendX = (uniqueTimes.length * cellWidth - legendWidth) / 2;
  const legendY = damageTypes.length * cellHeight + 30;

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

  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#heatmap-gradient)");

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

  svg.append("text")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", "14px")
    .text("Uncertainty Value");

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

  cells.on("mouseover", function(event, d) {
    svg.selectAll(".cell")
      .filter(cell => cell.row === d.row)
      .select("rect")
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    svg.selectAll(".cell")
      .filter(cell => cell.col === d.col)
      .select("rect")
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    svg.selectAll(".row-label")
      .filter((_, i) => i === d.row)
      .attr("font-weight", "bold")
      .attr("fill", colors.primary);

    svg.selectAll(".col-label")
      .filter((_, i) => i === d.col)
      .attr("font-weight", "bold")
      .attr("fill", colors.primary);
  });

  cells.on("mouseout", function(event, d) {
    svg.selectAll(".cell")
      .filter(cell => cell.row === d.row)
      .select("rect")
      .attr("opacity", 1)
      .attr("stroke", cell => cell.isAboveThreshold ? colors.secondary : "none")
      .attr("stroke-width", cell => cell.isAboveThreshold ? 2 : 0);

    svg.selectAll(".cell")
      .filter(cell => cell.col === d.col)
      .select("rect")
      .attr("opacity", 1)
      .attr("stroke", cell => cell.isAboveThreshold ? colors.secondary : "none")
      .attr("stroke-width", cell => cell.isAboveThreshold ? 2 : 0);

    svg.selectAll(".row-label")
      .filter((_, i) => i === d.row)
      .attr("font-weight", label => (dashboardState.damageTypeFilter === damageTypes[d.row]) ? "bold" : "normal")
      .attr("fill", "white");

    svg.selectAll(".col-label")
      .filter((_, i) => i === d.col)
      .attr("font-weight", "normal")
      .attr("fill", "white");
  });

  cells.on("click", (event, d) => {
    dashboardState.damageTypeFilter = (dashboardState.damageTypeFilter === d.damageType) ? "all" : d.damageType;

    document.getElementById("damage-type-filter").value = dashboardState.damageTypeFilter;

    updateDashboard();
  });
}

function renderHourlyChart() {
  const container = document.getElementById("hourly-chart-container");
  container.innerHTML = '';

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

  legendContainer.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', function() {
      const damageType = this.getAttribute('data-type');

      if (dashboardState.visibleDamageTypes.has(damageType)) {
        dashboardState.visibleDamageTypes.delete(damageType);
        this.classList.add('inactive');
      } else {
        dashboardState.visibleDamageTypes.add(damageType);
        this.classList.remove('inactive');
      }

      renderHourlyChart();
    });
  });

  const visibleTypes = Array.from(dashboardState.visibleDamageTypes);

  const width = container.clientWidth;
  const height = Math.max(350, Math.min(500, window.innerHeight * 0.4));
  const margin = {top: 30, right: 50, bottom: 60, left: 60};

  const svg = d3.select(container)
    .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, 23])
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(hourlyData, d => {
      return d3.max(visibleTypes, type => d[type] || 0);
    }) * 1.1])
    .range([height - margin.top - margin.bottom, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(h => `${h}:00`))
    .selectAll("text")
      .style("fill", "white");

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("fill", "white");

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

  svg.append("line")
    .attr("x1", 0)
    .attr("y1", y(dashboardState.uncertaintyThreshold))
    .attr("x2", width - margin.left - margin.right)
    .attr("y2", y(dashboardState.uncertaintyThreshold))
    .attr("stroke", colors.secondary)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

  visibleTypes.forEach(type => {
    const lineData = hourlyData
      .map(d => ({hour: d.hour, value: d[type]}))
      .filter(d => d.value !== null && d.value !== undefined);

    if (lineData.length < 2) return;

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

function renderTimePeriodTable() {
  const container = document.getElementById("time-period-container");

  const containerWidth = container.clientWidth || window.innerWidth - 40;

  const headers = ['Time Period', ...Object.values(damageTypeLabels)].map(
    (header, index) => {
      const width = index === 0 ? '15%' : `${85 / Object.values(damageTypeLabels).length}%`;
      return `<th style="width: ${width};">${header}</th>`;
    }
  ).join('');

  const rows = timePeriods.map(period => {
    const isSelected = dashboardState.timePeriodFilter === period.name.toLowerCase();
    const rowClass = isSelected ? 'selected-row' : '';

    const cells = Object.keys(damageTypeLabels).map(type => {
      const value = period.values[type];
      const displayValue = value !== null ? value.toFixed(2) : "N/A";

      const isAboveThreshold = value !== null && value > dashboardState.uncertaintyThreshold;

      let bgColor = "transparent";
      if (value !== null) {
        let color;
        if (value <= heatmapMax * 0.3) {
          const intensity = value / (heatmapMax * 0.3);
          color = d3.interpolateRgb("#f7fbff", "#fdae61")(intensity);
        } else {
          const intensity = (value - heatmapMax * 0.3) / (heatmapMax * 0.7);
          color = d3.interpolateRgb("#fdae61", "#d73027")(intensity);
        }
        const rgb = d3.color(color).rgb();
        bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
      }

      const cellClass = isAboveThreshold ? 'above-threshold' : '';
      return `<td class="data-cell ${cellClass}" style="background-color: ${bgColor};">${displayValue}</td>`;
    }).join('');

    return `<tr class="${rowClass}" data-period="${period.name.toLowerCase()}" style="cursor: pointer; transition: background-color 0.2s;">
              <td style="font-size: 1.1rem;">${period.name}<br><span style="font-size: 0.8rem; opacity: 0.8;">(${period.start}:00-${period.end}:59)</span></td>
              ${cells}
            </tr>`;
  }).join('');

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

  container.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', function() {
      const period = this.getAttribute('data-period');

      dashboardState.timePeriodFilter =
        dashboardState.timePeriodFilter === period ? "all" : period;

      document.getElementById("time-period").value = dashboardState.timePeriodFilter;

      updateDashboard();
    });
  });
}

function renderNetworkDiagram() {
  const container = document.getElementById("network-container");

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "network-controls";

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

  controlsDiv.appendChild(damageTypeLabel);
  controlsDiv.appendChild(damageTypeSelect);
  controlsDiv.appendChild(sliderLabel);
  controlsDiv.appendChild(sliderContainer);

  container.innerHTML = '';
  container.appendChild(controlsDiv);

  const diagramContainer = document.createElement("div");
  diagramContainer.id = "network-diagram";
  diagramContainer.style.width = "100%";
  diagramContainer.style.height = Math.max(600, Math.min(800, window.innerHeight * 0.6)) + "px";
  diagramContainer.style.backgroundColor = "#4292c6";
  container.appendChild(diagramContainer);

  function createNetworkDiagram() {
    const selectedTime = timeValues[slider.value];
    const selectedDamage = damageTypeSelect.value;

    timeLabel.textContent = `Time: ${selectedTime}`;

    const dataAtTime = Object.fromEntries(
      avgDamageData
        .filter(d => d.time_5min === selectedTime)
        .map(d => [d.location, d])
    );

    const values = Object.values(dataAtTime)
      .map(d => parseFloat(d[selectedDamage]))
      .filter(v => !isNaN(v));

    const maxValue = values.length > 0 ? Math.max(...values) : 1;

    function scaleSize(value, maxValue) {
      if (value === null || value === undefined || isNaN(value)) return 20;

      const minRadius = 20;
      const maxRadius = 100;
      const normalizedValue = maxValue > 0 ? value / maxValue : 0.5;
      return minRadius + (normalizedValue * (maxRadius - minRadius));
    }

    const nodes = locations.map(loc => {
      const locData = dataAtTime[loc];
      let value = locData ? parseFloat(locData[selectedDamage]) : null;
      const isMissing = value === null || value === undefined || isNaN(value);

      const displayValue = isMissing ? "" : value.toFixed(2);

      if (isMissing) value = 0;

      return {
        id: loc,
        x: locationPositions[loc].x,
        y: locationPositions[loc].y,
        r: scaleSize(value, maxValue),
        fill: isMissing ? "#e76f51" : "#4292c6",
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

    d3.select("#network-diagram").html("");

    const width = diagramContainer.clientWidth;
    const height = diagramContainer.clientHeight;

    const svg = d3.select("#network-diagram")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "-2 -2 4 4")
        .attr("preserveAspectRatio", "xMidYMid meet");

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

    const nodeGroups = svg.selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    nodeGroups.append("circle")
      .attr("r", d => d.r / 100)
      .attr("fill", d => d.fill)
      .attr("opacity", d => d.opacity)
      .attr("stroke", d => d.stroke)
      .attr("stroke-width", d => d.strokeWidth / 100);

    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.0em")
      .attr("fill", "white")
      .attr("font-size", "0.15px")
      .attr("font-weight", "bold")
      .text(d => d.id);

    nodeGroups.filter(d => !d.isMissing)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "white")
      .attr("font-size", "0.12px")
      .text(d => d.value);

    nodeGroups.append("title")
      .text(d => {
        const tooltipValue = d.isMissing ? "No data available" : d.value;
        return `Location: ${d.id}\nValue: ${tooltipValue}`;
      });
  }

  damageTypeSelect.addEventListener("change", createNetworkDiagram);
  slider.addEventListener("input", createNetworkDiagram);

  createNetworkDiagram();
}

function renderBubbleChart() {
  const container = document.getElementById("bubble-chart-container");

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "bubble-controls";

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

  controlsDiv.appendChild(damageTypeLabel);
  controlsDiv.appendChild(damageTypeSelect);

  container.innerHTML = '';
  container.appendChild(controlsDiv);

  const chartContainer = document.createElement("div");
  chartContainer.id = "bubble-chart";
  chartContainer.style.height = Math.max(500, Math.min(700, window.innerHeight * 0.5)) + "px";
  container.appendChild(chartContainer);

  function updateBubbleChart() {
    const selectedDamage = damageTypeSelect.value;

    const filteredData = bubbleData.filter(d => d.damageType === selectedDamage);

    const locationDomain = [...new Set(filteredData.map(d => d.location))].sort((a, b) => a - b);

    const containerWidth = chartContainer.clientWidth || window.innerWidth - 40;
    const containerHeight = chartContainer.clientHeight || 500;

    const width = containerWidth;
    const height = containerHeight;
    const margin = {top: 30, right: 20, bottom: 60, left: 60};

    d3.select("#bubble-chart").html("");

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

  damageTypeSelect.addEventListener("change", updateBubbleChart);

  updateBubbleChart();
}

function renderOverviewHeatmap() {
  const container = document.getElementById("overview-heatmap-container");

  container.innerHTML = "";

  const selectedDayData = dayGroups[dashboardState.selectedDay] || [];

  if (selectedDayData.length === 0) {
    container.innerHTML = `<div class="debug-info">No data available for selected day</div>`;
    return;
  }

  const timeFormat = d => {
    const timeString = d.time_string;
    return timeString.split(" ")[1].substring(0, 5);
  };

  const timeGroups = d3.groups(selectedDayData, timeFormat);
  timeGroups.sort((a, b) => {
    const timeA = a[0];
    const timeB = b[0];
    return timeA.localeCompare(timeB);
  });

  const allTimes = timeGroups.map(group => group[0]);

  const maxTimePoints = 24;
  const allTimePoints = allTimes.length;

  const selectedTimeStart = Math.min(dashboardState.timeWindowPosition, Math.max(0, allTimes.length - maxTimePoints));
  const selectedTimeEnd = Math.min(selectedTimeStart + maxTimePoints, allTimes.length);

  const damageTypes = Object.keys(damageTypeLabels);

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

  const cellWidth = 8;
  const cellHeight = 120;
  const margin = { top: 40, right: 20, bottom: 40, left: 60 };

  const width = allTimes.length * cellWidth + margin.left + margin.right;
  const height = cellHeight + margin.top + margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorScale = d3.scaleLinear()
    .domain([0, heatmapMax * 0.3, heatmapMax])
    .range(["#f7fbff", "#fdae61", "#d73027"])
    .clamp(true)
    .unknown("#444444");

  const labelStep = Math.max(1, Math.floor(allTimes.length / 5));
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
      const timeParts = d.split(':');
      return timeParts[0];
    });

  svg.append("text")
    .attr("x", -cellHeight / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "white")
    .text("Avg Uncertainty");

  const cells = svg.selectAll(".overview-cell")
    .data(averagesByTime)
    .enter()
    .append("g")
    .attr("class", "overview-cell")
    .attr("transform", d => `translate(${d.timeIndex * cellWidth}, 0)`)
    .style("cursor", "pointer");

  cells.append("rect")
    .attr("width", cellWidth - 1)
    .attr("height", cellHeight)
    .attr("fill", d => colorScale(d.value))
    .attr("stroke", d => d.isInSelectedWindow ? "white" : "none")
    .attr("stroke-width", d => d.isInSelectedWindow ? 2 : 0);

  svg.append("rect")
    .attr("class", "selection-highlight")
    .attr("x", selectedTimeStart * cellWidth)
    .attr("y", 0)
    .attr("width", Math.min(maxTimePoints, allTimes.length - selectedTimeStart) * cellWidth)
    .attr("height", cellHeight)
    .attr("fill", "rgba(255, 255, 255, 0.15)")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2")
    .attr("pointer-events", "none");

  cells.on("click", (event, d) => {
    const newPosition = Math.min(d.timeIndex, allTimes.length - maxTimePoints);
    dashboardState.timeWindowPosition = Math.max(0, newPosition);

    const timeWindowSlider = document.getElementById("time-window-slider");
    if (timeWindowSlider) {
      timeWindowSlider.value = dashboardState.timeWindowPosition;
    }

    renderDayHeatmap();
    renderOverviewHeatmap();
  });

  cells.append("title")
    .text(d => `Time: ${d.time}\nAvg Uncertainty: ${d.value.toFixed(2)}`);
}

function updateDashboard() {
  const damageTypeFilter = document.getElementById("damage-type-filter").value;
  const timePeriodFilter = document.getElementById("time-period").value;
  const uncertaintyThreshold = parseFloat(document.getElementById("uncertainty-threshold").value);

  let selectedDay = "day1";
  const daySelectElement = document.getElementById("day-select");

  if (daySelectElement && (daySelectElement.options.length === 0 ||
     (daySelectElement.options.length === 1 && daySelectElement.options[0].text === "Loading days..."))) {
    daySelectElement.innerHTML = "";

    if (uniqueDays && uniqueDays.length > 0) {
      uniqueDays.forEach((day, index) => {
        const option = document.createElement("option");
        option.value = `day${index+1}`;
        option.textContent = day;
        daySelectElement.appendChild(option);
      });
    } else {
      const option = document.createElement("option");
      option.value = "day1";
      option.textContent = "Day 1";
      daySelectElement.appendChild(option);
    }
  }

  if (daySelectElement && daySelectElement.options.length > 0) {
    selectedDay = daySelectElement.value;
  }

  dashboardState.damageTypeFilter = damageTypeFilter;
  dashboardState.timePeriodFilter = timePeriodFilter;
  dashboardState.uncertaintyThreshold = uncertaintyThreshold;
  dashboardState.selectedDay = selectedDay;

  if (damageTypeFilter === "all") {
    dashboardState.visibleDamageTypes = new Set(Object.keys(damageTypeLabels));
  } else {
    dashboardState.visibleDamageTypes = new Set([damageTypeFilter]);
  }

  document.getElementById("threshold-value").textContent = uncertaintyThreshold.toFixed(1);

  renderOverviewHeatmap();
  renderDayHeatmap();
  renderHourlyChart();
  renderTimePeriodTable();

  setTimeout(() => {
    try {
      renderNetworkDiagram();
    } catch (e) {
    }
  }, 100);

  setTimeout(() => {
    try {
      renderBubbleChart();
    } catch (e) {
    }
  }, 200);
}

function initializeEventListeners() {
  document.getElementById("damage-type-filter").addEventListener("change", function() {
    dashboardState.damageTypeFilter = this.value;
    updateDashboard();
  });

  document.getElementById("time-period").addEventListener("change", function() {
    updateDashboard();
  });

  document.getElementById("day-select").addEventListener("change", function() {
    dashboardState.timeWindowPosition = 0;
    if (document.getElementById("time-window-slider")) {
      document.getElementById("time-window-slider").value = 0;
    }
    updateDashboard();
  });

  document.getElementById("time-window-slider").addEventListener("input", function() {
    dashboardState.timeWindowPosition = parseInt(this.value);
    updateDashboard();
  });

  document.getElementById("uncertainty-threshold").addEventListener("input", function() {
    updateDashboard();
  });

  document.getElementById("reset-button").addEventListener("click", function() {
    Object.assign(dashboardState, createDashboardState());

    document.getElementById("damage-type-filter").value = "all";
    document.getElementById("time-period").value = "all";
    document.getElementById("uncertainty-threshold").value = "3.0";
    document.getElementById("day-select").value = Object.keys(dayGroups)[0];
    document.getElementById("time-window-slider").value = "0";

    updateDashboard();
  });

  window.addEventListener("resize", function() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(function() {
      renderHourlyChart();
      renderTimePeriodTable();
      renderDayHeatmap();
      renderNetworkDiagram();
      renderBubbleChart();
    }, 300);
  });
}

function initializeDashboard() {
  try {
    const daySelect = document.getElementById("day-select");
    if (daySelect && daySelect.options.length === 0 && uniqueDays && uniqueDays.length > 0) {
      uniqueDays.forEach((day, index) => {
        const option = document.createElement("option");
        option.value = `day${index+1}`;
        option.textContent = day;
        daySelect.appendChild(option);
      });
    }

    initializeEventListeners();

    const damageTypeFilter = document.getElementById("damage-type-filter");
    if (damageTypeFilter) {
      const allOption = damageTypeFilter.querySelector('option[value="all"]');
      damageTypeFilter.innerHTML = '';

      if (allOption) {
        damageTypeFilter.appendChild(allOption);
      } else {
        const option = document.createElement('option');
        option.value = 'all';
        option.textContent = 'All Damage Types';
        damageTypeFilter.appendChild(option);
      }

      Object.entries(damageTypeLabels).forEach(([key, label]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = label;
        damageTypeFilter.appendChild(option);
      });

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

    renderOverviewHeatmap();
    updateDashboard();
  } catch (e) {
  }
}

initializeDashboard();
```