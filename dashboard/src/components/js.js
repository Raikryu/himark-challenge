import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { dashboardColors } from "./dashboard-styles.js";


const csvFilePath = "/data/daily_mean_by_location.csv"; 
let selectedLocations = new Set();

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function loadStylesheet(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

export function getMetricLabel(metric) {
  const labels = {
    "combined_damage": "Combined Damage Score",
    "sewer_and_water": "Sewer & Water Damage",
    "power": "Power System Damage",
    "roads_and_bridges": "Roads & Bridges Damage",
    "medical": "Medical Facility Damage",
    "buildings": "Building Damage",
    "shake_intensity": "Earthquake Intensity"
  };
  
  return labels[metric] || metric;
}

export function processReportData(csvText) {
  const data = d3.csvParse(csvText.replace(/\r\n/g, "\n").trim(), d3.autoType);
  const parse = d3.timeParse("%d/%m/%Y %H:%M");
  
  data.forEach(d => {
    d.time = parse(d.time);
    d.combined_damage = (
      d.sewer_and_water +
      d.power +
      d.roads_and_bridges +
      d.medical +
      d.buildings +
      d.shake_intensity
    ) / 6;
  });
  
  return data.filter(d => d.time && !isNaN(d.time));
}

export const neighborhoodMap = {
  1: "Palace Hills",
  2: "Northwest",
  3: "Old Town", 
  4: "Safe Town",
  5: "Southwest",
  6: "Downtown",
  7: "Wilson Forest",
  8: "Scenic Vista",
  9: "Broadview",
  10: "Chapparal",
  11: "Terrapin Springs",
  12: "Pepper Mill",
  13: "Cheddarford",
  14: "Easton",
  15: "Weston",
  16: "Southton",
  17: "Oak Willow",
  18: "East Parton",
  19: "West Parton"
};

export function formatDate(date, format = 'medium') {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
    case 'medium':
    default:
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export async function loadCommonLibraries() {
  await loadScript('https://d3js.org/d3.v7.min.js');
  
  await Promise.all([
    loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
    loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
  ]);
  
  await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js');
  
  // Font Awesome for icons
  await loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  
  // Google Fonts - Inter
  await loadStylesheet('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
}

// Line chart specific functionality retained from original file
async function loadCSV() {
  const response = await fetch(csvFilePath);
  const text = await response.text();
  return text.split("\n").slice(1)
    .map(row => {
      const cols = row.split(",").map(c => c.trim());
      if (cols.length < 8) return null;
      return {
        date: new Date(cols[0].split("/").reverse().join("-") + "T00:00:00"),
        location: cols[1],
        shake_intensity: +cols[2],
        sewer_and_water: +cols[3],
        power: +cols[4],
        roads_and_bridges: +cols[5],
        medical: +cols[6],
        buildings: +cols[7]
      };
    })
    .filter(Boolean);
}

async function createChart(metric = "shake_intensity") {
  const data = await loadCSV();
  const allLocations = new Set(data.map(d => d.location));
  if (!selectedLocations.size) selectedLocations = new Set(allLocations);

  const filteredData = data.filter(d => selectedLocations.has(d.location));

  document.getElementById("chart").replaceChildren(
    Plot.plot({
      width: 800, height: 400,
      x: { label: "Date" }, 
      y: { label: getMetricLabel(metric), grid: true },
      color: { 
        legend: true,
        scheme: Object.values(dashboardColors.damage.categories)
      },
      style: {
        background: "transparent",
        color: dashboardColors.text.light,
        fontSize: 12,
        fontFamily: "Inter, sans-serif"
      },
      marks: [
        Plot.ruleY([0], {stroke: dashboardColors.text.muted, strokeOpacity: 0.3}), 
        Plot.lineY(filteredData, { 
          x: "date", 
          y: metric, 
          stroke: "location", 
          strokeWidth: 2.5,
          curve: "basis"
        })
      ]
    })
  );

  createLegend(allLocations);
}

function createLegend(locations) {
  const legendEl = document.getElementById("legend");
  legendEl.innerHTML = "";
  
  legendEl.style.display = "flex";
  legendEl.style.flexWrap = "wrap";
  legendEl.style.gap = "10px";
  legendEl.style.margin = "15px 0";
  
  Array.from(locations).sort().forEach((loc, index) => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.marginBottom = "5px";
    container.style.padding = "4px 8px";
    container.style.borderRadius = "4px";
    container.style.background = selectedLocations.has(loc) ? 
      "rgba(42, 157, 143, 0.1)" : "transparent";
    container.style.cursor = "pointer";
    
    const colorKeys = Object.keys(dashboardColors.damage.categories);
    const colorKey = colorKeys[index % colorKeys.length];
    const color = dashboardColors.damage.categories[colorKey];
    
    const colorSwatch = document.createElement("span");
    colorSwatch.style.display = "inline-block";
    colorSwatch.style.width = "12px";
    colorSwatch.style.height = "12px";
    colorSwatch.style.backgroundColor = color;
    colorSwatch.style.borderRadius = "2px";
    colorSwatch.style.marginRight = "8px";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = loc;
    checkbox.checked = selectedLocations.has(loc);
    checkbox.style.marginRight = "5px";
    
    const label = document.createElement("label");
    label.textContent = loc;
    label.style.fontSize = "0.9rem";
    label.style.color = dashboardColors.text.light;
    
    const handleSelectionChange = () => {
      container.style.background = checkbox.checked ? 
        "rgba(42, 157, 143, 0.1)" : "transparent";
      checkbox.checked ? selectedLocations.add(loc) : selectedLocations.delete(loc);
      createChart(document.getElementById("variable-select").value);
    };
    
    container.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        handleSelectionChange();
      }
    });
    
    checkbox.addEventListener("change", handleSelectionChange);
    
    container.appendChild(checkbox);
    container.appendChild(colorSwatch);
    container.appendChild(label);
    legendEl.appendChild(container);
  });
}

export function initializeChart() {
  document.addEventListener("DOMContentLoaded", () => {
    const chartContainer = document.getElementById("chart");
    if (chartContainer) {
      chartContainer.style.backgroundColor = "rgba(38, 70, 83, 0.2)";
      chartContainer.style.borderRadius = "8px";
      chartContainer.style.padding = "20px";
      chartContainer.style.marginBottom = "20px";
    }
    
    const dropdown = document.getElementById("variable-select");
    if (dropdown) {
      const metrics = [
        { value: "shake_intensity", label: "Earthquake Intensity" },
        { value: "sewer_and_water", label: "Sewer & Water Damage" },
        { value: "power", label: "Power System Damage" },
        { value: "roads_and_bridges", label: "Roads & Bridges Damage" },
        { value: "medical", label: "Medical Facility Damage" },
        { value: "buildings", label: "Building Damage" }
      ];
      
      applyDropdownStyles(dropdown);
      metrics.forEach(m => dropdown.append(new Option(m.label, m.value)));
      
      const label = document.createElement("label");
      label.textContent = "Damage Metric: ";
      label.style.marginRight = "10px";
      label.style.fontWeight = "500";
      label.style.color = dashboardColors.text.light;
      
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.marginBottom = "15px";
      
      dropdown.parentNode.insertBefore(container, dropdown);
      container.appendChild(label);
      container.appendChild(dropdown);
      
      dropdown.addEventListener("change", () => createChart(dropdown.value));
    }

    createChart();
  });
}

function applyDropdownStyles(dropdown) {
  dropdown.style.padding = "8px 12px";
  dropdown.style.backgroundColor = "rgba(42, 157, 143, 0.1)";
  dropdown.style.color = dashboardColors.text.light;
  dropdown.style.border = `1px solid ${dashboardColors.background.cardBorder}`;
  dropdown.style.borderRadius = "4px";
  dropdown.style.fontSize = "14px";
  dropdown.style.width = "200px";
}
