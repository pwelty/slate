export default class ThemeSwitcherWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    // Available themes (must match those defined in themes.css)
    this.availableThemes = this.config.availableThemes || ['dark', 'light', 'retro', 'synthwave', 'tokyo-night']
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

    // Clean up current theme effects first
    this.cleanupCurrentThemeEffects()

    this.currentTheme = newTheme
    
    // Update the document data-theme attribute (CSS handles the rest)
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Load theme-specific JavaScript if it exists
    this.loadThemeJS(newTheme)
    
    // Save to localStorage
    localStorage.setItem('dashboard-theme', newTheme)
    
    // Trigger custom event for other components that might need to react
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme: newTheme } 
    }))
    
    console.log(`✓ Theme switched to: ${newTheme}`)
  }

  cleanupCurrentThemeEffects() {
    // Clean up any existing theme effects
    if (window.TokyoNightTheme && typeof window.TokyoNightTheme.remove === 'function') {
      window.TokyoNightTheme.remove()
    }
    
    // Remove any theme-specific script tags
    const existingThemeScripts = document.querySelectorAll('script[data-theme-js]')
    existingThemeScripts.forEach(script => script.remove())
  }

  loadThemeJS(themeName) {
    // Check if theme JS file exists and load it
    const themeJSPath = `/js/${themeName}.js`
    
    // Test if the file exists
    fetch(themeJSPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // File exists, load it
          const script = document.createElement('script')
          script.src = themeJSPath
          script.setAttribute('data-theme-js', themeName)
          script.onload = () => {
            console.log(`✓ Theme effects loaded: ${themeName}.js`)
          }
          script.onerror = () => {
            console.warn(`Failed to load theme effects: ${themeName}.js`)
          }
          document.head.appendChild(script)
        }
      })
      .catch(() => {
        // No theme JS file, that's fine
        console.log(`No theme effects for: ${themeName}`)
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