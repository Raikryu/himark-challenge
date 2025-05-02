---
theme: dashboard
title: St. Himark Damage Box Plot
toc: false
---

# St. Himark Damage Metrics by Date 📊

<div class="control-panel">
  <div class="control-group">
    <label for="location-select"><strong>Select a Location:</strong></label>
    <select id="location-select" class="dashboard-select"></select>
  </div>
  <div class="control-group">
    <label for="metric-select"><strong>Select a Damage Metric:</strong></label>
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

<div class="chart-container">
  <div id="chart-container" class="chart-box"></div>
</div>

<div style="margin-top: 50px;">
  <h2>Analysis Insights</h2>
  <div class="dashboard-card insights-card">
    <div class="dashboard-title">
      <i class="fas fa-lightbulb"></i> Box Plot Interpretation
    </div>
    <div id="insights-content">
      <p>Select a location and damage metric to analyze the distribution of values over time. The box plot shows the median (middle line), quartiles (box edges), and range (whiskers) of each damage metric, helping identify patterns and outliers.</p>
    </div>
  </div>
</div>

```js
// Apply styles for the dashboard
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
  height: 600px;
  min-height: 600px;
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
  margin-top: 1rem;
}
.insights-content p {
  margin: 0.7rem 0;
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
    option.textContent = `Neighborhood ${loc}`;
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

    // Create insights HTML
    const html = `
      <p>In Neighborhood ${location}, the ${getMetricLabel(metric)} ranged from <strong>${min.toFixed(2)}</strong> to <strong>${max.toFixed(2)}</strong>,
         with a median of <strong>${median.toFixed(2)}</strong>.</p>
      <p>The highest levels were recorded on <strong>${formatDate(maxDate)}</strong>, with an average of <strong>${maxDateAvg.toFixed(2)}</strong>.</p>
      <p>Box plots show the distribution of damage values across each day, with the box representing the middle 50% of values
         and the whiskers showing the full range excluding outliers.</p>
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
    const height = container.clientHeight;
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
    svg.append("text")
      .attr("class", "chart-title")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + chartWidth / 2)
      .attr("y", margin.top / 2)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", dashboardColors.text.light)
      .text(`${getMetricLabel(selectedMetric)} in Neighborhood ${selectedLocation}`);

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