class DashboardState {
  constructor() {
    this._state = {
      filters: {
        location: null,
        timeRange: {
          start: null,
          end: null
        },
        metric: null,
        threshold: null,
      },
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
      urlSync: {
        enabled: true,
        lastUpdated: null
      },
      events: {}
    };
    
    this._subscribers = {
      'filters.location': [],
      'filters.timeRange': [],
      'filters.metric': [],
      'filters.threshold': [],
      'visualizationStates.heatmap': [],
      'visualizationStates.radarChart': [],
      'visualizationStates.animationGraph': [],
      'urlSync': []
    };
    
    this.setState = this.setState.bind(this);
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.syncStateWithURL = this.syncStateWithURL.bind(this);
    this.updateURLFromState = this.updateURLFromState.bind(this);
    
    if (typeof window !== 'undefined' && this._state.urlSync.enabled) {
      this.syncStateWithURL();
      window.addEventListener('popstate', this.syncStateWithURL);
    }
  }
  
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
  
  setState(path, value, silent = false) {
    if (!path || typeof path !== 'string') {
      console.error('Invalid state path provided:', path);
      throw new Error('Invalid state path: Path must be a non-empty string');
    }
    try {
      const keys = path.split('.');
      let current = this._state;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined) {
          current[key] = {};
        } else if (typeof current[key] !== 'object' || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      const isEqual = JSON.stringify(current[lastKey]) === JSON.stringify(value);
      if (isEqual) {
        return;
      }
      current[lastKey] = value;
      if (!silent) {
        this.notifySubscribers(path);
        for (let i = 1; i < keys.length; i++) {
          const parentPath = keys.slice(0, i).join('.');
          this.notifySubscribers(parentPath);
        }
        if (path.startsWith('filters.') && this._state.urlSync.enabled) {
          if (this._urlUpdateTimer) {
            clearTimeout(this._urlUpdateTimer);
          }
          this._urlUpdateTimer = setTimeout(() => {
            this.updateURLFromState();
            this._urlUpdateTimer = null;
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error updating state at path:', path, error);
      throw new Error(`Error updating state at path: ${path} - ${error.message}`);
    }
  }
  
  subscribe(path, callback) {
    if (!this._subscribers[path]) {
      this._subscribers[path] = [];
    }
    this._subscribers[path].push(callback);
    return () => this.unsubscribe(path, callback);
  }
  
  unsubscribe(path, callback) {
    if (!this._subscribers[path]) return;
    const index = this._subscribers[path].indexOf(callback);
    if (index !== -1) {
      this._subscribers[path].splice(index, 1);
    }
  }
  notifySubscribers(path) {
    if (!this._subscribers[path]) return;
    
    if (this._debounceTimers && this._debounceTimers[path]) {
      clearTimeout(this._debounceTimers[path]);
    }
    
    if (!this._debounceTimers) {
      this._debounceTimers = {};
    }
    
    this._debounceTimers[path] = setTimeout(() => {
      try {
        const value = this.getState(path);
        this._subscribers[path].forEach(callback => {
          try {
            callback(value, path);
          } catch (error) {
            console.error(`Error in state subscriber for ${path}:`, error);
          }
        });
        delete this._debounceTimers[path];
      } catch (error) {
        console.error(`Failed to notify subscribers for path ${path}:`, error);
      }
    }, 5);
  }
  
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
    if (this._state.urlSync.enabled) {
      this.updateURLFromState();
    }
  }
  
  syncStateWithURL() {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const updatedState = { filters: { ...this._state.filters } };
      let stateChanged = false;
      
      if (params.has('location')) {
        updatedState.filters.location = params.get('location');
        stateChanged = true;
      }
      if (params.has('metric')) {
        updatedState.filters.metric = params.get('metric');
        stateChanged = true;
      }
      if (params.has('threshold')) {
        const threshold = parseFloat(params.get('threshold'));
        if (!isNaN(threshold)) {
          updatedState.filters.threshold = threshold;
          stateChanged = true;
        }
      }
      if (params.has('timeStart') && params.has('timeEnd')) {
        const start = new Date(params.get('timeStart'));
        const end = new Date(params.get('timeEnd'));
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          updatedState.filters.timeRange = { start, end };
          stateChanged = true;
        }
      }
      if (stateChanged) {
        this.setState('filters', updatedState.filters, true);
        this.notifySubscribers('filters');
      }
    } catch (error) {
      console.error('Error synchronizing state with URL:', error);
    }
  }
  
  updateURLFromState() {
    try {
      if (typeof window === 'undefined') return;
      const filters = this._state.filters;
      const params = new URLSearchParams();
      
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
      
      const newURL = params.toString() ? 
        `${window.location.pathname}?${params.toString()}` : 
        window.location.pathname;
      
      window.history.pushState({ dashboardState: true }, '', newURL);
      this.setState('urlSync.lastUpdated', new Date().getTime(), true);
    } catch (error) {
      console.error('Error updating URL from state:', error);
    }
  }
  
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
  
  addEventListener(eventName, callback) {
    if (!this._state.events[eventName]) {
      this._state.events[eventName] = [];
    }
    this._state.events[eventName].push(callback);
    return () => {
      const index = this._state.events[eventName].indexOf(callback);
      if (index !== -1) {
        this._state.events[eventName].splice(index, 1);
      }
    };
  }
}

const dashboardState = new DashboardState();

export default dashboardState;
export function createGlobalFilterPanel() {
  const filterPanel = document.createElement('div');
  filterPanel.className = 'global-filter-panel';
  
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
  
  setTimeout(() => {
    const locationFilter = document.getElementById('location-filter');
    const metricFilter = document.getElementById('metric-filter');
    const thresholdFilter = document.getElementById('threshold-filter');
    const thresholdValue = document.getElementById('threshold-value');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const activeFilters = document.getElementById('active-filters');
    
    populateLocationOptions(locationFilter);
    
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
      locationFilter.value = '';
      metricFilter.value = '';
      thresholdFilter.value = 0;
      thresholdValue.textContent = 'None';
      dashboardState.resetFilters();
      updateActiveFiltersDisplay();
    });
    
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
    
    updateActiveFiltersDisplay();
  }, 0);
  
  return filterPanel;
}

async function populateLocationOptions(selectElement) {
  try {
    let locationData = [];
    try {
      const radarData = await FileAttachment("radar_chart_data.json").json();
      locationData = radarData.map(d => d.location);
    } catch (e) {
      try {
        const csvText = await FileAttachment("data/cleaned_mc1-reports-data.csv").text();
        const data = d3.csvParse(csvText);
        locationData = [...new Set(data.map(d => d.location))];
      } catch (err) {
        console.error("Could not load locations from any data source");
      }
    }
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
  
  dashboardState.subscribe('visualizationStates', updateHighlights);
  
  function updateHighlights() {
    const content = highlightsBox.querySelector('.highlights-content');
    const states = dashboardState.getState('visualizationStates');
    
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

export function applyGlobalFilters(data, options = {}) {
  if (!Array.isArray(data)) {
    console.warn("applyGlobalFilters expected array, got:", typeof data);
    return [];
  }
  
  const safeOptions = { ...options };
  const filters = dashboardState.getState('filters');
  
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
  
  let currentMetricKeys = null;
  if (filters.metric && metricKeys[filters.metric]) {
    currentMetricKeys = Array.isArray(metricKeys[filters.metric]) 
      ? metricKeys[filters.metric] 
      : [metricKeys[filters.metric]];
  }
  
  const damageCache = new Map();
  
  try {
    return data.filter(item => {
      if (!item) return false;
      
      if (filters.location && item[locationKey] !== filters.location) {
        return false;
      }
      
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
      
      if (filters.threshold !== null && filters.threshold > 0) {
        if (filters.metric && currentMetricKeys) {
          const meetsThreshold = currentMetricKeys.some(key => 
            item[key] !== undefined && !isNaN(item[key]) && item[key] >= filters.threshold
          );
          if (!meetsThreshold) return false;
        } 
        else {
          let combinedDamage;
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
    return [];
  }
}