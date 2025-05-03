fetch("radar_chart_data.json")
  .then(response => response.json())
  .then(data => createRadarChart(data));

  function createRadarChart(data) {
    const ctx = document.getElementById("radarChart").getContext("2d");

    const labels = data.map(item => `Location ${item.location}`);
    const datasets = [
        {
            label: "Sewer & Water",
            data: data.map(item => item.sewer_and_water),
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
        {
            label: "Power",
            data: data.map(item => item.power),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
        {
            label: "Roads & Bridges",
            data: data.map(item => item.roads_and_bridges),
            borderColor: "rgba(255, 206, 86, 1)",
            backgroundColor: "rgba(255, 206, 86, 0.2)",
        },
        {
            label: "Medical",
            data: data.map(item => item.medical),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
        {
            label: "Buildings",
            data: data.map(item => item.buildings),
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
        }
    ];

    new Chart(ctx, {
        type: "radar",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: "Damage Assessment by Location"
            }
        }
    });
}