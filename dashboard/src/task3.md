---
theme: dashboard
title: Task 3
toc: false
---

# Region Conditions and Uncertainty Overtime

This dashboard visualises the change in conditions and uncertainty of reportings overtime. To track damage reporting consistently over time intervals across all days, the mean is used to represent this. Additionally, to measure how uncertainty fluctuates over specific time periods, relevant uncertainty statistics are utilised, in this case the standard deviation is used.

## Uncertainty Overtime by Damage Type
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


<style>
  #plot-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

  }

  #dropdown-container {
    width: 100%;
    max-width: 400px;
    margin-bottom: 0px;
    text-align: center;
  }

  #plot-container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    height: 600px;
  }
</style>

## Region Damage Change Overtime

```js

const reports = await FileAttachment("data/avgdamage.csv").csv({ typed: true });

const damageTypes = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity"
];

const timeValues = [...new Set(reports.map(d => d.time_5min))].sort((a, b) => new Date(a) - new Date(b));

const neighborLinks = {
  1: [2, 5],
  2: [1, 5, 6, 3],
  3: [2, 15, 14, 4],
  4: [3, 14, 19, 18, 13, 12],
  5: [1, 2, 6, 16, 19, 17],
  6: [2, 5, 16, 15],
  7: [12, 11, 8],
  8: [9, 10, 11, 7],
  9: [17, 13, 10, 8],
  10: [8, 9, 13, 12, 11],
  11: [10, 13, 12, 7, 8],
  12: [4, 13, 10, 11, 7],
  13: [4, 12, 18, 17, 9, 10, 11],
  14: [3, 4, 19, 16, 15, 18],
  15: [2, 3, 14, 19, 16, 6],
  16: [6, 15, 14, 19, 5],
  17: [19, 18, 13, 9, 5],
  18: [4, 14, 19, 17, 13],
  19: [14, 4, 18, 17, 5, 16, 15]
};

const locations = Array.from({ length: 19 }, (_, i) => i + 1);

const layoutRadius = 1.5;
const angleStep = (2 * Math.PI) / locations.length;
const locationPositions = Object.fromEntries(
  locations.map((loc, i) => [
    loc,
    {
      x: Math.cos(i * angleStep) * layoutRadius,
      y: Math.sin(i * angleStep) * layoutRadius
    }
  ])
);

function scaleSize(value) {
  const minRadius = 50;
  const maxRadius = 200;
  return minRadius + (value * (maxRadius - minRadius));
}

function createNetworkDiagram(time, selectedDamage) {
  const dataAtTime = Object.fromEntries(
    reports.filter(d => d.time_5min === time)
           .map(d => [d.location, d])
  );

  const nodes = locations.map(loc => {
    const pos = locationPositions[loc];
    const data = dataAtTime[loc];
    const value = data ? data[selectedDamage] : null;
    const isMissing = value === null || value === undefined || isNaN(value);
    return {
      id: loc,
      group: "location",
      x: pos.x,
      y: pos.y,
      r: isMissing ? 20 : scaleSize(value),
      fill: isMissing ? "red" : "#4292c6"
    };
  });

  const links = [];
  for (const [source, targets] of Object.entries(neighborLinks)) {
    for (const target of targets) {
      if (Number(source) < target) {
        links.push({
          source: +source,
          target,
          x1: locationPositions[source].x,
          y1: locationPositions[source].y,
          x2: locationPositions[target].x,
          y2: locationPositions[target].y
        });
      }
    }
  }

  return Plot.plot({
    width: 800,
    height: 800,
    x: { domain: [-2, 2], axis: null },
    y: { domain: [-2, 2], axis: null },
    marks: [
      Plot.link(links, {
        x1: "x1",
        y1: "y1",
        x2: "x2",
        y2: "y2",
        stroke: "gray",
        strokeWidth: 2
      }),
      Plot.dot(nodes, {
        x: "x",
        y: "y",
        r: "r",
        fill: "fill"
      }),
      Plot.text(nodes, {
        x: "x",
        y: "y",
        text: d => d.id,
        fill: "white",
        textAnchor: "middle",
        fontSize: 14
      })
    ]
  });
}

function renderControls() {
  const container = document.getElementById("network-container");
  container.innerHTML = "";

  const controlsDiv = document.createElement("div");
  controlsDiv.style.marginBottom = "20px";

  const dropdown = document.createElement("select");
  damageTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.replace(/_/g, " ");
    dropdown.appendChild(option);
  });

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = timeValues.length - 1;
  slider.value = 0;
  slider.style.width = "100%";
  slider.style.marginTop = "10px";

  const timeLabel = document.createElement("div");
  timeLabel.style.marginTop = "5px";

  const updateDiagram = () => {
    const selectedTime = timeValues[slider.value];
    const selectedDamage = dropdown.value;
    timeLabel.textContent = `Time: ${new Date(selectedTime).toLocaleString()}`;
    renderNetworkDiagram(selectedTime, selectedDamage);
  };

  dropdown.addEventListener("change", updateDiagram);
  slider.addEventListener("input", updateDiagram);

  controlsDiv.appendChild(dropdown);
  controlsDiv.appendChild(slider);
  controlsDiv.appendChild(timeLabel);
  container.appendChild(controlsDiv);

  updateDiagram();
}

function renderNetworkDiagram(time, damageType) {
  const container = document.getElementById("network-container");
  let existing = document.getElementById("networkDiagram");
  if (existing) existing.remove();

  const diagramDiv = document.createElement("div");
  diagramDiv.id = "networkDiagram";
  diagramDiv.style.marginTop = "20px";
  diagramDiv.appendChild(createNetworkDiagram(time, damageType));

  container.appendChild(diagramDiv);
}

renderControls();

```

<div id="network-container"></div>


## Damage Uncertainty by Location

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
      domain: Array.from({ length: 19 }, (_, i) => i + 1)
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
