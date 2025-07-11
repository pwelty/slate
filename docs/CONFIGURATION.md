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

Themes are defined in `src/themes/*.yaml` and support both basic styling and advanced visual effects:

### Basic Theme Structure
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

### Available Themes
- **`dark`**: Clean dark theme (default)
- **`light`**: Clean light theme
- **`retro`**: Classic terminal green on black with monospace fonts
- **`synthwave`**: 80s neon aesthetics with visual effects
- **`tokyo-night`**: Popular VS Code theme adaptation
- **`ocean`**: Blue-based calming theme

### Enhanced Theme Features (Stock Effects System)

Modern themes support the **Stock Effects System** for advanced visual enhancements:

#### Stock Effects Integration
```yaml
# In theme.yaml
effects:
  # Global page effects
  page-effects:
    - "grid-overlay"            # Tron-style grid background
    - "scanlines"               # CRT screen scanlines

  # Widget effects
  widget-effects:
    - "neon-glow-border"        # Neon border glow on all widgets
    - "pulse-border"            # Pulsing border animation

  # Hover effects
  hover-effects:
    - "hover-pulse"             # Pulse glow on hover
    - "hover-electric"          # Electric border on hover

# Effect color configuration
effect-colors:
  primary: "255, 0, 128"        # RGB values for CSS rgba
  secondary: "0, 255, 255"      # Electric cyan
  accent: "131, 56, 236"        # Purple accent

# Effect timing
effect-timing:
  pulse-speed: "2.5s"           # Pulse animation speed
  electric-speed: "4s"          # Electric border rotation
  glow-speed: "3s"              # Breathing glow effect
```

#### Advanced Gradient System
```yaml
# Complex gradients for modern themes
gradients:
  primary: "linear-gradient(135deg, #0f0f23 0%, #1a0b2e 40%, #2d1b69 80%, #8338ec 100%)"
  accent: "linear-gradient(90deg, #ff0080 0%, #00ffff 50%, #ff006e 100%)"
  neon: "linear-gradient(45deg, #ff0080, #ff006e, #8338ec, #00ffff, #ff0080)"
```

#### Font Loading System
```yaml
# Google Fonts integration
fonts:
  google-fonts:
    - family: "Orbitron"
      weights: [400, 700, 900]
      display: "swap"
    - family: "Exo 2"
      weights: [300, 400, 600, 800]
      display: "swap"

# Font fallback definitions
font-family: "'Orbitron', 'Exo 2', 'Rajdhani', sans-serif"
font-family-mono: "'Share Tech Mono', 'Source Code Pro', monospace"
```

#### Widget-Specific Enhancements
```yaml
# Theme can specify widget-specific effects
widget-enhancements:
  weather:
    effects: ["neon-glow-border", "pulse-glow", "hover-electric"]
    colors: ["primary", "secondary"]
    gradients: ["accent"]
    
  status-summary:
    effects: ["electric-border", "neon-glow", "hover-pulse"]
    colors: ["primary", "accent"]
    gradients: ["primary"]
```

#### Custom CSS Integration
```yaml
# Advanced themes can include custom CSS
custom-css: |
  /* Theme-specific enhancements */
  [data-theme="mytheme"] .widget {
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 0, 128, 0.6);
  }
  
  [data-theme="mytheme"] .widget:hover {
    animation: pulse-glow 2s ease-in-out infinite;
  }
```

### Stock Effects Available

#### Border & Glow Effects
- **`neon-glow-border`**: Glowing neon border around elements
- **`electric-border`**: Animated electric border with rotating gradient
- **`pulse-border`**: Subtle pulsing border animation
- **`pulse-glow`**: Pulsing glow effect that breathes

#### Background Effects
- **`grid-overlay`**: Tron-style grid pattern overlay
- **`scanlines`**: CRT screen scanline effect
- **`retro-gradient-bg`**: Animated gradient backgrounds

#### Text Effects
- **`neon-glow`**: Glowing text effect with theme colors
- **`chromatic-aberration`**: Retro text distortion effect

#### Interactive Effects
- **`hover-pulse`**: Pulse effect on mouse hover
- **`hover-electric`**: Electric border effect on hover
- **`hover-glow`**: Enhanced glow effect on hover

### Theme Activation

Set theme in your dashboard configuration:
```yaml
# In config/dashboard.yaml
theme: "synthwave"              # Use enhanced synthwave theme
```

### Creating Custom Themes

1. **Create theme file**: `src/themes/mytheme.yaml`
2. **Define basic colors and typography**
3. **Add stock effects** (optional)
4. **Test with different widgets**
5. **Update theme switcher** to include your theme

### Performance Considerations

- **Stock effects use CSS animations** for optimal performance
- **Google Fonts load asynchronously** to prevent blocking
- **Effects are hardware-accelerated** where possible
- **Minimal JavaScript overhead** - most effects are pure CSS

### Theme Examples

#### Retro Theme (Terminal Style)
```yaml
name: "Retro"
bg-primary: "#000000"           # Pure black
text-primary: "#00ff00"         # Bright green
font-family-mono: "'Courier New', monospace"
effects:
  page-effects: ["scanlines"]
  widget-effects: ["neon-glow-border"]
```

#### Synthwave Theme (80s Neon)
```yaml
name: "Synthwave"
bg-primary: "#0f0f23"           # Deep space purple
text-primary: "#ff0080"         # Hot magenta
effects:
  page-effects: ["grid-overlay", "scanlines"]
  widget-effects: ["neon-glow-border", "pulse-border"]
  hover-effects: ["hover-electric"]
```

The theme system now supports everything from simple color changes to complex visual effects that transform your entire dashboard experience.

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