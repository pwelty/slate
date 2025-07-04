import { DashboardRenderer } from './renderer.js'

// Load YAML config from server
async function loadConfig() {
  try {
    const response = await fetch('/dashboard.yaml')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const yamlText = await response.text()
    
    // Parse YAML using js-yaml (we'll load it dynamically)
    const { load } = await import('https://cdn.skypack.dev/js-yaml')
    return load(yamlText)
  } catch (error) {
    console.error('Failed to load config:', error)
    throw error
  }
}

// Initialize dashboard
async function init() {
  try {
    const config = await loadConfig()
    
    // Make config globally available for widgets
    window.DASHBOARD_CONFIG = config
    
    // Apply initial theme
    applyInitialTheme(config)
    
    const dashboard = new DashboardRenderer(config)
    dashboard.render()
  } catch (error) {
    console.error('Failed to initialize dashboard:', error)
    document.body.innerHTML = `
      <div class="error">
        <h2>Configuration Error</h2>
        <p>Failed to load dashboard configuration. Please check that dashboard.yaml exists and is valid.</p>
        <p>Error: ${error.message}</p>
      </div>
    `
  }
}

// Apply initial theme based on saved preference or config default
function applyInitialTheme(config) {
  const savedTheme = localStorage.getItem('dashboard-theme')
  const defaultTheme = config.dashboard.theme || 'dark'
  const theme = savedTheme || defaultTheme
  
  // Set data-theme attribute
  document.documentElement.setAttribute('data-theme', theme)
  
  // Apply theme CSS variables
  if (config.themes && config.themes[theme]) {
    const root = document.documentElement
    Object.entries(config.themes[theme]).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value)
    })
  }
}

// Start the application
init()

// Hot reload support in development
if (import.meta.hot) {
  import.meta.hot.accept()
  
  // Watch for config changes and reload
  let lastConfigModified = null
  
  const checkConfigChanges = async () => {
    try {
      const response = await fetch('/dashboard.yaml', { method: 'HEAD' })
      const lastModified = response.headers.get('last-modified')
      
      if (lastConfigModified && lastModified !== lastConfigModified) {
        console.log('🔄 Dashboard config changed, reloading...')
        window.location.reload()
      }
      
      lastConfigModified = lastModified
    } catch (error) {
      console.debug('Config change check failed:', error)
    }
  }
  
  // Check for config changes every 2 seconds in development
  setInterval(checkConfigChanges, 2000)
  
  // Initial check
  checkConfigChanges()
}