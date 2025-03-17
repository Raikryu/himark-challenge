---
theme: dashboard
title: Shake Intensity Dashboard
toc: false
---

# Shake Intensity Over Time 🌍

<!-- Load the data -->

```js
const data = FileAttachment("data/daily_mean_by_location.csv").csv({typed: true});
```

<!-- Fix Date Formatting & Filter Data for the Required Date Range -->

```js
const parseDate = d3.timeParse("%d/%m/%Y"); // Ensure proper parsing
data.forEach(d => {
    d.date = parseDate(d.date); 
    if (!d.date) {
        console.error("❌ Date Parsing Failed for:", d);
    }
});


const startDate = parseDate("06/04/2020");
const endDate = parseDate("10/04/2020");
const filteredData = data.filter(d => d.date >= startDate && d.date <= endDate);

```

<!-- Define a Unique Color Scale for Each Neighborhood -->

```js
const uniqueLocations = Array.from(new Set(filteredData.map(d => String(d.location))));
const colorScale = d3.scaleOrdinal(d3.schemeCategory10.concat(d3.schemeSet3, d3.schemePaired)).domain(uniqueLocations);
```

<!-- Function to Create the Line Chart with Unique Colors and Legend -->

```js
function shakeIntensityChart(data, {width} = {}) {
  return Plot.plot({
    title: "Shake Intensity Over Time by Neighborhood",
    width,
    height: 400,
    marginLeft: 50,
    marginBottom: 50, // Increase bottom margin to avoid label overlap
    x: {
      grid: true,
      label: "Date",
      type: "time",
      ticks: d3.timeDay.every(1), // Ensure daily ticks
      tickFormat: d3.timeFormat("%B %d") // Format as 'April 07', 'April 08', etc.
    },
    y: {grid: true, label: "Shake Intensity"},
    color: {legend: true, domain: uniqueLocations, range: colorScale.range()},
    marks: [
      Plot.line(data, {x: "date", y: "shake_intensity", stroke: d => colorScale(String(d.location)), strokeWidth: 2, tip: true}),
      Plot.ruleY([0])
    ]
  });
}




```

<!-- Display the Line Chart -->

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => shakeIntensityChart(filteredData, {width}))}
  </div>
</div>

Data Source: Earthquake Monitoring System


