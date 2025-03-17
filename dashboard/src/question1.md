---
theme: dashboard
title: Shake Intensity Dashboard
toc: false
---

# variables over time🌍


```js
const data = FileAttachment("data/daily_mean_by_location.csv").csv({typed: true});
```



```js
const parseDate = d3.timeParse("%d/%m/%Y"); 
data.forEach(d => d.date = parseDate(d.date));s

const filteredData = data.filter(d => d.date >= new Date("2020-04-06") && d.date <= new Date("2020-04-10"));
```


```js
const uniqueLocations = Array.from(new Set(filteredData.map(d => String(d.location))));
const colorScale = d3.scaleOrdinal(d3.schemeCategory10.concat(d3.schemeSet3, d3.schemePaired)).domain(uniqueLocations);
```


```js
function shakeIntensityChart(data, {width} = {}) {
  return Plot.plot({
    title: "Variables Over Time by Neighborhood",
    width,
    height: 400,
    marginLeft: 50,
    marginBottom: 50, 
    x: {
      grid: true,
      label: "Date",
      type: "time",
      ticks: d3.timeDay.every(1),
      tickFormat: d3.timeFormat("%B %d") 
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


<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => shakeIntensityChart(filteredData, {width}))}
  </div>
</div>

Data Source: Earthquake Monitoring System
