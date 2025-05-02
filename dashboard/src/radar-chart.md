---
theme: dashboard
toc: true
title: "Damage Radar Chart Analysis"
---

# Multi-Dimensional Damage Assessment

This radar chart visualization enables the comparison of different damage metrics across St. Himark districts. You can analyze both individual districts in detail and compare multiple districts simultaneously.

## Visualization Controls

<div class="control-panel">
  <div class="control-group">
    <label for="district-select">Select District:</label>
    <select id="district-select" class="dashboard-select">
      <option value="all">All Districts</option>
      <!-- District options will be added dynamically -->
    </select>
  </div>
  
  <div class="control-group">
    <label for="metric-toggle">Compare Mode:</label>
    <div class="toggle-container">
      <input type="checkbox" id="compare-toggle" class="toggle-checkbox">
      <label for="compare-toggle" class="toggle-label"></label>
      <span id="compare-state">Single District</span>
    </div>
  </div>
  
  <div id="comparison-controls" style="display: none;">
    <div class="chips-container" id="district-chips">
      <!-- District chips will be added dynamically -->
    </div>
    <button id="clear-selection" class="dashboard-button">
      <i class="fas fa-times-circle"></i> Clear Selection
    </button>
  </div>
</div>

## Radar Chart Visualization

<div class="dashboard-card">
  <canvas id="radarChart" width="800" height="600"></canvas>
</div>

<div class="dashboard-card">
  <div class="dashboard-title">
    <i class="fas fa-info-circle"></i> District Analysis
  </div>
  <div id="district-analysis">
    <p>Select a district to see detailed analysis.</p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>

```js
import { dashboardColors, getDamageColor, applyDashboardStyles } from "./components/dashboard-styles.js"

{
  // Apply common dashboard styles
  applyDashboardStyles();
  
  // DOM elements
  const districtSelect = document.getElementById("district-select");
  const compareToggle = document.getElementById("compare-toggle");
  const compareState = document.getElementById("compare-state");
  const comparisonControls = document.getElementById("comparison-controls");
  const districtChips = document.getElementById("district-chips");
  const clearSelectionBtn = document.getElementById("clear-selection");
  const districtAnalysis = document.getElementById("district-analysis");
  
  // Chart reference
  let radarChart = null;
  
  // Track selected districts for comparison
  let selectedDistricts = [];
  let compareMode = false;
  
  // Load data
  const data = await FileAttachment("radar_chart_data.json").json();
  
  // Define metrics with display names
  const metrics = {
    sewer_and_water: { 
      displayName: "Sewer & Water",
      color: dashboardColors.damage.categories.sewage
    },
    power: { 
      displayName: "Power",
      color: dashboardColors.damage.categories.power
    },
    roads_and_bridges: { 
      displayName: "Roads & Bridges",
      color: dashboardColors.damage.categories.roads
    },
    medical: { 
      displayName: "Medical",
      color: dashboardColors.damage.categories.medical
    },
    buildings: { 
      displayName: "Buildings",
      color: dashboardColors.damage.categories.buildings
    }
  };
  
  // Get metric keys (we'll exclude damage_score as it's calculated)
  const metricKeys = Object.keys(metrics);
  
  // Populate district select dropdown
  populateDistrictDropdown();
  
  // Initialize chart with default values
  createChart("all");
  
  // Setup event listeners
  districtSelect.addEventListener("change", handleDistrictChange);
  compareToggle.addEventListener("change", handleCompareToggle);
  clearSelectionBtn.addEventListener("click", clearSelectedDistricts);
  
  // Function to populate district dropdown
  function populateDistrictDropdown() {
    // Get unique district names
    const districtNames = data.map(d => d.location);
    
    // Add options to select
    districtNames.forEach(district => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
  
  // Handle district selection change
  function handleDistrictChange() {
    const selectedValue = districtSelect.value;
    
    if (compareMode) {
      // In compare mode, add selected district to comparison
      if (selectedValue !== "all" && !selectedDistricts.includes(selectedValue)) {
        addDistrictToComparison(selectedValue);
      }
    } else {
      // In single mode, just update the chart
      createChart(selectedValue);
      updateDistrictAnalysis(selectedValue);
    }
  }
  
  // Handle compare toggle change
  function handleCompareToggle() {
    compareMode = compareToggle.checked;
    compareState.textContent = compareMode ? "Multi District" : "Single District";
    
    if (compareMode) {
      // Switch to comparison mode
      comparisonControls.style.display = "block";
      // Add current selection if it's a specific district
      if (districtSelect.value !== "all") {
        addDistrictToComparison(districtSelect.value);
      } else {
        // If "all" is selected, start with empty comparison
        createComparisonChart();
      }
    } else {
      // Switch back to single mode
      comparisonControls.style.display = "none";
      createChart(districtSelect.value);
      updateDistrictAnalysis(districtSelect.value);
    }
  }
  
  // Add a district to the comparison
  function addDistrictToComparison(districtName) {
    // Check if we already have this district
    if (selectedDistricts.includes(districtName)) {
      return;
    }
    
    // Add to our tracking array
    selectedDistricts.push(districtName);
    
    // Create a chip for this district
    const chip = document.createElement("div");
    chip.className = "district-chip";
    
    // Get district data
    const districtData = data.find(d => d.location === districtName);
    
    // Calculate damage score if not present
    const damageScore = districtData.damage_score || 
      calculateDamageScore(districtData);
    
    // Get color based on damage score
    const chipColor = getDamageColor(damageScore);
    
    // Create chip content
    chip.innerHTML = `
      <span class="chip-name" style="background-color: ${chipColor}">
        ${districtName}
      </span>
      <button class="chip-remove" data-district="${districtName}">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add chip to container
    districtChips.appendChild(chip);
    
    // Add click handler for remove button
    chip.querySelector(".chip-remove").addEventListener("click", function(e) {
      const district = e.currentTarget.dataset.district;
      removeDistrictFromComparison(district);
    });
    
    // Update the chart
    createComparisonChart();
  }
  
  // Remove a district from comparison
  function removeDistrictFromComparison(districtName) {
    // Remove from array
    selectedDistricts = selectedDistricts.filter(d => d !== districtName);
    
    // Remove chip
    const chips = districtChips.querySelectorAll(".district-chip");
    chips.forEach(chip => {
      const removeBtn = chip.querySelector(".chip-remove");
      if (removeBtn && removeBtn.dataset.district === districtName) {
        chip.remove();
      }
    });
    
    // Update chart
    createComparisonChart();
  }
  
  // Clear all selected districts
  function clearSelectedDistricts() {
    selectedDistricts = [];
    districtChips.innerHTML = "";
    createComparisonChart();
  }
  
  // Create chart for a single district or all districts
  function createChart(districtValue) {
    const ctx = document.getElementById("radarChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (radarChart) {
      radarChart.destroy();
    }
    
    // Prepare labels (metric names)
    const labels = metricKeys.map(key => metrics[key].displayName);
    
    // Prepare datasets
    let datasets = [];
    
    if (districtValue === "all") {
      // Show average for all districts
      const avgData = calculateAverageData();
      
      datasets.push({
        label: "All Districts (Average)",
        data: metricKeys.map(key => avgData[key]),
        backgroundColor: "rgba(231, 111, 81, 0.2)",
        borderColor: dashboardColors.secondary,
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: dashboardColors.secondary,
        pointRadius: 4
      });
    } else {
      // Show data for specific district
      const districtData = data.find(d => d.location === districtValue);
      
      if (districtData) {
        datasets.push({
          label: districtData.location,
          data: metricKeys.map(key => districtData[key]),
          backgroundColor: "rgba(42, 157, 143, 0.2)",
          borderColor: dashboardColors.primary,
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointBackgroundColor: dashboardColors.primary,
          pointRadius: 4
        });
      }
    }
    
    // Create the chart
    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              callback: value => `${value}`,
              backdropColor: "rgba(0, 0, 0, 0.3)",
              color: "#fff"
            },
            pointLabels: {
              color: "#fff",
              font: {
                size: 14,
                weight: "bold"
              }
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)"
            },
            angleLines: {
              color: "rgba(255, 255, 255, 0.2)"
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: districtValue === "all" 
              ? "Average Damage Metrics Across All Districts" 
              : `Damage Assessment for ${districtValue} District`,
            color: "#fff",
            font: {
              size: 18
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: dashboardColors.primary,
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              title: (items) => {
                return items[0].label;
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.raw.toFixed(2)}/10`;
              }
            }
          },
          legend: {
            display: true,
            position: "top",
            align: "center",
            labels: {
              color: "#fff",
              font: {
                size: 12
              },
              padding: 20
            }
          }
        }
      }
    });
  }
  
  // Create comparison chart for multiple districts
  function createComparisonChart() {
    const ctx = document.getElementById("radarChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (radarChart) {
      radarChart.destroy();
    }
    
    // Prepare labels (metric names)
    const labels = metricKeys.map(key => metrics[key].displayName);
    
    // Prepare datasets
    let datasets = [];
    
    // If no districts selected, show empty chart with message
    if (selectedDistricts.length === 0) {
      // Show the chart container but with a message
      document.getElementById("radarChart").style.display = "none";
      districtAnalysis.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-info-circle"></i>
          <p>Select districts to compare from the dropdown above.</p>
        </div>
      `;
      return;
    }
    
    // Show the chart
    document.getElementById("radarChart").style.display = "block";
    
    // Create a dataset for each selected district
    selectedDistricts.forEach((districtName, index) => {
      const districtData = data.find(d => d.location === districtName);
      
      if (districtData) {
        // Get a unique color for each district
        const hue = (index * 137) % 360; // Golden angle approximation for good distribution
        const color = `hsl(${hue}, 70%, 60%)`;
        
        datasets.push({
          label: districtName,
          data: metricKeys.map(key => districtData[key]),
          backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointBackgroundColor: color,
          pointRadius: 4
        });
      }
    });
    
    // Create the chart
    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              callback: value => `${value}`,
              backdropColor: "rgba(0, 0, 0, 0.3)",
              color: "#fff"
            },
            pointLabels: {
              color: "#fff",
              font: {
                size: 14,
                weight: "bold"
              }
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)"
            },
            angleLines: {
              color: "rgba(255, 255, 255, 0.2)"
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Comparison of ${selectedDistricts.length} Districts`,
            color: "#fff",
            font: {
              size: 18
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: dashboardColors.primary,
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              title: (items) => {
                return items[0].label;
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.raw.toFixed(2)}/10`;
              }
            }
          },
          legend: {
            display: true,
            position: "top",
            align: "center",
            labels: {
              color: "#fff",
              font: {
                size: 12
              },
              padding: 20
            }
          }
        }
      }
    });
    
    // Update comparative analysis
    updateComparativeAnalysis();
  }
  
  // Calculate average data across all districts
  function calculateAverageData() {
    const avgData = {};
    
    // Initialize average for each metric
    metricKeys.forEach(key => {
      avgData[key] = 0;
    });
    
    // Sum values
    data.forEach(district => {
      metricKeys.forEach(key => {
        avgData[key] += district[key] || 0;
      });
    });
    
    // Calculate average
    metricKeys.forEach(key => {
      avgData[key] = avgData[key] / data.length;
    });
    
    return avgData;
  }
  
  // Calculate damage score for a district if not provided
  function calculateDamageScore(district) {
    let sum = 0;
    let count = 0;
    
    metricKeys.forEach(key => {
      if (district[key] !== undefined) {
        sum += district[key];
        count++;
      }
    });
    
    return count > 0 ? sum / count : 0;
  }
  
  // Update district analysis panel
  function updateDistrictAnalysis(districtName) {
    // If "all" is selected, show overall analysis
    if (districtName === "all") {
      showOverallAnalysis();
      return;
    }
    
    // Find district data
    const districtData = data.find(d => d.location === districtName);
    
    if (!districtData) {
      districtAnalysis.innerHTML = `<p>No data available for ${districtName}</p>`;
      return;
    }
    
    // Calculate damage score if not provided
    const damageScore = districtData.damage_score || calculateDamageScore(districtData);
    
    // Find the highest and lowest damage categories
    const metricValues = metricKeys.map(key => ({
      key: key,
      value: districtData[key] || 0,
      name: metrics[key].displayName
    }));
    
    const highestDamage = [...metricValues].sort((a, b) => b.value - a.value)[0];
    const lowestDamage = [...metricValues].sort((a, b) => a.value - b.value)[0];
    
    // Generate analysis
    districtAnalysis.innerHTML = `
      <h3>${districtName} District Analysis</h3>
      
      <div class="analysis-section">
        <div class="analysis-metric">
          <div class="metric-label">Overall Damage Score</div>
          <div class="metric-value" style="color: ${getDamageColor(damageScore)}">
            ${damageScore.toFixed(2)}/10
          </div>
          <div class="metric-description">
            ${getDamageSeverityDescription(damageScore)}
          </div>
        </div>
        
        <div class="analysis-highlights">
          <div class="highlight-item">
            <div class="highlight-label">Most Affected</div>
            <div class="highlight-value" style="color: ${getDamageColor(highestDamage.value)}">
              ${highestDamage.name}
            </div>
            <div class="highlight-score">
              Score: ${highestDamage.value.toFixed(2)}/10
            </div>
          </div>
          
          <div class="highlight-item">
            <div class="highlight-label">Least Affected</div>
            <div class="highlight-value" style="color: ${getDamageColor(lowestDamage.value)}">
              ${lowestDamage.name}
            </div>
            <div class="highlight-score">
              Score: ${lowestDamage.value.toFixed(2)}/10
            </div>
          </div>
        </div>
      </div>
      
      <div class="analysis-recommendation">
        <h4>Priority Recommendations</h4>
        <p>${getRecommendation(districtData)}</p>
      </div>
    `;
  }
  
  // Show overall analysis when "all" is selected
  function showOverallAnalysis() {
    // Calculate average data
    const avgData = calculateAverageData();
    
    // Find districts with highest and lowest overall damage
    const districtsByDamage = [...data].sort((a, b) => {
      const scoreA = a.damage_score || calculateDamageScore(a);
      const scoreB = b.damage_score || calculateDamageScore(b);
      return scoreB - scoreA;
    });
    
    const mostDamaged = districtsByDamage[0];
    const leastDamaged = districtsByDamage[districtsByDamage.length - 1];
    
    // Find most damaged category across all districts
    const avgMetricValues = metricKeys.map(key => ({
      key: key,
      value: avgData[key],
      name: metrics[key].displayName
    }));
    
    const highestAvgDamage = [...avgMetricValues].sort((a, b) => b.value - a.value)[0];
    
    // Calculate overall average damage
    const overallAvg = metricKeys.reduce((sum, key) => sum + avgData[key], 0) / metricKeys.length;
    
    districtAnalysis.innerHTML = `
      <h3>St. Himark Overall Analysis</h3>
      
      <div class="analysis-section">
        <div class="analysis-metric">
          <div class="metric-label">Average Damage Score</div>
          <div class="metric-value" style="color: ${getDamageColor(overallAvg)}">
            ${overallAvg.toFixed(2)}/10
          </div>
          <div class="metric-description">
            ${getDamageSeverityDescription(overallAvg)}
          </div>
        </div>
        
        <div class="analysis-highlights">
          <div class="highlight-item">
            <div class="highlight-label">Most Damaged District</div>
            <div class="highlight-value">
              ${mostDamaged.location}
            </div>
            <div class="highlight-score" style="color: ${getDamageColor(mostDamaged.damage_score || calculateDamageScore(mostDamaged))}">
              Score: ${(mostDamaged.damage_score || calculateDamageScore(mostDamaged)).toFixed(2)}/10
            </div>
          </div>
          
          <div class="highlight-item">
            <div class="highlight-label">Least Damaged District</div>
            <div class="highlight-value">
              ${leastDamaged.location}
            </div>
            <div class="highlight-score" style="color: ${getDamageColor(leastDamaged.damage_score || calculateDamageScore(leastDamaged))}">
              Score: ${(leastDamaged.damage_score || calculateDamageScore(leastDamaged)).toFixed(2)}/10
            </div>
          </div>
        </div>
        
        <div class="analysis-trends">
          <h4>Key Findings</h4>
          <ul>
            <li>The most severely affected category across all districts is <strong>${highestAvgDamage.name}</strong> with an average score of <strong>${highestAvgDamage.value.toFixed(2)}/10</strong>.</li>
            <li>There is a ${calculateVariability().toFixed(1)}% variability in damage across different districts.</li>
            <li>${mostDamaged.location} district requires immediate attention with critical damage levels.</li>
          </ul>
        </div>
      </div>
    `;
  }
  
  // Update comparative analysis when multiple districts are selected
  function updateComparativeAnalysis() {
    if (selectedDistricts.length === 0) {
      return;
    }
    
    // Collect data for the selected districts
    const selectedData = selectedDistricts.map(district => {
      const districtData = data.find(d => d.location === district);
      return {
        name: district,
        data: districtData,
        score: districtData.damage_score || calculateDamageScore(districtData)
      };
    });
    
    // Sort by damage score
    selectedData.sort((a, b) => b.score - a.score);
    
    // Calculate differences and similarities
    const differences = findKeyDifferences(selectedData);
    const similarities = findKeySimilarities(selectedData);
    
    // Generate comparative analysis
    districtAnalysis.innerHTML = `
      <h3>Comparative Analysis</h3>
      
      <div class="comparison-ranking">
        <h4>Districts Ranked by Overall Damage</h4>
        <ol class="ranking-list">
          ${selectedData.map(district => `
            <li>
              <span class="district-name">${district.name}</span>
              <div class="score-bar" style="width: ${district.score * 10}%; background-color: ${getDamageColor(district.score)}">
                ${district.score.toFixed(2)}
              </div>
            </li>
          `).join('')}
        </ol>
      </div>
      
      <div class="comparison-insights">
        <div class="insight-column">
          <h4>Key Differences</h4>
          <ul>
            ${differences.map(diff => `
              <li>
                <strong>${diff.metric}:</strong> 
                ${diff.description}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="insight-column">
          <h4>Key Similarities</h4>
          <ul>
            ${similarities.map(sim => `
              <li>
                <strong>${sim.metric}:</strong> 
                ${sim.description}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <div class="overall-recommendation">
        <h4>Action Recommendations</h4>
        <p>${generateComparisonRecommendation(selectedData)}</p>
      </div>
    `;
  }
  
  // Generate recommendations based on district data
  function getRecommendation(districtData) {
    // Find the most critical areas
    const metricValues = metricKeys.map(key => ({
      key: key,
      value: districtData[key] || 0,
      name: metrics[key].displayName
    }));
    
    // Sort by severity
    metricValues.sort((a, b) => b.value - a.value);
    
    // Generate recommendations based on top issues
    const topIssues = metricValues.slice(0, 2);
    
    if (topIssues[0].value > 7) {
      return `Immediate emergency response needed for ${topIssues[0].name} infrastructure with critical damage level of ${topIssues[0].value.toFixed(1)}/10. Secondary focus should be on ${topIssues[1].name} restoration with damage level of ${topIssues[1].value.toFixed(1)}/10.`;
    } else if (topIssues[0].value > 5) {
      return `Prioritize repairs to ${topIssues[0].name} systems (damage: ${topIssues[0].value.toFixed(1)}/10) while establishing temporary alternatives. Address ${topIssues[1].name} issues (damage: ${topIssues[1].value.toFixed(1)}/10) as secondary priority.`;
    } else {
      return `Focus on assessment and preventative maintenance for ${topIssues[0].name} and ${topIssues[1].name} infrastructure. Both show moderate damage levels that should be monitored for potential deterioration.`;
    }
  }
  
  // Get severity description based on damage score
  function getDamageSeverityDescription(score) {
    if (score <= 2) {
      return "Minimal damage requiring routine maintenance";
    } else if (score <= 4) {
      return "Minor damage requiring non-urgent repairs";
    } else if (score <= 6) {
      return "Moderate damage requiring attention within days";
    } else if (score <= 8) {
      return "Severe damage requiring immediate response";
    } else {
      return "Critical damage requiring emergency intervention";
    }
  }
  
  // Calculate variability across districts
  function calculateVariability() {
    const scores = data.map(d => d.damage_score || calculateDamageScore(d));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const variability = ((max - min) / min) * 100;
    return variability;
  }
  
  // Find key differences between selected districts
  function findKeyDifferences(selectedData) {
    if (selectedData.length < 2) {
      return [{
        metric: "Analysis",
        description: "Select at least two districts to see differences."
      }];
    }
    
    const differences = [];
    
    // For each metric, find the largest difference
    metricKeys.forEach(key => {
      const values = selectedData.map(d => d.data[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const diff = max - min;
      
      if (diff > 2) { // Only consider significant differences
        const highestDistrict = selectedData.find(d => d.data[key] === max);
        const lowestDistrict = selectedData.find(d => d.data[key] === min);
        
        differences.push({
          metric: metrics[key].displayName,
          value: diff,
          description: `${highestDistrict.name} has ${diff.toFixed(1)} points higher damage than ${lowestDistrict.name} (${max.toFixed(1)} vs ${min.toFixed(1)})`
        });
      }
    });
    
    // Sort by largest difference
    differences.sort((a, b) => b.value - a.value);
    
    return differences.slice(0, 3); // Return top 3 differences
  }
  
  // Find key similarities between selected districts
  function findKeySimilarities(selectedData) {
    if (selectedData.length < 2) {
      return [{
        metric: "Analysis",
        description: "Select at least two districts to see similarities."
      }];
    }
    
    const similarities = [];
    
    // For each metric, find the smallest difference
    metricKeys.forEach(key => {
      const values = selectedData.map(d => d.data[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const diff = max - min;
      
      if (diff < 1.5) { // Consider small differences as similarities
        similarities.push({
          metric: metrics[key].displayName,
          value: diff,
          description: `All selected districts have similar ${metrics[key].displayName.toLowerCase()} damage (between ${min.toFixed(1)} and ${max.toFixed(1)})`
        });
      }
    });
    
    // Sort by smallest difference
    similarities.sort((a, b) => a.value - b.value);
    
    return similarities.length > 0 ? similarities.slice(0, 3) : [{
      metric: "Analysis",
      description: "No significant similarities found between the selected districts."
    }];
  }
  
  // Generate recommendations for comparison
  function generateComparisonRecommendation(selectedData) {
    if (selectedData.length <= 1) {
      return "Select multiple districts to generate comparative recommendations.";
    }
    
    // Find the district with highest damage
    const mostDamaged = selectedData[0]; // Already sorted
    
    // Find the most common critical issue across districts
    const criticalIssues = {};
    
    metricKeys.forEach(key => {
      criticalIssues[key] = 0;
      selectedData.forEach(district => {
        if (district.data[key] > 7) { // Critical threshold
          criticalIssues[key]++;
        }
      });
    });
    
    // Find the most common critical issue
    const mostCommonIssue = Object.keys(criticalIssues).reduce((a, b) => 
      criticalIssues[a] > criticalIssues[b] ? a : b
    );
    
    if (criticalIssues[mostCommonIssue] > 0) {
      const affectedCount = criticalIssues[mostCommonIssue];
      const totalCount = selectedData.length;
      
      return `Prioritize ${metrics[mostCommonIssue].displayName} repairs across ${affectedCount} of ${totalCount} selected districts, with immediate focus on ${mostDamaged.name} which has the highest overall damage score of ${mostDamaged.score.toFixed(1)}/10. Coordinated response teams should be deployed to address this common critical issue.`;
    } else {
      // If no critical issues, recommend based on highest damage district
      return `Focus resources on ${mostDamaged.name} district which has the highest overall damage score of ${mostDamaged.score.toFixed(1)}/10. Other selected districts show less severe damage but should be monitored. Regular assessment of infrastructure across all districts is recommended.`;
    }
  }
}
```

<style>
.control-panel {
  margin-bottom: 1.5rem;
}

.control-group {
  display: inline-flex;
  align-items: center;
  margin-right: 1.5rem;
  margin-bottom: 1rem;
}

.control-group label {
  margin-right: 0.5rem;
  color: var(--text-light);
}

/* Toggle Switch */
.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-checkbox {
  display: none;
}

.toggle-label {
  cursor: pointer;
  text-indent: -9999px;
  width: 50px;
  height: 25px;
  background: var(--bg-card);
  display: block;
  border-radius: 100px;
  position: relative;
  border: 1px solid var(--bg-card-border);
}

.toggle-label:after {
  content: '';
  position: absolute;
  top: 2px;
  left: 3px;
  width: 19px;
  height: 19px;
  background: var(--primary-color);
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-checkbox:checked + .toggle-label {
  background: var(--bg-card-hover);
}

.toggle-checkbox:checked + .toggle-label:after {
  left: calc(100% - 3px);
  transform: translateX(-100%);
  background: var(--secondary-color);
}

.toggle-label:active:after {
  width: 25px;
}

#compare-state {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* District Chips */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.district-chip {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 0 5px 0 0;
  height: 32px;
  overflow: hidden;
}

.chip-name {
  padding: 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
  color: white;
  font-weight: 500;
  border-radius: 16px 0 0 16px;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 50%;
  margin-left: 4px;
}

.chip-remove:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Analysis Styles */
.analysis-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.analysis-metric {
  padding: 1rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--bg-card-border);
  text-align: center;
}

.metric-label {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.metric-description {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.analysis-highlights {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.highlight-item {
  padding: 1rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--bg-card-border);
  text-align: center;
}

.highlight-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.highlight-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.highlight-score {
  font-size: 0.875rem;
}

.analysis-recommendation, 
.analysis-trends,
.comparison-insights,
.comparison-ranking,
.overall-recommendation {
  padding: 1rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--bg-card-border);
  margin-bottom: 1rem;
}

.comparison-insights {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.insight-column h4 {
  margin-top: 0;
  color: var(--primary-color);
}

.insight-column ul {
  padding-left: 1.5rem;
}

.insight-column li {
  margin-bottom: 0.5rem;
}

.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranking-list li {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.district-name {
  width: 120px;
  flex-shrink: 0;
}

.score-bar {
  height: 20px;
  border-radius: 10px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .analysis-section,
  .analysis-highlights,
  .comparison-insights {
    grid-template-columns: 1fr;
  }
}
</style>