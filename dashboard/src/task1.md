---
theme: dashboard
title: Testing
toc: false
---

# Task 1

Emergency response based on the shake map

Determined how their response should change based on damage reports from citizens on ground
  - Shake map instrument data vs reported shake data
  - Heat map vs heat map


- Somehow create map
    - map regions selectable
    - show radar, piechart something as summary of their damage
    - show summary of worst affected regions



## Supplied heat map vs Generated

- Supplied heatmap shows the intensity of the instrumentation readings - Generated heatmap shows the intensity of shake that has been reported in each neighbourhood
1. Two a
How to prioritize neighborhoods?
  - Look at weath and characteristics of neighbourhoods
  - The instrument damage and recorded
```js
{
  const neighborhoodMap = {
    1: "Palace Hills", 2: "Northwest", 3: "Old Town", 4: "Safe Town", 5: "Southwest",
    6: "Downtown", 7: "Wilson Forest", 8: "Scenic Vista", 9: "Broadview", 10: "Chapparal",
    11: "Terrapin Springs", 12: "Pepper Mill", 13: "Cheddarford", 14: "Easton", 15: "Weston",
    16: "Southton", 17: "Oak Willow", 18: "East Parton", 19: "West Parton"
  };

  const raw = await FileAttachment("data/mc1-reports-cleaned.csv").csv({typed: true});

  // Extract just the date and enrich with neighborhood name
  const data = raw.map(d => ({
    ...d,
    day: d.time?.split(" ")[0],  // e.g., "2020-04-08"
    neighborhood: neighborhoodMap[+d.location] || `Unknown (${d.location})`
  }));

  // Only use valid dates that exist in data
  const uniqueDays = [...new Set(data.map(d => d.day).filter(Boolean))].sort();

  const metrics = [
    "shake_intensity",
    "sewer_and_water",
    "power",
    "roads_and_bridges",
    "medical",
    "buildings"
  ];

  const width = 600;
  const height = 250;
  const margin = { top: 40, right: 30, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const neighborhoods = [...new Set(data.map(d => d.neighborhood))].sort();

  const x = d3.scalePoint()
    .domain(metrics)
    .range([0, innerWidth])
    .padding(0.5);

  const yScales = {};
  metrics.forEach(m => {
    yScales[m] = d3.scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0]);
  });

  const container = d3.create("div")
    .style("display", "grid")
    .style("grid-template-columns", "repeat(auto-fit, minmax(440px, 1fr))")
    .style("gap", "20px")
    .style("background", "#222")
    .style("padding", "20px");

  for (const nhood of neighborhoods) {
    const neighborhoodContainer = d3.create("div");

    const select = html`<select style="margin-bottom: 10px;">${uniqueDays.map(day => html`<option value="${day}">${day}</option>`)}</select>`;
    neighborhoodContainer.append(() => select);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#333");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const title = svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    neighborhoodContainer.append(() => svg.node());

    function draw(day) {
      // ✅ Clear just the data elements inside <g>
      g.selectAll("*").remove();

      const reports = data.filter(d => d.neighborhood === nhood && d.day === day);

      if (reports.length === 0) {
        title.text(`${nhood} – ${day} (No data)`);
        return;
      }

      // Draw individual lines
      g.selectAll("path.individual")
        .data(reports)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.05)
        .attr("d", d => d3.line()(metrics.map(m => [x(m), yScales[m](d[m])])));

      // Mean trend line
      const meanLine = metrics.map(m => {
        const values = reports.map(d => +d[m]).filter(v => !isNaN(v));
        return { key: m, value: d3.mean(values) };
      });

      g.append("path")
        .datum(meanLine)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
          .x(d => x(d.key))
          .y(d => yScales[d.key](d.value)));

      // Axes
      const axisGroup = g.selectAll("g.axis")
        .data(metrics)
        .join("g")
        .attr("class", "axis")
        .attr("transform", d => `translate(${x(d)},0)`)
        .each(function(d) {
          d3.select(this)
            .call(d3.axisLeft(yScales[d]).ticks(3))
            .selectAll("text")
            .attr("fill", "white")
            .style("font-size", "10px");
        });

      // Axis labels
      axisGroup.append("text")
        .attr("y", -6)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text(d => d.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));

      // Title update
      title.text(`${nhood} – ${day}`);
    }

    draw(uniqueDays[0]);
    select.onchange = () => draw(select.value);

    container.append(() => neighborhoodContainer.node());
  }

  display(container.node());
}




```