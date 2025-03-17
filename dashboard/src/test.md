---
theme: dashboard
title: Shake Intensity Dashboard
toc: false
---

# Shake Intensity Over Time 🌍

```js
FileAttachment("data/daily_mean_by_location.csv").csv({typed: true}).then(loadedData => {
  const parseDate = d3.timeParse("%d/%m/%Y");
  loadedData.forEach(d => {
      d.date = parseDate(d.date); 
      if (!d.date) {
          console.error("❌ Date Parsing Failed for: ", d);
      }
  });

  const startDate = parseDate("06/04/2020");
  const endDate = parseDate("10/04/2020");
  let filteredData = loadedData.filter(d => d.date >= startDate && d.date <= endDate);

  const uniqueLocations = Array.from(new Set(filteredData.map(d => String(d.location))));
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10.concat(d3.schemeSet3, d3.schemePaired)).domain(uniqueLocations);

  function shakeIntensityChart(data, {width, yMetric = "shake_intensity"} = {}) {
    return Plot.plot({
      title: "Variable Change Over Time by Neighborhood",
      width,
      height: 430,
      marginLeft: 50,
      marginBottom: 50,
      x: {
        grid: true,
        label: "Date",
        type: "time",
        ticks: d3.timeDay.every(1),
        tickFormat: d3.timeFormat("%B %d")
      },
      y: {grid: true, label: yMetric},
      color: {legend: true, domain: uniqueLocations, range: colorScale.range()},
      marks: [
        Plot.line(data, {x: "date", y: yMetric, stroke: d => colorScale(String(d.location)), strokeWidth: 2, tip: true}),
        Plot.ruleY([0])
      ]
    });
  }

  function updateChart(metric) {
    const selectedLocations = Array.from(document.querySelectorAll(".location-checkbox:checked"))
      .map(cb => cb.value);
    const filteredSubset = filteredData.filter(d => selectedLocations.includes(String(d.location)));
    
    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = "";
    const newChart = shakeIntensityChart(filteredSubset, {width: chartContainer.clientWidth, yMetric: metric});
    if (newChart) {
      chartContainer.appendChild(newChart);
    } else {
      console.error("Chart generation failed.");
    }
  }

  document.getElementById("metric-select").addEventListener("change", function() {
    updateChart(this.value);
  });


  const locationFilter = document.getElementById("location-filter");
  uniqueLocations.forEach(location => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = location;
    checkbox.checked = true;
    checkbox.classList.add("location-checkbox");
    checkbox.addEventListener("change", () => updateChart(document.getElementById("metric-select").value));
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` Neighborhood ${location} `));
    locationFilter.appendChild(label);
  });


  updateChart("shake_intensity");
});
```


<div class="grid grid-cols-1">
  <div class="card">
    <label for="metric-select">Choose a Metric:</label>
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

<!-- Location Selection Checkboxes -->

<div class="grid grid-cols-1">
  <div class="card">
    <label><strong>Select Locations:</strong></label>
    <div id="location-filter"></div>
  </div>
</div>

<!-- Display the Line Chart -->

<div class="grid grid-cols-1">
  <div class="card">
    <div id="chart-container"></div>
  </div>
</div>

Data Source: Earthquake Monitoring System
