import { dashboardColors } from "./dashboard-styles.js";
import dashboardState from "./dashboard-state.js";
import { getMetricLabel } from "./js.js";
export function createVisualizationContainer(options) {
  const {
    id,
    height = 500,
    withPadding = true,
    withBorder = true
  } = options;

  const container = document.createElement("div");
  container.className = "visualization-container";
  container.id = id;
  container.style.height = `${height}px`;
  
  if (!withPadding) {
    container.style.padding = "0";
  }
  
  if (!withBorder) {
    container.style.border = "none";
  }

  const style = document.createElement("style");
  style.textContent = `
    .visualization-container {
      width: 100%;
      position: relative;
      background: var(--bg-card);
      border: ${withBorder ? '1px solid var(--bg-card-border)' : 'none'};
      border-radius: 8px;
      padding: ${withPadding ? '1.5rem' : '0'};
      margin-bottom: 2rem;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);

  return container;
}

export function createLegend(options) {
  const {
    id,
    items = [],
    position = "bottom", // "bottom", "top", "right", "left"
  } = options;

  const legend = document.createElement("div");
  legend.className = `visualization-legend legend-${position}`;
  legend.id = id;

  // Create legend items
  items.forEach(item => {
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    
    const colorBox = document.createElement("div");
    colorBox.className = "legend-color";
    colorBox.style.backgroundColor = item.color;
    
    const label = document.createElement("span");
    label.className = "legend-label";
    label.textContent = item.label;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legend.appendChild(legendItem);
  });

  const style = document.createElement("style");
  style.textContent = `
    .visualization-legend {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }
    
    .legend-bottom, .legend-top {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      margin: ${position === "top" ? "0 0 1rem 0" : "1rem 0 0 0"};
    }
    
    .legend-left, .legend-right {
      flex-direction: column;
      position: absolute;
      top: 1rem;
      ${position === "left" ? "left: 1rem" : "right: 1rem"};
      background: rgba(38, 70, 83, 0.7);
      padding: 0.75rem;
      border-radius: 6px;
      z-index: 10;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    
    .legend-label {
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .legend-left, .legend-right {
        position: static;
        margin-top: 1rem;
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  `;
  document.head.appendChild(style);

  return legend;
}

export function createTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "visualization-tooltip";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  const style = document.createElement("style");
  style.textContent = `
    .visualization-tooltip {
      position: absolute;
      background: rgba(38, 70, 83, 0.9);
      color: white;
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      pointer-events: none;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      border: 1px solid ${dashboardColors.primary};
      transform: translate(-50%, -100%);
      margin-top: -8px;
    }
    
    .visualization-tooltip:after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      margin-left: -8px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid rgba(38, 70, 83, 0.9);
    }
  `;
  document.head.appendChild(style);

  return {
    element: tooltip,
    
        show: function({ x, y, content }) {
      if (typeof content === "string") {
        this.element.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.element.innerHTML = "";
        this.element.appendChild(content);
      }
      
      this.element.style.display = "block";
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    },
    
        hide: function() {
      this.element.style.display = "none";
    }
  };
}

export function createNoDataMessage(message = "No data available for the selected filters") {
  const container = document.createElement("div");
  container.className = "no-data-message";
  
  const icon = document.createElement("i");
  icon.className = "fas fa-info-circle";
  
  const text = document.createElement("p");
  text.textContent = message;
  
  container.appendChild(icon);
  container.appendChild(text);
  
  const style = document.createElement("style");
  style.textContent = `
    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }
    
    .no-data-message i {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }
    
    .no-data-message p {
      font-size: 1rem;
      max-width: 300px;
    }
  `;
  document.head.appendChild(style);
  
  return container;
}

export function createInsightsCard(options) {
  const {
    title,
    content,
    icon = "lightbulb"
  } = options;
  
  const card = document.createElement("div");
  card.className = "insights-card dashboard-card";
  
  const titleElement = document.createElement("div");
  titleElement.className = "dashboard-title";
  titleElement.innerHTML = `<i class="fas fa-${icon}"></i> ${title}`;
  
  const contentElement = document.createElement("div");
  contentElement.className = "insights-content";
  
  if (typeof content === "string") {
    contentElement.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    contentElement.appendChild(content);
  }
  
  card.appendChild(titleElement);
  card.appendChild(contentElement);
  
  const style = document.createElement("style");
  style.textContent = `
    .insights-card {
      margin-top: 2rem;
    }
    
    .insights-content {
      color: var(--text-light);
      font-size: 0.95rem;
      line-height: 1.6;
    }
    
    .insights-content p {
      margin: 0.7rem 0;
    }
    
    .insights-content strong {
      color: var(--primary-color);
    }
  `;
  document.head.appendChild(style);
  
  return card;
}

export function createMetricCard(options) {
  const {
    label,
    value,
    color = dashboardColors.secondary,
    icon
  } = options;
  
  const card = document.createElement("div");
  card.className = "metric-card";
  
  let iconHtml = '';
  if (icon) {
    iconHtml = `<i class="fas fa-${icon}"></i>`;
  }
  
  card.innerHTML = `
    <div class="metric-value" style="color: ${color}">
      ${iconHtml}
      <span>${value}</span>
    </div>
    <div class="metric-label">${label}</div>
  `;
  
  const style = document.createElement("style");
  style.textContent = `
    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--bg-card-border);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.2s ease-in-out;
    }
    
    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .metric-label {
      font-size: 1rem;
      color: var(--text-muted);
    }
  `;
  document.head.appendChild(style);
  
  return card;
}

export function createMetricRow(options) {
  const {
    label,
    value,
    max = 10,
    showBar = false,
    barColor = null
  } = options;
  
  const row = document.createElement("div");
  row.className = "metric-row";
  
  const labelElement = document.createElement("div");
  labelElement.className = "metric-row-label";
  labelElement.textContent = label;
  
  const valueElement = document.createElement("div");
  valueElement.className = "metric-row-value";
  
  if (showBar && max > 0) {
    // Calculate percentage
    const percentage = Math.min(100, (value / max) * 100);
    const color = barColor || dashboardColors.primary;
    
    valueElement.innerHTML = `
      <div class="metric-bar-container">
        <div class="metric-bar" style="width: ${percentage}%; background-color: ${color}">
          <span>${value}</span>
        </div>
      </div>
    `;
  } else {
    valueElement.textContent = value;
  }
  
  row.appendChild(labelElement);
  row.appendChild(valueElement);
  
  const style = document.createElement("style");
  style.textContent = `
    .metric-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--bg-card-border);
    }
    
    .metric-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .metric-row-label {
      flex: 1;
      font-size: 0.95rem;
      color: var(--text-light);
    }
    
    .metric-row-value {
      flex: 2;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-light);
    }
    
    .metric-bar-container {
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
    }
    
    .metric-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      color: white;
      font-size: 0.8rem;
      font-weight: bold;
      border-radius: 10px;
    }
  `;
  document.head.appendChild(style);
  
  return row;
}

export function createDataTable(options) {
  const {
    headers = [],
    rows = [],
    striped = true,
    columnWidths = []
  } = options;
  
  const table = document.createElement("table");
  table.className = `data-table ${striped ? 'striped' : ''}`;
  
  // Create header
  if (headers.length > 0) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    headers.forEach((header, index) => {
      const th = document.createElement("th");
      th.textContent = header;
      
      if (columnWidths[index]) {
        th.style.width = columnWidths[index];
      }
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
  }
  
  // Create body
  const tbody = document.createElement("tbody");
  
  rows.forEach(row => {
    const tr = document.createElement("tr");
    
    row.forEach(cell => {
      const td = document.createElement("td");
      
      if (cell !== null && typeof cell === 'object' && cell.html) {
        td.innerHTML = cell.html;
      } else if (cell !== null && typeof cell === 'object' && cell.element) {
        td.appendChild(cell.element);
      } else {
        td.textContent = cell;
      }
      
      if (cell !== null && typeof cell === 'object' && cell.className) {
        td.className = cell.className;
      }
      
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  
  const style = document.createElement("style");
  style.textContent = `
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
      color: var(--text-light);
    }
    
    .data-table th, .data-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--bg-card-border);
    }
    
    .data-table th {
      color: var(--primary-color);
      font-weight: 600;
      background: rgba(42, 157, 143, 0.05);
    }
    
    .data-table.striped tbody tr:nth-child(odd) {
      background: rgba(255, 255, 255, 0.03);
    }
    
    .data-table tbody tr:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `;
  document.head.appendChild(style);
  
  return table;
}