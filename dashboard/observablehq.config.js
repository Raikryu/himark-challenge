export default {
  title: "St. Himark Earthquake Dashboard",

  pages: [
    {
      name: "Overview",
      path: "/"
    },
    {
      name: "Damage Assessment",
      pages: [
        {name: "Geographic Heatmap", path: "/heatmap"},
        {name: "Damage Radar Chart", path: "/radar-chart"}
      ]
    },
    {
      name: "Temporal Analysis",
      pages: [
        {name: "Damage Animation", path: "/animation_graph"},
        {name: "Variables Over Time", path: "/linegraph"},
        {name: "Boxplot Analysis", path: "/boxplot"}
      ]
    },
    {
      name: "Uncertainty Analysis",
      pages: [
        {name: "Neighborhood Uncertainty", path: "/task2"},
        {name: "Region Conditions Over Time", path: "/task3"}
      ]
    },
    {
      name: "Data Hierarchies",
      pages: [
        {name: "Damage Treemap", path: "/treemap"}
      ]
    }
  ],

  head: `
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>
  `,

  root: "src",

  theme: "dark",
  header: `<div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-chart-line" style="font-size: 20px;"></i>
            <span>St. Himark Earthquake Data Analysis</span>
          </div>`, 
  footer: "St. Himark Earthquake Analysis | Disaster Response Dashboard",
  sidebar: true,
  toc: true,
  pager: true,
  output: "dist",
  search: true,
  linkify: true,
  typographer: true,
  preserveExtension: false,
  preserveIndex: false,
};