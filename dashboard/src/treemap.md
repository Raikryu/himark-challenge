## Treemap Visualization

<script src="https://d3js.org/d3.v7.min.js"></script>

<div class="treemap-container dashboard-card">
  <div class="visualization-header">
    <h2>Damage Impact by District</h2>
    <div class="visualization-controls">
      <select id="treemap-metric-selector" class="dashboard-select">
        <option value="combined_damage">Combined Damage</option>
        <option value="sewer_and_water">Sewer & Water</option>
        <option value="power">Power</option>
        <option value="roads_and_bridges">Roads & Bridges</option>
        <option value="medical">Medical</option>
        <option value="buildings">Buildings</option>
      </select>
    </div>
  </div>

  <div class="treemap-legend" id="treemap-legend"></div>

  <svg id="treemapChart" style="width: 100%; height: 600px;"
       viewBox="0 0 800 600"
       preserveAspectRatio="xMidYMid meet"></svg>

  <div id="treemap-tooltip" class="tooltip"></div>
</div>

<style>
  .treemap-container {
    width: 100%;
    margin-bottom: 2rem;
  }

  svg#treemapChart {
    display: block;
    margin: auto;
    font-family: var(--font-family);
  }

  .treemap-cell {
    stroke: rgba(255, 255, 255, 0.5);
    stroke-width: 1.5;
    transition: opacity 0.2s, stroke-width 0.2s;
  }

  .treemap-cell:hover {
    stroke: #fff;
    stroke-width: 2;
    cursor: pointer;
  }

  .treemap-cell-text {
    pointer-events: none;
  }

  .treemap-label {
    font-size: 12px;
    font-weight: 600;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6);
  }

  .treemap-value {
    font-size: 10px;
    opacity: 0.9;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6);
  }

  .visualization-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .visualization-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--primary-color);
  }

  .treemap-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 12px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  .tooltip {
    position: absolute;
    padding: 10px;
    background: rgba(38, 70, 83, 0.9);
    color: white;
    border: 1px solid rgba(42, 157, 143, 0.6);
    border-radius: 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
    font-size: 12px;
    max-width: 250px;
  }

  /* Media Queries for Responsiveness */
  @media (max-width: 768px) {
    .visualization-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .treemap-legend {
      justify-content: flex-start;
    }
  }
</style>
```js
import { dashboardColors, applyDashboardStyles, getDamageColor } from "./components/dashboard-styles.js"
import dashboardState from "./components/dashboard-state.js"
import { loadCommonLibraries } from "./components/js.js"

async function initTreemap() {
  applyDashboardStyles();

  await loadCommonLibraries();

  const width = 800;
  const height = 600;

  const svgElement = document.getElementById("treemapChart");
  const tooltipElement = document.getElementById("treemap-tooltip");

  const svg = d3.select(svgElement);
  const tooltip = d3.select(tooltipElement);

  let currentMetric = "combined_damage";

  const baseTreemapData = await FileAttachment("treemap.json").json();
  let reportData;
  try {
    reportData = await FileAttachment("data/cleaned_mc1-reports-data.csv").csv();
  } catch (error) {
  }

  const districtMetrics = {};

  async function processDistrictData() {
    if (!reportData) return;

    const districtNames = [
      "Palace Hills", "Northwest", "Old Town", "Safe Town", "Southwest",
      "Downtown", "Wilson Forest", "Scenic Vista", "Broadview", "Chapparal",
      "Terrapin Springs", "Pepper Mill", "Cheddarford", "Easton", "Weston",
      "Southton", "Oak Willow", "East Parton", "West Parton"
    ];

    const locationMap = {};
    for (let i = 0; i < districtNames.length; i++) {
      locationMap[i + 1] = districtNames[i];
    }

    const metrics = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"];

    districtNames.forEach(district => {
      districtMetrics[district] = {
        combined_damage: 0,
        sewer_and_water: 0,
        power: 0,
        roads_and_bridges: 0,
        medical: 0,
        buildings: 0,
        shake_intensity: 0,
        count: 0
      };
    });

    reportData.forEach(report => {
      const locationId = parseInt(report.location);
      const districtName = locationMap[locationId];

      if (!districtName) return;

      districtMetrics[districtName].count++;

      metrics.forEach(metric => {
        const value = parseFloat(report[metric]);
        if (!isNaN(value)) {
          districtMetrics[districtName][metric] += value;
        }
      });

      const damages = [
        parseFloat(report.sewer_and_water),
        parseFloat(report.power),
        parseFloat(report.roads_and_bridges),
        parseFloat(report.medical),
        parseFloat(report.buildings)
      ].filter(val => !isNaN(val));

      if (damages.length > 0) {
        const avgDamage = damages.reduce((sum, val) => sum + val, 0) / damages.length;
        districtMetrics[districtName].combined_damage += avgDamage;
      }
    });

    districtNames.forEach(district => {
      const count = districtMetrics[district].count;
      if (count > 0) {
        metrics.forEach(metric => {
          districtMetrics[district][metric] /= count;
        });
        districtMetrics[district].combined_damage /= count;
      }
    });
  }

  function createColorScale(values) {
    const min = 0;
    const max = d3.max(values);

    return d3.scaleLinear()
      .domain([min, max * 0.3, max])
      .range(["#f7fbff", "#fdae61", "#d73027"]);
  }

  function renderTreemap() {
      svg.selectAll("*").remove();

      const data = JSON.parse(JSON.stringify(baseTreemapData));

      data.children.forEach(district => {
      if (!district.originalValue) {
        district.originalValue = district.value;
      }

      if (districtMetrics[district.name]) {
        // Use the selected metric value, or fall back to original value
        const metricValue = districtMetrics[district.name][currentMetric];

        if (metricValue !== undefined && !isNaN(metricValue)) {
          const scaleFactor = currentMetric === "combined_damage" ? 10000 : 20000;
          district.value = metricValue * scaleFactor;
        } else {
          district.value = district.originalValue;
        }
      } else {
        district.value = district.originalValue;
      }
    });

    const root = d3.hierarchy(data)
      .sum(d => d.value);

    root.sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .paddingOuter(4)
      .paddingInner(2)
      .round(true)(root);

    const values = root.leaves().map(d => d.value);
    const colorScale = createColorScale(values);

    const cells = svg.selectAll(".treemap-cell")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "treemap-cell")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cells.append("rect")
      .attr("width", d => Math.max(0, d.x1 - d.x0))
      .attr("height", d => Math.max(0, d.y1 - d.y0))
      .attr("fill", d => colorScale(d.value))
      .attr("class", "treemap-cell")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 3);

        let displayValue = d.value;
        if (districtMetrics[d.data.name]) {
          displayValue = districtMetrics[d.data.name][currentMetric];
        }
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.data.name}</strong><br>
            <span>${currentMetric.replace(/_/g, " ")}: ${d3.format(",.1f")(displayValue)}</span>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "rgba(255, 255, 255, 0.5)")
          .attr("stroke-width", 1.5);
        tooltip.style("opacity", 0);
      })
      .on("click", function(event, d) {
        dashboardState.setState('filters.location', d.data.name);
      });

    cells.append("text")
      .attr("x", 5)
      .attr("y", 15)
      .attr("class", "treemap-label")
      .attr("fill", d => getBestTextColor(colorScale(d.value)))
      .text(d => {
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;

        if (cellWidth < 40 || cellHeight < 30) return "";

        const name = d.data.name;
        return name.length > 12 ? name.substring(0, 10) + "..." : name;
      });

    cells.append("text")
      .attr("x", 5)
      .attr("y", 30)
      .attr("class", "treemap-value")
      .attr("fill", d => getBestTextColor(colorScale(d.value)))
      .text(d => {
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;

        if (cellWidth < 40 || cellHeight < 30) return "";

        let displayValue = d.value;
        if (districtMetrics[d.data.name]) {
          displayValue = districtMetrics[d.data.name][currentMetric];
        }

        return d3.format(",.1f")(displayValue);
      });

    createLegend(colorScale);
  }

  function createLegend(colorScale) {
    const legendContainer = document.getElementById("treemap-legend");
    legendContainer.innerHTML = "";

    const legendValues = [0, 0.25, 0.5, 0.75, 1].map(t => {
      const domain = colorScale.domain();
      const range = domain[domain.length - 1] - domain[0];
      return domain[0] + range * t;
    });

    legendValues.forEach(value => {
      const item = document.createElement("div");
      item.className = "legend-item";

      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = colorScale(value);

      let displayValue = value;
      if (value > 0) {
        const domain = colorScale.domain();
        const normalizedValue = (value / domain[domain.length - 1]) * 10;
        displayValue = normalizedValue;
      }

      const label = document.createElement("span");
      label.textContent = d3.format(",.1f")(displayValue);

      item.appendChild(colorBox);
      item.appendChild(label);
      legendContainer.appendChild(item);
    });

    const metricTitle = document.createElement("div");
    metricTitle.style.width = "100%";
    metricTitle.style.textAlign = "center";
    metricTitle.style.marginBottom = "0.5rem";
    metricTitle.style.fontWeight = "bold";
    metricTitle.textContent = `Metric: ${currentMetric.replace(/_/g, " ")}`;

    legendContainer.insertBefore(metricTitle, legendContainer.firstChild);
  }

  function getBestTextColor(bgColor) {
    // Convert the background color to RGB
    let color;
    if (bgColor.startsWith("#")) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);

      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Use white text on dark backgrounds, black text on light backgrounds
      return luminance > 0.5 ? "black" : "white";
    }

    return "white"; // Default to white
  }

  await processDistrictData();

  const metricSelector = document.getElementById("treemap-metric-selector");
  metricSelector.addEventListener("change", () => {
    currentMetric = metricSelector.value;

    renderTreemap();
  });

  dashboardState.subscribe('filters', (filters) => {
    if (filters.metric && filters.metric !== currentMetric) {
      // Update the dropdown to match dashboard state
      currentMetric = filters.metric;
      metricSelector.value = currentMetric;
    }
    renderTreemap();
  });

  renderTreemap();
}

initTreemap();
```