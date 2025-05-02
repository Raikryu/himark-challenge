// Visualization content, descriptions, insights, and analysis
// This module provides consistent content for each visualization

/**
 * Content for the Heatmap visualization
 */
export const heatmapContent = {
  title: "St. Himark Geographic Damage Assessment",
  icon: "map-marked-alt",
  description: `
    This interactive heatmap shows the geographic distribution of damage across St. Himark's districts 
    following the earthquake. The color intensity represents the severity of damage, with darker red indicating 
    higher damage scores. Select different damage metrics to understand how specific infrastructure types 
    were affected across the region.
  `,
  insights: [
    "Northwestern districts experienced the most severe overall damage, particularly to power infrastructure and buildings.",
    "The Central district maintained relatively functional medical facilities despite moderate damage to other systems.",
    "Southeastern regions show the least damage across most metrics, potentially serving as staging areas for recovery operations.",
    "Water and sewer system damage closely correlates with building structural damage patterns across all districts."
  ],
  instructions: [
    "Use the dropdown to switch between different damage metrics (overall score, medical, power, etc.).",
    "Click on a district to see detailed damage information in the panel below.",
    "Use the 'Compare All Metrics' button to visualize all damage types for a selected district.",
    "Hover over districts to see tooltips with key metrics.",
    "Click districts to highlight them and compare with other visualizations."
  ],
  metadata: [
    { label: "Geographic Coverage", value: "19 districts of St. Himark" },
    { label: "Damage Scale", value: "0-10 (higher = more severe)" },
    { label: "Data Source", value: "St. Himark Damage Assessment Reports" },
    { label: "Map Projection", value: "Simplified Coordinate System" }
  ]
};

/**
 * Content for the Radar Chart visualization
 */
export const radarChartContent = {
  title: "Multi-Dimensional Damage Assessment",
  icon: "chart-pie",
  description: `
    This radar chart provides a multi-dimensional view of damage across different infrastructure categories. 
    Each axis represents a different damage metric, allowing for comparison across districts or viewing 
    average metrics. The chart helps identify which aspects of infrastructure were most severely affected 
    and compare patterns between different areas.
  `,
  insights: [
    "Power systems consistently show the highest damage scores across most districts, indicating widespread electrical infrastructure failure.",
    "Medical facilities were relatively more preserved in districts with critical healthcare infrastructure compared to other systems.",
    "Northwestern districts show a distinctive damage pattern with severe impacts across all categories, while other regions show more varied patterns.",
    "Building damage strongly correlates with other utility damage, suggesting cascading infrastructure failures."
  ],
  instructions: [
    "Use the District dropdown to select a specific district or view averages across all districts.",
    "Toggle 'Compare Mode' to select and visualize multiple districts simultaneously.",
    "When in Compare Mode, use the district dropdown to add districts to the comparison.",
    "Click on districts in the comparison to remove them.",
    "Hover over the chart to see exact values for each damage metric.",
    "Review the District Analysis panel for key statistics and recommendations based on the damage patterns."
  ],
  metadata: [
    { label: "Damage Categories", value: "5 infrastructure types" },
    { label: "Scale", value: "0-10 severity rating" },
    { label: "District Coverage", value: "All 19 St. Himark districts" },
    { label: "Data Collection", value: "Post-earthquake assessment reports" }
  ]
};

/**
 * Content for the Animation Graph visualization
 */
export const animationGraphContent = {
  title: "Temporal Damage Analysis",
  icon: "chart-line",
  description: `
    This time-series animation shows how damage evolved across different districts over time following the 
    earthquake. The visualization helps identify critical time periods, damage progression patterns, and the 
    effectiveness of response efforts. The timeline markers highlight key events during the disaster response.
  `,
  insights: [
    "Damage peaked approximately 36 hours after the initial earthquake, with Northwestern districts experiencing the most severe impacts.",
    "Power infrastructure damage increased more rapidly than other metrics, suggesting cascading failures in the electrical grid.",
    "The rate of new damage reports decreased significantly after the 72-hour mark, indicating stabilization of conditions.",
    "Recovery efforts showed measurable progress first in Central districts before extending to peripheral areas.",
    "Different infrastructure types showed distinct recovery patterns, with roads and power systems recovering at different rates."
  ],
  instructions: [
    "Use the Play/Pause/Reset buttons to control the animation sequence.",
    "Adjust the Animation Speed slider to speed up or slow down the playback.",
    "Change the Time Step dropdown to control how much time advances between frames.",
    "Select different damage metrics from the dropdown to focus on specific types of infrastructure.",
    "Use the timeline slider to manually scrub through different time points.",
    "Click on timeline markers to jump to significant events.",
    "Examine the Damage Trend chart to see how average damage evolved over time.",
    "Review the statistics panel for quantitative insights about each time frame."
  ],
  metadata: [
    { label: "Time Period", value: "14 days post-earthquake" },
    { label: "Temporal Resolution", value: "Hourly data points" },
    { label: "Metrics Tracked", value: "6 damage categories" },
    { label: "Data Source", value: "Time-stamped damage reports" }
  ]
};

/**
 * Content for the Boxplot visualization
 */
export const boxplotContent = {
  title: "Statistical Damage Distribution Analysis",
  icon: "chart-boxplot",
  description: `
    This boxplot visualization provides statistical insights into the distribution of damage across different 
    locations and metrics. Boxplots show the median, quartiles, and outliers in the damage data, helping to 
    understand the central tendency and variability of damage across St. Himark.
  `,
  insights: [
    "Building damage shows the widest variability across districts, indicating uneven structural impacts.",
    "Medical facility damage has the most outliers, suggesting some facilities were disproportionately affected.",
    "Northwestern districts consistently show higher median damage values with lower variability, indicating widespread severe damage.",
    "Southeastern districts display lower median damage but higher variability, suggesting isolated severe damage amidst generally milder conditions."
  ],
  instructions: [
    "Use the Location dropdown to filter data for specific districts or view all districts.",
    "Select different damage metrics from the Metric dropdown to compare distributions.",
    "Hover over boxplot elements to see exact statistical values (median, quartiles, etc.).",
    "Compare distributions visually to identify patterns in damage variability across locations.",
    "Note outliers (points outside the whiskers) as they represent unusually high or low damage reports."
  ],
  metadata: [
    { label: "Statistical Measures", value: "Median, quartiles, min/max, outliers" },
    { label: "Sample Size", value: "All verified damage reports" },
    { label: "Whisker Range", value: "1.5 × IQR (interquartile range)" },
    { label: "Data Processing", value: "Cleaned and validated reports" }
  ]
};

/**
 * Content for the Uncertainty Analysis visualization
 */
export const uncertaintyContent = {
  title: "Damage Assessment Uncertainty Analysis",
  icon: "question-circle",
  description: `
    This visualization focuses on the reliability and uncertainty in damage assessment data. It helps identify 
    areas where data may be incomplete or inconsistent, providing context for decision-making about resource 
    allocation and prioritization of additional assessments.
  `,
  insights: [
    "Northwestern districts show high damage estimates but also high uncertainty, suggesting potential inaccuracies in assessment.",
    "Central districts have the most consistent reporting with lowest uncertainty, providing reliable damage estimates.",
    "Remote districts show significant data gaps, with up to 35% missing metrics in some areas.",
    "Uncertainty in power system damage assessments is higher than other infrastructure types across all districts.",
    "Temporal patterns show decreasing uncertainty as more comprehensive assessments were completed over time."
  ],
  instructions: [
    "Use the tabs to navigate between different uncertainty visualizations.",
    "In the scatter plot, identify districts with both high damage and high uncertainty (upper right quadrant).",
    "Review the missing data rate bars to identify areas requiring additional assessment.",
    "Examine the correlation heatmap to understand relationships between different uncertainty metrics.",
    "Use the parallel coordinates plot to trace patterns across multiple uncertainty dimensions simultaneously."
  ],
  metadata: [
    { label: "Uncertainty Metrics", value: "Missing data rate, variance, reliability score" },
    { label: "Data Quality Sources", value: "Report completeness, consistency, source reliability" },
    { label: "Correlation Method", value: "Pearson correlation coefficient" },
    { label: "Reference Period", value: "Complete assessment timeline" }
  ]
};

/**
 * Content for the Integrated Dashboard visualization
 */
export const dashboardContent = {
  title: "St. Himark Earthquake Integrated Dashboard",
  icon: "tachometer-alt",
  description: `
    This comprehensive dashboard integrates multiple visualizations with shared filters and interactivity to provide 
    a complete view of the earthquake impact on St. Himark. Use the global filters to focus on specific areas or 
    damage types and observe coordinated updates across all visualizations.
  `,
  insights: [
    "Northwestern districts experienced critical damage across all infrastructure types, requiring prioritized emergency response.",
    "Power systems were the most severely affected infrastructure type across all districts, with an average damage score of 7.2/10.",
    "Damage patterns show clear geographic clustering, with severity decreasing from northwest to southeast.",
    "Recovery efforts were most effective in districts with lower initial damage, while severely affected areas showed prolonged recovery timelines.",
    "Medical facilities in the Central district maintained better functionality despite surrounding infrastructure damage, providing critical emergency services."
  ],
  instructions: [
    "Use the global filters at the top to focus on specific districts, damage metrics, or severity thresholds.",
    "Click on elements in any visualization to highlight corresponding data across all charts.",
    "Hover over visualization elements to see detailed information in the Highlights box.",
    "Click 'View Full' links to navigate to detailed visualizations for deeper analysis.",
    "Examine the Key Statistics panels for summarized insights across all data.",
    "Review the Analysis and Recommendations section for guidance on response prioritization."
  ],
  metadata: [
    { label: "Integrated Visualizations", value: "6 coordinated views" },
    { label: "Data Sources", value: "Combined assessment reports and geographic data" },
    { label: "Update Frequency", value: "Daily during active response" },
    { label: "Filter Capabilities", value: "Geographic, metric-based, and threshold filtering" }
  ]
};

/**
 * Content for the Treemap visualization
 */
export const treemapContent = {
  title: "Hierarchical Damage Structure Analysis",
  icon: "project-diagram",
  description: `
    This treemap visualization breaks down damage patterns into hierarchical structures, showing the relative 
    contribution of different damage categories across districts. The size of each rectangle represents the 
    proportional severity, helping to identify which aspects of infrastructure contributed most to overall damage.
  `,
  insights: [
    "Power infrastructure damage accounts for approximately 32% of total assessed damage across all districts.",
    "Northwestern districts show disproportionately high building structural damage compared to other regions.",
    "Medical facility damage represents the smallest proportion of overall damage, but includes some critical facilities with severe impacts.",
    "Central districts show a more balanced damage distribution across all categories, while peripheral districts show more specialized damage patterns."
  ],
  instructions: [
    "Click on parent rectangles to zoom in and explore that branch of the hierarchy in more detail.",
    "Click the top area to zoom back out to the previous level.",
    "Hover over rectangles to see detailed damage information and proportional statistics.",
    "Use the color legend to identify different damage categories or district groupings.",
    "Compare relative sizes to understand proportional contribution to overall damage."
  ],
  metadata: [
    { label: "Hierarchy Levels", value: "3 (Region > District > Damage Type)" },
    { label: "Size Metric", value: "Proportional damage contribution" },
    { label: "Color Encoding", value: "Damage type or district category" },
    { label: "Data Aggregation", value: "Normalized damage scores" }
  ]
};

/**
 * Get appropriate content for a visualization based on path or name
 * @param {string} path - The visualization path or name
 * @returns {Object} The content object for the visualization
 */
export function getVisualizationContent(path) {
  // Normalize path 
  const normalizedPath = path.toLowerCase().replace(/\//g, '');
  
  // Match to the appropriate content
  if (normalizedPath.includes('heatmap')) {
    return heatmapContent;
  } else if (normalizedPath.includes('radar') || normalizedPath.includes('radar-chart')) {
    return radarChartContent;
  } else if (normalizedPath.includes('animation') || normalizedPath.includes('animated')) {
    return animationGraphContent;
  } else if (normalizedPath.includes('boxplot')) {
    return boxplotContent;
  } else if (normalizedPath.includes('uncertainty') || normalizedPath.includes('task2')) {
    return uncertaintyContent;
  } else if (normalizedPath.includes('dashboard')) {
    return dashboardContent;
  } else if (normalizedPath.includes('treemap')) {
    return treemapContent;
  }
  
  // Default to basic content if no match
  return {
    title: "Visualization",
    icon: "chart-line",
    description: "This visualization provides insights into the earthquake damage data for St. Himark.",
    insights: [],
    instructions: [],
    metadata: []
  };
}