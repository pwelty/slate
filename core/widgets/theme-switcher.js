export default class ThemeSwitcherWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.availableThemes = this.config.availableThemes || ['dark', 'light']
    this.currentTheme = this.getCurrentTheme()
  }

  init() {
    this.render()
    this.attachEventListeners()
    
    // Listen for theme changes to update the selector
    window.addEventListener('theme-changed', (e) => {
      this.currentTheme = e.detail.theme
      this.updateSelector()
    })
    
    // Also listen for initial theme application
    setTimeout(() => {
      const actualTheme = document.documentElement.getAttribute('data-theme')
      if (actualTheme && actualTheme !== this.currentTheme) {
        this.currentTheme = actualTheme
        this.updateSelector()
      }
    }, 100)
  }

  getCurrentTheme() {
    // Get the actually applied theme from the data attribute (this is what main.js sets)
    const applied = document.documentElement.getAttribute('data-theme')
    if (applied && this.availableThemes.includes(applied)) {
      return applied
    }
    
    // Fallback to localStorage if data attribute is missing
    const saved = localStorage.getItem('dashboard-theme')
    if (saved && this.availableThemes.includes(saved)) {
      return saved
    }
    
    // Final fallback
    return 'dark'
  }

  render() {
    this.container.innerHTML = `
      <div class="theme-switcher-widget">
        <div class="theme-switcher-container">
          <label for="theme-select" class="theme-switcher-label">
            🎨 Theme
          </label>
          <select id="theme-select" class="theme-switcher-select">
            ${this.availableThemes.map(theme => `
              <option value="${theme}" ${theme === this.currentTheme ? 'selected' : ''}>
                ${this.formatThemeName(theme)}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `
  }

  formatThemeName(theme) {
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  updateSelector() {
    const select = this.container.querySelector('#theme-select')
    if (select) {
      select.value = this.currentTheme
    }
  }

  attachEventListeners() {
    const select = this.container.querySelector('#theme-select')
    if (select) {
      select.addEventListener('change', (e) => {
        this.switchTheme(e.target.value)
      })
    }
  }

  switchTheme(newTheme) {
    if (!this.availableThemes.includes(newTheme)) {
      console.warn(`Theme '${newTheme}' not available`)
      return
    }

    this.currentTheme = newTheme
    
    // Update the document data-theme attribute
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Save to localStorage
    localStorage.setItem('dashboard-theme', newTheme)
    
    // Apply theme CSS variables
    this.applyTheme(newTheme)
    
    // Trigger custom event for other components that might need to react
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme: newTheme } 
    }))
  }

  applyTheme(themeName) {
    // Get the theme configuration from the global config
    const config = window.DASHBOARD_CONFIG || this.config.dashboardConfig
    if (!config || !config.themes || !config.themes[themeName]) {
      console.warn(`Theme '${themeName}' not found in configuration`)
      return
    }

    const theme = config.themes[themeName]
    const root = document.documentElement

    // Apply CSS custom properties
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value)
    })
  }

  destroy() {
    // Clean up event listeners if needed
    const select = this.container.querySelector('#theme-select')
    if (select) {
      select.removeEventListener('change', this.switchTheme)
    }
  }
} 