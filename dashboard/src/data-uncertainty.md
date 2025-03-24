---
theme: dashboard
title: Neighborhood Report Uncertainty
toc: false
---

# Neighborhood Report Uncertainty

This dashboard visualizes the uncertainty in neighborhood reports based on preprocessed metrics. Higher reliability scores indicate more consistent and complete reports, while missing data rates and damage variability help assess uncertainty.

<!-- Load the processed data -->
```js
const neighborhoods = await FileAttachment("data/processed_neighborhood_reliability.json").json();

const metrics = ["missing_data_rate", "report_frequency", "damage_variability", "reliability_score"];
const metricLabels = {
  missing_data_rate: "Missing Data Rate (%)",
  report_frequency: "Report Frequency (min)",
  damage_variability: "Damage Variability",
  reliability_score: "Reliability Score"
};
```
```js
display(
  Plot.plot({
    title: "Neighborhood Uncertainty: Missing Data vs Reliability",
    x: { label: "Missing Data Rate (%)", grid: true },
    y: { label: "Reliability Score", grid: true },
    marks: [
      Plot.dot(neighborhoods, {
        x: "missing_data_rate",
        y: "reliability_score",
        r: d => d.damage_variability_norm * 2,  // Scale bubble size by damage variability
        fill: "steelblue",
        title: d => `${d.neighborhood}: ${d.missing_data_rate_norm.toFixed(3)}% missing, reliability ${d.reliability_score_norm.toFixed(2)}`
      })
    ]
  })
);
```
```js
{
  // Sort neighborhoods by missing_data_rate in descending order
  const sortedData = Array.from(neighborhoods).sort((a, b) => b.missing_data_rate_norm - a.missing_data_rate_norm);
  display(
    Plot.plot({
      title: "Missing Data Rate by Neighborhood",
      width: 1000,
      height: 400,
      marginLeft: 80,
      marginBottom: 80,
      x: {
        label: "Neighborhood",
        grid: true,
        tickRotate: -45,
        domain: sortedData.map(d => d.neighborhood)
      },
      y: {
        label: "Missing Data Rate (%)",
        grid: true
      },
      marks: [
        Plot.barY(sortedData, {
          x: "neighborhood",
          y: "missing_data_rate",
          fill: "tomato",
          title: d => `${d.neighborhood}: ${d.missing_data_rate.toFixed(3)}% missing`
        })
      ]
    })
  );
}

```

```js
{
  // Create a sorted copy of the data ordered by damage_variability (lowest first)
  const sortedData = Array.from(neighborhoods).sort((a, b) => a.damage_variability - b.damage_variability);
  display(
    Plot.plot({
      title: "Damage Variability by Neighborhood (Ordered from Best to Worst)",
      width: 1000,
      height: 400,
      marginLeft: 80,
      marginBottom: 80,
      x: {
        label: "Neighborhood",
        grid: true,
        tickRotate: -45,
        domain: sortedData.map(d => d.neighborhood) // enforce order based on sorted data
      },
      y: { label: "Damage Variability (Std. Deviation)", grid: true },
      marks: [
        Plot.barY(sortedData, {
          x: "neighborhood",
          y: "damage_variability",
          fill: "steelblue",
          title: d => `${d.neighborhood}: ${d.damage_variability.toFixed(2)}`
        })
      ]
    })
  );
}

```

```js
{
  // Create a sorted copy of the data ordered by report_frequency (lowest first)
  const sortedData = Array.from(neighborhoods).sort((a, b) => a.report_frequency - b.report_frequency);
  display(
    Plot.plot({
      title: "Report Frequency by Neighborhood (Ordered from Best to Worst)",
      width: 1000,
      height: 400,
      marginLeft: 80,
      marginBottom: 80,
      x: {
        label: "Neighborhood",
        grid: true,
        tickRotate: -45,
        domain: sortedData.map(d => d.neighborhood) // enforce order based on sorted data
      },
      y: {
        label: "Report Frequency (Avg Time Gap in Minutes)",
        grid: true
      },
      marks: [
        Plot.barY(sortedData, {
          x: "neighborhood",
          y: "report_frequency",
          fill: "steelblue",
          title: d => `${d.neighborhood}: ${d.report_frequency.toFixed(2)} min`
        })
      ]
    })
  );
}
```



```js
function correlation(x, y) {
  const n = x.length;
  const meanX = d3.mean(x);
  const meanY = d3.mean(y);
  const cov = d3.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY))) / (n - 1);
  const stdX = d3.deviation(x);
  const stdY = d3.deviation(y);
  return cov / (stdX * stdY);
}
```
```js

  const matrix = [];
  metrics.forEach(metric1 => {
    metrics.forEach(metric2 => {
      const x = neighborhoods.map(d => d[metric1]);
      const y = neighborhoods.map(d => d[metric2]);
      const corr = correlation(x, y);
      matrix.push({ metric1, metric2, correlation: corr });
    });
  });
  matrix;
  ```
  ```js

  display(
    Plot.plot({
      title: "Correlation Heatmap of Neighborhood Metrics",
      width: 500,
      height: 500,
      marginLeft: 100,
      marginBottom: 100,
      x: {
        domain: metrics,
        label: "Metric"
      },
      y: {
        domain: metrics,
        label: "Metric"
      },
      marks: [
        // Draw a rectangle for each cell in the matrix
        Plot.rect(matrix, {
          x: "metric1",
          y: "metric2",
          fill: "correlation",
          width: 1,
          height: 1,
          title: d => `${d.metric1} vs ${d.metric2}: ${d.correlation.toFixed(2)}`
        })
      ],
      color: {
        type: "linear",
        domain: [-1, 0, 1],
        range: ["red", "white", "blue"],
        label: "Pearson Correlation",
        legend: true
      }
    })
  );


```


```js

 // Set dimensions and margins.
  const width = 900;
  const height = 500;
  const margin = { top: 50, right: 70, bottom: 50, left: 70 };

  // Create the SVG container with a dark background.
  const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font", "16px sans-serif")
      .style("background", "#333");

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // x-scale for positioning metrics along the horizontal axis.
  const x = d3.scalePoint()
      .domain(metrics)
      .range([0, innerWidth])
      .padding(0.5);

  // y-scales: one for each metric based on its data range.
  const yScales = {};
  metrics.forEach(m => {
    const values = neighborhoods.map(d => d[m]);
    yScales[m] = d3.scaleLinear()
      .domain(d3.extent(values))
      .nice()
      .range([innerHeight, 0]);
  });

  // Append a group element for the plot.
  const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Draw a line for each neighborhood.
  const lines = g.selectAll("path")
    .data(neighborhoods)
    .join("path")
      .attr("fill", "none")
      .attr("stroke", "white")   // white lines
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8)
      .attr("d", d => d3.line()(metrics.map(m => [x(m), yScales[m](d[m])])));

  // Append tooltips with neighborhood name and location.
  lines.append("title")
    .text(d => `${d.neighborhood} (Location: ${d.location})`);

  // Add interactive highlighting on mouseover.
  lines.on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "orange")
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 1);
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.8);
    });

  // Draw an axis for each metric.
  const axisGroup = g.selectAll("g.axis")
      .data(metrics)
      .join("g")
      .attr("class", "axis")
      .attr("transform", d => `translate(${x(d)},0)`)
      .each(function(d) {
        d3.select(this)
          .call(d3.axisLeft(yScales[d]).ticks(5))
          .selectAll("text")
          .attr("fill", "white"); // Set tick labels to white
      });

  // Add labels for each axis.
  axisGroup.append("text")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "white") // Set axis labels to white
      .style("font-weight", "bold")
      .text(d => {
        if(d === "missing_data_rate") return "Missing Data Rate (%)";
        if(d === "report_frequency") return "Report Frequency (min)";
        if(d === "damage_variability") return "Damage Variability";
        if(d === "reliability_score") return "Reliability Score";
        return d;
      });

  // Add a chart title.
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .attr("fill", "white") // white title
      .text("Parallel Coordinates Plot of Neighborhood Metrics");
display(svg.node());


```