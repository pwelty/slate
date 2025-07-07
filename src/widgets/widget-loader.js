/**
 * Dynamic Widget Loader - Plugin Architecture
 * 
 * Discovers and loads self-contained widgets that export:
 * - WIDGET_DEFINITION (schema, capabilities, templates)
 * - default class (widget implementation)
 */

export class WidgetLoader {
  constructor() {
    this.widgetCache = new Map()
    this.definitionCache = new Map()
  }

  /**
   * Load a widget module and cache it
   */
  async loadWidgetModule(widgetType) {
    if (this.widgetCache.has(widgetType)) {
      return this.widgetCache.get(widgetType)
    }

    const widgetRegistry = {
      // Service widgets
      trilium: () => import('../../core/widgets/trilium.js'),
      obsidian: () => import('../../core/widgets/obsidian.js'),
      todoist: () => import('../../core/widgets/todoist.js'),
      preview: () => import('../../core/widgets/preview.js'),
      
      // UI widgets
      clock: () => import('../../core/widgets/clock.js'),
      weather: () => import('../../core/widgets/weather.js'),
      radar: () => import('../../core/widgets/radar.js'),
      'theme-switcher': () => import('../../core/widgets/theme-switcher.js'),
      image: () => import('../../core/widgets/image.js'),
      'status-summary': () => import('../../core/widgets/status-summary.js'),
      
      // Special widgets
      motd: () => import('../../core/widgets/motd.js'),
      status: () => import('../../core/widgets/status.js'),
      tailscale: () => import('../../core/widgets/tailscale.js')
    }

    if (!widgetRegistry[widgetType]) {
      throw new Error(`Widget type "${widgetType}" not found`)
    }

    try {
      const module = await widgetRegistry[widgetType]()
      this.widgetCache.set(widgetType, module)
      
      // Cache widget definition if available
      if (module.WIDGET_DEFINITION) {
        this.definitionCache.set(widgetType, module.WIDGET_DEFINITION)
      }
      
      return module
    } catch (error) {
      throw new Error(`Failed to load widget "${widgetType}": ${error.message}`)
    }
  }

  /**
   * Get widget definition (schema, capabilities, templates)
   */
  async getWidgetDefinition(widgetType) {
    if (this.definitionCache.has(widgetType)) {
      return this.definitionCache.get(widgetType)
    }

    const module = await this.loadWidgetModule(widgetType)
    return module.WIDGET_DEFINITION || null
  }

  /**
   * Validate widget configuration against its schema
   */
  async validateWidget(widgetType, config) {
    const definition = await this.getWidgetDefinition(widgetType)
    if (!definition || !definition.schema) {
      // Widget not converted to new format yet - skip validation
      console.log(`⚠ Widget ${widgetType} using legacy format (no WIDGET_DEFINITION)`)
      return { valid: true, warnings: [`Widget ${widgetType} using legacy format`], config }
    }

    const errors = []
    const warnings = []
    const schema = definition.schema

    // Check required fields
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
      } else if (spec.default !== undefined) {
        // Apply default value
        config[field] = spec.default
        warnings.push(`Applied default value for ${field}: ${spec.default}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      config // Return config with defaults applied
    }
  }

  /**
   * Get all available widgets
   */
  async getAvailableWidgets() {
    // This could be made dynamic by scanning the widgets directory
    return [
      'trilium', 'obsidian', 'todoist', 'preview',
      'clock', 'weather', 'radar', 'theme-switcher', 'image', 'status-summary',
      'motd', 'status', 'tailscale'
    ]
  }

  /**
   * Get widget capabilities
   */
  async getWidgetCapabilities(widgetType) {
    const definition = await this.getWidgetDefinition(widgetType)
    return definition ? definition.capabilities : {}
  }

  /**
   * Get widget dependencies
   */
  async getWidgetDependencies(widgetType) {
    const definition = await this.getWidgetDefinition(widgetType)
    return definition ? definition.dependencies : {}
  }

  /**
   * Create widget instance with validation
   */
  async createWidget(widgetType, container, config) {
    // Validate configuration
    const validation = await this.validateWidget(widgetType, config)
    if (!validation.valid) {
      throw new Error(`Widget validation failed: ${validation.errors.join(', ')}`)
    }

    // Log any warnings
    if (validation.warnings.length > 0) {
      console.warn(`Widget ${widgetType} warnings:`, validation.warnings)
    }

    // Load widget module
    const module = await this.loadWidgetModule(widgetType)
    if (!module.default) {
      throw new Error(`Widget "${widgetType}" does not export a default class`)
    }

    // Create and return widget instance
    return new module.default(container, validation.config)
  }

  /**
   * Get widget template by name
   */
  async getWidgetTemplate(widgetType, templateName) {
    const definition = await this.getWidgetDefinition(widgetType)
    if (!definition || !definition.templates) {
      return null
    }
    return definition.templates[templateName]
  }

  /**
   * Check if widget has specific capability
   */
  async hasCapability(widgetType, capability) {
    const capabilities = await this.getWidgetCapabilities(widgetType)
    return capabilities[capability] === true
  }

  /**
   * Get widgets by capability
   */
  async getWidgetsByCapability(capability) {
    const widgets = await this.getAvailableWidgets()
    const result = []

    for (const widgetType of widgets) {
      if (await this.hasCapability(widgetType, capability)) {
        result.push(widgetType)
      }
    }

    return result
  }
}

// Global widget loader instance
export const widgetLoader = new WidgetLoader()