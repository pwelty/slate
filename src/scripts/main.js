import { DashboardRenderer } from './renderer.js'
import { StatusChecker } from './status-checker.js'

// Load YAML configs from server
async function loadConfig() {
  try {
    // Load both config files
    const [configResponse, widgetsResponse] = await Promise.all([
      fetch('config/config.yaml'),
      fetch('config/widgets.yaml')
    ])
    
    if (!configResponse.ok) {
      throw new Error(`HTTP error loading config.yaml! status: ${configResponse.status}`)
    }
    if (!widgetsResponse.ok) {
      throw new Error(`HTTP error loading widgets.yaml! status: ${widgetsResponse.status}`)
    }
    
    const [configText, widgetsText] = await Promise.all([
      configResponse.text(),
      widgetsResponse.text()
    ])
    
    // Parse YAML using js-yaml (we'll load it dynamically)
    const { load } = await import('https://cdn.skypack.dev/js-yaml')
    const config = load(configText)
    const widgets = load(widgetsText)
    
    // Merge them into expected structure
    const merged = {
      ...config,
      components: Object.entries(widgets).map(([id, widget]) => ({
        id,
        ...widget
      }))
    }
    
    console.log('✓ Config loaded:', {
      title: merged.title,
      theme: merged.theme,
      components: merged.components.length
    })
    
    return merged
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
    await applyInitialTheme(config)
    
    const dashboard = new DashboardRenderer(config)
    dashboard.render()
    
    // Initialize status checking after render
    const statusChecker = new StatusChecker()
    // Give the DOM a moment to settle after render
    setTimeout(() => statusChecker.init(), 500)
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
async function applyInitialTheme(config) {
  const savedTheme = localStorage.getItem('dashboard-theme')
  const defaultTheme = config.theme || 'dark'
  
  // Set theme name
  let theme = defaultTheme
  if (savedTheme) {
    // For now, just trust localStorage (theme validation will happen when loading theme file)
    theme = savedTheme
  }
  
  // Set data-theme attribute
  document.documentElement.setAttribute('data-theme', theme)
  
  // Save the applied theme to localStorage (ensures consistency)
  localStorage.setItem('dashboard-theme', theme)
  
  // Load theme file from core/themes/
  try {
    const themeResponse = await fetch(`core/themes/${theme}.yaml`)
    if (themeResponse.ok) {
      const themeText = await themeResponse.text()
      const { load } = await import('https://cdn.skypack.dev/js-yaml')
      const themeData = load(themeText)
      
      // Apply theme CSS variables
      const root = document.documentElement
      Object.entries(themeData).forEach(([property, value]) => {
        // Skip non-CSS properties like name, description
        if (!['name', 'description'].includes(property)) {
          root.style.setProperty(`--${property}`, value)
        }
      })
      
      console.log(`✓ Applied theme: ${themeData.name || theme}`)
    } else {
      console.warn(`Theme file not found: core/themes/${theme}.yaml, falling back to defaults`)
    }
  } catch (error) {
    console.error(`Failed to load theme ${theme}:`, error)
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
      // Check both config files for changes
      const [configResponse, widgetsResponse] = await Promise.all([
        fetch('config/config.yaml', { method: 'HEAD' }),
        fetch('config/widgets.yaml', { method: 'HEAD' })
      ])
      
      const configModified = configResponse.headers.get('last-modified')
      const widgetsModified = widgetsResponse.headers.get('last-modified')
      
      if (lastConfigModified && (
        configModified !== lastConfigModified.config ||
        widgetsModified !== lastConfigModified.widgets
      )) {
        console.log('🔄 Configuration changed, reloading...')
        window.location.reload()
      }
      
      lastConfigModified = {
        config: configModified,
        widgets: widgetsModified
      }
    } catch (error) {
      console.debug('Config change check failed:', error)
    }
  }
  
  // Check for config changes every 2 seconds in development
  setInterval(checkConfigChanges, 2000)
  
  // Initial check
  checkConfigChanges()
}