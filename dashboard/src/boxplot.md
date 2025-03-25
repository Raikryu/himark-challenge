---
theme: dashboard
title: box_plot
toc: false
---

# Box Plot of Selected Variable by Date 📊

<div class="section">
  <label for="location-select"><strong>Select a Location:</strong></label>
  <select id="location-select"></select>
</div>

<div class="section">
  <label for="metric-select"><strong>Select a Variable:</strong></label>
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
  <div id="chart-container" class="chart-box"></div>
</div>


```js



// Upload your file and use FileAttachment
data = FileAttachment("data/cleaned_mc1-reports-data.csv").csv({typed: true}).then(raw => {
  const parseDate = d3.timeParse("%d/%m/%Y %H:%M");
  return raw.map(d => {
    d.numericDate = parseDate(d.time);
    d.date = d.numericDate ? d.numericDate.toISOString().split("T")[0] : null;
    return d;
  });
})


filtered = data.filter(d =>
  d.numericDate &&
  d.numericDate >= new Date("2020-04-06") &&
  d.numericDate <= new Date("2020-04-10") &&
  String(d.location).trim() === selectedLocation &&
  !isNaN(d[selectedMetric])
)



Plot.plot({
  width: 800,
  height: 500,
  x: {
    type: "time",
    label: "Date",
    ticks: d3.timeDay.every(1),
    tickFormat: d3.timeFormat("%Y-%m-%d")
  },
  y: {
    label: selectedMetric,
    grid: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.boxY(filtered, {
      x: "numericDate",
      y: selectedMetric,
      fill: "steelblue",
      opacity: 0.7
    })
  ]
})
