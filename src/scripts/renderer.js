import { widgetLoader } from '../widgets/widget-loader.js'

export class DashboardRenderer {
  constructor(config) {
    this.config = config
    this.container = document.getElementById('dashboard-container')
    this.widgets = new Map()
  }

  render() {
    try {
      console.log('🎨 Applying theme...')
      this.applyTheme()
      
      console.log('📐 Applying grid settings...')
      this.applyGridSettings()
      
      console.log('🧩 Rendering components...')
      this.renderComponents()
      
      console.log('🎛️ Initializing collapsibles...')
      this.initializeCollapsibles()
      
      console.log('✅ Dashboard render complete!')
    } catch (error) {
      console.error('❌ Dashboard render failed:', error)
      throw error
    }
  }

  applyTheme() {
    // Theme is now handled by main.js during initialization
    // Just ensure the data-theme attribute is set
    const theme = this.config.theme || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }

  applyGridSettings() {
    const columns = this.config.columns || 12
    const gap = this.config.gap || '1rem'
    
    this.container.style.setProperty('--grid-columns', columns)
    this.container.style.setProperty('--grid-gap', gap)
  }

  renderComponents() {
    this.container.innerHTML = ''
    
    if (!this.config.components || !Array.isArray(this.config.components)) {
      console.warn('No components defined in configuration')
      return
    }

    // Separate components into groups and widgets
    const groups = new Map()
    const standaloneWidgets = []
    
    console.log('🔍 Processing components:', this.config.components.length)
    
    this.config.components.forEach(component => {
      console.log('Processing component:', component.id, component.type)
      if (component.type === 'group') {
        groups.set(component.id, {
          ...component,
          children: []
        })
        console.log('  ➕ Added group:', component.id)
      } else if (component.group) {
        // Widget belongs to a group
        if (!groups.has(component.group)) {
          console.warn(`Widget ${component.id} references unknown group: ${component.group}`)
          return
        }
        groups.get(component.group).children.push(component)
        console.log('  🔗 Added to group:', component.group)
      } else {
        // Standalone widget
        standaloneWidgets.push(component)
        console.log('  🏷️ Standalone widget')
      }
    })
    
    console.log('📊 Groups found:', Array.from(groups.keys()))
    console.log('📊 Standalone widgets:', standaloneWidgets.length)

    // Render groups with their children
    groups.forEach(group => {
      const element = this.createComponent(group)
      if (element) {
        this.container.appendChild(element)
      }
    })

    // Render standalone widgets
    standaloneWidgets.forEach(component => {
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
      // Handle new intuitive syntax: row: 1, column: 10, span: 3
      if (typeof component.position.row !== 'undefined') {
        div.style.setProperty('--row', component.position.row)
      }
      
      if (typeof component.position.column !== 'undefined' && typeof component.position.span !== 'undefined') {
        // New syntax: column + span
        const startCol = component.position.column
        const endCol = startCol + component.position.span
        div.style.setProperty('--column', `${startCol} / ${endCol}`)
      } else if (component.position.column) {
        // Legacy syntax: "1 / 7" or "1 / -1"
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
    const isCollapsible = component.collapsible !== false // Default to true if not specified
    const layout = component.layout || 'grid'
    
    container.innerHTML = `
      <div class="group ${isCollapsed ? 'collapsed' : ''} ${isCollapsible ? 'collapsible' : 'non-collapsible'}">
        <div class="group-header" data-group-id="${component.id}" ${isCollapsible ? '' : 'data-non-collapsible="true"'}>
          <span>${component.title || 'Untitled Group'}</span>
          ${isCollapsible ? '<span class="collapse-icon">▼</span>' : ''}
        </div>
        <div class="group-content ${layout}">
          ${this.renderGroupChildren(component.children || [])}
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

  renderGroupChildren(children) {
    return children.map((child, index) => {
      console.log('Rendering group child:', child.type, child)
      if (child.type === 'link') {
        return this.createLinkHTML(child)
      } else if (child.type === 'motd') {
        return this.createMOTDHTML(child)
      } else if (child.type === 'todoist') {
        console.log('Creating Todoist HTML for child:', child)
        return this.createTodoistHTML(child, index)
      } else if (child.type === 'obsidian') {
        console.log('Creating Obsidian HTML for child:', child)
        return this.createObsidianHTML(child, index)
      } else if (child.type === 'trilium') {
        console.log('Creating Trilium HTML for child:', child)
        return this.createTriliumHTML(child, index)
      } else if (child.type === 'preview') {
        console.log('Creating Preview HTML for child:', child)
        return this.createPreviewHTML(child, index)
      } else if (child.type === 'widget') {
        // Handle nested widgets within groups
        const containerId = `group-widget-${Date.now()}-${index}`
        setTimeout(() => {
          const container = document.getElementById(containerId)
          if (container) {
            this.loadWidget(child.widget, container, child.config || {})
          }
        }, 0)
        return `<div id="${containerId}" class="group-widget-item"></div>`
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

  createTriliumHTML(trilium, index) {
    const containerId = `trilium-${Date.now()}-${index}`
    console.log('Creating Trilium container with ID:', containerId, 'and config:', trilium.config)
    // Schedule widget loading after render
    setTimeout(() => {
      const container = document.getElementById(containerId)
      console.log('Loading Trilium widget into container:', container)
      if (container) {
        this.loadWidget('trilium', container, trilium.config || {})
      } else {
        console.error('Trilium container not found:', containerId)
      }
    }, 0)
    return `<div id="${containerId}" class="trilium-group-item"></div>`
  }

  createPreviewHTML(preview, index) {
    const containerId = `preview-${Date.now()}-${index}`
    console.log('Creating Preview container with ID:', containerId, 'and config:', preview.config)
    // Schedule widget loading after render
    setTimeout(() => {
      const container = document.getElementById(containerId)
      console.log('Loading Preview widget into container:', container)
      if (container) {
        this.loadWidget('preview', container, preview.config || {})
      } else {
        console.error('Preview container not found:', containerId)
      }
    }, 0)
    return `<div id="${containerId}" class="preview-group-item"></div>`
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
      
      // Create widget using plugin loader
      const widget = await widgetLoader.createWidget(widgetType, widgetContainer, config)
      console.log(`✓ Widget ${widgetType} created and validated`)
      
      // Store widget and initialize
      this.widgets.set(widgetContainer.id, widget)
      await widget.init()
      console.log(`✓ Widget ${widgetType} initialized successfully`)
      
      // Log widget capabilities for debugging
      const capabilities = await widgetLoader.getWidgetCapabilities(widgetType)
      if (Object.keys(capabilities).length > 0) {
        console.log(`  Capabilities:`, Object.keys(capabilities).filter(k => capabilities[k]))
      }
      
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
    // Delegate to widget loader
    return await widgetLoader.loadWidgetModule(widgetType)
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
      // Only add click handler for collapsible groups
      if (!header.dataset.nonCollapsible) {
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
        
        // Add cursor pointer for collapsible groups
        header.style.cursor = 'pointer'
      } else {
        // Non-collapsible groups don't get pointer cursor
        header.style.cursor = 'default'
      }
    })

    // Restore collapsed states from localStorage (only for collapsible groups)
    document.querySelectorAll('.group-header').forEach(header => {
      const groupId = header.dataset.groupId
      if (groupId && !header.dataset.nonCollapsible) {
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