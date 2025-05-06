# St. Himark Earthquake Visualization Dashboard

An interactive data visualization dashboard for analyzing earthquake damage in the city of St. Himark.

## Group members
- Amal Hassan - efyah8@nottingham.ac.uk
- Ben Assor - psyba5@nottingham.ac.uk
- Matthew Langley - psyml9@nottingham.ac.uk
- Siddharth Advani - psysa15@nottingham.ac.uk

## Project Overview

This project is an interactive visualization dashboard built with [Observable Framework](https://observablehq.com/framework/) that analyzes earthquake damage data for the fictional city of St. Himark. The dashboard helps emergency responders prioritize their response based on damage reports from citizens, showing uncertainty in the data and how conditions change over time.

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation and Running Locally

1. Clone the repository:
   ```bash
   cd himark-challenge
   ```

2. Install dependencies for the dashboard:
   ```bash
   cd dashboard
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:3000 to view the dashboard.

### Building for Production

To create a production build:
```bash
cd dashboard
npm run build
```

This will generate static files in the `dashboard/dist` directory that can be deployed to any static web hosting service.

## Project Structure

```
.
├─ dashboard/             # Main visualization dashboard
│  ├─ src/                # Source files for the dashboard
│  │  ├─ components/      # Reusable JavaScript components
│  │  ├─ data/            # Processed data files
│  │  ├─ index.md         # Dashboard home page
│  │  ├─ heatmap.md       # Geographic heatmap visualization
│  │  ├─ treemap.md       # Damage impact by district visualization
│  │  ├─ linegraph.md     # Damage trends over time
│  │  ├─ boxplot.md       # Distribution of damage metrics
│  │  ├─ radar-chart.md   # Multi-metric comparison
│  │  ├─ task2.md         # Uncertainty and reliability analysis
│  │  └─ task3.md         # Temporal change analysis
│  ├─ observablehq.config.js # Dashboard configuration
│  └─ package.json        # Dashboard dependencies
├─ data/                  # Raw source data files
├─ docs/                  # Documentation files
└─ pre-processing/        # Python scripts for data preprocessing
```

## Analysis Tasks

The dashboard addresses three main analytical questions:

### Task 1: Emergency Response Prioritization
How should emergency responders prioritize neighborhoods based on damage reports from citizens? Which parts of the city are hardest hit?

### Task 2: Data Reliability Analysis
How reliable are the reports from different neighborhoods? Which neighborhoods are providing the most consistent and reliable data?

### Task 3: Temporal Analysis
How do conditions change over time, and how does the uncertainty in the data evolve as the situation develops?

## Technology Stack

- [Observable Framework](https://observablehq.com/framework/) - Main dashboard framework
- [D3.js](https://d3js.org/) - Data visualization library
- [Leaflet](https://leafletjs.com/) - Interactive mapping
- [Chart.js](https://www.chartjs.org/) - Charting library

## Command Reference

| Command | Description |
| ------- | ----------- |
| `npm install` | Install or reinstall dependencies |
| `npm run dev` | Start local preview server |
| `npm run build` | Build static site, generating `./dist` |
| `npm run clean` | Clear the local data loader cache |


