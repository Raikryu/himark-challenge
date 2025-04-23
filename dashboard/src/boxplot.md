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

FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
  const raw = d3.csvParse(text.replace(/\r\n/g, "\n").trim(), d3.autoType);
  const parseDate = d3.timeParse("%d/%m/%Y %H:%M");

  raw.forEach(d => {
    d.numericDate = parseDate(d.time);
    d.location = String(d.location).trim();
    d.date = d.numericDate ? d.numericDate.toISOString().split("T")[0] : null;
  });

  const rangeStart = new Date("2020-04-06");
  const rangeEnd = new Date("2020-04-10");
  const validData = raw.filter(d => d.numericDate >= rangeStart && d.numericDate <= rangeEnd);

  const locations = [...new Set(validData.map(d => d.location))].sort((a, b) => +a - +b);
  const locationSelect = document.getElementById("location-select");
  locationSelect.innerHTML = "";
  locations.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = `Neighborhood ${loc}`;
    locationSelect.appendChild(option);
  });

  const metricSelect = document.getElementById("metric-select");

  function draw() {
    const selectedLocation = locationSelect.value;
    const selectedMetric = metricSelect.value;

    const filtered = validData.filter(d =>
      d.location === selectedLocation && !isNaN(d[selectedMetric])
    );

    const chart = Plot.plot({
      width: 800,
      height: 500,
      x: { label: "Date", type: "band" },
      y: { label: selectedMetric, grid: true },
      marks: [
        Plot.ruleY([0]),
        Plot.boxY(filtered, {
          x: "date",
          y: selectedMetric,
          fill: "steelblue",
          opacity: 0.7
        })
      ]
    });

    const container = document.getElementById("chart-container");
    container.innerHTML = "";
    container.appendChild(chart);
  }

  locationSelect.addEventListener("change", draw);
  metricSelect.addEventListener("change", draw);

  setTimeout(() => {
    locationSelect.selectedIndex = 0;
    draw();
  }, 100);
});
