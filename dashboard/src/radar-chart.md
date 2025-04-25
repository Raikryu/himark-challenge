# Radar Chart with Dropdown

This notebook visualizes different metrics using a radar chart. Select a metric from the dropdown to update the chart.

## Metric Selection

<select id="metricSelect">
  <option value="sewer_and_water">Sewer & Water</option>
  <option value="power">Power</option>
  <option value="roads_and_bridges">Roads & Bridges</option>
  <option value="medical">Medical</option>
  <option value="buildings">Buildings</option>
  <option value="damage_score">Damage Score</option>
</select>

## Radar Chart

<canvas id="radarChart" width="600" height="600"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

```js

const metricSelect = document.getElementById("metricSelect");
  const canvas = document.getElementById("radarChart");
  const ctx = canvas.getContext("2d");

  // 2. Load data
  const data = await FileAttachment("radar_chart_data.json").json();
  console.log("Radar data loaded:", data);

  // 3. Create initial dataset
  const defaultMetric = "sewer_and_water";
  const initialDataset = {
    label: metricDisplayName(defaultMetric),
    data: data.map(d => d[defaultMetric]),
    borderColor: "rgba(255, 99, 132, 1)",
    backgroundColor: "rgba(255, 99, 132, 0.2)"
  };

  // 4. Create the chart
  window.myRadarChart = new Chart(ctx, {
  type: "radar",
  data: {
    labels: data.map(d => d.locationName),
    datasets: [{
      label: "Roads & Bridges",
      data: data.map(d => d.roads_and_bridges),
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: "#fff"
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: "#fff",
          backdropColor: "transparent",
          showLabelBackdrop: false,
          font: {
            size: 12
          },
          callback: (value) => `${value}/10`
        },
        angleLines: {
          color: "#444"
        },
        grid: {
          color: "#666"
        },
        pointLabels: {
          color: "#fff",
          font: {
            size: 13
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "#fff"
        }
      },
      title: {
        display: true,
        text: "Damage Assessment by Location (Single Metric)",
        color: "#fff",
        font: {
          size: 16
        }
      }
    }
  }
});


  // 5. Listen for dropdown changes
  metricSelect.addEventListener("change", event => {
    updateChartMetric(event.target.value);
  });

  // 6. The update function
  function updateChartMetric(metric) {
    const chart = window.myRadarChart; 
    chart.data.datasets[0].label = metricDisplayName(metric);
    chart.data.datasets[0].data = data.map(d => d[metric]);
    chart.update();
  }

  function metricDisplayName(metricKey) {
    switch(metricKey) {
      case "sewer_and_water": return "Sewer & Water";
      case "power": return "Power";
      case "roads_and_bridges": return "Roads & Bridges";
      case "medical": return "Medical";
      case "buildings": return "Buildings";
      case "damage_score": return "Damage Score";
      default: return metricKey;
    }
  }

```