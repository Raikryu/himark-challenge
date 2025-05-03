---
theme: dashboard
title: St. Himark Damage Box Plot
toc: false
---

# St. Himark Damage Metrics by Date

This interactive visualization shows the distribution of damage metrics for each neighborhood across different days. Use the controls to explore different metrics and locations to identify patterns and outliers.

```js
// Import required libraries
import * as d3 from "d3";
```

<div class="control-panel">
  <div class="control-group">
    <label for="location-select">Location:</label>
    <select id="location-select" class="dashboard-select"></select>
  </div>
  <div class="control-group">
    <label for="metric-select">Damage Metric:</label>
    <select id="metric-select" class="dashboard-select">
      <option value="shake_intensity">Shake Intensity</option>
      <option value="sewer_and_water">Sewer & Water</option>
      <option value="power">Power</option>
      <option value="roads_and_bridges">Roads & Bridges</option>
      <option value="medical">Medical</option>
      <option value="buildings">Buildings</option>
    </select>
  </div>
</div>

<h2>Damage Distribution Visualization</h2>
<div class="chart-container">
  <div id="chart-container" class="chart-box"></div>
</div>

<div style="margin-top: 100px;">
  <h2>Key Insights and Patterns</h2>
  <div class="dashboard-card insights-card">
    <div class="dashboard-title">
      <i class="fas fa-lightbulb"></i> Analysis Insights
    </div>
    <div id="insights-content">
      <p>Select a location and damage metric to analyze the distribution of values over time. The box plot shows the median (middle line), quartiles (box edges), and range (whiskers) of each damage metric, helping identify patterns and outliers.</p>
    </div>
  </div>
</div>

```js
// Define CSS for the dashboard
const dashboardStyles = html`<style>
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
  min-width: 200px;
}
.chart-container {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--bg-card-border);
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  height: 750px;
  min-height: 750px;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 2rem;
}
.chart-box {
  border: 1px solid var(--bg-card-border);
  border-radius: 12px;
  height: 100%;
  width: 100%;
  background-color: rgba(42, 157, 143, 0.05);
  overflow: hidden;
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
@media (max-width: 1200px) {
  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style>`;

// Add styles to the document
display(dashboardStyles);

// Load Font Awesome for icons
html`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">`;

// Load Inter font
html`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">`;

// Define dashboard colors object for plots
const dashboardColors = {
  primary: '#2a9d8f',
  secondary: '#e76f51',
  dark: '#264653',
  light: '#e9e9e9',
  muted: '#a8a8a8',
  background: {
    card: 'rgba(42, 157, 143, 0.1)',
    cardBorder: 'rgba(42, 157, 143, 0.2)'
  },
  text: {
    light: '#e9e9e9',
    muted: '#a8a8a8'
  }
};

// Define neighborhood name mapping from ID to actual name
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

// Function to get color based on damage level (0-10)
function getDamageColor(value) {
  // Define color ranges for different damage levels
  const colors = [
    {min: 0, max: 2, color: '#2a9d8f'},  // Low - teal
    {min: 2, max: 4, color: '#8ab17d'},  // Low-mid - green/yellow
    {min: 4, max: 6, color: '#e9c46a'},  // Mid - yellow
    {min: 6, max: 8, color: '#f4a261'},  // Mid-high - orange
    {min: 8, max: 10, color: '#e76f51'}, // High - red/orange
  ];

  for (const range of colors) {
    if (value >= range.min && value < range.max) {
      return range.color;
    }
  }

  // Default color for values out of range
  return colors[colors.length - 1].color;
}

// Function to get label for a metric
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

// Load and process data
FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
  const raw = d3.csvParse(text.replace(/\r\n/g, "\n").trim(), d3.autoType);

  // Parse dates and ensure proper data types
  const parseDate = d3.timeParse("%d/%m/%Y %H:%M");
  raw.forEach(d => {
    d.numericDate = parseDate(d.time);
    d.location = String(d.location).trim();
    d.date = d.numericDate ? d.numericDate.toISOString().split("T")[0] : null;
  });

  // Filter data to earthquake period (April 6-10, 2020)
  const rangeStart = new Date("2020-04-06");
  const rangeEnd = new Date("2020-04-10");
  const validData = raw.filter(d => d.numericDate >= rangeStart && d.numericDate <= rangeEnd);

  // Get unique locations and populate the select dropdown
  const locations = [...new Set(validData.map(d => d.location))].sort((a, b) => +a - +b);
  const locationSelect = document.getElementById("location-select");
  locationSelect.innerHTML = "";

  locations.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    // Use the neighborhood mapping for the display text
    option.textContent = neighborhoodMap[loc] || `Neighborhood ${loc}`;
    locationSelect.appendChild(option);
  });

  // Get reference to metric select
  const metricSelect = document.getElementById("metric-select");

  // Function to update insights based on selected options
  function updateInsights(location, metric, data) {
    const insightsContent = document.getElementById("insights-content");

    // Calculate some statistics for insights
    const metricValues = data.map(d => d[metric]);
    const avg = d3.mean(metricValues);
    const max = d3.max(metricValues);
    const min = d3.min(metricValues);
    const median = d3.median(metricValues);

    // Find date with highest average
    const byDate = d3.group(data, d => d.date);
    let maxDateAvg = 0;
    let maxDate = "";

    for (const [date, values] of byDate.entries()) {
      const dateAvg = d3.mean(values, d => d[metric]);
      if (dateAvg > maxDateAvg) {
        maxDateAvg = dateAvg;
        maxDate = date;
      }
    }

    // Format the date for display
    const formatDate = d => {
      const dateObj = new Date(d);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Create insights HTML in a grid format (similar to animation_graph.md)
    const neighborhoodName = neighborhoodMap[location] || `Neighborhood ${location}`;
    
    // Calculate variance for variability insight
    const variance = d3.variance(metricValues) || 0;
    const stdDev = Math.sqrt(variance);
    
    const html = `
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-title">Damage Range</div>
          <div class="insight-content">
            <p>In ${neighborhoodName}, the ${getMetricLabel(metric)} ranged from <strong>${min.toFixed(2)}</strong> to <strong>${max.toFixed(2)}</strong>,
               with a median of <strong>${median.toFixed(2)}</strong>.</p>
            <p>This indicates the overall impact severity and distribution of damage.</p>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-title">Peak Damage Period</div>
          <div class="insight-content">
            <p>The highest levels were recorded on <strong>${formatDate(maxDate)}</strong>, with an average of <strong>${maxDateAvg.toFixed(2)}</strong>.</p>
            <p>This peak represents the most critical period for this type of infrastructure damage.</p>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-title">Damage Variability</div>
          <div class="insight-content">
            <p>The standard deviation of damage values is <strong>${stdDev.toFixed(2)}</strong>, indicating 
               ${stdDev > 2 ? 'high' : stdDev > 1 ? 'moderate' : 'low'} variability in reported damage levels.</p>
            <p>This may reflect ${stdDev > 2 ? 'inconsistent impact patterns or reporting' : stdDev > 1 ? 'natural variation in effects' : 'consistent impact across the area'}.</p>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-title">Box Plot Interpretation</div>
          <div class="insight-content">
            <p>The box plot visualization shows the distribution of damage values for each day.</p>
            <p>Each box represents the middle 50% of values, the line is the median, the dot shows the mean, and the whiskers indicate the full range excluding outliers.</p>
          </div>
        </div>
      </div>
    `;

    insightsContent.innerHTML = html;
  }

  // Function to draw the box plot
  function drawBoxPlot() {
    const selectedLocation = locationSelect.value;
    const selectedMetric = metricSelect.value;

    // Filter data based on selections
    const filtered = validData.filter(d =>
      d.location === selectedLocation && !isNaN(d[selectedMetric])
    );

    // Group data by date for statistical summaries
    const byDate = Array.from(d3.group(filtered, d => d.date), ([key, value]) => ({
      date: key,
      values: value.map(d => d[selectedMetric])
    }));

    // Calculate statistics for each date
    byDate.forEach(d => {
      d.min = d3.min(d.values);
      d.q1 = d3.quantile(d.values.sort(d3.ascending), 0.25);
      d.median = d3.median(d.values);
      d.q3 = d3.quantile(d.values.sort(d3.ascending), 0.75);
      d.max = d3.max(d.values);
      d.mean = d3.mean(d.values);
      // Calculate color based on mean damage level
      d.color = getDamageColor(d.mean);
    });

    // Sort by date
    byDate.sort((a, b) => a.date.localeCompare(b.date));

    // Format date for display
    const formatDate = d => {
      const dateObj = new Date(d);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Create SVG for box plot
    const container = document.getElementById("chart-container");
    const width = container.clientWidth;
    const height = 750; // Set fixed height to match animation graph
    container.style.height = `${height}px`;
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    container.innerHTML = "";

    // Create SVG
    const svg = d3.create("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale - categorical for dates
    const x = d3.scaleBand()
      .domain(byDate.map(d => d.date))
      .range([0, chartWidth])
      .padding(0.4);

    // Y scale - numerical for damage metrics
    const y = d3.scaleLinear()
      .domain([0, d3.max(byDate, d => d.max) * 1.1]) // Add 10% padding at top
      .nice()
      .range([chartHeight, 0]);

    // Add X axis with formatted dates
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(formatDate))
      .selectAll("text")
        .attr("y", 10)
        .attr("x", 0)
        .attr("fill", dashboardColors.text.light)
        .attr("text-anchor", "middle");

    // Style X axis
    g.select(".x-axis")
      .selectAll("line")
      .attr("stroke", dashboardColors.background.cardBorder);

    g.select(".x-axis")
      .selectAll("path")
      .attr("stroke", dashboardColors.background.cardBorder);

    // Add Y axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .attr("fill", dashboardColors.text.light);

    // Style Y axis
    g.select(".y-axis")
      .selectAll("line")
      .attr("stroke", dashboardColors.background.cardBorder);

    g.select(".y-axis")
      .selectAll("path")
      .attr("stroke", dashboardColors.background.cardBorder);

    // Add horizontal grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-chartWidth)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", dashboardColors.background.cardBorder)
      .attr("stroke-opacity", 0.3)
      .attr("stroke-dasharray", "3,3");

    // Remove grid axis line
    g.select(".grid path").remove();

    // Add vertical grid lines
    g.append("g")
      .attr("class", "grid vertical-grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-chartHeight)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", dashboardColors.background.cardBorder)
      .attr("stroke-opacity", 0.3)
      .attr("stroke-dasharray", "3,3");

    // Remove vertical grid axis line
    g.select(".vertical-grid path").remove();

    // Create groups for each box
    const boxGroups = g.selectAll(".box")
      .data(byDate)
      .join("g")
      .attr("class", "box")
      .attr("transform", d => `translate(${x(d.date) + x.bandwidth()/2},0)`);

    // Box width - half the band width
    const boxWidth = x.bandwidth() * 0.8;

    // Add boxes (rectangles for IQR)
    boxGroups.append("rect")
      .attr("x", -boxWidth / 2)
      .attr("y", d => y(d.q3))
      .attr("width", boxWidth)
      .attr("height", d => y(d.q1) - y(d.q3))
      .attr("fill", d => d.color)
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1)
      .attr("rx", 3) // Rounded corners
      .attr("ry", 3)
      .attr("opacity", 0.8);

    // Add median lines
    boxGroups.append("line")
      .attr("x1", -boxWidth / 2)
      .attr("x2", boxWidth / 2)
      .attr("y1", d => y(d.median))
      .attr("y2", d => y(d.median))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add min lines (lower whiskers)
    boxGroups.append("line")
      .attr("class", "whisker")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", d => y(d.q1))
      .attr("y2", d => y(d.min))
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    // Add max lines (upper whiskers)
    boxGroups.append("line")
      .attr("class", "whisker")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", d => y(d.q3))
      .attr("y2", d => y(d.max))
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    // Add min whisker ticks
    boxGroups.append("line")
      .attr("class", "whisker-tick")
      .attr("x1", -boxWidth / 4)
      .attr("x2", boxWidth / 4)
      .attr("y1", d => y(d.min))
      .attr("y2", d => y(d.min))
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    // Add max whisker ticks
    boxGroups.append("line")
      .attr("class", "whisker-tick")
      .attr("x1", -boxWidth / 4)
      .attr("x2", boxWidth / 4)
      .attr("y1", d => y(d.max))
      .attr("y2", d => y(d.max))
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    // Add mean points
    boxGroups.append("circle")
      .attr("cx", 0)
      .attr("cy", d => y(d.mean))
      .attr("r", 4)
      .attr("fill", "white")
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    // Add X axis label
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + chartWidth / 2)
      .attr("y", height - 10)
      .attr("fill", dashboardColors.text.light)
      .text("Date");

    // Add Y axis label
    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${margin.left / 3}, ${margin.top + chartHeight / 2}) rotate(-90)`)
      .attr("fill", dashboardColors.text.light)
      .text(getMetricLabel(selectedMetric));

    // Add chart title
    const neighborhoodTitle = neighborhoodMap[selectedLocation] || `Neighborhood ${selectedLocation}`;
    svg.append("text")
      .attr("class", "chart-title")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + chartWidth / 2)
      .attr("y", margin.top / 2)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", dashboardColors.text.light)
      .text(`${getMetricLabel(selectedMetric)} in ${neighborhoodTitle}`);

    // Add legend
    const legendGroup = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right - 150}, ${margin.top})`);

    // Legend title
    legendGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "12px")
      .attr("fill", dashboardColors.text.light)
      .text("Box Plot Elements:");

    // Box element
    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 10)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", dashboardColors.primary)
      .attr("stroke", dashboardColors.secondary)
      .attr("opacity", 0.8);

    legendGroup.append("text")
      .attr("x", 25)
      .attr("y", 22)
      .attr("font-size", "11px")
      .attr("fill", dashboardColors.text.light)
      .text("IQR (25-75%)");

    // Median line
    legendGroup.append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("y1", 40)
      .attr("y2", 40)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    legendGroup.append("text")
      .attr("x", 25)
      .attr("y", 44)
      .attr("font-size", "11px")
      .attr("fill", dashboardColors.text.light)
      .text("Median");

    // Mean point
    legendGroup.append("circle")
      .attr("cx", 7.5)
      .attr("cy", 60)
      .attr("r", 4)
      .attr("fill", "white")
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    legendGroup.append("text")
      .attr("x", 25)
      .attr("y", 64)
      .attr("font-size", "11px")
      .attr("fill", dashboardColors.text.light)
      .text("Mean");

    // Whisker
    legendGroup.append("line")
      .attr("x1", 7.5)
      .attr("x2", 7.5)
      .attr("y1", 75)
      .attr("y2", 90)
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    legendGroup.append("line")
      .attr("x1", 2.5)
      .attr("x2", 12.5)
      .attr("y1", 90)
      .attr("y2", 90)
      .attr("stroke", dashboardColors.secondary)
      .attr("stroke-width", 1);

    legendGroup.append("text")
      .attr("x", 25)
      .attr("y", 84)
      .attr("font-size", "11px")
      .attr("fill", dashboardColors.text.light)
      .text("Min/Max Range");

    // Add the SVG to the container
    container.appendChild(svg.node());

    // Update insights with this data
    updateInsights(selectedLocation, selectedMetric, filtered);
  }

  // Add event listeners to the selectors
  locationSelect.addEventListener("change", drawBoxPlot);
  metricSelect.addEventListener("change", drawBoxPlot);

  // Initial drawing
  setTimeout(() => {
    if (locationSelect.options.length > 0) {
      locationSelect.selectedIndex = 0;
      drawBoxPlot();
    }
  }, 100);
});
```