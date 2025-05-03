/**
 * Reusable timeline component for visualizations
 * This component handles time series data visualization
 * with animation and playback controls.
 */

import { dashboardColors } from "./dashboard-styles.js";
import dashboardState from "./dashboard-state.js";
import { formatDate } from "./js.js";

/**
 * Creates a timeline component with animation controls
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID for the container element
 * @param {Array} options.timestamps - Array of Date objects for the timeline
 * @param {Function} options.onTimeChange - Callback when time changes
 * @param {string} options.stateKey - State key for storing current time
 * @param {string} options.playStateKey - State key for storing play state
 * @param {number} options.frameRate - Animation frame rate in ms (default: 1000)
 * @returns {Object} Timeline control object
 */
export function createTimeline(options) {
  const {
    containerId,
    timestamps = [],
    onTimeChange = () => {},
    stateKey = "visualizationStates.timeline.currentTime",
    playStateKey = "visualizationStates.timeline.playState",
    frameRate = 1000
  } = options;
  
  if (!timestamps || timestamps.length === 0) {
    console.error("Timeline component requires timestamps array");
    return null;
  }
  
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  container.className = "timeline-container";
  
  // Create timeline HTML
  container.innerHTML = `
    <div class="timeline-controls">
      <button id="${containerId}-play-btn" class="dashboard-button timeline-btn">
        <i class="fas fa-play"></i>
      </button>
      <button id="${containerId}-pause-btn" class="dashboard-button timeline-btn">
        <i class="fas fa-pause"></i>
      </button>
      <div class="timeline-slider-container">
        <input type="range" id="${containerId}-slider" min="0" max="${timestamps.length - 1}" value="0" class="timeline-slider">
      </div>
      <div id="${containerId}-time-display" class="timeline-time-display">-</div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .timeline-container {
      margin-bottom: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--bg-card-border);
      border-radius: 8px;
      padding: 1rem;
    }
    
    .timeline-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .timeline-btn {
      background-color: var(--primary-color);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
    }
    
    .timeline-btn:hover {
      background-color: var(--accent-color);
    }
    
    .timeline-slider-container {
      flex: 1;
      display: flex;
      align-items: center;
    }
    
    .timeline-slider {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      outline: none;
      opacity: 0.8;
      transition: opacity .2s;
    }
    
    .timeline-slider:hover {
      opacity: 1;
    }
    
    .timeline-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${dashboardColors.secondary};
      cursor: pointer;
    }
    
    .timeline-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${dashboardColors.secondary};
      cursor: pointer;
      border: none;
    }
    
    .timeline-time-display {
      min-width: 140px;
      text-align: right;
      font-size: 0.875rem;
      color: var(--text-light);
      font-family: monospace;
    }
    
    @media (max-width: 768px) {
      .timeline-controls {
        flex-wrap: wrap;
      }
      
      .timeline-slider-container {
        order: 3;
        width: 100%;
        margin-top: 0.5rem;
      }
      
      .timeline-time-display {
        font-size: 0.75rem;
        min-width: 100px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Get DOM elements
  const playBtn = document.getElementById(`${containerId}-play-btn`);
  const pauseBtn = document.getElementById(`${containerId}-pause-btn`);
  const slider = document.getElementById(`${containerId}-slider`);
  const timeDisplay = document.getElementById(`${containerId}-time-display`);
  
  // State
  let currentIndex = 0;
  let animationInterval = null;
  let isPlaying = false;
  
  // Format and update the time display
  function updateTimeDisplay(timestamp) {
    const formattedDate = formatDate(timestamp, 'long');
    timeDisplay.textContent = formattedDate;
    
    // Update state
    dashboardState.setState(stateKey, formattedDate);
    
    // Call the onTimeChange callback
    if (typeof onTimeChange === 'function') {
      onTimeChange(timestamp, currentIndex);
    }
  }
  
  // Update the visualization based on the current timestamp
  function updateTime(index) {
    currentIndex = index;
    slider.value = index;
    updateTimeDisplay(timestamps[index]);
  }
  
  // Start the animation
  function play() {
    if (animationInterval) {
      clearInterval(animationInterval);
    }
    
    isPlaying = true;
    dashboardState.setState(playStateKey, 'playing');
    
    animationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % timestamps.length;
      updateTime(currentIndex);
    }, frameRate);
  }
  
  // Pause the animation
  function pause() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    isPlaying = false;
    dashboardState.setState(playStateKey, 'paused');
  }
  
  // Set event listeners
  playBtn.addEventListener('click', play);
  pauseBtn.addEventListener('click', pause);
  
  slider.addEventListener('input', () => {
    const index = parseInt(slider.value);
    currentIndex = index;
    updateTimeDisplay(timestamps[index]);
  });
  
  // Initial update
  updateTime(0);
  
  // Return control object
  return {
    // Jump to a specific timestamp
    setTime: (timestamp) => {
      const index = timestamps.findIndex(t => t.getTime() === timestamp.getTime());
      if (index !== -1) {
        updateTime(index);
      }
    },
    
    // Jump to a specific index
    setIndex: (index) => {
      if (index >= 0 && index < timestamps.length) {
        updateTime(index);
      }
    },
    
    // Start the animation
    play: () => play(),
    
    // Pause the animation
    pause: () => pause(),
    
    // Toggle between playing and paused states
    toggle: () => {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    },
    
    // Get the current timestamp
    getCurrentTime: () => timestamps[currentIndex],
    
    // Get the current index
    getCurrentIndex: () => currentIndex,
    
    // Check if animation is playing
    isPlaying: () => isPlaying,
    
    // Cleanup resources
    destroy: () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
      
      // Remove event listeners
      playBtn.removeEventListener('click', play);
      pauseBtn.removeEventListener('click', pause);
      slider.removeEventListener('input', () => {});
    }
  };
}

/**
 * Creates a simple time slider (without play/pause controls)
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID for the container element
 * @param {Array} options.timestamps - Array of Date objects for the timeline
 * @param {Function} options.onTimeChange - Callback when time changes
 * @param {string} options.displayFormat - Time display format ('short', 'medium', 'long')
 * @returns {Object} Time slider control object
 */
export function createTimeSlider(options) {
  const {
    containerId,
    timestamps = [],
    onTimeChange = () => {},
    displayFormat = 'medium'
  } = options;
  
  if (!timestamps || timestamps.length === 0) {
    console.error("Time slider component requires timestamps array");
    return null;
  }
  
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  container.className = "time-slider-container";
  
  // Create time slider HTML
  container.innerHTML = `
    <div class="time-slider-wrapper">
      <span id="${containerId}-time-label" class="time-slider-label">Time:</span>
      <input type="range" id="${containerId}-slider" 
             min="0" max="${timestamps.length - 1}" 
             value="0" class="timeline-slider">
      <span id="${containerId}-time-display" class="time-slider-display">-</span>
    </div>
  `;
  
  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .time-slider-container {
      margin-bottom: 1rem;
    }
    
    .time-slider-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .time-slider-label {
      font-size: 0.875rem;
      color: var(--text-light);
      white-space: nowrap;
    }
    
    .time-slider-display {
      font-size: 0.875rem;
      color: var(--text-light);
      min-width: 100px;
      text-align: right;
    }
    
    .timeline-slider {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      outline: none;
    }
    
    .timeline-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${dashboardColors.primary};
      cursor: pointer;
    }
    
    .timeline-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${dashboardColors.primary};
      cursor: pointer;
      border: none;
    }
  `;
  document.head.appendChild(style);
  
  // Get DOM elements
  const slider = document.getElementById(`${containerId}-slider`);
  const timeDisplay = document.getElementById(`${containerId}-time-display`);
  
  // State
  let currentIndex = 0;
  
  // Format and update the time display
  function updateTimeDisplay(timestamp) {
    timeDisplay.textContent = formatDate(timestamp, displayFormat);
    
    // Call the onTimeChange callback
    if (typeof onTimeChange === 'function') {
      onTimeChange(timestamp, currentIndex);
    }
  }
  
  // Update based on the current timestamp
  function updateTime(index) {
    currentIndex = index;
    slider.value = index;
    updateTimeDisplay(timestamps[index]);
  }
  
  // Set event listeners
  slider.addEventListener('input', () => {
    const index = parseInt(slider.value);
    updateTime(index);
  });
  
  // Initial update
  updateTime(0);
  
  // Return control object
  return {
    setTime: (timestamp) => {
      const index = timestamps.findIndex(t => t.getTime() === timestamp.getTime());
      if (index !== -1) {
        updateTime(index);
      }
    },
    
    setIndex: (index) => {
      if (index >= 0 && index < timestamps.length) {
        updateTime(index);
      }
    },
    
    getCurrentTime: () => timestamps[currentIndex],
    getCurrentIndex: () => currentIndex,
    
    destroy: () => {
      slider.removeEventListener('input', () => {});
    }
  };
}

/**
 * Creates time range selector with start and end date
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID for the container element
 * @param {Date} options.minDate - Minimum date allowed
 * @param {Date} options.maxDate - Maximum date allowed
 * @param {Date} options.startDate - Initial start date
 * @param {Date} options.endDate - Initial end date
 * @param {Function} options.onChange - Callback when range changes
 * @param {string} options.stateKey - State key for storing date range
 * @returns {Object} Time range control object
 */
export function createTimeRange(options) {
  const {
    containerId,
    minDate = new Date('2020-04-06'),
    maxDate = new Date('2020-04-10'),
    startDate = minDate,
    endDate = maxDate,
    onChange = () => {},
    stateKey = "filters.timeRange"
  } = options;
  
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  container.className = "time-range-container";
  
  // Create time range HTML
  container.innerHTML = `
    <div class="time-range-header">
      <label class="time-range-label">Date Range Filter</label>
      <button id="${containerId}-reset" class="time-range-reset">Reset</button>
    </div>
    <div class="time-range-controls">
      <div class="date-input-group">
        <label for="${containerId}-start">From:</label>
        <input type="date" id="${containerId}-start" class="date-input" 
               min="${minDate.toISOString().split('T')[0]}" 
               max="${maxDate.toISOString().split('T')[0]}" 
               value="${startDate.toISOString().split('T')[0]}">
      </div>
      <div class="date-input-group">
        <label for="${containerId}-end">To:</label>
        <input type="date" id="${containerId}-end" class="date-input" 
               min="${minDate.toISOString().split('T')[0]}" 
               max="${maxDate.toISOString().split('T')[0]}" 
               value="${endDate.toISOString().split('T')[0]}">
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .time-range-container {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--bg-card-border);
      border-radius: 8px;
    }
    
    .time-range-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .time-range-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-light);
    }
    
    .time-range-reset {
      background: none;
      border: none;
      color: ${dashboardColors.primary};
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: underline;
    }
    
    .time-range-controls {
      display: flex;
      gap: 1rem;
    }
    
    .date-input-group {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .date-input-group label {
      font-size: 0.875rem;
      color: var(--text-light);
      white-space: nowrap;
    }
    
    .date-input {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--bg-card-border);
      border-radius: 4px;
      padding: 0.5rem;
      color: var(--text-light);
      font-size: 0.875rem;
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .time-range-controls {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Get DOM elements
  const startInput = document.getElementById(`${containerId}-start`);
  const endInput = document.getElementById(`${containerId}-end`);
  const resetBtn = document.getElementById(`${containerId}-reset`);
  
  // Update the date range and notify listeners
  function updateRange() {
    const start = new Date(startInput.value);
    const end = new Date(endInput.value);
    
    // Ensure end date is not before start date
    if (end < start) {
      endInput.value = startInput.value;
      end.setTime(start.getTime());
    }
    
    // Set both to midnight for consistent comparison
    start.setHours(0, 0, 0, 0);
    // End date should be end of day
    end.setHours(23, 59, 59, 999);
    
    // Update state
    dashboardState.setState(stateKey, { start, end });
    
    // Call the onChange callback
    if (typeof onChange === 'function') {
      onChange({ start, end });
    }
  }
  
  // Reset to full range
  function reset() {
    startInput.value = minDate.toISOString().split('T')[0];
    endInput.value = maxDate.toISOString().split('T')[0];
    updateRange();
  }
  
  // Set event listeners
  startInput.addEventListener('change', updateRange);
  endInput.addEventListener('change', updateRange);
  resetBtn.addEventListener('click', reset);
  
  // Initial update
  updateRange();
  
  // Return control object
  return {
    getRange: () => {
      const start = new Date(startInput.value);
      const end = new Date(endInput.value);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
    
    setRange: (start, end) => {
      startInput.value = start.toISOString().split('T')[0];
      endInput.value = end.toISOString().split('T')[0];
      updateRange();
    },
    
    reset: () => reset(),
    
    destroy: () => {
      startInput.removeEventListener('change', updateRange);
      endInput.removeEventListener('change', updateRange);
      resetBtn.removeEventListener('click', reset);
    }
  };
}