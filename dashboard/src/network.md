---
theme: dashboard
title: network
toc: false
---

# Earthquake Damage (Standard Deviation)

```js

const reports = await FileAttachment("data/damage_std.csv").csv({ typed: true });

const damage = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity"
];

function scaleSize(value) {
  const minRadius = 120;
  const maxRadius = 300; 
  const scalingFactor = 4; 
  return minRadius + (Math.pow(value, scalingFactor) * (maxRadius - minRadius));
}

function createNetworkDiagram(location) {
  const locationData = reports.find(d => d.location == location);

  const locationNode = { id: `Location ${location}`, group: "location", x: 0, y: 0, r: 200 };

  const layoutRadius = 1.5; 
  const damageNodes = damage.map((damageType, i) => ({
    id: damageType,
    group: "damage",
    x: Math.cos((i / damage.length) * 2 * Math.PI) * layoutRadius,
    y: Math.sin((i / damage.length) * 2 * Math.PI) * layoutRadius,
    r: scaleSize(locationData[damageType])
  }));

  const nodes = [locationNode, ...damageNodes];

  const links = damage.map(damageType => {
    const targetNode = damageNodes.find(node => node.id === damageType);
    const midpointX = (locationNode.x + targetNode.x) / 2;
    const midpointY = (locationNode.y + targetNode.y) / 2;
    return {
      source: locationNode.id,
      target: damageType,
      x1: locationNode.x,
      y1: locationNode.y,
      x2: targetNode.x,
      y2: targetNode.y,
      midpointX,
      midpointY, 
      text: damageType 
    };
  });

  return Plot.plot({
    width: 700,
    height: 700,
    x: { domain: [-2, 2], axis: null },
    y: { domain: [-2, 2], axis: null },
    marks: [
      Plot.link(links, {
        x1: "x1",
        y1: "y1",
        x2: "x2",
        y2: "y2",
        stroke: "gray",
        strokeWidth: 4
      }),
      Plot.dot(nodes, {
        x: "x",
        y: "y",
        fill: d => (d.group === "location" ? "white" : "#4292c6"),
        r: "r"
      }),
      Plot.text(nodes, {
        x: "x",
        y: "y",
        text: d => (d.group === "location" ? d.id : ""),
        fill: "white", 
        textAnchor: "middle",
        fontSize: 18,
        fontWeight: "bold" 
      }),
      Plot.text(links, {
        x: "midpointX", 
        y: "midpointY", 
        text: "text", 
        fill: "white",
        textAnchor: "middle",
        fontSize: 14 
      })
    ]
  });
}

function renderDropdown() {
  const container = document.getElementById("radar-charts-container");
  container.innerHTML = "";

  const dropdown = document.createElement("select");
  dropdown.id = "locationDropdown";
  dropdown.style.marginBottom = "20px";
  
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a location";
  defaultOption.value = "";
  dropdown.appendChild(defaultOption);

  [...new Set(reports.map(d => d.location))].forEach(location => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = `Location ${location}`;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", () => {
    const selectedLocation = dropdown.value;
    if (selectedLocation) {
      renderNetworkDiagram(selectedLocation);
    }
  });

  container.appendChild(dropdown);
}

function renderNetworkDiagram(location) {
  const container = document.getElementById("radar-charts-container");

  const existingDiagram = document.getElementById("networkDiagram");
  if (existingDiagram) {
    existingDiagram.remove();
  }

  const diagramDiv = document.createElement("div");
  diagramDiv.id = "networkDiagram";
  diagramDiv.style.display = "flex";
  diagramDiv.style.justifyContent = "center";
  diagramDiv.style.marginTop = "20px";

  const networkDiagram = createNetworkDiagram(location);
  diagramDiv.appendChild(networkDiagram);

  container.appendChild(diagramDiv);
}


renderDropdown();


```

<div id="radar-charts-container"></div>