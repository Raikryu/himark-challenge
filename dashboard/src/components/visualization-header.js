import { dashboardColors } from "./dashboard-styles.js";
import dashboardState from "./dashboard-state.js";
export function createVisualizationHeader(options) {
  const {
    title,
    description = "",
    icon = "chart-bar",
    includeControls = false,
    containerId = ""
  } = options;

  // Create container
  const header = document.createElement("div");
  header.className = "visualization-header";
  if (containerId) {
    header.id = containerId;
  }

  // Create title section
  const titleElement = document.createElement("div");
  titleElement.className = "visualization-title";
  titleElement.innerHTML = `<i class="fas fa-${icon}"></i> ${title}`;
  header.appendChild(titleElement);

  // Add description if provided
  if (description) {
    const descriptionElement = document.createElement("div");
    descriptionElement.className = "visualization-description";
    descriptionElement.textContent = description;
    header.appendChild(descriptionElement);
  }

  // Add controls container if requested
  if (includeControls) {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "visualization-controls";
    controlsContainer.id = `${containerId ? containerId + "-" : ""}controls`;
    header.appendChild(controlsContainer);
  }

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .visualization-header {
      margin-bottom: 1.5rem;
    }
    
    .visualization-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: ${dashboardColors.primary};
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }
    
    .visualization-title i {
      color: ${dashboardColors.secondary};
    }
    
    .visualization-description {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 1rem;
      max-width: 800px;
      line-height: 1.5;
    }
    
    .visualization-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 1rem 0;
      align-items: center;
      padding: 1rem;
      background: var(--bg-card);
      border-radius: 8px;
      border: 1px solid var(--bg-card-border);
    }
    
    @media (max-width: 768px) {
      .visualization-controls {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `;
  document.head.appendChild(style);

  return header;
}

export function createFilterDropdown(options) {
  const {
    id,
    label,
    options = [],
    defaultValue = "",
    stateKey = ""
  } = options;

  const container = document.createElement("div");
  container.className = "filter-group";

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", id);
  labelElement.textContent = label;
  
  const select = document.createElement("select");
  select.id = id;
  select.className = "dashboard-select";

  // Add options
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });

  // Set default value
  select.value = defaultValue;

  // Add change event listener
  if (stateKey) {
    // Set initial state value
    if (defaultValue) {
      dashboardState.setState(stateKey, defaultValue);
    }

    // Update state when select changes
    select.addEventListener("change", () => {
      dashboardState.setState(stateKey, select.value);
    });
    
    // Update select when state changes
    dashboardState.subscribe(stateKey, value => {
      if (select.value !== value) {
        select.value = value || defaultValue;
      }
    });
  }

  container.appendChild(labelElement);
  container.appendChild(select);

  return container;
}

export function createLoadingIndicator() {
  const loader = document.createElement("div");
  loader.className = "visualization-loader";
  loader.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-text">Loading data...</div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .visualization-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-muted);
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(42, 157, 143, 0.2);
      border-top-color: ${dashboardColors.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    .loading-text {
      font-size: 0.9rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  return loader;
}

export function createErrorMessage(message) {
  const errorElement = document.createElement("div");
  errorElement.className = "visualization-error";
  errorElement.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <div class="error-message">${message}</div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .visualization-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: rgba(231, 111, 81, 0.1);
      border-radius: 8px;
      color: ${dashboardColors.secondary};
      text-align: center;
    }
    
    .visualization-error i {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .error-message {
      font-size: 1rem;
      max-width: 500px;
    }
  `;
  document.head.appendChild(style);

  return errorElement;
}