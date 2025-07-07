# Configuration Reference

Complete guide to configuring your Slate dashboard through YAML files.

## Configuration Files

Slate uses a flat configuration structure with separate files:

- `config/config.yaml` - Global dashboard settings
- `config/widgets.yaml` - Widget layout and configuration
- `core/themes/*.yaml` - Theme definitions

## config/config.yaml

Global dashboard settings:

```yaml
title: "Slate Dashboard"
theme: "tokyo-night"
columns: 12
gap: "1rem"
icons:
  github: "🐙"
  gitlab: "🦊"
  docker: "🐳"
```

### Settings

- `title`: Browser title and header text
- `theme`: Theme name (must match theme file in `core/themes/`)
- `columns`: Number of grid columns (recommended: 12)
- `gap`: CSS grid gap value (e.g., "1rem", "16px")
- `icons`: Custom icon mappings (emoji, SVG, or font icons)

## config/widgets.yaml

Widget layout configuration using flat structure:

```yaml
# Groups (containers only)
dev-group:
  type: "group"
  title: "Development"
  position:
    row: 2
    column: 1
    span: 6
  collapsible: true
  collapsed: false
  backgroundColor: "#1a365d"

# Widgets reference groups
github-link:
  type: "link"
  group: "dev-group"
  name: "GitHub"
  url: "https://github.com"
  icon: "github"
  description: "Code repository"
  statusCheck: false

# Standalone widgets
header-clock:
  type: "widget"
  widget: "clock"
  position:
    row: 1
    column: 10
    span: 3
  config:
    format: "12h"
    showDate: true
```

## Widget Types

### Groups
Container widgets that hold other widgets:

```yaml
group-id:
  type: "group"
  title: "Group Title"
  position: { row: 1, column: 1, span: 6 }
  collapsible: true      # Can be collapsed
  collapsed: false       # Start collapsed
  backgroundColor: "#color"  # Optional background
```

### Links
Service/website links:

```yaml
link-id:
  type: "link"
  group: "parent-group-id"  # Optional
  name: "Service Name"
  url: "https://example.com"
  icon: "icon-name"
  description: "Optional description"
  statusCheck: true      # Check if service is up
  compact: false         # Compact display mode
```

### Widgets
Interactive components:

```yaml
widget-id:
  type: "widget"
  widget: "clock|weather|status|etc"
  position: { row: 1, column: 1, span: 3 }
  backgroundColor: "#color"  # Optional
  config:
    # Widget-specific configuration
```

## Widget-Specific Configurations

### Clock Widget
```yaml
config:
  format: "12h"        # "12h" or "24h"
  showDate: true       # Show date below time
```

### Weather Widget
```yaml
config:
  location: "30033"         # ZIP code or city
  displayName: "Atlanta"    # Display name
  units: "fahrenheit"       # "fahrenheit" or "celsius"
  apiKey: "your-api-key"    # OpenWeatherMap API key
```

### MOTD Widget
```yaml
config:
  title: "Message Title"
  message: "Your message here"
  icon: "📢"
  priority: "high"          # "high", "medium", "low"
  dismissible: true         # Can be dismissed
  timestamp: true           # Show timestamp
```

### Preview Widget
```yaml
config:
  service: "linkwarden"     # Service type
  title: "Recent Items"
  limit: 5                  # Number of items
  baseUrl: "https://..."    # Service URL
  apiKey: "your-api-key"    # Optional API key
```

## Position System

Uses CSS Grid with intuitive row/column/span syntax:

```yaml
position:
  row: 1           # Grid row (1-based)
  column: 1        # Start column (1-based)
  span: 3          # Number of columns to span
```

Examples:
- `row: 1, column: 1, span: 12` = Full width on row 1
- `row: 2, column: 1, span: 6` = Left half of row 2
- `row: 2, column: 7, span: 6` = Right half of row 2

## Theme Configuration

Themes are defined in `core/themes/*.yaml`:

```yaml
# Theme metadata
name: "Theme Name"
description: "Theme description"

# Colors
bg-primary: "#000000"
bg-secondary: "#1a1a1a"
text-primary: "#ffffff"
accent: "#3b82f6"
border: "#333333"

# Typography
font-family: "'Inter', sans-serif"
font-size-base: "1rem"
font-size-group-title: "1.1rem"
font-size-widget-title: "1rem"
font-size-widget-text: "0.9rem"

# Visual effects
shadow: "0 4px 6px rgba(0,0,0,0.1)"
radius: "0.5rem"
```

## Service Integration

Many widgets support external service integration:

### Environment Variables
Create `.env` file for API keys:

```env
OPENWEATHER_API_KEY=your_key_here
TODOIST_API_TOKEN=your_token_here
LINKWARDEN_API_KEY=your_key_here
```

### API Endpoints
The dashboard includes a built-in API server for service integration:

- `http://localhost:3001/api/obsidian` - Obsidian notes
- `http://localhost:3001/api/trilium` - Trilium notes  
- `http://localhost:3001/api/linkwarden` - Linkwarden bookmarks
- `http://localhost:3001/api/todoist` - Todoist tasks

## Advanced Configuration

### Custom Icons
```yaml
icons:
  custom-service: "🔧"
  # SVG icons
  github: '<svg viewBox="0 0 24 24">...</svg>'
  # Font icons
  docker: 'fab fa-docker'
```

### Widget Layouts
Groups support different layouts:

```yaml
layout: "grid"        # Grid layout (default)
layout: "horizontal"  # Horizontal list
```

### Responsive Behavior
The dashboard automatically adjusts:
- 12 columns on desktop
- 8 columns on tablet
- 1 column on mobile

## Validation

The dashboard validates configuration on startup:
- YAML syntax checking
- Widget type validation
- Position conflict detection
- Missing service warnings

## Hot Reload

Configuration changes are automatically detected and applied:
- Edit `config/*.yaml` files
- Dashboard updates without page refresh
- Invalid configurations show error messages

## Migration Guide

### From Legacy Format
If upgrading from nested configuration:

**Old format:**
```yaml
components:
  - type: group
    items:
      - type: link
        name: "GitHub"
```

**New format:**
```yaml
# Group definition
dev-group:
  type: group
  title: "Development"

# Link references group
github-link:
  type: link
  group: "dev-group"
  name: "GitHub"
```

## Best Practices

1. **Use semantic IDs**: `dev-group`, `github-link` vs `group1`, `link1`
2. **Group related widgets**: Keep similar services together
3. **Consistent positioning**: Use regular row/column patterns
4. **Theme consistency**: Stick to theme colors for backgrounds
5. **Status checks**: Enable for critical services only
6. **Documentation**: Comment complex configurations

## Troubleshooting

### Common Issues

**Dashboard not loading:**
- Check YAML syntax with online validator
- Verify file permissions
- Check browser console for errors

**Widgets not displaying:**
- Verify widget type spelling
- Check position conflicts
- Ensure required config fields

**Theme not applying:**
- Verify theme file exists in `core/themes/`
- Check theme name matches filename
- Validate theme YAML syntax

**Service integration failing:**
- Check API keys in `.env` file
- Verify service URLs are accessible
- Check API server logs in console