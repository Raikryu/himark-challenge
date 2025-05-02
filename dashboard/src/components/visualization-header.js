// Common Visualization Header Component for Consistency
// This provides standardized headers, descriptions, and metadata for all visualizations

/**
 * Creates a standard header for visualizations
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.title - Visualization title
 * @param {string} options.icon - FontAwesome icon class (without 'fa-')
 * @param {string} options.description - Visualization description
 * @param {Array} options.insights - Key insights as an array of strings
 * @param {Array} options.instructions - Usage instructions as an array of strings
 * @param {Array} options.metadata - Metadata as an array of {label, value} objects
 * @returns {HTMLElement} The header DOM element
 */
export function createVisualizationHeader(options) {
  const {
    title,
    icon = 'chart-pie',
    description = '',
    insights = [],
    instructions = [],
    metadata = []
  } = options;
  
  // Create container
  const container = document.createElement('div');
  container.className = 'visualization-header';
  
  // Create title
  const titleElement = document.createElement('h2');
  titleElement.className = 'visualization-title';
  titleElement.innerHTML = `<i class="fas fa-${icon}"></i> ${title}`;
  container.appendChild(titleElement);
  
  // Create description if provided
  if (description) {
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'visualization-description';
    descriptionElement.innerHTML = description;
    container.appendChild(descriptionElement);
  }
  
  // Create expandable sections container
  const sectionsContainer = document.createElement('div');
  sectionsContainer.className = 'header-sections';
  container.appendChild(sectionsContainer);
  
  // Add insights section if provided
  if (insights && insights.length > 0) {
    const insightsSection = createExpandableSection('Key Insights', 'lightbulb', insights);
    sectionsContainer.appendChild(insightsSection);
  }
  
  // Add instructions section if provided
  if (instructions && instructions.length > 0) {
    const instructionsSection = createExpandableSection('Usage Instructions', 'info-circle', instructions);
    sectionsContainer.appendChild(instructionsSection);
  }
  
  // Add metadata section if provided
  if (metadata && metadata.length > 0) {
    const metadataContent = document.createElement('div');
    metadataContent.className = 'metadata-content';
    
    metadata.forEach(item => {
      const metaItem = document.createElement('div');
      metaItem.className = 'metadata-item';
      
      const metaLabel = document.createElement('span');
      metaLabel.className = 'metadata-label';
      metaLabel.textContent = item.label;
      
      const metaValue = document.createElement('span');
      metaValue.className = 'metadata-value';
      metaValue.textContent = item.value;
      
      metaItem.appendChild(metaLabel);
      metaItem.appendChild(metaValue);
      metadataContent.appendChild(metaItem);
    });
    
    const metadataSection = createExpandableSection('Data Information', 'database', [metadataContent.outerHTML]);
    sectionsContainer.appendChild(metadataSection);
  }
  
  return container;
}

/**
 * Creates an expandable section for the header
 * 
 * @param {string} title - Section title
 * @param {string} icon - FontAwesome icon class (without 'fa-')
 * @param {Array} contentItems - Array of content items (strings or HTML)
 * @returns {HTMLElement} The section DOM element
 */
function createExpandableSection(title, icon, contentItems) {
  const section = document.createElement('div');
  section.className = 'header-section';
  
  // Create section header
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'section-header';
  sectionHeader.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${title}</span>
    <button class="toggle-button">
      <i class="fas fa-chevron-down"></i>
    </button>
  `;
  section.appendChild(sectionHeader);
  
  // Create section content
  const sectionContent = document.createElement('div');
  sectionContent.className = 'section-content';
  sectionContent.style.display = 'none';
  
  // Add content items
  if (contentItems[0] && contentItems[0].startsWith('<div class="metadata-content">')) {
    // Special case for metadata which is already HTML
    sectionContent.innerHTML = contentItems[0];
  } else {
    const contentList = document.createElement('ul');
    contentItems.forEach(item => {
      const listItem = document.createElement('li');
      listItem.innerHTML = item;
      contentList.appendChild(listItem);
    });
    sectionContent.appendChild(contentList);
  }
  
  section.appendChild(sectionContent);
  
  // Add toggle functionality
  const toggleButton = sectionHeader.querySelector('.toggle-button');
  toggleButton.addEventListener('click', () => {
    const isVisible = sectionContent.style.display !== 'none';
    sectionContent.style.display = isVisible ? 'none' : 'block';
    toggleButton.innerHTML = `<i class="fas fa-chevron-${isVisible ? 'down' : 'up'}"></i>`;
  });
  
  return section;
}

/**
 * Add a standard footer to visualizations
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.sourceName - Source data name
 * @param {string} options.lastUpdated - Last updated date
 * @param {string} options.author - Author information
 * @returns {HTMLElement} The footer DOM element
 */
export function createVisualizationFooter(options = {}) {
  const {
    sourceName = 'St. Himark Earthquake Data',
    lastUpdated = new Date().toLocaleDateString(),
    author = 'St. Himark Disaster Response Team'
  } = options;
  
  const footer = document.createElement('div');
  footer.className = 'visualization-footer';
  
  footer.innerHTML = `
    <div class="footer-content">
      <div class="data-source">
        <span class="label">Data Source:</span>
        <span class="value">${sourceName}</span>
      </div>
      <div class="last-updated">
        <span class="label">Last Updated:</span>
        <span class="value">${lastUpdated}</span>
      </div>
      <div class="created-by">
        <span class="label">Created By:</span>
        <span class="value">${author}</span>
      </div>
    </div>
  `;
  
  return footer;
}

// Add CSS for these components
export function addVisualizationStyles() {
  // Check if styles already added
  if (document.getElementById('visualization-header-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'visualization-header-styles';
  
  style.textContent = `
    /* Visualization header styles */
    .visualization-header {
      margin-bottom: 2rem;
    }
    
    .visualization-title {
      color: var(--primary-color);
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .visualization-description {
      color: var(--text-light);
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .header-sections {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .header-section {
      background: var(--bg-card);
      border: 1px solid var(--bg-card-border);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(42, 157, 143, 0.1);
      cursor: pointer;
    }
    
    .section-header i {
      color: var(--primary-color);
      margin-right: 0.75rem;
    }
    
    .section-header span {
      flex: 1;
      font-weight: 600;
      color: var(--text-light);
    }
    
    .toggle-button {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .toggle-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .section-content {
      padding: 1rem;
      color: var(--text-light);
    }
    
    .section-content ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .section-content li {
      margin-bottom: 0.75rem;
    }
    
    .section-content li:last-child {
      margin-bottom: 0;
    }
    
    /* Metadata styles */
    .metadata-content {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 150px;
    }
    
    .metadata-label {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .metadata-value {
      font-size: 0.95rem;
      font-weight: 500;
    }
    
    /* Footer styles */
    .visualization-footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid var(--bg-card-border);
    }
    
    .footer-content {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .footer-content .label {
      font-weight: 600;
      margin-right: 0.5rem;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .visualization-title {
        font-size: 1.5rem;
      }
      
      .visualization-description {
        font-size: 1rem;
      }
      
      .footer-content {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `;
  
  document.head.appendChild(style);
}