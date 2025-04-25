## Treemap Visualization

<script src="https://d3js.org/d3.v7.min.js"></script>

<svg id="treemapChart" style="width: 100%; height: auto;" 
     viewBox="0 0 800 600" 
     preserveAspectRatio="xMidYMid meet"></svg>

<style>

  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
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

const width = 800;
  const height = 600;
  
  
  const svgElement = document.getElementById("treemapChart");
  
  
  const svg = d3.select(svgElement);
  
  
  const data = await FileAttachment("treemap.json").json();
  
  
  const root = d3.hierarchy(data)
    .sum(d => d.value);  
  
  
  d3.treemap()
    .size([width, height])
    .padding(1)(root);
  
  
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  
  
  const leaves = svg.selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`);
  
  
  leaves.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.parent.data.name))
  
  
  leaves.append("text")
    .attr("x", 5)
    .attr("y", 15)
    .style("font-size", "10px")
    .text(d => d.data.name);
  
  
  leaves.append("text")
    .attr("x", 5)
    .attr("y", 30)
    .text(d => d.data.value);
  
```