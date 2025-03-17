---
theme: dashboard
title: line_graph
toc: false
---

# Variables Over Time 🌍

```js
FileAttachment("data/daily_mean_by_location.csv").csv({typed: true}).then(loadedData => {
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
  const uniqueLocations = [...locationSet];

  const colorSchemes = [...d3.schemeCategory10, ...d3.schemeSet3, ...d3.schemePaired];
  const colorScale = d3.scaleOrdinal(colorSchemes).domain(uniqueLocations);


  function Line_Chart(data, {width, yMetric = "shake_intensity"} = {}) {
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



function updateLineChart(selectedMetric) {

    const selectedLocations = [...document.querySelectorAll(".location-checkbox:checked")]
        .map(checkbox => checkbox.value);

  
    const filteredDataSubset = filteredData.filter(entry => selectedLocations.includes(String(entry.location)));


    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = "";


    const newChart = Line_Chart(filteredDataSubset, { width: chartContainer.clientWidth, yMetric: selectedMetric });


    if (newChart) {
        chartContainer.appendChild(newChart);
    } else {
        console.error("Failure");
    }
}

document.getElementById("metric-select").addEventListener("change", event => {
    updateLineChart(event.target.value);
});


  const locationFilter = document.getElementById("location-filter");
  uniqueLocations.forEach(location => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = location;
    checkbox.checked = true;
    checkbox.classList.add("location-checkbox");
    checkbox.addEventListener("change", () => updateLineChart(document.getElementById("metric-select").value));
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` Neighborhood ${location} `));
    locationFilter.appendChild(label);
  });


  updateLineChart("shake_intensity");
});
```



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


<div class="section">
  <label><strong>Filter by Location:</strong></label>
  <div id="location-filter"></div>
</div>


<div class="section">
  <div id="chart-container" class="chart-box"></div>
</div>


Data Source: Earthquake Monitoring System
