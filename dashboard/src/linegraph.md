---
theme: dashboard
title: line_graph
toc: false
---

# Variables Over Time 🌍

```js
import { dashboardColors, getDamageColor, applyDashboardStyles } from "/components/dashboard-styles.js";
import dashboardState, { applyGlobalFilters } from "/components/dashboard-state.js";
import { loadCommonLibraries, getMetricLabel, neighborhoodMap } from "/components/js.js";

applyDashboardStyles();

Promise.all([
  loadCommonLibraries(),
  FileAttachment("data/daily_mean_by_location.csv").csv({typed: true})
]).then(([_, loadedData]) => {
  const parsethedate = d3.timeParse("%d/%m/%Y");
  loadedData.forEach(d => {
    d.date = parsethedate(d.date);
    if (!d.date) {
      console.error("err", d);
    }
  });

  const startDate = parsethedate("06/04/2020");
  const endDate = parsethedate("10/04/2020");
  let filteredData = loadedData.filter(d => d.date >= startDate && d.date <= endDate);

  const locationSet = new Set();
  filteredData.forEach(d => locationSet.add(String(d.location)));
  const uniqueLocations = [...locationSet].sort((a, b) => a - b);

  const colorMap = {
    1: "#FF5733", // Palace Hills - bright red-orange
    2: "#33FF57", // Northwest - bright green
    3: "#3357FF", // Old Town - bright blue
    4: "#FF33F5", // Safe Town - bright pink
    5: "#F5FF33", // Southwest - bright yellow
    6: "#33FFF5", // Downtown - bright cyan
    7: "#C70039", // Wilson Forest - dark red
    8: "#8833FF", // Scenic Vista - bright purple
    9: "#FF8833", // Broadview - bright orange
    10: "#33FFBD", // Chapparal - bright mint
    11: "#00008B", // Terrapin Springs - dark blue
    12: "#FF3355", // Pepper Mill - bright red
    13: "#33FF99", // Cheddarford - bright seafoam
    14: "#9933FF", // Easton - bright violet
    15: "#FFBD33", // Weston - bright gold
    16: "#33CCFF", // Southton - bright sky blue
    17: "#FF33BD", // Oak Willow - bright magenta
    18: "#71FF33", // East Parton - bright lime
    19: "#FF5599"  // West Parton - bright rose
  };

  const getNeighborhoodName = (id) => {
    return neighborhoodMap[id] || `Neighborhood ${id}`;
  };

  applyCustomStyles();

  dashboardState.subscribe('filters', () => {
    const filters = dashboardState.getState('filters');
    const dataWithFilters = applyGlobalFilters(filteredData, {
      locationKey: 'location',
      timeKey: 'date'
    });

    updateLineChart(document.getElementById("metric-select").value, dataWithFilters);
    
    if (filters.location) {
      document.querySelectorAll(".location-checkbox").forEach(checkbox => {
        checkbox.checked = checkbox.value === filters.location;
      });
    }
  });

  function createLineChart(data, container, options = {}) {
    const {
      width = container.clientWidth,
      height = 450,
      yMetric = "shake_intensity",
      showTitle = true,
      isMini = false
    } = options;
    
    container.innerHTML = '';
    
    if (data.length === 0) {
      container.innerHTML = '<div class="no-data-message">No data available for the selected filters</div>';
      return;
    }
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.fontFamily = "Inter, sans-serif";
    container.appendChild(svg);
    
    const dataByLocation = {};
    uniqueLocations.forEach(loc => {
      dataByLocation[loc] = [];
    });
    
    data.forEach(d => {
      if (dataByLocation[d.location]) {
        dataByLocation[d.location].push(d);
      }
    });
    
    Object.keys(dataByLocation).forEach(loc => {
      dataByLocation[loc].sort((a, b) => a.date - b.date);
    });
    
    const allDates = data.map(d => d.date);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    const allValues = data.map(d => d[yMetric]);
    const maxValue = Math.max(...allValues) * 1.1;
    
    const xScale = date => {
      return ((date - minDate) / (maxDate - minDate)) * (width - 70) + 50;
    };
    
    const yScale = value => {
      return height - 40 - (value / maxValue) * (height - 60);
    };
    
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 50);
    xAxis.setAttribute("y1", height - 40);
    xAxis.setAttribute("x2", width - 20);
    xAxis.setAttribute("y2", height - 40);
    xAxis.setAttribute("stroke", "rgba(255,255,255,0.3)");
    svg.appendChild(xAxis);
    
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 50);
    yAxis.setAttribute("y1", 20);
    yAxis.setAttribute("x2", 50);
    yAxis.setAttribute("y2", height - 40);
    yAxis.setAttribute("stroke", "rgba(255,255,255,0.3)");
    svg.appendChild(yAxis);
    
    const dayRange = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const tickCount = isMini ? Math.min(3, dayRange) : Math.min(5, dayRange);
    const tickInterval = (maxDate - minDate) / (tickCount - 1);
    
    for (let i = 0; i < tickCount; i++) {
      const tickDate = new Date(minDate.getTime() + i * tickInterval);
      const tickX = xScale(tickDate);
      
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", tickX);
      tick.setAttribute("y1", height - 40);
      tick.setAttribute("x2", tickX);
      tick.setAttribute("y2", height - 35);
      tick.setAttribute("stroke", "rgba(255,255,255,0.5)");
      svg.appendChild(tick);
      
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", tickX);
      label.setAttribute("y", height - 25);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", dashboardColors.text.light);
      label.style.fontSize = "10px";
      label.textContent = tickDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
      svg.appendChild(label);
      
      const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      gridLine.setAttribute("x1", tickX);
      gridLine.setAttribute("y1", 20);
      gridLine.setAttribute("x2", tickX);
      gridLine.setAttribute("y2", height - 40);
      gridLine.setAttribute("stroke", "rgba(255,255,255,0.1)");
      gridLine.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(gridLine);
    }
    
    const tickValues = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
    
    tickValues.forEach(value => {
      const tickY = yScale(value);
      
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", 45);
      tick.setAttribute("y1", tickY);
      tick.setAttribute("x2", 50);
      tick.setAttribute("y2", tickY);
      tick.setAttribute("stroke", "rgba(255,255,255,0.5)");
      svg.appendChild(tick);
      
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", 40);
      label.setAttribute("y", tickY + 4);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("fill", dashboardColors.text.light);
      label.style.fontSize = "10px";
      label.textContent = value.toFixed(1);
      svg.appendChild(label);
      
      const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      gridLine.setAttribute("x1", 50);
      gridLine.setAttribute("y1", tickY);
      gridLine.setAttribute("x2", width - 20);
      gridLine.setAttribute("y2", tickY);
      gridLine.setAttribute("stroke", "rgba(255,255,255,0.1)");
      gridLine.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(gridLine);
    });
    
    if (showTitle) {
      const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
      title.setAttribute("x", width / 2);
      title.setAttribute("y", 15);
      title.setAttribute("text-anchor", "middle");
      title.setAttribute("fill", dashboardColors.text.light);
      title.style.fontSize = "14px";
      title.style.fontWeight = "bold";
      title.textContent = "Variables Over Time by Neighborhood";
      svg.appendChild(title);
    }
    
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.setAttribute("x", width / 2);
    xLabel.setAttribute("y", height - 5);
    xLabel.setAttribute("text-anchor", "middle");
    xLabel.setAttribute("fill", dashboardColors.text.light);
    xLabel.style.fontSize = "12px";
    xLabel.textContent = "Date";
    svg.appendChild(xLabel);
    
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("transform", `rotate(-90) translate(-${height/2}, 15)`);
    yLabel.setAttribute("text-anchor", "middle");
    yLabel.setAttribute("fill", dashboardColors.text.light);
    yLabel.style.fontSize = "12px";
    yLabel.textContent = getMetricLabel(yMetric);
    svg.appendChild(yLabel);
    
    Object.keys(dataByLocation).forEach(location => {
      const locationData = dataByLocation[location];
      if (locationData.length < 2) return;
      
      const pathData = locationData.map((d, i) => {
        const x = xScale(d.date);
        const y = yScale(d[yMetric]);
        return (i === 0 ? "M" : "L") + `${x},${y}`;
      }).join(" ");
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", colorMap[location]);
      path.setAttribute("stroke-width", "2");
      path.setAttribute("data-location", location);
      svg.appendChild(path);
      
      if (!isMini) {
        locationData.forEach(d => {
          const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          point.setAttribute("cx", xScale(d.date));
          point.setAttribute("cy", yScale(d[yMetric]));
          point.setAttribute("r", "3");
          point.setAttribute("fill", colorMap[location]);
          point.setAttribute("data-location", location);
          point.setAttribute("data-date", d.date.toISOString());
          point.setAttribute("data-value", d[yMetric]);
          
          svg.appendChild(point);
        });
      }
    });
    
    if (isMini) {
      const viewFullLink = document.createElement("div");
      viewFullLink.className = "view-full-link";
      viewFullLink.innerHTML = '<a href="linegraph" target="_self">View Full Chart</a>';
      container.appendChild(viewFullLink);
    }
    
    return svg;
  }

  function updateLineChart(selectedMetric, dataToUse = filteredData) {
    const selectedLocations = [...document.querySelectorAll(".location-checkbox:checked")]
        .map(checkbox => checkbox.value);

    const filteredDataSubset = dataToUse.filter(entry => 
      selectedLocations.includes(String(entry.location)));

    const chartContainer = document.getElementById("chart-container");
    
    createLineChart(filteredDataSubset, chartContainer, {
      yMetric: selectedMetric,
      showTitle: true
    });
    
    dashboardState.setState('visualizationStates.lineGraph.selectedMetric', selectedMetric);
  }

  function initMiniLineChart(data) {
    const container = document.getElementById('mini-linechart');
    if (!container) return;
    
    const filters = dashboardState.getState('filters');
    const selectedMetric = filters.metric || 'shake_intensity';
    
    const filteredDataForMini = applyGlobalFilters(data, {
      locationKey: 'location',
      timeKey: 'date'
    });
    
    createLineChart(filteredDataForMini, container, {
      height: 250,
      yMetric: selectedMetric,
      showTitle: false,
      isMini: true
    });
  }
  
  window.initMiniLineChart = function() {
    initMiniLineChart(filteredData);
  };

  document.getElementById("metric-select").addEventListener("change", event => {
    updateLineChart(event.target.value);
  });

  function applyCustomStyles() {
    const metricSelect = document.getElementById("metric-select");
    if (metricSelect) {
      metricSelect.style.padding = "8px 12px";
      metricSelect.style.backgroundColor = "rgba(42, 157, 143, 0.1)";
      metricSelect.style.color = dashboardColors.text.light;
      metricSelect.style.border = `1px solid ${dashboardColors.background.cardBorder}`;
      metricSelect.style.borderRadius = "4px";
      metricSelect.style.fontSize = "14px";
      metricSelect.style.marginLeft = "10px";
    }
    
    const controls = document.querySelectorAll(".section");
    controls.forEach(section => {
      section.style.marginBottom = "20px";
    });
    
    const chartContainer = document.getElementById("chart-container");
    if (chartContainer) {
      chartContainer.style.backgroundColor = "rgba(38, 70, 83, 0.2)";
      chartContainer.style.borderRadius = "8px";
      chartContainer.style.padding = "20px";
      chartContainer.style.height = "500px";
      chartContainer.style.position = "relative";
    }
    
    const labels = document.querySelectorAll(".section label");
    labels.forEach(label => {
      label.style.fontWeight = "500";
      label.style.color = dashboardColors.text.light;
      label.style.display = "inline-flex";
      label.style.alignItems = "center";
    });
  }

  const locationFilter = document.getElementById("location-filter");
  if (locationFilter) {
    locationFilter.style.display = "grid";
    locationFilter.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
    locationFilter.style.gap = "10px";
    locationFilter.style.marginTop = "10px";
    
    uniqueLocations.forEach(location => {
      const label = document.createElement("label");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.padding = "6px";
      label.style.backgroundColor = [1, 3, 5, 7, 9, 11, 15, 18].includes(Number(location)) ? 
        "rgba(42, 157, 143, 0.15)" : "rgba(42, 157, 143, 0.05)";
      label.style.borderRadius = "4px";
      label.style.cursor = "pointer";
      label.style.transition = "background-color 0.2s";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = location;
      checkbox.checked = [1, 3, 5, 7, 9, 11, 15, 18].includes(Number(location));
      checkbox.classList.add("location-checkbox");
      checkbox.style.marginRight = "8px";
      
      const colorSwatch = document.createElement("span");
      colorSwatch.style.display = "inline-block";
      colorSwatch.style.width = "12px";
      colorSwatch.style.height = "12px";
      colorSwatch.style.backgroundColor = colorMap[location];
      colorSwatch.style.borderRadius = "2px";
      colorSwatch.style.marginRight = "8px";
      
      checkbox.addEventListener("change", () => {
        updateLineChart(document.getElementById("metric-select").value);
        
        label.style.backgroundColor = checkbox.checked 
          ? "rgba(42, 157, 143, 0.15)" 
          : "rgba(42, 157, 143, 0.05)";
        
        const checkedBoxes = document.querySelectorAll(".location-checkbox:checked");
        if (checkedBoxes.length === 1 && checkbox.checked) {
          dashboardState.setState('filters.location', location);
        } else if (checkedBoxes.length > 1 && dashboardState.getState('filters.location')) {
          dashboardState.setState('filters.location', null);
        }
      });
      
      label.appendChild(checkbox);
      label.appendChild(colorSwatch);
      label.appendChild(document.createTextNode(getNeighborhoodName(location)));
      locationFilter.appendChild(label);
      
      label.addEventListener("mouseover", () => {
        if (!checkbox.checked) {
          label.style.backgroundColor = "rgba(42, 157, 143, 0.1)";
        }
      });
      
      label.addEventListener("mouseout", () => {
        if (!checkbox.checked) {
          label.style.backgroundColor = "rgba(42, 157, 143, 0.05)";
        }
      });
    });
  }

  const defaultSelectedLocations = ['1', '3', '5', '7', '9', '11', '15', '18'];
  const initialSelectedData = filteredData.filter(entry => 
    defaultSelectedLocations.includes(String(entry.location)));
  
  const chartContainer = document.getElementById("chart-container");
  createLineChart(initialSelectedData, chartContainer, {
    yMetric: "shake_intensity",
    showTitle: true
  });
  
  dashboardState.setState('visualizationStates.lineGraph.selectedMetric', "shake_intensity");
});
```

<div class="control-panel">
  <div class="section">
    <label for="metric-select"><strong>Choose a Metric:</strong></label>
    <select id="metric-select">
      <option value="shake_intensity">Shake Intensity</option>
      <option value="sewer_and_water">Sewer & Water</option>
      <option value="power">Power</option>
      <option value="roads_and_bridges">Roads & Bridges</option>
      <option value="medical">Medical</option>
      <option value="buildings">Buildings</option>
    </select>
  </div>
</div>

<div class="dashboard-card">
  <div class="dashboard-title">
    <i class="fas fa-map-marker-alt"></i> Filter by Neighborhood
  </div>
  <div id="location-filter"></div>
</div>

<div class="dashboard-card">
  <div class="dashboard-title">
    <i class="fas fa-chart-line"></i> Damage Metrics Over Time
  </div>
  <div id="chart-container"></div>
</div>

<div class="dashboard-description">
  <strong>Data Source:</strong> St. Himark Earthquake Monitoring System
</div>

<style>
.view-full-link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 15px;
  z-index: 100;
}

.view-full-link a {
  color: white;
  text-decoration: none;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.no-data-message {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: var(--text-muted);
  font-style: italic;
}
</style>