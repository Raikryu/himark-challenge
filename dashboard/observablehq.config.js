// See https://observablehq.com/framework/config for documentation.
export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "St. Himark Earthquake Dashboard",

  // The pages and sections in the sidebar. If you don't specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
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

  // Content to add to the head of the page, e.g. for a favicon:
  head: `
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  `,

  // The path to the source root.
  root: "src",

  // Additional configuration options
  theme: "dark", // Using dark theme for better visualization contrast
  header: `<div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-chart-line" style="font-size: 20px;"></i>
            <span>St. Himark Earthquake Data Analysis</span>
          </div>`, 
  footer: "Created for disaster response analysis | Powered by Observable Framework",
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