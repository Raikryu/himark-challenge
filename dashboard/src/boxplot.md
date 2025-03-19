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


FileAttachment("data/cleaned_mc1-reports-data.csv").csv({typed: true}).then(loadedData => {
  const parseDate = d3.timeParse("%d/%m/%Y %H:%M");

  // Convert and clean dates
  loadedData.forEach(d => {
      d.numericDate = parseDate(d.time); // Convert time to Date object
      d.date = d.numericDate ? d.numericDate.toISOString().split("T")[0] : null; // Keep only YYYY-MM-DD
  });

  console.log("Loaded Data Sample:", loadedData.slice(0, 10)); // Debug dataset

  const startDate = new Date("2020-04-06");
  const endDate = new Date("2020-04-10");

  // Get unique locations
  const locationSet = new Set(loadedData.map(d => String(d.location).trim())); // Ensure correct type
  const uniqueLocations = [...locationSet].sort(); // Sort for cleaner dropdown

  function Box_Plot(data, {width, yMetric} = {}) {
    return Plot.plot({
      title: `Box Plot of ${yMetric} for Selected Location Over Time`,
      width,
      height: 500,
      marginLeft: 50,
      marginBottom: 50,
      x: {
        grid: true,
        label: "Date",
        type: "time",
        ticks: d3.timeDay.every(1),
        tickFormat: d3.timeFormat("%d/%m/%Y")
      },
      y: {grid: true, label: yMetric},
      marks: [
        Plot.ruleY([0]), // Baseline
        Plot.boxY(data, { 
          x: "numericDate", // Separate box plot per date
          y: "median", // Center value
          y1: "min",   // Lower whisker
          y2: "max",   // Upper whisker
          q1: "q1",    // 25th percentile
          q3: "q3",    // 75th percentile
          stroke: "black",
          fill: "steelblue",
          opacity: 0.7
        })
      ]
    });
  }

  function updateBoxPlot() {
    const selectedMetric = document.getElementById("metric-select").value;
    const selectedLocation = document.getElementById("location-select").value;

    // Filter data by location and date range
    const filteredData = loadedData.filter(d => 
      String(d.location).trim() === selectedLocation &&  // Ensure same type (string)
      d.numericDate && d.numericDate >= startDate && d.numericDate <= endDate &&
      !isNaN(d[selectedMetric]) // Ensure value is a number
    );

    console.log("Filtered Data for Selected Location & Metric:", filteredData);

    // Compute box plot statistics per date dynamically
    const groupedByDate = d3.group(filteredData, d => d.date);
    const boxPlotData = [];

    groupedByDate.forEach((entries, date) => {
      const values = entries.map(d => d[selectedMetric]).sort(d3.ascending).filter(v => !isNaN(v));

      if (values.length > 0) {
        boxPlotData.push({
          numericDate: new Date(date),  // Ensure it's a valid Date object
          min: d3.min(values) || 0,
          q1: d3.quantile(values, 0.25) || 0,
          median: d3.median(values) || 0,
          q3: d3.quantile(values, 0.75) || 0,
          max: d3.max(values) || 0
        });
      }
    });

    console.log("Box Plot Data (Computed):", boxPlotData);

    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = "";

    if (boxPlotData.length > 0) {
      const newChart = Box_Plot(boxPlotData, { width: chartContainer.clientWidth, yMetric: selectedMetric });
      chartContainer.appendChild(newChart);
    } else {
      chartContainer.innerHTML = "<p style='color:red;'>⚠️ No data available for this selection.</p>";
      console.warn("⚠️ No data available for the selected location & variable.");
    }
  }

  // Ensure event listeners run only after the DOM loads
  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("metric-select").addEventListener("change", updateBoxPlot);
    document.getElementById("location-select").addEventListener("change", updateBoxPlot);
    updateBoxPlot();  // Initialize with default selections
  });

  // Populate location dropdown
  const locationDropdown = document.getElementById("location-select");

  // Clear dropdown before adding new options
  locationDropdown.innerHTML = "";

  // Add default placeholder option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a Location";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  locationDropdown.appendChild(defaultOption);

  // Populate dropdown
  uniqueLocations.forEach(location => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = `Location ${location}`;
    locationDropdown.appendChild(option);
  });
});

