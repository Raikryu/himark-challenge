---
toc: false
---

<div class="hero">
  <h1>St. Himark Earthquake Dashboard</h1>
  <h2>Comprehensive disaster impact analysis and response planning</h2>
</div>

<div class="dashboard-overview">
  <div class="dashboard-description">
    <h3><i class="fas fa-info-circle"></i> About This Dashboard</h3>
    <p>
      This interactive dashboard provides comprehensive analysis of the earthquake impact on St. Himark.
      It offers multiple visualizations of damage assessments, temporal patterns, and uncertainty analysis
      to support disaster response planning and resource allocation.
    </p>
  </div>

  <div class="key-features">
    <h3><i class="fas fa-chart-pie"></i> Key Features</h3>
    <ul>
      <li>Real-time geographic damage assessment</li>
      <li>Temporal analysis of damage progression</li>
      <li>Uncertainty and reliability metrics</li>
      <li>Interactive filters and cross-visualization correlation</li>
      <li>Multi-dimensional damage analysis</li>
    </ul>
  </div>
</div>

<div class="dashboard-navigation">
  <h3><i class="fas fa-compass"></i> Dashboard Navigation</h3>

  <div class="nav-cards">
    <a href="/heatmap" class="nav-card">
      <i class="fas fa-map-marked-alt"></i>
      <h4>Geographic Heatmap</h4>
      <p>View damage intensity across districts</p>
    </a>
    <a href="/radar-chart" class="nav-card">
      <i class="fas fa-chart-pie"></i>
      <h4>Damage Radar Chart</h4>
      <p>Compare damage metrics by location</p>
    </a>
    <a href="/animation_graph" class="nav-card">
      <i class="fas fa-film"></i>
      <h4>Damage Animation</h4>
      <p>Watch damage progression over time</p>
    </a>
    <a href="/boxplot" class="nav-card">
      <i class="fas fa-chart-bar"></i>
      <h4>Boxplot Analysis</h4>
      <p>Statistical distribution of damage</p>
    </a>
    <a href="/task2" class="nav-card">
      <i class="fas fa-question-circle"></i>
      <h4>Neighborhood Uncertainty</h4>
      <p>Analyze data reliability by region</p>
    </a>
    <a href="/task3" class="nav-card">
      <i class="fas fa-clock"></i>
      <h4>Region Conditions Over Time</h4>
      <p>Track changing conditions and uncertainty</p>
    </a>
    <a href="/treemap" class="nav-card">
      <i class="fas fa-sitemap"></i>
      <h4>Damage Treemap</h4>
      <p>Hierarchical view of damage factors</p>
    </a>
  </div>
</div>

<div id="quick-stats" class="quick-stats">
  <h3><i class="fas fa-tachometer-alt"></i> Quick Statistics</h3>
  <div id="stats-container" class="stats-container"></div>
</div>

```js
import { applyDashboardStyles } from "./components/dashboard-styles.js";

{
  applyDashboardStyles();

  Promise.all([
    FileAttachment("data/cleaned_mc1-reports-data.csv").csv(),
    FileAttachment("radar_chart_data.json").json()
  ]).then(([reportData, radarData]) => {
  const totalReports = reportData.length;

  const avgDamage = radarData.reduce((sum, item) =>
    sum + (item.damage_score ||
      ((item.sewer_and_water + item.power + item.roads_and_bridges + item.medical + item.buildings) / 5)), 0
  ) / radarData.length;

  const mostAffectedArea = radarData.reduce((max, item) => {
    const score = item.damage_score ||
      ((item.sewer_and_water + item.power + item.roads_and_bridges + item.medical + item.buildings) / 5);
    return score > max.score ? {name: item.location, score} : max;
  }, {name: '', score: 0});

  const times = reportData
    .map(d => new Date(d.time.replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3")))
    .filter(d => !isNaN(d));
  const firstReport = new Date(Math.min(...times));
  const lastReport = new Date(Math.max(...times));
  const daysDiff = Math.floor((lastReport - firstReport) / (1000 * 60 * 60 * 24));

  const statsContainer = document.getElementById('stats-container');
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalReports.toLocaleString()}</div>
      <div class="stat-label">Total Reports</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${avgDamage.toFixed(1)}</div>
      <div class="stat-label">Avg. Damage Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${mostAffectedArea.name}</div>
      <div class="stat-label">Most Affected Area</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${daysDiff}</div>
      <div class="stat-label">Days of Data</div>
    </div>
  `;
  }).catch(error => {
    console.error("Error loading data:", error);
    document.getElementById('stats-container').innerHTML = `
      <div class="error-message">Error loading statistics: ${error.message}</div>
    `;
  });
}
```

<style>
:root {
  --primary-color: #2a9d8f;
  --secondary-color: #e76f51;
  --dark-bg: #264653;
  --light-text: #e9e9e9;
  --muted-text: #a8a8a8;
  --card-bg: rgba(42, 157, 143, 0.1);
  --card-border: rgba(42, 157, 143, 0.2);
  --card-hover: rgba(42, 157, 143, 0.3);
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: var(--light-text);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;
  margin: 2rem 0 4rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(30deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--muted-text);
}

.dashboard-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 3rem 0;
}

.dashboard-overview h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.dashboard-overview p, .dashboard-overview li {
  color: var(--light-text);
  font-size: 1rem;
}

.dashboard-description, .key-features {
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

.key-features ul {
  padding-left: 1.5rem;
}

.key-features li {
  margin-bottom: 0.5rem;
}

.dashboard-navigation {
  margin: 3rem 0;
}

.dashboard-navigation h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.nav-card:hover {
  background: var(--card-hover);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.nav-card i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--secondary-color);
}

.nav-card h4 {
  color: var(--light-text);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.nav-card p {
  color: var(--muted-text);
  margin: 0;
  font-size: 0.9rem;
}

.quick-stats {
  margin: 3rem 0;
}

.quick-stats h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--muted-text);
}

.error-message {
  color: #e76f51;
  font-style: italic;
}

@media (max-width: 768px) {
  .dashboard-overview {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero h2 {
    font-size: 1rem;
  }
}

</style>