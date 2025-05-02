import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { dashboardColors } from "./dashboard-styles.js";

const csvFilePath = "/data/daily_mean_by_location.csv"; 
let selectedLocations = new Set();


async function loadCSV() {
    const response = await fetch(csvFilePath);
    const text = await response.text();
    return text.split("\n").slice(1).map(row => {
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
    }).filter(Boolean);
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
            y: { label: metric.replace("_", " ").toUpperCase(), grid: true },
            color: { 
                legend: true,
                scheme: Object.values(dashboardColors.damage.categories) // Use consistent color scheme
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
    
    // Add style to legend
    legendEl.style.display = "flex";
    legendEl.style.flexWrap = "wrap";
    legendEl.style.gap = "10px";
    legendEl.style.margin = "15px 0";
    
    // Convert locations to array for consistent ordering
    Array.from(locations).sort().forEach((loc, index) => {
        // Create container for each location
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginBottom = "5px";
        container.style.padding = "4px 8px";
        container.style.borderRadius = "4px";
        container.style.background = selectedLocations.has(loc) ? 
            "rgba(42, 157, 143, 0.1)" : "transparent";
        container.style.cursor = "pointer";
        
        // Get color from dashboard colors
        const colorKeys = Object.keys(dashboardColors.damage.categories);
        const colorKey = colorKeys[index % colorKeys.length];
        const color = dashboardColors.damage.categories[colorKey];
        
        // Create color swatch
        const colorSwatch = document.createElement("span");
        colorSwatch.style.display = "inline-block";
        colorSwatch.style.width = "12px";
        colorSwatch.style.height = "12px";
        colorSwatch.style.backgroundColor = color;
        colorSwatch.style.borderRadius = "2px";
        colorSwatch.style.marginRight = "8px";
        
        // Create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = loc;
        checkbox.checked = selectedLocations.has(loc);
        checkbox.style.marginRight = "5px";
        
        // Create label
        const label = document.createElement("label");
        label.textContent = loc;
        label.style.fontSize = "0.9rem";
        label.style.color = dashboardColors.text.light;
        
        // Add click handler to container
        container.addEventListener("click", (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                
                // Update visual state
                container.style.background = checkbox.checked ? 
                    "rgba(42, 157, 143, 0.1)" : "transparent";
                    
                // Update data state
                checkbox.checked ? selectedLocations.add(loc) : selectedLocations.delete(loc);
                createChart(document.getElementById("variable-select").value);
            }
        });
        
        // Add change handler to checkbox
        checkbox.addEventListener("change", () => {
            // Update visual state
            container.style.background = checkbox.checked ? 
                "rgba(42, 157, 143, 0.1)" : "transparent";
                
            // Update data state
            checkbox.checked ? selectedLocations.add(loc) : selectedLocations.delete(loc);
            createChart(document.getElementById("variable-select").value);
        });
        
        // Assemble and append
        container.appendChild(checkbox);
        container.appendChild(colorSwatch);
        container.appendChild(label);
        legendEl.appendChild(container);
    });
}

export function initializeChart() {
    document.addEventListener("DOMContentLoaded", () => {
        // Style the chart container
        const chartContainer = document.getElementById("chart");
        if (chartContainer) {
            chartContainer.style.backgroundColor = "rgba(38, 70, 83, 0.2)";
            chartContainer.style.borderRadius = "8px";
            chartContainer.style.padding = "20px";
            chartContainer.style.marginBottom = "20px";
        }
        
        // Style and enhance the dropdown
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
            
            // Style dropdown
            dropdown.style.padding = "8px 12px";
            dropdown.style.backgroundColor = "rgba(42, 157, 143, 0.1)";
            dropdown.style.color = dashboardColors.text.light;
            dropdown.style.border = `1px solid ${dashboardColors.background.cardBorder}`;
            dropdown.style.borderRadius = "4px";
            dropdown.style.fontSize = "14px";
            dropdown.style.width = "200px";
            
            // Add options with better labels
            metrics.forEach(m => dropdown.append(new Option(m.label, m.value)));
            
            // Create label
            const label = document.createElement("label");
            label.textContent = "Damage Metric: ";
            label.style.marginRight = "10px";
            label.style.fontWeight = "500";
            label.style.color = dashboardColors.text.light;
            
            // Create container
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.alignItems = "center";
            container.style.marginBottom = "15px";
            
            // Insert label before dropdown
            dropdown.parentNode.insertBefore(container, dropdown);
            container.appendChild(label);
            container.appendChild(dropdown);
            
            // Add change handler
            dropdown.addEventListener("change", () => createChart(dropdown.value));
        }

        // Render initial chart
        createChart();
    });
}
