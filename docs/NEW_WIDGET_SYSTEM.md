# New YAML-Based Widget System

## Overview

The new widget system centralizes widget rendering and separates **Widget TYPE definitions** (YAML) from **Widget INSTANCE configurations**. This provides better maintainability, consistency, and easier widget development.

## Architecture

### Before (JavaScript Classes)
```
Widget Definition (JS Class) + Widget Instance (Config) → Rendered Widget
```

### After (YAML + Centralized Renderer)
```
Widget TYPE (YAML Definition) + Widget INSTANCE (Config) → Centralized Renderer → Rendered Widget
```

## Key Components

### 1. Widget Definitions (`src/widgets/definitions/`)
YAML files that define widget behavior, templates, and capabilities:

```yaml
# clock.yaml
metadata:
  type: "ui"
  description: "Real-time clock display"
  
schema:
  format:
    type: "string"
    default: "12h"
    enum: ["12h", "24h"]
    
templates:
  main: |
    <div class="clock-widget">
      <div class="clock-time">{{time}}</div>
      {{#if showDate}}
      <div class="clock-date">{{date}}</div>
      {{/if}}
    </div>
    
dataProcessing:
  generateData: |
    function(config) {
      const now = new Date();
      return {
        time: now.toLocaleTimeString(),
        showDate: config.showDate
      };
    }
```

### 2. Widget Renderer (`src/scripts/widget_renderer.py`)
Python server-side renderer that:
- Loads YAML widget definitions
- Validates configurations against schemas
- Handles templating and data processing
- Renders widgets to HTML at build time
- Integrates with theme system

### 3. Widget Instances (Configuration)
Same as before - configuration objects that specify how a widget should behave:

```yaml
# config/widgets.yaml
header-clock:
  type: "widget"
  widget: "clock"
  config:
    format: "12h"
    showDate: true
```

## Widget Definition Schema

### Complete YAML Structure
```yaml
# Widget metadata
metadata:
  type: "ui|api|service"        # Widget category
  description: "Description"    # Human-readable description
  version: "1.0.0"             # Version number
  author: "Author Name"        # Author

# Configuration schema (what config this widget accepts)
schema:
  fieldName:
    type: "string|integer|boolean"
    required: true|false
    default: "defaultValue"
    enum: ["option1", "option2"]  # For restricted values
    description: "Field description"

# Widget capabilities
capabilities:
  realTimeUpdates: true|false    # Does widget update automatically
  userInteraction: true|false    # Does widget respond to user actions
  apiIntegration: true|false     # Does widget call APIs
  caching: true|false           # Should API responses be cached
  responsive: true|false        # Is widget responsive

# API configuration (for widgets with apiIntegration: true)
api:
  baseUrl: "https://api.example.com"
  method: "GET|POST|PUT|DELETE"
  headers:
    "Content-Type": "application/json"
  buildUrl: |
    function(config) {
      return `${baseUrl}?key=${config.apiKey}`;
    }

# HTML templates for different states
templates:
  main: |
    <div class="widget-main">{{content}}</div>
  loading: |
    <div class="widget-loading">Loading...</div>
  error: |
    <div class="widget-error">{{error}}</div>

# Data processing functions
dataProcessing:
  generateData: |
    function(config) {
      return { data: 'processed' };
    }
  transformApiData: |
    function(apiData, config) {
      return { transformed: apiData };
    }
  handleError: |
    function(error, config) {
      return { error: error.message };
    }

# Widget lifecycle hooks
lifecycle:
  init: |
    function(container, config) {
      // Initialize widget
    }
  destroy: |
    function(container) {
      // Clean up widget
    }

# Styling information
styling:
  classes:
    - "widget-class"
    - "widget-specific-class"
  defaultStyles: |
    .widget-class {
      padding: 1rem;
    }
```

## Widget Types

### 1. UI Widgets
Simple widgets that display static or dynamic content:
- **Clock**: Real-time clock display
- **Image**: Image/logo display
- **Theme Switcher**: UI theme selection

### 2. API Widgets  
Widgets that integrate with external APIs:
- **Weather**: Weather data from OpenWeatherMap
- **Status**: Service status monitoring

### 3. Service Widgets
Widgets that integrate with specific services:
- **Todoist**: Task management
- **Trilium**: Note management
- **Obsidian**: Note management

## Usage Examples

### 1. Dashboard Rendering
```bash
# Render complete dashboard with dark theme
python src/scripts/dashboard_renderer.py --theme dark

# Render with different theme
python src/scripts/dashboard_renderer.py --theme synthwave
```

### 2. Individual Widget Rendering
```bash
# Render a specific widget
python src/scripts/widget_renderer.py --widget header-clock --theme dark

# Render to custom output file
python src/scripts/widget_renderer.py --widget weather --output weather-widget.html
```

### 3. Theme Building
```bash
# Build all themes
python src/scripts/theme_renderer.py --themes-dir src/themes --dist-dir dist

# Build specific theme
python src/scripts/theme_renderer.py --theme dark --themes-dir src/themes --dist-dir dist
```

## Template Engine

The system uses a simple template engine that supports:

### Variable Substitution
```html
<div class="widget-title">{{title}}</div>
<div class="widget-value">{{value}}</div>
```

### Conditional Rendering
```html
{{#if showDate}}
<div class="widget-date">{{date}}</div>
{{/if}}
```

### Nested Properties
```html
<div class="user-name">{{user.name}}</div>
<div class="user-email">{{user.email}}</div>
```

## Data Processing

### Static Data Generation
```javascript
generateData: |
  function(config) {
    return {
      timestamp: new Date().toISOString(),
      message: config.message || 'Hello World'
    };
  }
```

### API Data Transformation
```javascript
transformApiData: |
  function(apiData, config) {
    return {
      temperature: Math.round(apiData.main.temp),
      condition: apiData.weather[0].description,
      location: config.displayName || apiData.name
    };
  }
```

### Error Handling
```javascript
handleError: |
  function(error, config) {
    if (error.message.includes('401')) {
      return { error: 'Invalid API key' };
    }
    return { error: error.message };
  }
```

## Widget Lifecycle

### Initialization
```javascript
init: |
  function(container, config) {
    // Set up event listeners
    // Start timers
    // Initialize state
  }
```

### Cleanup
```javascript
destroy: |
  function(container) {
    // Clear timers
    // Remove event listeners
    // Clean up resources
  }
```

## Migration Guide

### From JavaScript Classes to YAML

1. **Extract Templates**: Move HTML generation to YAML templates
2. **Extract Configuration**: Move schema validation to YAML schema
3. **Extract Logic**: Move data processing to YAML functions
4. **Update Imports**: Change from widget classes to widget renderer

### Example Migration

**Before (JavaScript Class):**
```javascript
export default class ClockWidget {
  constructor(container, config) {
    this.container = container;
    this.config = config;
  }
  
  render() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    
    this.container.innerHTML = `
      <div class="clock-widget">
        <div class="clock-time">${time}</div>
      </div>
    `;
  }
}
```

**After (YAML Definition):**
```yaml
templates:
  main: |
    <div class="clock-widget">
      <div class="clock-time">{{time}}</div>
    </div>

dataProcessing:
  generateData: |
    function(config) {
      const now = new Date();
      return {
        time: now.toLocaleTimeString()
      };
    }
```

## Benefits

1. **Separation of Concerns**: Widget logic separated from presentation
2. **Consistency**: All widgets follow the same structure
3. **Maintainability**: Easier to modify templates without touching logic
4. **Reusability**: Widget definitions can be shared across projects
5. **Configuration**: Centralized configuration validation
6. **Debugging**: Better error handling and logging
7. **Performance**: Built-in caching and optimization

## Testing

Use the test file `test-new-widgets.html` to test the new system:

```bash
# Serve the project
npm run serve

# Navigate to test file
open http://localhost:5173/test-new-widgets.html
```

The test interface allows you to:
- Test different widget types
- Modify configurations in real-time
- See error handling in action
- Understand the rendering process

## File Structure

```
src/
├── scripts/               # Python rendering system
│   ├── dashboard_renderer.py  # Complete dashboard rendering
│   ├── widget_renderer.py     # Individual widget rendering
│   └── theme_renderer.py      # Theme CSS generation
├── widgets/               # YAML widget definitions
│   ├── clock.yaml
│   ├── image.yaml
│   ├── weather.yaml
│   └── ...
├── themes/               # Theme definitions
│   ├── dark.yaml
│   ├── light.yaml
│   └── ...
└── template/             # Base templates and assets
    ├── index.html
    ├── css/
    └── js/
```

This new system provides a more maintainable, consistent, and powerful foundation for widget development in the Slate Dashboard. 