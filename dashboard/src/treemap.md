## Treemap Visualization

<script src="https://d3js.org/d3.v7.min.js"></script>

<svg id="treemapChart" style="width: 100%; height: auto;" 
     viewBox="0 0 800 600" 
     preserveAspectRatio="xMidYMid meet"></svg>

<style>
  svg#treemapChart {
    display: block;
    margin: auto;
  }
  text {
    font-size: 12px;
    fill: #fff;
    pointer-events: none; 
  }
</style>
```js 
import { dashboardColors, applyDashboardStyles } from "./components/dashboard-styles.js"

{
  // Apply dashboard styles
  applyDashboardStyles();
  
  const width = 800;
  const height = 600;
  
  // Get SVG element
  const svgElement = document.getElementById("treemapChart");
  
  // Select the SVG with D3
  const svg = d3.select(svgElement);
  
  // Load the treemap data
  const data = await FileAttachment("treemap.json").json();
  
  
  const root = d3.hierarchy(data)
    .sum(d => d.value);  
  
  // Create the treemap layout
  d3.treemap()
    .size([width, height])
    .padding(1)(root);
  
  // Use dashboard colors instead of D3's default scheme
  const color = d3.scaleOrdinal([
    dashboardColors.damage.categories.buildings,
    dashboardColors.damage.categories.power,
    dashboardColors.damage.categories.medical,
    dashboardColors.damage.categories.sewage,
    dashboardColors.damage.categories.roads,
    dashboardColors.primary,
    dashboardColors.secondary,
    dashboardColors.accent
  ]);
  
  
  const leaves = svg.selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`);
  
  
  leaves.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.parent.data.name))
    .attr("stroke", "rgba(255,255,255,0.3)")
    .attr("stroke-width", 1);
  
  // Add labels for item names
  leaves.append("text")
    .attr("x", 5)
    .attr("y", 15)
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .text(d => d.data.name);
  
  // Add values
  leaves.append("text")
    .attr("x", 5)
    .attr("y", 30)
    .style("fill", "rgba(255,255,255,0.8)")
    .text(d => d.data.value);
}
```