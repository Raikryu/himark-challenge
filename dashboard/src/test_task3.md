---
theme: dashboard
title: Testing Visualization
toc: false
---

# Simple Test Visualization

This is a minimal test to verify visualizations are rendering correctly.

```js
import * as d3 from "d3";
```

```js
// Let's try raw HTML and SVG rendering with basic D3
const createChart = () => {
  // Create container
  const container = html`<div style="width: 100%; height: 300px;"></div>`;
  
  // Sample data
  const data = [
    {x: 0, y: 10, category: "A"},
    {x: 1, y: 15, category: "A"},
    {x: 2, y: 25, category: "A"},
    {x: 3, y: 18, category: "A"},
    {x: 4, y: 30, category: "A"}
  ];
  
  // Set up dimensions
  const margin = {top: 20, right: 30, bottom: 30, left: 40};
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto");
  
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Set up scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x)])
    .range([0, width]);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)])
    .nice()
    .range([height, 0]);
  
  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
  
  g.append("g")
    .call(d3.axisLeft(y));
  
  // Add bars
  g.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.x))
    .attr("y", d => y(d.y))
    .attr("width", width / data.length * 0.8)
    .attr("height", d => height - y(d.y))
    .attr("fill", "#2a9d8f");
  
  // Add to container
  container.appendChild(svg.node());
  
  return container;
};

// Return the chart
createChart()
```

## Direct HTML Table Visualization

```js
// Let's try a simple HTML table with data
const createTable = () => {
  // Sample data
  const tableData = [
    {name: "Medical", uncertainty: 4.2, missing: "12%"},
    {name: "Power", uncertainty: 3.8, missing: "8%"},
    {name: "Roads & Bridges", uncertainty: 3.5, missing: "5%"},
    {name: "Buildings", uncertainty: 3.2, missing: "7%"},
    {name: "Sewer & Water", uncertainty: 3.0, missing: "9%"}
  ];
  
  // Create HTML
  const table = html`
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #2a9d8f; color: white;">
          <th style="padding: 10px; text-align: left;">Damage Type</th>
          <th style="padding: 10px; text-align: center;">Uncertainty Score</th>
          <th style="padding: 10px; text-align: center;">Missing Data</th>
        </tr>
      </thead>
      <tbody>
        ${tableData.map(row => html`
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">${row.name}</td>
            <td style="padding: 10px; text-align: center;">${row.uncertainty}</td>
            <td style="padding: 10px; text-align: center;">${row.missing}</td>
          </tr>
        `)}
      </tbody>
    </table>
  `;
  
  return table;
};

// Return the table
createTable()
```

## Basic HTML and Static Content

<div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>This is a testing HTML section</h3>
  <p>If you can see this with proper styling, HTML rendering is working.</p>
</div>

<img src="https://via.placeholder.com/600x300?text=Test+Image" alt="Test Image" style="max-width:100%;">

## Using display() Function

```js
// Try using display() function directly
const simpleDiv = html`<div style="padding: 15px; background-color: #e76f51; color: white; border-radius: 8px;">
  <h3>Testing direct display()</h3>
  <p>This is a test to see if the display() function works properly.</p>
</div>`;

display(simpleDiv);
```