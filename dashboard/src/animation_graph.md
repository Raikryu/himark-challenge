
---
title: St. Himark Damage Progression Visualization
theme: dashboard
toc: false
---

# St. Himark Damage Progression Visualization

This interactive visualization tracks damage metrics across St. Himark neighborhoods following the earthquake. Use the controls to animate the visualization and identify critical patterns.

```js
import * as d3 from "d3";
```

```js
const dashboardColors = {
  primary: '#2a9d8f',
  secondary: '#e76f51',
  dark: '#264653',
  light: '#e9e9e9',
  muted: '#a8a8a8',
};

const neighborhoodMap = {
  1: "Palace Hills",
  2: "Northwest",
  3: "Old Town", 
  4: "Safe Town",
  5: "Southwest",
  6: "Downtown",
  7: "Wilson Forest",
  8: "Scenic Vista",
  9: "Broadview",
  10: "Chapparal",
  11: "Terrapin Springs",
  12: "Pepper Mill",
  13: "Cheddarford",
  14: "Easton",
  15: "Weston",
  16: "Southton",
  17: "Oak Willow",
  18: "East Parton",
  19: "West Parton"
};

function getDamageColor(value) {
  const colors = [
    {min: 0, max: 2, color: '#2a9d8f'},
    {min: 2, max: 4, color: '#8ab17d'},
    {min: 4, max: 6, color: '#e9c46a'},
    {min: 6, max: 8, color: '#f4a261'},
    {min: 8, max: 10, color: '#e76f51'},
  ];

  for (const range of colors) {
    if (value >= range.min && value < range.max) {
      return range.color;
    }
  }

  return colors[colors.length - 1].color;
}

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

```js
html`<style>
:root {
  --primary-color: #2a9d8f;
  --secondary-color: #e76f51;
  --bg-dark: #264653;
  --text-light: #e9e9e9;
  --text-muted: #a8a8a8;
  --bg-card: rgba(42, 157, 143, 0.1);
  --bg-card-border: rgba(42, 157, 143, 0.2);
}
.control-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--bg-card-border);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.control-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.dashboard-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}
.dashboard-button:hover {
  background-color: #218777;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.dashboard-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.dashboard-range {
  width: 150px;
  margin: 0 0.5rem;
  accent-color: var(--primary-color);
}
.dashboard-select {
  padding: 8px 12px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='6' viewBox='0 0 8 6'%3E%3Cpath fill='%23fff' d='M0 0h8L4 6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 8px;
  padding-right: 30px;
}
.timeline-container {
  position: relative;
  margin: 2.5rem 0;
  padding: 2rem 0.5rem 1rem;
  background: rgba(42, 157, 143, 0.1);
  border-radius: 12px;
  border: 1px solid var(--bg-card-border);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}
.timeline-range {
  width: 100%;
  margin: 0;
  height: 12px;
  accent-color: var(--secondary-color);
  opacity: 0.9;
  box-sizing: border-box;
  display: block;
}
.timeline-range:hover {
  opacity: 1;
}
#timeline-slider-container {
  position: relative;
  padding: 0 10px;
  width: 100%;
  box-sizing: border-box;
}
#timeline-slider-container::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 0;
}
#current-time-display {
  text-align: center;
  margin-top: 1rem;
  font-size: 1.1rem;
  color: var(--text-light);
  font-weight: 500;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.visualization-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 150px;
  height: 800px;
}
.chart-container {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--bg-card-border);
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  height: 100%;
  min-height: 750px;
  box-sizing: border-box;
  position: relative;
}
.stats-container, .dashboard-card {
  width: 100%;
  box-sizing: border-box;
}
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.trend-chart {
  width: 100%;
  height: 150px;
  margin-bottom: 1rem;
}
.dashboard-card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--bg-card-border);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.4rem;
}
.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}
.stat-placeholder {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-muted);
  font-style: italic;
}
.severity-distribution h4 {
  font-size: 1.1rem;
  margin: 1rem 0;
  color: var(--text-light);
}
.severity-level {
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
}
.severity-label {
  width: 80px;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}
.severity-bar-container {
  flex: 1;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  overflow: hidden;
}
.severity-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
  border-radius: 9px;
  min-width: 22px;
  transition: width 0.5s;
  font-weight: 500;
  text-shadow: 0 0 3px rgba(0,0,0,0.5);
}
.insights-card {
  margin-top: 2rem;
}
.insights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.insight-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.insight-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.08);
}
.insight-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.8rem;
}
.insight-content {
  font-size: 0.95rem;
  color: var(--text-light);
}
.insight-content p {
  margin: 0.7rem 0;
}
.chart-title {
  font-size: 1.3rem;
  font-weight: 500;
  text-align: center;
}
.chart-box {
  border: 1px solid var(--bg-card-border);
  border-radius: 12px;
  height: 100%;
  min-height: 750px;
  width: 100%;
  background-color: rgba(42, 157, 143, 0.05);
  overflow: hidden;
}
.error-message {
  padding: 1.5rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  margin: 1.5rem;
  color: #ff6b6b;
  font-weight: 500;
}
.bar {
  transition: width 0.4s ease-out, opacity 0.2s;
}
@media (max-width: 1200px) {
  .visualization-container {
    grid-template-columns: 1fr;
  }
  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style>`
```

## Animation Controls

```js
const controlPanel = html`
<div class="control-panel">
  <div class="control-group">
    <button id="play-button" class="dashboard-button">
      <i class="fas fa-play"></i> Play
    </button>
    <button id="pause-button" class="dashboard-button" disabled>
      <i class="fas fa-pause"></i> Pause
    </button>
    <button id="reset-button" class="dashboard-button">
      <i class="fas fa-undo"></i> Reset
    </button>
  </div>
  <div class="control-group">
    <label for="speed-control">Animation Speed:</label>
    <input type="range" id="speed-control" min="100" max="2000" value="1000" step="100" class="dashboard-range">
    <span id="speed-display">1 second</span>
  </div>
  <div class="control-group">
    <label for="step-select">Time Step:</label>
    <select id="step-select" class="dashboard-select">
      <option value="1">1 hour</option>
      <option value="3">3 hours</option>
      <option value="6">6 hours</option>
      <option value="12" selected>12 hours</option>
      <option value="24">24 hours</option>
    </select>
  </div>
  <div class="control-group">
    <label for="metric-select">Damage Metric:</label>
    <select id="metric-select" class="dashboard-select">
      <option value="combined_damage" selected>Combined Damage</option>
      <option value="sewer_and_water">Sewer & Water</option>
      <option value="power">Power</option>
      <option value="roads_and_bridges">Roads & Bridges</option>
      <option value="medical">Medical</option>
      <option value="buildings">Buildings</option>
      <option value="shake_intensity">Shake Intensity</option>
    </select>
  </div>
</div>
`;

const timelineContainer = html`
<div class="timeline-container">
  <div id="timeline-slider-container">
    <input type="range" id="timeline-slider" min="0" max="100" value="0" class="timeline-range" style="width:100%;">
  </div>
  <div id="timeline-markers"></div>
  <div id="current-time-display">Current Time: -</div>
</div>
`;

const visualizationContainer = html`
<h2>Damage Evolution Visualization</h2>
<div class="visualization-container">
  <div class="chart-container">
    <div id="animated-bar-container" class="chart-box"></div>
  </div>
  <div class="stats-container">
    <div class="dashboard-card">
      <div class="dashboard-title">
        <i class="fas fa-chart-line"></i> Damage Trend
      </div>
      <div id="trend-chart" class="trend-chart"></div>
    </div>
    <div class="dashboard-card">
      <div class="dashboard-title">
        <i class="fas fa-info-circle"></i> Current Statistics
      </div>
      <div id="current-stats">
        <div class="stat-placeholder">Play animation to see statistics</div>
      </div>
    </div>
  </div>
</div>

<div style="margin-top: 100px;">
  <h2 style="margin-top: 50px;">Key Insights and Patterns</h2>
  <div class="dashboard-card insights-card">
    <div class="dashboard-title">
      <i class="fas fa-lightbulb"></i> Analysis Insights
    </div>
    <div id="insights-content">
      <p>Play the animation to generate insights about damage patterns over time.</p>
    </div>
  </div>
</div>
`;

display(controlPanel);
display(timelineContainer);
display(visualizationContainer);
```

```js
function generateSampleData() {
  const locations = [
    neighborhoodMap[1], neighborhoodMap[2], neighborhoodMap[3],
    neighborhoodMap[4], neighborhoodMap[5], neighborhoodMap[6],
    neighborhoodMap[7], neighborhoodMap[8], neighborhoodMap[9]
  ];

  const data = [];

  const startDate = new Date(2020, 3, 6, 8, 0);

  for (let day = 0; day < 5; day++) {
    for (let hour = 0; hour < 24; hour++) {
      if (Math.random() > 0.7) continue;

      const currentTime = new Date(startDate);
      currentTime.setDate(startDate.getDate() + day);
      currentTime.setHours(startDate.getHours() + hour);

      for (const location of locations) {
        if (Math.random() > 0.8) continue;

        const dayFactor = Math.max(0, 1 - (day * 0.15));
        const hourFactor = Math.max(0, 1 - (hour * 0.01));
        const randomFactor = 0.7 + (Math.random() * 0.6);
        const baseDamage = 10 * dayFactor * hourFactor * randomFactor;

        data.push({
          time: currentTime,
          location: location,
          sewer_and_water: baseDamage * (0.7 + Math.random() * 0.6),
          power: baseDamage * (0.6 + Math.random() * 0.8),
          roads_and_bridges: baseDamage * (0.5 + Math.random() * 0.7),
          medical: baseDamage * (0.4 + Math.random() * 0.9),
          buildings: baseDamage * (0.6 + Math.random() * 0.7),
          shake_intensity: baseDamage * (0.3 + Math.random() * 0.3)
        });
      }
    }
  }

  return data;
}

const sampleData = generateSampleData();

const groupedByTime = d3.group(sampleData, d => d3.timeHour(d.time));

const timestamps = Array.from(groupedByTime.keys()).sort((a, b) => a - b);

let currentIndex = 0;
let animationSpeed = 1000;
let animationInterval;
let step = 12;
let selectedMetric = "combined_damage";

const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");
const stepSelect = document.getElementById("step-select");
const metricSelect = document.getElementById("metric-select");
const speedControl = document.getElementById("speed-control");
const speedDisplay = document.getElementById("speed-display");
const timelineSlider = document.getElementById("timeline-slider");
const currentTimeDisplay = document.getElementById("current-time-display");
const barContainer = document.getElementById("animated-bar-container");
const trendChart = document.getElementById("trend-chart");
const currentStats = document.getElementById("current-stats");
const insightsContent = document.getElementById("insights-content");

timelineSlider.max = timestamps.length - 1;
timelineSlider.value = 0;

const timeFormat = d3.timeFormat("%b %d, %Y %H:%M");

if (timestamps.length > 0) {
  renderFrame(timestamps[0]);
  currentTimeDisplay.textContent = `Current Time: ${timeFormat(timestamps[0])}`;
}

playButton.addEventListener("click", startAnimation);
pauseButton.addEventListener("click", pauseAnimation);
resetButton.addEventListener("click", resetAnimation);

stepSelect.addEventListener("change", function() {
  step = parseInt(this.value);
});

metricSelect.addEventListener("change", function() {
  selectedMetric = this.value;
  renderFrame(timestamps[currentIndex]);
  updateTrendChart();
});

speedControl.addEventListener("input", function() {
  animationSpeed = parseInt(this.value);
  speedDisplay.textContent = (animationSpeed / 1000).toFixed(1) + " seconds";

  if (animationInterval) {
    pauseAnimation();
    startAnimation();
  }
});

timelineSlider.addEventListener("input", function() {
  currentIndex = parseInt(this.value);
  renderFrame(timestamps[currentIndex]);
  currentTimeDisplay.textContent = `Current Time: ${timeFormat(timestamps[currentIndex])}`;
  updateTrendChart();
});

function startAnimation() {
  pauseAnimation();

  animationInterval = setInterval(advanceFrame, animationSpeed);

  playButton.disabled = true;
  pauseButton.disabled = false;
}

function pauseAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  playButton.disabled = false;
  pauseButton.disabled = true;
}

function resetAnimation() {
  pauseAnimation();
  currentIndex = 0;
  timelineSlider.value = 0;
  renderFrame(timestamps[0]);
  currentTimeDisplay.textContent = `Current Time: ${timeFormat(timestamps[0])}`;
  updateTrendChart();
}

function advanceFrame() {
  const currentTime = timestamps[currentIndex];
  const targetTime = new Date(currentTime.getTime() + (step * 60 * 60 * 1000));

  const nextIndex = timestamps.findIndex(t => t >= targetTime);

  if (nextIndex !== -1 && nextIndex < timestamps.length) {
    currentIndex = nextIndex;
  } else {
    currentIndex = 0;
    pauseAnimation();
    generateInsights();
  }

  timelineSlider.value = currentIndex;
  renderFrame(timestamps[currentIndex]);
  currentTimeDisplay.textContent = `Current Time: ${timeFormat(timestamps[currentIndex])}`;
  updateTrendChart();
}

function renderFrame(timestamp) {
  barContainer.innerHTML = "";

  const points = groupedByTime.get(timestamp) || [];

  const locationDamage = Array.from(
    d3.rollup(
      points,
      v => {
        if (selectedMetric === "combined_damage") {
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
    ([location, value]) => {
      let neighborhoodName = location;
      if (neighborhoodMap && neighborhoodMap[location]) {
        neighborhoodName = neighborhoodMap[location];
      }
      return { location: neighborhoodName, value };
    }
  );

  locationDamage.sort((a, b) => b.value - a.value);

  const margin = { top: 20, right: 30, bottom: 40, left: 120 };
  const width = barContainer.clientWidth - margin.left - margin.right;

  const containerHeight = barContainer.clientHeight || 750;
  const height = containerHeight - margin.top - margin.bottom;

  const svg = d3.create("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(locationDamage, d => d.value) || 10])
    .nice()
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(locationDamage.map(d => d.location))
    .range([0, height])
    .padding(0.2);

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSize(-height))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "rgba(255, 255, 255, 0.1)"))
    .call(g => g.selectAll(".tick text").attr("fill", "#fff"));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick text").attr("fill", "#fff"));

  g.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .attr("fill", "#fff")
    .text(getMetricLabel(selectedMetric));

  g.selectAll(".bar")
    .data(locationDamage)
    .join("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", d => y(d.location))
    .attr("width", d => x(d.value))
    .attr("height", y.bandwidth())
    .attr("fill", d => getDamageColor(d.value))
    .attr("rx", 4)
    .attr("ry", 4);

  g.selectAll(".bar-label")
    .data(locationDamage)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", d => x(d.value) + 5)
    .attr("y", d => y(d.location) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("fill", "#fff")
    .attr("font-size", 10)
    .text(d => d.value.toFixed(1));

  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left + width / 2)
    .attr("y", margin.top - 5)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .attr("font-size", 16)
    .attr("font-weight", "bold")
    .text(`${getMetricLabel(selectedMetric)} at ${timeFormat(timestamp)}`);

  barContainer.appendChild(svg.node());

  updateCurrentStats(locationDamage, timestamp);
}

function updateTrendChart() {
  trendChart.innerHTML = "";

  const width = trendChart.clientWidth;
  const height = 150;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };

  const trendData = [];

  for (let i = 0; i <= Math.min(currentIndex + 10, timestamps.length - 1); i++) {
    const timestamp = timestamps[i];
    const points = groupedByTime.get(timestamp) || [];

    let avgDamage;
    if (selectedMetric === "combined_damage") {
      avgDamage = d3.mean(points, d =>
        (d.sewer_and_water + d.power + d.roads_and_bridges +
         d.medical + d.buildings + d.shake_intensity) / 6
      ) || 0;
    } else {
      avgDamage = d3.mean(points, d => d[selectedMetric] || 0) || 0;
    }

    trendData.push({
      time: timestamp,
      value: avgDamage
    });
  }

  const svg = d3.create("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const x = d3.scaleTime()
    .domain(d3.extent(trendData, d => d.time))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(trendData, d => d.value) * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("class", "trend-x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b")))
    .call(g => g.selectAll(".tick text").attr("fill", "#fff"));

  svg.append("g")
    .attr("class", "trend-y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5))
    .call(g => g.selectAll(".tick text").attr("fill", "#fff"));

  const line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.time))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(trendData)
    .attr("class", "trend-line")
    .attr("fill", "none")
    .attr("stroke", dashboardColors.secondary)
    .attr("stroke-width", 2)
    .attr("d", line);

  if (trendData.length > 0) {
    const currentData = trendData[Math.min(currentIndex, trendData.length - 1)];
    svg.append("circle")
      .attr("class", "current-point")
      .attr("cx", x(currentData.time))
      .attr("cy", y(currentData.value))
      .attr("r", 5)
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 2)
      .attr("fill", "white");
  }

  trendChart.appendChild(svg.node());
}

function updateCurrentStats(locationDamage, timestamp) {
  if (locationDamage.length === 0) {
    currentStats.innerHTML = `<div class="stat-placeholder">No data available for this time period</div>`;
    return;
  }

  const avgDamage = d3.mean(locationDamage, d => d.value);

  let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${avgDamage.toFixed(2)}</div>
        <div class="stat-label">Average ${getMetricLabel(selectedMetric)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${locationDamage.length}</div>
        <div class="stat-label">Reporting Locations</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: ${getDamageColor(locationDamage[0].value)}">${locationDamage[0].location}</div>
        <div class="stat-label">Most Affected Location</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${locationDamage[0].value.toFixed(2)}</div>
        <div class="stat-label">Highest Damage Value</div>
      </div>
    </div>
    <div class="severity-distribution">
      <h4>Severity Distribution</h4>
      <div class="severity-bars">
  `;

  const severityLevels = [
    { min: 0, max: 2, label: "Minimal", color: getDamageColor(1) },
    { min: 2, max: 4, label: "Minor", color: getDamageColor(3) },
    { min: 4, max: 6, label: "Moderate", color: getDamageColor(5) },
    { min: 6, max: 8, label: "Severe", color: getDamageColor(7) },
    { min: 8, max: 10, label: "Critical", color: getDamageColor(9) }
  ];

  severityLevels.forEach(level => {
    const count = locationDamage.filter(d => d.value >= level.min && d.value < level.max).length;
    const percentage = (count / locationDamage.length) * 100;
    html += `
      <div class="severity-level">
        <div class="severity-label">${level.label}</div>
        <div class="severity-bar-container">
          <div class="severity-bar" style="width: ${percentage}%; background-color: ${level.color}">
            ${count > 0 ? count : ''}
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  currentStats.innerHTML = html;
}

function generateInsights() {
  let peakDamageTime = null;
  let maxAvgDamage = 0;
  let peakDamageLocation = null;

  for (const timestamp of timestamps) {
    const points = groupedByTime.get(timestamp) || [];

    if (points.length === 0) continue;

    const avgDamage = d3.mean(points, d =>
      (d.sewer_and_water + d.power + d.roads_and_bridges +
       d.medical + d.buildings + d.shake_intensity) / 6
    ) || 0;

    if (avgDamage > maxAvgDamage) {
      maxAvgDamage = avgDamage;
      peakDamageTime = timestamp;

      const locationDamages = Array.from(
        d3.rollup(
          points,
          v => d3.mean(v, d =>
            (d.sewer_and_water + d.power + d.roads_and_bridges +
             d.medical + d.buildings + d.shake_intensity) / 6
          ),
          d => d.location
        )
      );

      locationDamages.sort((a, b) => b[1] - a[1]);
      if (locationDamages.length > 0) {
        const locationId = locationDamages[0][0];
        peakDamageLocation = neighborhoodMap[locationId] || locationId;
      }
    }
  }

  const locationDamageOverTime = new Map();

  for (const timestamp of timestamps) {
    const points = groupedByTime.get(timestamp) || [];

    if (points.length === 0) continue;

    const locationDamages = d3.rollup(
      points,
      v => d3.mean(v, d =>
        (d.sewer_and_water + d.power + d.roads_and_bridges +
         d.medical + d.buildings + d.shake_intensity) / 6
      ),
      d => d.location
    );

    locationDamages.forEach((damage, location) => {
      if (!locationDamageOverTime.has(location)) {
        locationDamageOverTime.set(location, []);
      }
      locationDamageOverTime.get(location).push(damage);
    });
  }

  const locationAvgDamage = new Map();
  locationDamageOverTime.forEach((damages, location) => {
    locationAvgDamage.set(location, d3.mean(damages));
  });

  const sortedLocations = Array.from(locationAvgDamage.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const mostDamagedLocationId = sortedLocations[0]?.[0];
  const mostDamagedLocationName = neighborhoodMap[mostDamagedLocationId] || mostDamagedLocationId;
  const mostDamagedLocationValue = sortedLocations[0]?.[1];
  
  const mostDamagedLocation = [mostDamagedLocationName, mostDamagedLocationValue];

  const locationVariability = new Map();
  locationDamageOverTime.forEach((damages, location) => {
    const mean = d3.mean(damages);
    const variance = d3.mean(damages.map(d => Math.pow(d - mean, 2)));
    const stdDev = Math.sqrt(variance);
    locationVariability.set(location, stdDev);
  });

  const sortedVariableLocations = Array.from(locationVariability.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const mostVariableLocationId = sortedVariableLocations[0]?.[0];
  const mostVariableLocationName = neighborhoodMap[mostVariableLocationId] || mostVariableLocationId;
  const mostVariableLocationValue = sortedVariableLocations[0]?.[1];
  
  const mostVariableLocation = [mostVariableLocationName, mostVariableLocationValue];

  let insightsHtml = `
    <div class="insights-grid">
      <div class="insight-card">
        <div class="insight-title">Peak Damage Period</div>
        <div class="insight-content">
          <p>The highest average damage was recorded on <strong>${timeFormat(peakDamageTime)}</strong> with an average combined damage score of <strong>${maxAvgDamage.toFixed(2)}</strong>.</p>
          <p><strong>${peakDamageLocation || 'Unknown'}</strong> was the most affected location during this peak period.</p>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-title">Most Affected Location</div>
        <div class="insight-content">
          <p><strong>${mostDamagedLocation ? mostDamagedLocation[0] : 'Unknown'}</strong> experienced the highest average damage over the entire timespan with a score of <strong>${mostDamagedLocation ? mostDamagedLocation[1].toFixed(2) : 'N/A'}</strong>.</p>
          <p>This location should be prioritized for resource allocation.</p>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-title">Most Variable Location</div>
        <div class="insight-content">
          <p><strong>${mostVariableLocation ? mostVariableLocation[0] : 'Unknown'}</strong> showed the highest variability in damage levels (standard deviation: ${mostVariableLocation ? mostVariableLocation[1].toFixed(2) : 'N/A'}).</p>
          <p>This location experienced significant fluctuations that may indicate continuing aftershocks or cascading infrastructure failures.</p>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-title">Damage Distribution</div>
        <div class="insight-content">
          <p>Different infrastructure types showed varying levels of vulnerability to earthquake damage.</p>
          <p>The impact on power systems, water infrastructure, and transportation networks varied significantly by neighborhood location.</p>
        </div>
      </div>
    </div>
  `;

  insightsContent.innerHTML = insightsHtml;
}

html`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">`;

html`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">`;

if (timestamps.length > 0) {
  renderFrame(timestamps[0]);
  updateTrendChart();
} else {
  barContainer.innerHTML = `<div class="error-message">No data available for visualization</div>`;
}
```