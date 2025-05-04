# St. Himark Earthquake Dashboard Data Summary

This document provides an overview of how real data from St. Himark is integrated into the dashboard visualizations.

## Data Files

The dashboard uses the following data files located in `/dashboard/src/data/`:

1. **cleaned_mc1-reports-data.csv**
   - Main dataset with all damage reports
   - Contains time, damage metrics for different infrastructure types, location
   - Used in animation graph and other temporal visualizations

2. **radar_chart_data.json**
   - Aggregated damage metrics by location/district
   - Includes averaged scores for different damage types
   - Used in radar chart and heatmap visualizations

3. **boxplot_data.csv**
   - Statistical summaries (min, q1, median, q3, max) of damage metrics
   - Organized by date and location
   - Used in the boxplot visualization

4. **daily_mean_by_location.csv**
   - Daily averages of damage metrics by location
   - Used for temporal trend analysis

5. **heatmap_data.csv**
   - Time-series data organized in 30-min intervals
   - Contains damage counts by location
   - Used in the heatmap visualization

6. **processed_neighborhood_reliability.json**
   - Contains reliability metrics for each neighborhood
   - Includes missing data rates, report frequency, and damage variability
   - Used in uncertainty analysis

7. **uncertainty.csv & uncertainty2.csv**
   - Time-based uncertainty metrics for damage assessments
   - Used in the uncertainty visualization

8. **st_himark_color_extracted_pixels_with_update2.geojson**
   - Geographic data defining district boundaries
   - Used in the map-based visualizations

## Data Integration by Visualization

### Geographic Heatmap
- Uses the GeoJSON file for district boundaries
- Integrates damage scores from `radar_chart_data.json`
- Allows switching between different damage metrics
- Color intensity represents damage severity

### Radar Chart
- Uses `radar_chart_data.json` for multi-dimensional metrics
- Shows damage across different infrastructure types
- Supports comparing multiple districts
- Generates statistical insights based on patterns

### Animation Graph
- Uses `cleaned_mc1-reports-data.csv` for temporal progression
- Shows how damage evolved over time
- Calculates statistical summaries for each time point
- Identifies key events in the timeline

### Boxplot Analysis
- Uses `boxplot_data.csv` for statistical distributions
- Shows variability and central tendency of damage
- Allows filtering by location and metric

### Uncertainty Analysis
- Uses `processed_neighborhood_reliability.json` and uncertainty CSV files
- Visualizes data quality and reliability
- Highlights areas with incomplete or variable data

### Dashboard
- Integrates all visualizations with consistent data mapping
- Implements cross-visualization filters based on location, time and metrics
- Generates insights across all data sources

## Data Processing

The dashboard components use several data processing techniques:

1. **Aggregation**: Computing averages, medians, and other statistics
2. **Filtering**: Allowing users to focus on specific locations, time periods, or metrics
3. **Transformation**: Converting raw data into visualization-ready formats
4. **Joining**: Combining geographic data with damage metrics
5. **Normalization**: Ensuring consistent scales across metrics

## Color Mapping

The dashboard uses a consistent color scheme to represent data:

- Damage intensity uses a sequential red color scale (darker = more severe)
- Different infrastructure types have distinct categorical colors
- Uncertainty metrics use a diverging color scale

## Data-Driven Insights

The dashboard generates several types of insights based on the data:

1. **Geographic patterns**: Identifying most and least affected areas
2. **Temporal trends**: Tracking damage evolution and recovery
3. **Infrastructure vulnerability**: Comparing damage across different systems
4. **Reliability assessment**: Highlighting areas with uncertain data
5. **Statistical outliers**: Identifying unusual damage patterns

These data-driven insights help emergency responders prioritize resources and understand the overall impact of the earthquake on St. Himark.