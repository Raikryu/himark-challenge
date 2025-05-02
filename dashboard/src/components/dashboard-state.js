// Dashboard State Management for Cross-Visualization Communication
// This module provides a shared state system for communication between visualizations

// Singleton state store
class DashboardState {
  constructor() {
    // Initialize state
    this._state = {
      // Selected filters that apply across visualizations
      filters: {
        location: null,    // Selected location/district
        timeRange: {       // Selected time range
          start: null,
          end: null
        },
        metric: null,      // Selected damage metric
        threshold: null,   // Damage threshold filter
      },
      
      // Track visualization-specific states that others might need to know about
      visualizationStates: {
        heatmap: {
          hoveredDistrict: null,
          selectedDistrict: null
        },
        radarChart: {
          selectedDistricts: [],
          hoveredMetric: null
        },
        animationGraph: {
          currentTime: null,
          playState: 'paused'
        }
      },
      
      // URL parameters for state persistence
      urlSync: {
        enabled: true,     // Whether to sync state with URL
        lastUpdated: null  // Timestamp of last URL update
      },
      
      // Custom events for complex interactions
      events: {}
    };
    
    // Track subscribers to state changes
    this._subscribers = {
      // Key: state path, Value: array of callback functions
      'filters.location': [],
      'filters.timeRange': [],
      'filters.metric': [],
      'filters.threshold': [],
      'visualizationStates.heatmap': [],
      'visualizationStates.radarChart': [],
      'visualizationStates.animationGraph': [],
      'urlSync': []
    };
    
    // Bind methods to ensure 'this' works correctly
    this.setState = this.setState.bind(this);
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.syncStateWithURL = this.syncStateWithURL.bind(this);
    this.updateURLFromState = this.updateURLFromState.bind(this);
    
    // Initialize URL syncing if enabled
    if (typeof window !== 'undefined' && this._state.urlSync.enabled) {
      // Load initial state from URL
      this.syncStateWithURL();
      
      // Set up listener for URL changes (e.g., browser back/forward)
      window.addEventListener('popstate', this.syncStateWithURL);
    }
  }
  
  /**
   * Get a value from the state
   * @param {string} path - Dot notation path to the state value
   * @returns {any} The state value at the path
   */
  getState(path) {
    if (!path) return this._state;
    
    const keys = path.split('.');
    let current = this._state;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }
  
  /**
   * Update a value in the state
   * @param {string} path - Dot notation path to the state value
   * @param {any} value - New value to set
   * @param {boolean} silent - If true, don't notify subscribers
   * @throws {Error} - If path is invalid or undefined
   */
  setState(path, value, silent = false) {
    // Input validation
    if (!path || typeof path !== 'string') {
      console.error('Invalid state path provided:', path);
      throw new Error('Invalid state path: Path must be a non-empty string');
    }
    
    try {
      const keys = path.split('.');
      let current = this._state;
      
      // Navigate to the nested property, creating objects as needed
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined) {
          current[key] = {};
        } else if (typeof current[key] !== 'object' || current[key] === null) {
          // If path segment exists but isn't an object, replace with an object
          current[key] = {};
        }
        current = current[key];
      }
      
      // Set the value
      const lastKey = keys[keys.length - 1];
      
      // Check if value has actually changed before updating and notifying
      const isEqual = JSON.stringify(current[lastKey]) === JSON.stringify(value);
      if (isEqual) {
        return; // Skip update if value is equivalent (reduces unnecessary renders)
      }
      
      current[lastKey] = value;
      
      // Notify subscribers
      if (!silent) {
        // Notify subscribers of the exact path
        this.notifySubscribers(path);
        
        // Also notify subscribers of parent paths
        for (let i = 1; i < keys.length; i++) {
          const parentPath = keys.slice(0, i).join('.');
          this.notifySubscribers(parentPath);
        }
        
        // If this is a filter change and URL sync is enabled, update the URL
        if (path.startsWith('filters.') && this._state.urlSync.enabled) {
          // Debounce URL updates to avoid too many history entries
          if (this._urlUpdateTimer) {
            clearTimeout(this._urlUpdateTimer);
          }
          
          this._urlUpdateTimer = setTimeout(() => {
            this.updateURLFromState();
            this._urlUpdateTimer = null;
          }, 300); // Wait for 300ms of inactivity before updating URL
        }
      }
    } catch (error) {
      console.error('Error updating state at path:', path, error);
      throw new Error(`Error updating state at path: ${path} - ${error.message}`);
    }
  }
  
  /**
   * Subscribe to changes in a specific part of the state
   * @param {string} path - Dot notation path to the state part to watch
   * @param {function} callback - Function to call when the state changes
   * @returns {function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this._subscribers[path]) {
      this._subscribers[path] = [];
    }
    
    this._subscribers[path].push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(path, callback);
  }
  
  /**
   * Unsubscribe from state changes
   * @param {string} path - Path that was subscribed to
   * @param {function} callback - Callback function that was subscribed
   */
  unsubscribe(path, callback) {
    if (!this._subscribers[path]) return;
    
    const index = this._subscribers[path].indexOf(callback);
    if (index !== -1) {
      this._subscribers[path].splice(index, 1);
    }
  }
  
  /**
   * Notify all subscribers of a state change
   * @param {string} path - Path that changed
   */
  notifySubscribers(path) {
    if (!this._subscribers[path]) return;
    
    // Debounce notifications to prevent excessive updates
    // If already scheduled for this path, clear previous timeout
    if (this._debounceTimers && this._debounceTimers[path]) {
      clearTimeout(this._debounceTimers[path]);
    }
    
    // Initialize debounce timers object if it doesn't exist
    if (!this._debounceTimers) {
      this._debounceTimers = {};
    }
    
    // Schedule notification with a small delay to batch rapid changes
    this._debounceTimers[path] = setTimeout(() => {
      try {
        const value = this.getState(path);
        
        // Call each subscriber with the new value
        this._subscribers[path].forEach(callback => {
          try {
            callback(value, path);
          } catch (error) {
            console.error(`Error in state subscriber for ${path}:`, error);
            // Continue with other subscribers even if one fails
          }
        });
        
        // Clean up timer reference
        delete this._debounceTimers[path];
      } catch (error) {
        console.error(`Failed to notify subscribers for path ${path}:`, error);
      }
    }, 5); // 5ms debounce time - short enough to feel immediate but allows batching
  }
  
  /**
   * Reset all filters to their default values
   */
  resetFilters() {
    this.setState('filters', {
      location: null,
      timeRange: {
        start: null,
        end: null
      },
      metric: null,
      threshold: null
    });
    
    // Update URL to match reset state
    if (this._state.urlSync.enabled) {
      this.updateURLFromState();
    }
  }
  
  /**
   * Synchronize state with URL parameters
   * Loads state from the current URL
   */
  syncStateWithURL() {
    try {
      if (typeof window === 'undefined') return;
      
      const params = new URLSearchParams(window.location.search);
      const updatedState = { filters: { ...this._state.filters } };
      let stateChanged = false;
      
      // Process location
      if (params.has('location')) {
        updatedState.filters.location = params.get('location');
        stateChanged = true;
      }
      
      // Process metric
      if (params.has('metric')) {
        updatedState.filters.metric = params.get('metric');
        stateChanged = true;
      }
      
      // Process threshold
      if (params.has('threshold')) {
        const threshold = parseFloat(params.get('threshold'));
        if (!isNaN(threshold)) {
          updatedState.filters.threshold = threshold;
          stateChanged = true;
        }
      }
      
      // Process time range
      if (params.has('timeStart') && params.has('timeEnd')) {
        const start = new Date(params.get('timeStart'));
        const end = new Date(params.get('timeEnd'));
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          updatedState.filters.timeRange = { start, end };
          stateChanged = true;
        }
      }
      
      // Apply state updates silently to avoid circular updates
      if (stateChanged) {
        this.setState('filters', updatedState.filters, true); // Silent update
        this.notifySubscribers('filters'); // Manual notification after all changes
      }
      
    } catch (error) {
      console.error('Error synchronizing state with URL:', error);
    }
  }
  
  /**
   * Update URL parameters to reflect current state
   * This enables shareable URLs and browser history
   */
  updateURLFromState() {
    try {
      if (typeof window === 'undefined') return;
      
      const filters = this._state.filters;
      const params = new URLSearchParams();
      
      // Only add parameters for non-null values
      if (filters.location) {
        params.set('location', filters.location);
      }
      
      if (filters.metric) {
        params.set('metric', filters.metric);
      }
      
      if (filters.threshold !== null) {
        params.set('threshold', filters.threshold.toString());
      }
      
      if (filters.timeRange.start && filters.timeRange.end) {
        params.set('timeStart', filters.timeRange.start.toISOString());
        params.set('timeEnd', filters.timeRange.end.toISOString());
      }
      
      // Update URL without reloading the page
      const newURL = params.toString() ? 
        `${window.location.pathname}?${params.toString()}` : 
        window.location.pathname;
      
      window.history.pushState({ dashboardState: true }, '', newURL);
      
      // Update last sync time
      this.setState('urlSync.lastUpdated', new Date().getTime(), true);
      
    } catch (error) {
      console.error('Error updating URL from state:', error);
    }
  }
  
  /**
   * Dispatch a custom event to all subscribers
   * @param {string} eventName - Name of the event
   * @param {any} payload - Event data
   */
  dispatchEvent(eventName, payload) {
    if (!this._state.events[eventName]) {
      this._state.events[eventName] = [];
    }
    
    this._state.events[eventName].forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }
  
  /**
   * Subscribe to a custom event
   * @param {string} eventName - Name of the event to listen for
   * @param {function} callback - Function to call when the event occurs
   * @returns {function} Unsubscribe function
   */
  addEventListener(eventName, callback) {
    if (!this._state.events[eventName]) {
      this._state.events[eventName] = [];
    }
    
    this._state.events[eventName].push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this._state.events[eventName].indexOf(callback);
      if (index !== -1) {
        this._state.events[eventName].splice(index, 1);
      }
    };
  }
}

// Create a singleton instance
const dashboardState = new DashboardState();

// Export the singleton
export default dashboardState;

// Helper components for Observable integration

/**
 * Creates a global filter panel to use across dashboards
 * @returns {HTMLElement} The filter panel DOM element
 */
export function createGlobalFilterPanel() {
  // Create the container
  const filterPanel = document.createElement('div');
  filterPanel.className = 'global-filter-panel';
  
  // Add filter controls
  filterPanel.innerHTML = `
    <div class="filter-section">
      <button id="reset-filters-btn" class="dashboard-button">
        <i class="fas fa-sync-alt"></i> Reset Filters
      </button>
      <div class="filter-status" id="active-filters">No active filters</div>
    </div>
    
    <div class="filter-section locations-filter">
      <label>District Filter:</label>
      <select id="location-filter" class="dashboard-select">
        <option value="">All Districts</option>
        <!-- Will be populated by JavaScript -->
      </select>
    </div>
    
    <div class="filter-section metric-filter">
      <label>Damage Metric:</label>
      <select id="metric-filter" class="dashboard-select">
        <option value="">All Metrics</option>
        <option value="combined_damage">Combined Damage</option>
        <option value="sewer_and_water">Sewer & Water</option>
        <option value="power">Power</option>
        <option value="roads_and_bridges">Roads & Bridges</option>
        <option value="medical">Medical</option>
        <option value="buildings">Buildings</option>
        <option value="shake_intensity">Shake Intensity</option>
      </select>
    </div>
    
    <div class="filter-section damage-threshold">
      <label>Damage Threshold: <span id="threshold-value">None</span></label>
      <input type="range" id="threshold-filter" min="0" max="10" step="0.5" value="0" class="dashboard-range">
    </div>
  `;
  
  // Add event listeners after the panel is added to the DOM
  setTimeout(() => {
    // Get filter elements
    const locationFilter = document.getElementById('location-filter');
    const metricFilter = document.getElementById('metric-filter');
    const thresholdFilter = document.getElementById('threshold-filter');
    const thresholdValue = document.getElementById('threshold-value');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const activeFilters = document.getElementById('active-filters');
    
    // Populate location options from available data
    populateLocationOptions(locationFilter);
    
    // Add event listeners
    locationFilter.addEventListener('change', () => {
      dashboardState.setState('filters.location', locationFilter.value || null);
      updateActiveFiltersDisplay();
    });
    
    metricFilter.addEventListener('change', () => {
      dashboardState.setState('filters.metric', metricFilter.value || null);
      updateActiveFiltersDisplay();
    });
    
    thresholdFilter.addEventListener('input', () => {
      const value = parseFloat(thresholdFilter.value);
      thresholdValue.textContent = value > 0 ? value.toString() : 'None';
      dashboardState.setState('filters.threshold', value > 0 ? value : null);
      updateActiveFiltersDisplay();
    });
    
    resetFiltersBtn.addEventListener('click', () => {
      // Reset UI elements
      locationFilter.value = '';
      metricFilter.value = '';
      thresholdFilter.value = 0;
      thresholdValue.textContent = 'None';
      
      // Reset state
      dashboardState.resetFilters();
      updateActiveFiltersDisplay();
    });
    
    // Function to update the active filters display
    function updateActiveFiltersDisplay() {
      const filters = dashboardState.getState('filters');
      const activeFiltersList = [];
      
      if (filters.location) {
        activeFiltersList.push(`District: ${filters.location}`);
      }
      
      if (filters.metric) {
        const metricName = metricFilter.options[metricFilter.selectedIndex].text;
        activeFiltersList.push(`Metric: ${metricName}`);
      }
      
      if (filters.threshold) {
        activeFiltersList.push(`Min Damage: ${filters.threshold}`);
      }
      
      if (activeFiltersList.length > 0) {
        activeFilters.innerHTML = `<strong>Active Filters:</strong> ${activeFiltersList.join(' | ')}`;
      } else {
        activeFilters.textContent = 'No active filters';
      }
    }
    
    // Initial update
    updateActiveFiltersDisplay();
    
  }, 0);
  
  return filterPanel;
}

/**
 * Helper to populate location options in a select element
 * @param {HTMLSelectElement} selectElement - The select element to populate
 */
async function populateLocationOptions(selectElement) {
  try {
    // Try to load data from any available data source
    let locationData = [];
    
    try {
      // Try to use the radar chart data first
      const radarData = await FileAttachment("radar_chart_data.json").json();
      locationData = radarData.map(d => d.location);
    } catch (e) {
      try {
        // Fall back to CSV report data
        const csvText = await FileAttachment("data/cleaned_mc1-reports-data.csv").text();
        const data = d3.csvParse(csvText);
        locationData = [...new Set(data.map(d => d.location))];
      } catch (err) {
        console.error("Could not load locations from any data source");
      }
    }
    
    // Add options to select
    if (locationData && locationData.length > 0) {
      locationData.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        selectElement.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error populating location options:", error);
  }
}

/**
 * Create an info box to display highlights across visualizations
 * @returns {HTMLElement} The highlights box DOM element
 */
export function createHighlightsBox() {
  const highlightsBox = document.createElement('div');
  highlightsBox.className = 'dashboard-highlights-box';
  highlightsBox.id = 'dashboard-highlights';
  
  highlightsBox.innerHTML = `
    <div class="highlights-header">
      <i class="fas fa-star"></i> Dashboard Highlights
    </div>
    <div class="highlights-content">
      <p>Hover over or select elements in any visualization to see details here.</p>
    </div>
  `;
  
  // Set up event listeners
  dashboardState.subscribe('visualizationStates', updateHighlights);
  
  function updateHighlights() {
    const content = highlightsBox.querySelector('.highlights-content');
    const states = dashboardState.getState('visualizationStates');
    
    // Check for any active information to display
    if (states.heatmap.hoveredDistrict || states.heatmap.selectedDistrict) {
      const district = states.heatmap.hoveredDistrict || states.heatmap.selectedDistrict;
      content.innerHTML = `
        <div class="highlight-item">
          <strong>District: ${district}</strong>
          <p>View this district in other visualizations for more insights.</p>
        </div>
      `;
    } else if (states.radarChart.hoveredMetric) {
      content.innerHTML = `
        <div class="highlight-item">
          <strong>Metric: ${states.radarChart.hoveredMetric}</strong>
          <p>This damage metric is shown across all districts in the heatmap.</p>
        </div>
      `;
    } else if (states.animationGraph.currentTime) {
      content.innerHTML = `
        <div class="highlight-item">
          <strong>Time: ${states.animationGraph.currentTime}</strong>
          <p>Damage data from this time point is displayed in other visualizations.</p>
        </div>
      `;
    } else {
      content.innerHTML = `
        <p>Hover over or select elements in any visualization to see details here.</p>
      `;
    }
  }
  
  return highlightsBox;
}

/**
 * Helper function to apply global filters to a dataset
 * @param {Array} data - The dataset to filter
 * @param {Object} options - Options for filtering
 * @returns {Array} The filtered dataset
 */
export function applyGlobalFilters(data, options = {}) {
  // Input validation
  if (!Array.isArray(data)) {
    console.warn("applyGlobalFilters expected array, got:", typeof data);
    return [];
  }
  
  // Create a defensive copy of options to avoid side effects
  const safeOptions = { ...options };
  
  // Get filters from state
  const filters = dashboardState.getState('filters');
  
  // Set defaults for filter options
  const { 
    locationKey = 'location',
    metricKeys = {
      'combined_damage': ['combined_damage'],
      'sewer_and_water': ['sewer_and_water'],
      'power': ['power'],
      'roads_and_bridges': ['roads_and_bridges'],
      'medical': ['medical'],
      'buildings': ['buildings'],
      'shake_intensity': ['shake_intensity']
    },
    timeKey = 'time'
  } = safeOptions;
  
  // Cache the metricKeys for the current filter.metric if applicable
  // for improved performance when filtering large datasets
  let currentMetricKeys = null;
  if (filters.metric && metricKeys[filters.metric]) {
    currentMetricKeys = Array.isArray(metricKeys[filters.metric]) 
      ? metricKeys[filters.metric] 
      : [metricKeys[filters.metric]];
  }
  
  // Use memoization to cache combined damage calculations
  const damageCache = new Map();
  
  try {
    return data.filter(item => {
      if (!item) return false;
      
      // Apply location filter
      if (filters.location && item[locationKey] !== filters.location) {
        return false;
      }
      
      // Apply time range filter if applicable
      if (filters.timeRange.start && filters.timeRange.end && item[timeKey]) {
        try {
          const itemTime = new Date(item[timeKey]);
          if (isNaN(itemTime.getTime())) {
            console.warn(`Invalid time value: ${item[timeKey]}`);
            return false;
          }
          if (itemTime < filters.timeRange.start || itemTime > filters.timeRange.end) {
            return false;
          }
        } catch (error) {
          console.error("Error processing time filter:", error);
          return false;
        }
      }
      
      // Apply damage threshold filter
      if (filters.threshold !== null && filters.threshold > 0) {
        // If a specific metric is selected, filter by that metric
        if (filters.metric && currentMetricKeys) {
          // Check if any of the metric keys meet the threshold
          const meetsThreshold = currentMetricKeys.some(key => 
            item[key] !== undefined && !isNaN(item[key]) && item[key] >= filters.threshold
          );
          
          if (!meetsThreshold) return false;
        } 
        // Otherwise apply to all metrics (combined damage)
        else {
          // Use cached combined damage if available
          let combinedDamage;
          
          // Create a cache key based on the item's metric values
          const cacheKey = [
            item.sewer_and_water,
            item.power,
            item.roads_and_bridges,
            item.medical,
            item.buildings
          ].join('|');
          
          if (damageCache.has(cacheKey)) {
            combinedDamage = damageCache.get(cacheKey);
          } else {
            // Calculate combined damage if not already present
            if (item.combined_damage !== undefined) {
              combinedDamage = item.combined_damage;
            } else if (
              item.sewer_and_water !== undefined &&
              item.power !== undefined &&
              item.roads_and_bridges !== undefined &&
              item.medical !== undefined &&
              item.buildings !== undefined &&
              !isNaN(item.sewer_and_water) &&
              !isNaN(item.power) &&
              !isNaN(item.roads_and_bridges) &&
              !isNaN(item.medical) &&
              !isNaN(item.buildings)
            ) {
              combinedDamage = (
                item.sewer_and_water +
                item.power +
                item.roads_and_bridges +
                item.medical +
                item.buildings
              ) / 5;
              
              // Cache the result
              damageCache.set(cacheKey, combinedDamage);
            }
          }
          
          if (combinedDamage !== undefined && combinedDamage < filters.threshold) {
            return false;
          }
        }
      }
      
      return true;
    });
  } catch (error) {
    console.error("Error applying filters to dataset:", error);
    return []; // Return empty array in case of error
  }
}