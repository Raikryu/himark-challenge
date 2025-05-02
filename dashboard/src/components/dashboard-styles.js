// Common color schemes and styles for St. Himark Earthquake Dashboard

export const dashboardColors = {
  // Primary color palette (for UI elements and general use)
  primary: "#2a9d8f",
  secondary: "#e76f51",
  dark: "#264653",
  light: "#e9c46a",
  accent: "#f4a261",
  
  // Text colors
  text: {
    light: "#e9e9e9",
    muted: "#a8a8a8",
    dark: "#333333"
  },
  
  // Background colors
  background: {
    card: "rgba(42, 157, 143, 0.1)",
    cardBorder: "rgba(42, 157, 143, 0.2)",
    cardHover: "rgba(42, 157, 143, 0.3)",
    dark: "#1a1a1a",
    light: "#f8f9fa"
  },
  
  // Damage level colors (for consistent representation across visualizations)
  damage: {
    // Sequential color scale for damage levels
    sequential: [
      "#fee5d9", // Minimal damage
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#ef3b2c",
      "#cb181d",
      "#99000d"  // Severe damage
    ],
    // For categorical representation
    categories: {
      buildings: "#4e79a7",
      power: "#f28e2c", 
      medical: "#e15759",
      sewage: "#76b7b2",
      roads: "#59a14f"
    }
  },
  
  // Uncertainty visualization colors
  uncertainty: {
    low: "#4682b4",    // Steel blue - more certain
    medium: "#d4b483", // Tan - medium certainty
    high: "#bc5090"     // Purple - less certain
  }
};

// Font settings
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
  fontSize: {
    small: "0.875rem",
    base: "1rem",
    large: "1.25rem",
    xlarge: "1.5rem",
    xxlarge: "2rem",
    title: "2.5rem"
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// Common chart settings
export const chartConfig = {
  // Common margin settings for consistent layout
  margin: {
    small: { top: 10, right: 10, bottom: 30, left: 40 },
    medium: { top: 20, right: 30, bottom: 40, left: 50 },
    large: { top: 30, right: 40, bottom: 50, left: 60 }
  },
  
  // Animation timings
  transitions: {
    fast: 250,
    medium: 500,
    slow: 750
  },
  
  // Common axis formatting for consistency
  axisFormat: {
    // Number of ticks based on chart size
    tickCount: {
      small: 3,
      medium: 5,
      large: 8
    },
    
    // Date formatting options for different time scales
    timeFormat: {
      hour: "%I %p",
      day: "%b %d",
      month: "%b %Y"
    }
  },
  
  // Standard tooltip styling
  tooltip: {
    backgroundColor: "rgba(38, 70, 83, 0.8)",
    borderColor: "rgba(42, 157, 143, 0.6)",
    textColor: "#e9e9e9",
    fontSize: "0.875rem",
    padding: "8px 12px",
    borderRadius: "4px"
  }
};

// Helper function to get damage color based on score (0-10)
export function getDamageColor(score, alpha = 1) {
  // Normalize score to 0-1 range
  const normalizedScore = Math.max(0, Math.min(score, 10)) / 10;
  
  // Get color from damage sequential scale
  const colorIndex = Math.floor(normalizedScore * (dashboardColors.damage.sequential.length - 1));
  const color = dashboardColors.damage.sequential[colorIndex];
  
  // If alpha is 1, return hex color
  if (alpha === 1) return color;
  
  // Otherwise convert to rgba with specified alpha
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper function to get uncertainty color based on level (0-1)
export function getUncertaintyColor(level, alpha = 1) {
  let color;
  
  if (level < 0.33) {
    color = dashboardColors.uncertainty.low;
  } else if (level < 0.66) {
    color = dashboardColors.uncertainty.medium;
  } else {
    color = dashboardColors.uncertainty.high;
  }
  
  // If alpha is 1, return hex color
  if (alpha === 1) return color;
  
  // Convert to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Add CSS variables to document root for easy access in stylesheets
export function applyDashboardStyles() {
  const root = document.documentElement;
  
  // Set primary colors
  root.style.setProperty('--primary-color', dashboardColors.primary);
  root.style.setProperty('--secondary-color', dashboardColors.secondary);
  root.style.setProperty('--dark-color', dashboardColors.dark);
  root.style.setProperty('--light-color', dashboardColors.light);
  root.style.setProperty('--accent-color', dashboardColors.accent);
  
  // Set text colors
  root.style.setProperty('--text-light', dashboardColors.text.light);
  root.style.setProperty('--text-muted', dashboardColors.text.muted);
  root.style.setProperty('--text-dark', dashboardColors.text.dark);
  
  // Set background colors
  root.style.setProperty('--bg-card', dashboardColors.background.card);
  root.style.setProperty('--bg-card-border', dashboardColors.background.cardBorder);
  root.style.setProperty('--bg-card-hover', dashboardColors.background.cardHover);
  root.style.setProperty('--bg-dark', dashboardColors.background.dark);
  root.style.setProperty('--bg-light', dashboardColors.background.light);
  
  // Set typography
  root.style.setProperty('--font-family', typography.fontFamily);
  root.style.setProperty('--font-size-small', typography.fontSize.small);
  root.style.setProperty('--font-size-base', typography.fontSize.base);
  root.style.setProperty('--font-size-large', typography.fontSize.large);
  
  // Apply basic styles to common elements
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: var(--font-family);
      color: var(--text-light);
      line-height: 1.6;
    }
    
    .dashboard-card {
      background: var(--bg-card);
      border: 1px solid var(--bg-card-border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .dashboard-title {
      color: var(--primary-color);
      font-size: var(--font-size-large);
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .dashboard-description {
      color: var(--text-muted);
      font-size: var(--font-size-base);
      margin-bottom: 1.5rem;
    }
    
    .chart-container {
      width: 100%;
      height: 500px;
      position: relative;
    }
    
    .control-panel {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
    }
    
    .dashboard-select, .dashboard-button {
      background: var(--bg-card);
      border: 1px solid var(--bg-card-border);
      color: var(--text-light);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-family: var(--font-family);
      font-size: var(--font-size-small);
    }
    
    .dashboard-button {
      cursor: pointer;
      transition: background 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .dashboard-button:hover {
      background: var(--bg-card-hover);
    }
    
    .dashboard-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
      font-size: var(--font-size-small);
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  `;
  
  document.head.appendChild(style);
}