export class DashboardRenderer {
  constructor(config) {
    this.config = config
    this.container = document.getElementById('dashboard-container')
    this.widgets = new Map()
  }

  render() {
    this.applyTheme()
    this.applyGridSettings()
    this.renderComponents()
    this.initializeCollapsibles()
  }

  applyTheme() {
    const theme = this.config.dashboard?.theme || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    
    // Apply custom theme variables if defined
    if (this.config.themes && this.config.themes[theme]) {
      const themeVars = this.config.themes[theme]
      Object.entries(themeVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })
    }
  }

  applyGridSettings() {
    const columns = this.config.dashboard?.columns || 12
    const gap = this.config.dashboard?.gap || '1rem'
    
    this.container.style.setProperty('--grid-columns', columns)
    this.container.style.setProperty('--grid-gap', gap)
  }

  renderComponents() {
    this.container.innerHTML = ''
    
    if (!this.config.components || !Array.isArray(this.config.components)) {
      console.warn('No components defined in configuration')
      return
    }

    this.config.components.forEach(component => {
      const element = this.createComponent(component)
      if (element) {
        this.container.appendChild(element)
      }
    })
  }

  createComponent(component) {
    const div = document.createElement('div')
    div.className = 'grid-item'
    div.id = component.id || `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    if (component.position) {
      if (component.position.row) {
        div.style.setProperty('--row', component.position.row)
      }
      if (component.position.column) {
        div.style.setProperty('--column', component.position.column)
      }
    }

    switch (component.type) {
      case 'group':
        return this.createGroup(component, div)
      case 'widget':
        return this.createWidget(component, div)
      case 'link':
        return this.createLink(component, div)
      default:
        console.warn(`Unknown component type: ${component.type}`)
        return null
    }
  }

  createGroup(component, container) {
    const isCollapsed = component.collapsed || false
    const layout = component.layout || 'grid'
    
    container.innerHTML = `
      <div class="group ${isCollapsed ? 'collapsed' : ''}">
        <div class="group-header" data-group-id="${component.id}">
          <span>${component.title || 'Untitled Group'}</span>
          <span class="collapse-icon">▼</span>
        </div>
        <div class="group-content ${layout}">
          ${this.renderGroupItems(component.items || [])}
        </div>
      </div>
    `
    
    // Apply custom background color if specified
    if (component.backgroundColor) {
      const groupElement = container.querySelector('.group')
      groupElement.style.setProperty('--group-bg', component.backgroundColor)
    }
    
    return container
  }

  renderGroupItems(items) {
    return items.map((item, index) => {
      console.log('Rendering group item:', item.type, item)
      if (item.type === 'link') {
        return this.createLinkHTML(item)
      } else if (item.type === 'motd') {
        return this.createMOTDHTML(item)
      } else if (item.type === 'todoist') {
        console.log('Creating Todoist HTML for item:', item)
        return this.createTodoistHTML(item, index)
      } else if (item.type === 'obsidian') {
        console.log('Creating Obsidian HTML for item:', item)
        return this.createObsidianHTML(item, index)
      }
      return ''
    }).join('')
  }

  createLinkHTML(link) {
    const icon = this.getIcon(link.icon)
    const hasStatus = link.statusCheck
    const isCompact = link.compact
    const target = '_blank'  // Always open in new tab
    const rel = 'noopener noreferrer'  // Always add security attributes
    
    return `
      <a href="${link.url}" 
         class="link-card ${isCompact ? 'compact' : ''}" 
         target="${target}" 
         rel="${rel}"
         ${hasStatus ? `data-status-url="${link.url}"` : ''}>
        <div class="link-icon">${icon}</div>
        <div class="link-info">
          <div class="link-name">${link.name}</div>
          ${link.description && !isCompact ? `<div class="link-description">${link.description}</div>` : ''}
        </div>
        ${hasStatus ? '<div class="status-indicator checking"></div>' : ''}
      </a>
    `
  }

  createMOTDHTML(motd) {
    const title = motd.title || "Message of the Day"
    const message = motd.message || "No message configured"
    const icon = motd.icon || "📢"
    const priority = motd.priority || "normal"
    const dismissible = motd.dismissible || false
    const timestamp = motd.timestamp !== false // default true
    const className = motd.className || ""
    
    return `
      <div class="motd-group-item ${className}" data-priority="${priority}">
        <div class="motd-header">
          <span class="motd-icon">${icon}</span>
          <h4 class="motd-title">${title}</h4>
          ${dismissible ? '<button class="motd-dismiss" title="Dismiss message">×</button>' : ''}
        </div>
        <div class="motd-message">${message}</div>
        ${timestamp ? `<div class="motd-timestamp">Updated: ${new Date().toLocaleString()}</div>` : ''}
      </div>
    `
  }

  createTodoistHTML(todoist, index) {
    const containerId = `todoist-${Date.now()}-${index}`
    console.log('Creating Todoist container with ID:', containerId, 'and config:', todoist.config)
    // Schedule widget loading after render
    setTimeout(() => {
      const container = document.getElementById(containerId)
      console.log('Loading Todoist widget into container:', container)
      if (container) {
        this.loadWidget('todoist', container, todoist.config || {})
      } else {
        console.error('Todoist container not found:', containerId)
      }
    }, 0)
    return `<div id="${containerId}" class="todoist-group-item"></div>`
  }

  createObsidianHTML(obsidian, index) {
    const containerId = `obsidian-${Date.now()}-${index}`
    console.log('Creating Obsidian container with ID:', containerId, 'and config:', obsidian.config)
    // Schedule widget loading after render
    setTimeout(() => {
      const container = document.getElementById(containerId)
      console.log('Loading Obsidian widget into container:', container)
      if (container) {
        this.loadWidget('obsidian', container, obsidian.config || {})
      } else {
        console.error('Obsidian container not found:', containerId)
      }
    }, 0)
    return `<div id="${containerId}" class="obsidian-group-item"></div>`
  }

  createWidget(component, container) {
    const widgetType = component.widget
    const config = component.config || {}
    
    container.innerHTML = `<div class="widget" id="widget-${component.id}"></div>`
    
    // Apply custom background color if specified
    if (component.backgroundColor) {
      const widgetElement = container.querySelector('.widget')
      widgetElement.style.setProperty('--widget-bg', component.backgroundColor)
    }
    
    // Load widget asynchronously
    this.loadWidget(widgetType, container.querySelector('.widget'), config)
    
    return container
  }

  createLink(component, container) {
    container.innerHTML = this.createLinkHTML(component)
    return container
  }

  async loadWidget(widgetType, widgetContainer, config) {
    try {
      console.log(`Loading widget: ${widgetType} with config:`, config)
      const widgetModule = await this.getWidgetModule(widgetType)
      console.log(`Widget module loaded for ${widgetType}:`, widgetModule)
      const widget = new widgetModule.default(widgetContainer, config)
      this.widgets.set(widgetContainer.id, widget)
      await widget.init()
      console.log(`Widget ${widgetType} initialized successfully`)
    } catch (error) {
      console.error(`Failed to load widget ${widgetType}:`, error)
      widgetContainer.innerHTML = `
        <div class="error">
          <p>Failed to load ${widgetType} widget</p>
          <small>${error.message}</small>
        </div>
      `
    }
  }

  async getWidgetModule(widgetType) {
    const widgetRegistry = {
      clock: () => import('./widgets/clock.js'),
      weather: () => import('./widgets/weather.js'),
      status: () => import('./widgets/status.js'),
      radar: () => import('./widgets/radar.js'),
      'theme-switcher': () => import('./widgets/theme-switcher.js'),
      'tailscale': () => import('./widgets/tailscale.js'),
      image: () => import('./widgets/image.js'),
      motd: () => import('./widgets/motd.js'),
      'status-summary': () => import('./widgets/status-summary.js'),
      todoist: () => import('./widgets/todoist.js'),
      obsidian: () => import('./widgets/obsidian.js')
    }
    
    if (!widgetRegistry[widgetType]) {
      throw new Error(`Widget type "${widgetType}" not found`)
    }
    
    return await widgetRegistry[widgetType]()
  }

  getIcon(iconName) {
    if (!iconName) return '🔗'
    
    // Icon mapping - can be extended
    const icons = {
      github: '🐙',
      gitlab: '🦊',
      docker: '🐳',
      kubernetes: '⚙️',
      prometheus: '📊',
      grafana: '📈',
      nextcloud: '☁️',
      plex: '🎬',
      jellyfin: '🎭',
      home: '🏠',
      server: '🖥️',
      database: '🗄️',
      network: '🌐',
      security: '🔒',
      tools: '🔧',
      monitoring: '👁️',
      backup: '💾',
      calendar: '📅',
      mail: '📧',
      chat: '💬',
      rss: '📰',
      weather: '🌤️',
      clock: '🕒'
    }
    
    // Check if it's a custom icon from config
    if (this.config.icons && this.config.icons[iconName]) {
      return this.config.icons[iconName]
    }
    
    return icons[iconName] || iconName
  }

  initializeCollapsibles() {
    document.querySelectorAll('.group-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const group = header.closest('.group')
        group.classList.toggle('collapsed')
        
        // Save state to localStorage
        const groupId = header.dataset.groupId
        if (groupId) {
          const isCollapsed = group.classList.contains('collapsed')
          localStorage.setItem(`group-${groupId}-collapsed`, isCollapsed)
        }
      })
    })

    // Restore collapsed states from localStorage
    document.querySelectorAll('.group-header').forEach(header => {
      const groupId = header.dataset.groupId
      if (groupId) {
        const isCollapsed = localStorage.getItem(`group-${groupId}-collapsed`) === 'true'
        if (isCollapsed) {
          header.closest('.group').classList.add('collapsed')
        }
      }
    })

    // Initialize MOTD dismiss buttons in groups
    this.initializeMOTDDismiss()
  }

  initializeMOTDDismiss() {
    const dismissButtons = document.querySelectorAll('.motd-group-item .motd-dismiss')
    dismissButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation() // Prevent group header click
        const motdItem = button.closest('.motd-group-item')
        if (motdItem) {
          motdItem.style.display = 'none'
        }
      })
    })
  }
}