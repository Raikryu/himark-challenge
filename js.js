import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

const csvFilePath = "daily_mean_by_location.csv";
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
            color: { legend: true },
            marks: [Plot.ruleY([0]), Plot.lineY(filteredData, { x: "date", y: metric, stroke: "location" })]
        })
    );

    createLegend(allLocations);
}


function createLegend(locations) {
    document.getElementById("legend").innerHTML = "";
    locations.forEach(loc => {
        const checkbox = Object.assign(document.createElement("input"), { type: "checkbox", value: loc, checked: selectedLocations.has(loc) });
        checkbox.addEventListener("change", () => {
            checkbox.checked ? selectedLocations.add(loc) : selectedLocations.delete(loc);
            createChart(document.getElementById("variable-select").value);
        });
        document.getElementById("legend").append(Object.assign(document.createElement("label"), { textContent: ` ${loc}` }), checkbox, document.createElement("br"));
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("variable-select");
    ["shake_intensity", "sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"].forEach(m => 
        dropdown.append(new Option(m.replace("_", " ").toUpperCase(), m))
    );
    dropdown.addEventListener("change", () => createChart(dropdown.value));
    
    document.body.append(Object.assign(document.createElement("div"), { id: "legend" }));
    
    createChart();
});
