---
theme: dashboard
title: heatmap
toc: false
---

# Earthquake Reports

```js

const reports = await FileAttachment("data/heatmap_data.csv").csv({typed: true,
});


const heatmap_data = reports.flatMap(d =>
  Object.keys(d).filter(key => key !== "time_30min").map(region => ({
    time: d.time_30min,
    region: region,
    value: +d[region]
  }))
);

const days = {
  day1: heatmap_data.filter(d => d.time.startsWith("2020-04-06")),
  day2: heatmap_data.filter(d => d.time.startsWith("2020-04-07")),
  day3: heatmap_data.filter(d => d.time.startsWith("2020-04-08")),
  day4: heatmap_data.filter(d => d.time.startsWith("2020-04-09")),
  day5: heatmap_data.filter(d => d.time.startsWith("2020-04-10")),
};


```

```js

const color = Plot.scale({
  color: {
    type: "linear",
    domain: [0, d3.max(heatmap_data, d => d.value)],
    range: ["#dbe9f6", "#08306b"], 
    legend: true
  }
});


```

```js
function heatmap(data, {width} = {}) {
  return Plot.plot({
    title: "Number of Reports Overtime",
    width,
    height: 500,
    marginLeft: 60,
    marginBottom: 40,
    x: {
      label: "Time",
    },
    y: {
      label: "Regions",
      domain: Array.from({length: 19}, (_, i) => String(i + 1)) 
    },
    color,
    marks: [
      Plot.cell(data, {
        x: "time",
        y: "region",
        fill: "value",
        title: d => `Time: ${d.time}\nRegion: ${d.region}\nReports: ${d.value}`
      })
    ],
    interaction: {
      zoom: true,
      wheel: true,
      pan: true
    }
  });
}


```

<div class="grid grid-cols-1">
  <div class="card">
    <h3>Date: April 6, 2020</h3>
    ${resize((width) => heatmap(days.day1, {width}))}
  </div>
    <div class="card">
    <h3>Date: April 7, 2020</h3>
    ${resize((width) => heatmap(days.day2, {width}))}
  </div>
    <div class="card">
    <h3>Date: April 8, 2020</h3>
    ${resize((width) => heatmap(days.day3, {width}))}
  </div>
    <div class="card">
    <h3>Date: April 9, 2020</h3>
    ${resize((width) => heatmap(days.day4, {width}))}
  </div>
      <div class="card">
    <h3>Date: April 10, 2020</h3>
    ${resize((width) => heatmap(days.day5, {width}))}
  </div>

</div>

