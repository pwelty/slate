# Configuration Reference

Complete guide to configuring your Slate dashboard through the unified YAML configuration system.

## 📄 Configuration Overview

Slate uses a **single configuration file** for all dashboard settings:

- `config/dashboard.yaml` - Complete dashboard configuration (global settings + layout + widgets)

The old split configuration (`config/config.yaml` + `config/widgets.yaml`) has been unified into one comprehensive file.

## 🗂️ Configuration Structure

```yaml
# Global Dashboard Settings
dashboard:
  title: "My Dashboard"
  theme: "ocean"
  columns: 12
  gap: "1rem"

# Widget Layout and Configuration
components:
  - id: "header-clock"
    type: "clock"
    position: { row: 1, column: 10, width: 3, height: 1 }
    config:
      format: "12h"
      showDate: true
      
  - id: "recent-activity"
    type: "group"
    title: "Recent Activity"
    position: { row: 3, column: 1, width: 9, height: 1 }
    items:
      - type: "trilium"
        config:
          baseUrl: "https://trilium.example.com"
          apiToken: "your-token"
```

## 🌐 Global Dashboard Settings

Configure overall dashboard behavior and appearance:

```yaml
dashboard:
  title: "Slate Dashboard"        # Browser title and header
  subtitle: "Personal Dashboard"  # Optional subtitle
  theme: "ocean"                  # Theme name (see Available Themes)
  author: "Your Name"            # Dashboard author
  version: "2.0.0"               # Version for reference
  columns: 12                    # Grid system columns (recommended: 12)
  gap: "1rem"                    # CSS gap between grid items
  allowRowExpansion: true        # Allow content to expand rows
  
  # Row height configuration (choose one approach)
  rowHeights: ["100px", "120px", "120px", "120px", "100px"]
  maxRowHeight: "250px"          # Maximum row expansion height
```

### Dashboard Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `title` | string | "Slate" | Browser title and header text |
| `subtitle` | string | "Personal Dashboard" | Optional subtitle text |
| `theme` | string | "ocean" | Theme name (must exist in `src/themes/`) |
| `columns` | integer | 12 | Number of grid columns |
| `gap` | string | "1rem" | CSS grid gap (e.g., "1rem", "16px") |
| `allowRowExpansion` | boolean | true | Allow rows to expand with content |
| `rowHeights` | array | - | Specific height for each row |
| `maxRowHeight` | string | "250px" | Maximum row expansion height |

## 🧩 Component Configuration

Components are the building blocks of your dashboard. Each component has:

- **id**: Unique identifier
- **type**: Component type (`widget`, `group`, or specific widget type)
- **position**: Grid placement
- **config**: Component-specific settings

### Position System

All components use a consistent position system:

```yaml
position:
  row: 1        # Grid row (1-based)
  column: 1     # Start column (1-based) 
  width: 3      # Number of columns to span
  height: 1     # Number of rows to span (usually 1)
```

**Common Layout Patterns:**
- `row: 1, column: 1, width: 12` - Full width header
- `row: 2, column: 1, width: 6` - Left half
- `row: 2, column: 7, width: 6` - Right half
- `row: 3, column: 1, width: 9` - Three-quarters width
- `row: 3, column: 10, width: 3` - One-quarter width

## 🔧 Widget Types

### Clock Widget

Real-time clock with customizable format:

```yaml
- id: "header-clock"
  type: "clock"
  position: { row: 1, column: 10, width: 3, height: 1 }
  config:
    format: "12h"          # "12h" or "24h"
    showDate: true         # Show date below time
    centered: true         # Center alignment
```

### Weather Widget

OpenWeatherMap integration with current conditions:

```yaml
- id: "weather-widget"
  type: "weather"
  position: { row: 3, column: 10, width: 3, height: 1 }
  config:
    location: "30033"              # ZIP code or city name
    displayName: "Atlanta, GA"     # Custom display name
    units: "fahrenheit"            # "fahrenheit" or "celsius"
    apiKey: "your-openweather-key" # OpenWeatherMap API key
```

### Forecast Widget

Extended weather forecast:

```yaml
- id: "forecast-widget"  
  type: "forecast"
  position: { row: 4, column: 10, width: 3, height: 1 }
  config:
    location: "30033"
    displayName: "Atlanta, GA"
    units: "fahrenheit"
    apiKey: "your-openweather-key"
    days: 5                        # Number of forecast days
```

### Text Widget

Custom text content with formatting:

```yaml
- id: "welcome-text"
  type: "text"
  position: { row: 1, column: 3, width: 4, height: 1 }
  config:
    title: "Welcome"               # Optional title
    content: "Welcome to your dashboard!"
    alignment: "center"            # "left", "center", "right"
    size: "medium"                 # "small", "medium", "large"
```

### Image Widget

Display logos or images:

```yaml
- id: "slate-logo"
  type: "image"
  position: { row: 1, column: 1, width: 2, height: 1 }
  config:
    src: "images/slate_logo_821_286.png"
    alt: "Slate Logo"
    height: "60px"                 # Optional height constraint
    objectFit: "contain"           # CSS object-fit property
```

### Status Summary Widget

System status overview:

```yaml
- id: "status-summary"
  type: "status-summary"
  position: { row: 1, column: 7, width: 3, height: 1 }
  config:
    title: "Services"
    refreshInterval: 30000         # Refresh every 30 seconds
```

## 🔗 Service Integration Widgets

### Trilium Notes

Recent notes from Trilium:

```yaml
- type: "trilium"
  config:
    title: "Recent Notes"
    baseUrl: "https://trilium.example.com"
    apiToken: "your-etapi-token"   # From Trilium ETAPI
    limit: 5                       # Number of notes to display
```

**Setup:**
1. Enable ETAPI in Trilium
2. Generate API token
3. Use token in configuration

### Linkwarden Bookmarks

Recent bookmarks from Linkwarden:

```yaml
- type: "linkwarden"  
  config:
    title: "Recent Bookmarks"
    icon: "📚"
    baseUrl: "https://linkwarden.example.com"
    apiKey: "your-linkwarden-api-key"
    limit: 5
```

**Setup:**
1. Generate API key in Linkwarden settings
2. Use API key in configuration

### Todoist Tasks

Recent tasks from Todoist:

```yaml
- type: "todoist"
  config:
    title: "Recent Tasks"
    icon: "✅"
    apiToken: "your-todoist-token"
    projectName: "Dashboard"       # Optional: filter by project
    limit: 5
```

**Setup:**
1. Get API token from Todoist settings
2. Use token in configuration

### Weather Radar

Interactive weather radar:

```yaml
- id: "radar-widget"
  type: "radar"
  position: { row: 4, column: 8, width: 2, height: 1 }
  config:
    location: "30033"
    displayName: "Atlanta, GA"
    apiKey: "your-openweather-key"
```

## 📁 Group Widgets

Groups organize related widgets together:

```yaml
- id: "dev-group"
  type: "group"
  title: "Development"
  position: { row: 2, column: 1, width: 6, height: 1 }
  collapsed: false                 # Start expanded/collapsed
  items:
    - type: "link"
      name: "GitHub"
      url: "https://github.com"
      icon: "🐙"
      description: "Code repository"
      statusCheck: false           # Optional status monitoring
      
    - type: "link" 
      name: "GitLab"
      url: "https://gitlab.com"
      icon: "🦊"
      description: "Alternative Git hosting"
```

### Group Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Group display title |
| `collapsed` | boolean | Start collapsed (false = expanded) |
| `items` | array | Array of links or widgets in the group |

### Link Items

Links within groups support:

```yaml
- type: "link"
  name: "Service Name"             # Display name
  url: "https://example.com"       # Target URL
  icon: "🔧"                       # Icon (emoji or Unicode)
  description: "Service description" # Optional description
  statusCheck: true                # Monitor service status
  width: 3                         # Optional: columns to span in group
```

## 🎨 Theme Configuration

Set the active theme:

```yaml
dashboard:
  theme: "ocean"                   # Theme name
```

### Available Themes

| Theme | Description | Best For |
|-------|-------------|----------|
| `ocean` | Calming blue with wave animations | Default, professional |
| `dark` | Clean dark theme | Minimalist setups |
| `light` | Bright minimalist theme | Daytime use |
| `tokyo-night` | Popular VS Code theme | Developer environments |
| `synthwave` | 80s neon cyberpunk | Fun, animated setups |
| `retro` | Terminal green-on-black | Classic computing feel |

### Theme Features

Themes control:
- **Colors** - Background, text, accent colors
- **Typography** - Font families and sizes
- **Visual Effects** - Animations and special effects
- **Spacing** - Margins, padding, border radius

## 🔧 Advanced Configuration

### Custom Row Heights

Define specific heights for each row:

```yaml
dashboard:
  # Specific heights for rows 1-5
  rowHeights: ["80px", "120px", "140px", "120px", "100px"]
  maxRowHeight: "250px"
```

### Service Integration Setup

Many widgets require API keys or tokens. Set these in your configuration:

```yaml
# Recommended: Use environment variables for sensitive data
- type: "weather"
  config:
    apiKey: "${OPENWEATHER_API_KEY}"   # Environment variable
```

Or create a `.env` file:
```bash
OPENWEATHER_API_KEY=your_key_here
TODOIST_API_TOKEN=your_token_here
TRILIUM_API_TOKEN=your_token_here
```

### Grid System Details

Slate uses a 12-column CSS Grid system:

- **Desktop**: 12 columns
- **Tablet**: 8 columns (automatic responsive)
- **Mobile**: 1 column (stacked layout)

**Planning Your Layout:**
1. Sketch your desired layout
2. Assign row numbers (top to bottom)
3. Calculate column spans for each element
4. Test on different screen sizes

### Background Colors

Add custom backgrounds to widgets or groups:

```yaml
- id: "special-group"
  type: "group"
  backgroundColor: "rgba(45, 74, 34, 0.7)"   # Semi-transparent green
  # ... rest of configuration
```

## 🔍 Validation and Debugging

### Configuration Validation

Slate validates your configuration on build:

- **YAML syntax** checking
- **Widget type** validation  
- **Position conflict** detection
- **Missing required fields** warnings
- **Service connectivity** testing

### Common Issues

**Dashboard not loading:**
```bash
# Check YAML syntax
python3 -c "import yaml; yaml.safe_load(open('config/dashboard.yaml'))"
```

**Widgets not displaying:**
- Verify widget type spelling
- Check position conflicts (overlapping widgets)
- Ensure required config fields are present

**Service integration failing:**
- Verify API keys/tokens are correct
- Check service URLs are accessible
- Review API rate limits

### Debug Mode

Build with verbose output:
```bash
python3 src/scripts/dashboard_renderer.py --debug
```

## 📝 Configuration Examples

### Minimal Configuration

```yaml
dashboard:
  title: "Simple Dashboard"
  theme: "dark"

components:
  - id: "clock"
    type: "clock"  
    position: { row: 1, column: 1, width: 12, height: 1 }
    config:
      format: "24h"
```

### Complete Configuration

```yaml
dashboard:
  title: "My Complete Dashboard"
  subtitle: "Personal Hub"
  theme: "ocean"
  columns: 12
  gap: "1rem"
  rowHeights: ["100px", "120px", "120px", "120px", "100px"]
  maxRowHeight: "250px"

components:
  # Header row
  - id: "logo"
    type: "image"
    position: { row: 1, column: 1, width: 2, height: 1 }
    config:
      src: "images/logo.png"
      
  - id: "welcome"
    type: "text"
    position: { row: 1, column: 3, width: 4, height: 1 }
    config:
      content: "Welcome to my dashboard!"
      alignment: "center"
      
  - id: "status"
    type: "status-summary"
    position: { row: 1, column: 7, width: 3, height: 1 }
    
  - id: "clock"
    type: "clock"
    position: { row: 1, column: 10, width: 3, height: 1 }
    config:
      format: "12h"
      showDate: true

  # Services row
  - id: "dev-services"
    type: "group"
    title: "Development"
    position: { row: 2, column: 1, width: 6, height: 1 }
    items:
      - type: "link"
        name: "GitHub"
        url: "https://github.com"
        icon: "🐙"
        statusCheck: true

  - id: "tools-services"  
    type: "group"
    title: "Tools"
    position: { row: 2, column: 7, width: 6, height: 1 }
    items:
      - type: "link"
        name: "Gmail"
        url: "https://gmail.com"
        icon: "📧"

  # Activity row
  - id: "recent-activity"
    type: "group"
    title: "Recent Activity"
    position: { row: 3, column: 1, width: 9, height: 1 }
    items:
      - type: "trilium"
        config:
          baseUrl: "https://trilium.example.com"
          apiToken: "your-token"
          limit: 3
          
      - type: "todoist"
        config:
          apiToken: "your-token"
          limit: 3

  # Weather widget
  - id: "weather"
    type: "weather"
    position: { row: 3, column: 10, width: 3, height: 1 }
    config:
      location: "30033"
      apiKey: "your-key"
```

## 🚀 Next Steps

1. **Start Simple** - Begin with a minimal configuration
2. **Add Gradually** - Add widgets one at a time
3. **Test Frequently** - Rebuild after each change
4. **Customize Themes** - Experiment with different themes
5. **Integrate Services** - Connect your favorite tools

For widget-specific details, see [Widget Reference](WIDGET_DEFINITIONS.md).
For theme customization, see [Theming Guide](THEMING_ARCHITECTURE.md).