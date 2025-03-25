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
  // 🔧 Clean line endings, auto-type fields
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const raw = d3.csvParse(cleaned, d3.autoType);

  const parseDate = d3.timeParse("%d/%m/%Y %H:%M");

  // ⏱️ Parse time and clean location values
  raw.forEach(d => {
    d.numericDate = parseDate(d.time);
    d.location = String(d.location).trim(); // 💡 ensure consistent string
    d.date = d.numericDate ? d.numericDate.toISOString().split("T")[0] : null;
  });

  // 📅 Filter for the desired date range
  const startDate = new Date("2020-04-06");
  const endDate = new Date("2020-04-10");
  const validData = raw.filter(d => d.numericDate && d.numericDate >= startDate && d.numericDate <= endDate);

  // 🧭 Get unique, sorted locations
  const locationSet = new Set(validData.map(d => d.location));
  const uniqueLocations = [...locationSet].sort((a, b) => +a - +b); // 🔢 sort numerically

  // 📥 Populate location dropdown
  const locationSelect = document.getElementById("location-select");
  locationSelect.innerHTML = ""; // clear existing
  uniqueLocations.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc;
    opt.textContent = `Neighborhood ${loc}`;
    locationSelect.appendChild(opt);
  });

  // Metric selector already present
  const metricSelect = document.getElementById("metric-select");

  function drawBoxPlot() {
    const selectedLocation = locationSelect.value;
    const selectedMetric = metricSelect.value;

    const filtered = validData.filter(d =>
      d.location === selectedLocation && !isNaN(d[selectedMetric])
    );

    const chart = Plot.plot({
      width: 800,
      height: 500,
      x: {
        label: "Date",
        type: "band" // ✅ required for categorical string x-axis
      },
      y: {
        label: selectedMetric,
        grid: true
      },
      marks: [
        Plot.ruleY([0]),
        Plot.boxY(filtered, {
          x: "date", // ✅ string like "2020-04-07"
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

  // 🧠 Dropdown listeners
  locationSelect.addEventListener("change", drawBoxPlot);
  metricSelect.addEventListener("change", drawBoxPlot);

  // 🚀 Initial render after short delay
  setTimeout(() => {
    locationSelect.selectedIndex = 0;
    drawBoxPlot();
  }, 100);
});
