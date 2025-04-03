---
theme: dashboard
title: Uncertainty Overtime
toc: false
---

# Damage Uncertainty Timeline

```js

const reports = await FileAttachment("data/uncertainty.csv").csv({typed: true,
});

const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

const heatmap_data = reports.flatMap(d =>
  Object.keys(d)
    .filter(key => key !== "time_5min")
    .map(damageType => ({
      time: parseTime(d.time_5min),
      damageType: damageType,
      value: +d[damageType]
    }))
);

const heatmapMax = Math.log(d3.max(heatmap_data.map(d => d.value)) + 1);
const legendMax = d3.max(heatmap_data.map(d => d.value));

const formatDate = d3.timeFormat("%Y-%m-%d");

const days = {
  day1: heatmap_data.filter(d => formatDate(d.time) === "2020-04-06"),
  day2: heatmap_data.filter(d => formatDate(d.time) === "2020-04-07"),
  day3: heatmap_data.filter(d => formatDate(d.time) === "2020-04-08"),
  day4: heatmap_data.filter(d => formatDate(d.time) === "2020-04-09"),
  day5: heatmap_data.filter(d => formatDate(d.time) === "2020-04-10"),
};

const color = Plot.scale({
  color: {
    type: "linear",
    domain: [0, legendMax],
    range: ["#f7fbff", "#fdae61", "#d73027"],
    legend: true
  }
});

const legend = Plot.legend({
  color: {
    type: "linear",
    domain: [0, legendMax],
    range: [
      "#f7fbff",
      "#fdae61",
      "#d73027"
    ],
    label: "Uncertainty (Standard Deviation)"
  },
  marginTop: 20,
  width: 400
});

function heatmap(data, {width} = {}) {
  return Plot.plot({
    width,
    height: 500,
    marginLeft: 80,
    marginBottom: 40,
    x: {
      type: "band",
      label: "Time",
      ticks: d3.timeHour.every(1),
      tickFormat: d3.timeFormat("%H:%M")
    },
    y: {
      label: "Damage Type",
      domain: ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]
    },
    color,
    marks: [
      Plot.cell(data, {
        x: "time",
        y: "damageType",
        fill: "value",
        title: d => `Time: ${d3.timeFormat("%Y-%m-%d %H:%M")(d.time)}\nDamage: ${d.damageType}\nStandard Deviation: ${d.value.toFixed(2)}`
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
<div>
  ${legend}
</div>

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

# Damage Uncertainty by Location

```js
const uncertaintyData = await FileAttachment("data/uncertainty2.csv").csv({typed: true});

const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

const bubbleData = uncertaintyData.flatMap(d =>
  Object.keys(d)
    .filter(key => key !== "location" && key !== "time_5min") 
    .map(damageType => ({
      time: parseTime(d.time_5min),
      location: d.location,
      damageType: damageType,
      value: d[damageType],
      size: d[damageType],  
    }))
);

const damageTypes = Array.from(new Set(bubbleData.map(d => d.damageType)));

const wrapper = d3.select("body").append("div").attr("id", "plot-wrapper");

const dropdownContainer = wrapper.append("div").attr("id", "dropdown-container")

const dropdown = dropdownContainer.append("select")
  .attr("id", "damage-type-selector")
  .on("change", updatePlot);

dropdown.selectAll("option")
  .data(damageTypes)
  .enter().append("option")
  .text(d => d)
  .attr("value", d => d);

let selectedDamageType = damageTypes[0];

function updatePlot() {
  selectedDamageType = d3.select("#damage-type-selector").property("value");

  d3.select("#plot-container").html(""); 

  const plot = Plot.plot({
    width: 1000,
    height: 600,
    marginLeft: 100,
    marginBottom: 60,
    x: {
      label: "Time",
      type: "utc",
      ticks: d3.timeHour.every(24),
      tickFormat: d3.timeFormat("%H:%M")
    },
    y: {
      label: "Location",
      domain: Array.from({ length: 19 }, (_, i) => i + 1) // 
    },
    color: { scheme: "category10" },
    marks: [
      Plot.dot(bubbleData.filter(d => d.damageType === selectedDamageType), {
        x: "time",
        y: "location",
        r: "size",
        fill: "damageType",
        opacity: 0.6,
        title: (d) => `${d.damageType}: ${d.value}`
      })
    ],
    interaction: { zoom: true, wheel: true, pan: true }
  });

  d3.select("#plot-container").node().appendChild(plot);
}

const plotContainer = wrapper.append("div").attr("id", "plot-container");

updatePlot();

