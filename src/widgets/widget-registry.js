/**
 * Widget Registry - Central definition system for all widgets
 * 
 * Each widget declares:
 * - Schema: What config options it accepts
 * - Capabilities: What it can do (status checking, caching, etc.)
 * - Dependencies: Required environment variables or APIs
 * - Rendering: How it integrates with the renderer
 */

export const WIDGET_REGISTRY = {
  // Container widgets
  group: {
    type: 'container',
    description: 'Collapsible container for organizing other widgets',
    schema: {
      title: { type: 'string', required: false, description: 'Group header text' },
      collapsed: { type: 'boolean', required: false, default: false, description: 'Start collapsed' },
      backgroundColor: { type: 'string', required: false, description: 'CSS background color/gradient' },
      items: { type: 'array', required: true, description: 'Child widgets' }
    },
    capabilities: {
      hasChildren: true,
      collapsible: true,
      customStyling: true
    },
    renderMethod: 'createGroup'
  },

  // Link widgets
  link: {
    type: 'interactive',
    description: 'Clickable link with optional status monitoring',
    schema: {
      name: { type: 'string', required: true, description: 'Display name' },
      url: { type: 'string', required: true, description: 'Target URL' },
      icon: { type: 'string', required: false, description: 'Icon name from mapping' },
      description: { type: 'string', required: false, description: 'Subtitle text' },
      statusCheck: { type: 'boolean', required: false, default: false, description: 'Enable health monitoring' },
      compact: { type: 'boolean', required: false, default: false, description: 'Minimal display mode' }
    },
    capabilities: {
      statusMonitoring: true,
      externalLinks: true,
      customStyling: true
    },
    renderMethod: 'createLinkHTML'
  },

  // Service integration widgets
  trilium: {
    type: 'service',
    description: 'Displays Trilium notes filtered by tag',
    schema: {
      tag: { type: 'string', required: true, description: 'Trilium tag to search for (without #)' },
      maxNotes: { type: 'integer', required: false, default: 5, description: 'Maximum notes to display' }
    },
    capabilities: {
      apiIntegration: true,
      caching: true,
      realTimeUpdates: true
    },
    dependencies: {
      env: ['TRILIUM_TOKEN', 'TRILIUM_URL'],
      endpoints: ['/api/trilium']
    },
    renderMethod: 'createTriliumHTML',
    widgetClass: 'trilium'
  },

  obsidian: {
    type: 'service',
    description: 'Displays Obsidian notes (limited functionality)',
    schema: {
      vaultPath: { type: 'string', required: true, description: 'Path to Obsidian vault' },
      tag: { type: 'string', required: false, description: 'Tag filter (limited support)' },
      maxNotes: { type: 'integer', required: false, default: 5, description: 'Maximum notes to display' },
      apiUrl: { type: 'string', required: true, description: 'Obsidian Local REST API URL' },
      apiKey: { type: 'string', required: true, description: 'API key' }
    },
    capabilities: {
      apiIntegration: true,
      caching: true
    },
    dependencies: {
      env: ['OBSIDIAN_API_KEY', 'OBSIDIAN_API_URL'],
      endpoints: ['/api/obsidian']
    },
    limitations: ['Tag search not fully supported', 'Content search unavailable'],
    renderMethod: 'createObsidianHTML',
    widgetClass: 'obsidian'
  },

  todoist: {
    type: 'service',
    description: 'Displays tasks from Todoist',
    schema: {
      apiToken: { type: 'string', required: true, description: 'Todoist API token' },
      projectName: { type: 'string', required: false, description: 'Filter by project name' },
      tag: { type: 'string', required: false, description: 'Filter by tag' },
      maxTasks: { type: 'integer', required: false, default: 5, description: 'Maximum tasks to display' }
    },
    capabilities: {
      apiIntegration: true,
      caching: true,
      realTimeUpdates: true
    },
    dependencies: {
      env: ['TODOIST_API_TOKEN']
    },
    renderMethod: 'createTodoistHTML',
    widgetClass: 'todoist'
  },

  preview: {
    type: 'service',
    description: 'Shows recent items from external services',
    schema: {
      service: { 
        type: 'enum', 
        required: true, 
        values: ['trilium', 'linkwarden', 'obsidian'],
        description: 'Service to fetch from' 
      },
      title: { type: 'string', required: false, description: 'Custom title override' },
      limit: { type: 'integer', required: false, default: 3, description: 'Number of items to display' }
    },
    capabilities: {
      multiService: true,
      apiIntegration: true,
      caching: true
    },
    dependencies: {
      dynamic: true, // Depends on selected service
      endpoints: ['/api/trilium/recent', '/api/linkwarden/recent', '/api/obsidian/recent']
    },
    renderMethod: 'createPreviewHTML',
    widgetClass: 'preview'
  },

  // Information widgets
  motd: {
    type: 'content',
    description: 'Message of the Day - displays announcements and alerts',
    schema: {
      title: { type: 'string', required: false, description: 'Message header' },
      message: { type: 'string', required: true, description: 'Message content' },
      icon: { type: 'string', required: false, description: 'Emoji or icon' },
      priority: { 
        type: 'enum', 
        required: false, 
        values: ['low', 'normal', 'high'], 
        default: 'normal',
        description: 'Visual importance level' 
      },
      dismissible: { type: 'boolean', required: false, default: false, description: 'Show close button' },
      timestamp: { type: 'boolean', required: false, default: true, description: 'Show timestamp' },
      className: { type: 'string', required: false, description: 'Custom CSS class' }
    },
    capabilities: {
      userInteraction: true,
      customStyling: true,
      localStorage: true
    },
    renderMethod: 'createMOTDHTML'
  },

  // Standalone widgets
  clock: {
    type: 'widget',
    description: 'Digital clock with date display',
    schema: {
      format: { 
        type: 'enum', 
        required: false, 
        values: ['12h', '24h'], 
        default: '12h',
        description: 'Time format' 
      },
      showDate: { type: 'boolean', required: false, default: true, description: 'Display date' }
    },
    capabilities: {
      realTimeUpdates: true,
      responsive: true
    },
    widgetClass: 'clock'
  },

  weather: {
    type: 'widget',
    description: 'Current weather conditions',
    schema: {
      location: { type: 'string', required: true, description: 'Zip code or city name' },
      displayName: { type: 'string', required: false, description: 'Custom location display name' },
      units: { 
        type: 'enum', 
        required: false, 
        values: ['fahrenheit', 'celsius'], 
        default: 'fahrenheit',
        description: 'Temperature units' 
      },
      apiKey: { type: 'string', required: true, description: 'OpenWeatherMap API key' }
    },
    capabilities: {
      apiIntegration: true,
      caching: true,
      responsive: true
    },
    dependencies: {
      env: ['OPENWEATHER_API_KEY'],
      apis: ['openweathermap.org']
    },
    widgetClass: 'weather'
  },

  radar: {
    type: 'widget',
    description: 'Weather radar overlay',
    schema: {
      location: { type: 'string', required: true, description: 'Zip code for radar center' },
      displayName: { type: 'string', required: false, description: 'Custom location display name' },
      apiKey: { type: 'string', required: true, description: 'OpenWeatherMap API key' }
    },
    capabilities: {
      apiIntegration: true,
      caching: true,
      interactive: true
    },
    dependencies: {
      env: ['OPENWEATHER_API_KEY'],
      apis: ['openweathermap.org']
    },
    widgetClass: 'radar'
  },

  'theme-switcher': {
    type: 'widget',
    description: 'Real-time theme switching interface',
    schema: {
      availableThemes: { 
        type: 'array', 
        required: true, 
        description: 'List of available theme names' 
      }
    },
    capabilities: {
      userInteraction: true,
      localStorage: true,
      realTimeUpdates: true
    },
    widgetClass: 'theme-switcher'
  },

  image: {
    type: 'widget',
    description: 'Display images and logos',
    schema: {
      src: { type: 'string', required: true, description: 'Image file path or URL' },
      alt: { type: 'string', required: false, description: 'Alt text for accessibility' },
      height: { type: 'string', required: false, description: 'CSS height value' },
      objectFit: { 
        type: 'enum', 
        required: false, 
        values: ['contain', 'cover', 'fill', 'scale-down'], 
        default: 'contain',
        description: 'CSS object-fit property' 
      },
      className: { type: 'string', required: false, description: 'Custom CSS class' }
    },
    capabilities: {
      customStyling: true,
      responsive: true
    },
    widgetClass: 'image'
  },

  'status-summary': {
    type: 'widget',
    description: 'Aggregate status monitoring display',
    schema: {},
    capabilities: {
      statusAggregation: true,
      realTimeUpdates: true
    },
    dependencies: {
      requires: 'Links with statusCheck enabled'
    },
    widgetClass: 'status-summary'
  },

  tailscale: {
    type: 'widget',
    description: 'Tailscale network status monitoring',
    schema: {
      // Schema to be defined based on implementation
    },
    capabilities: {
      apiIntegration: true,
      statusMonitoring: true
    },
    widgetClass: 'tailscale',
    status: 'experimental'
  }
}

/**
 * Widget validation and helper functions
 */
export class WidgetDefinition {
  static validate(widgetType, config) {
    const definition = WIDGET_REGISTRY[widgetType]
    if (!definition) {
      throw new Error(`Unknown widget type: ${widgetType}`)
    }

    const errors = []
    const schema = definition.schema

    // Validate required fields
    for (const [field, spec] of Object.entries(schema)) {
      if (spec.required && !(field in config)) {
        errors.push(`Missing required field: ${field}`)
      }

      if (field in config) {
        const value = config[field]
        
        // Type validation
        if (spec.type === 'string' && typeof value !== 'string') {
          errors.push(`Field ${field} must be a string`)
        }
        if (spec.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field ${field} must be a boolean`)
        }
        if (spec.type === 'integer' && !Number.isInteger(value)) {
          errors.push(`Field ${field} must be an integer`)
        }
        if (spec.type === 'array' && !Array.isArray(value)) {
          errors.push(`Field ${field} must be an array`)
        }
        
        // Enum validation
        if (spec.type === 'enum' && !spec.values.includes(value)) {
          errors.push(`Field ${field} must be one of: ${spec.values.join(', ')}`)
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Widget validation failed: ${errors.join(', ')}`)
    }

    return true
  }

  static getDefinition(widgetType) {
    return WIDGET_REGISTRY[widgetType]
  }

  static getAllWidgets() {
    return Object.keys(WIDGET_REGISTRY)
  }

  static getWidgetsByType(type) {
    return Object.entries(WIDGET_REGISTRY)
      .filter(([_, def]) => def.type === type)
      .map(([name, _]) => name)
  }

  static getWidgetCapabilities(widgetType) {
    const definition = WIDGET_REGISTRY[widgetType]
    return definition ? definition.capabilities : {}
  }

  static getWidgetDependencies(widgetType) {
    const definition = WIDGET_REGISTRY[widgetType]
    return definition ? definition.dependencies : {}
  }

  static getSchema(widgetType) {
    const definition = WIDGET_REGISTRY[widgetType]
    return definition ? definition.schema : {}
  }
}