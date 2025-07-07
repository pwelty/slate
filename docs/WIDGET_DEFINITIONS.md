# Slate Dashboard - Widget Definitions

This file documents all available widgets, their configuration options, and usage examples.

## Widget Types

### 1. Group Widget
**Purpose**: Container that organizes other widgets with collapsible functionality

**Configuration**:
```yaml
- id: "my-group"
  type: "group"
  title: "Group Title"
  position:
    row: 2
    column: 1
    span: 6
  collapsed: false                    # Optional: start collapsed
  backgroundColor: "#1a365d"          # Optional: custom background
  items:
    - type: "link"                    # Child widgets
      name: "Example"
      url: "https://example.com"
```

**Options**:
- `title`: Group header text
- `collapsed`: Boolean, whether group starts collapsed
- `backgroundColor`: CSS color/gradient for background
- `items`: Array of child widgets

---

### 2. Link Widget
**Purpose**: Displays clickable links with optional status monitoring

**Configuration**:
```yaml
- type: "link"
  name: "GitHub"
  url: "https://github.com"
  icon: "github"                      # Optional: icon name
  description: "Code repository"      # Optional: subtitle
  statusCheck: true                   # Optional: enable health check
  compact: false                      # Optional: compact display
```

**Options**:
- `name`: Display name for the link
- `url`: Target URL (opens in new tab)
- `icon`: Icon name from icon mapping
- `description`: Optional subtitle text
- `statusCheck`: Boolean, enables HTTP health monitoring
- `compact`: Boolean, minimal display mode

---

### 3. Preview Widget
**Purpose**: Shows recent items from external services

**Configuration**:
```yaml
- type: "preview"
  config:
    service: "trilium"                # Required: trilium, linkwarden, obsidian
    title: "Recent Notes"             # Optional: custom title
    limit: 3                          # Optional: number of items (default: 3)
```

**Supported Services**:
- `trilium`: Recent notes from Trilium
- `linkwarden`: Recent bookmarks from Linkwarden
- `obsidian`: Recent notes from Obsidian (limited functionality)

---

### 4. Trilium Widget
**Purpose**: Displays Trilium notes filtered by tag

**Configuration**:
```yaml
- type: "trilium"
  config:
    tag: "dashboard_search"           # Required: tag to search for
    maxNotes: 2                       # Optional: max notes to display
```

**Options**:
- `tag`: Trilium tag to search for (without # prefix)
- `maxNotes`: Maximum number of notes to display

**Note**: Requires TRILIUM_TOKEN and TRILIUM_URL in environment

---

### 5. Obsidian Widget
**Purpose**: Displays Obsidian notes (limited tag search)

**Configuration**:
```yaml
- type: "obsidian"
  config:
    vaultPath: "/path/to/vault/"      # Required: vault path
    tag: "search"                     # Limited functionality
    maxNotes: 2                       # Optional: max notes
    apiUrl: "http://localhost:27123"  # Required: API URL
    apiKey: "your-api-key"            # Required: API key
```

**Limitations**: Obsidian Local REST API doesn't support tag search

---

### 6. Todoist Widget
**Purpose**: Displays tasks from Todoist

**Configuration**:
```yaml
- type: "todoist"
  config:
    apiToken: "your-token"            # Required: Todoist API token
    projectName: "Dashboard"          # Optional: filter by project
    tag: "search"                     # Optional: filter by tag
    maxTasks: 3                       # Optional: max tasks to display
```

**Options**:
- `apiToken`: Todoist API token
- `projectName`: Filter tasks by project name
- `tag`: Filter tasks by tag
- `maxTasks`: Maximum number of tasks to display

---

### 7. MOTD Widget
**Purpose**: Message of the Day - displays announcements and alerts

**Configuration**:
```yaml
- type: "motd"
  title: "System Alert"               # Optional: message title
  message: "Server maintenance tonight" # Required: message content
  icon: "🚨"                         # Optional: emoji/icon
  priority: "high"                    # Optional: low, normal, high
  dismissible: true                   # Optional: show X button
  timestamp: true                     # Optional: show timestamp
  className: "custom-class"           # Optional: CSS class
```

**Options**:
- `title`: Header text for the message
- `message`: Main message content
- `icon`: Emoji or icon to display
- `priority`: Visual importance (affects styling)
- `dismissible`: Whether users can close the message
- `timestamp`: Show last updated time
- `className`: Custom CSS class for styling

---

### 8. Weather Widget
**Purpose**: Current weather conditions

**Configuration**:
```yaml
- id: "weather-widget"
  type: "widget"
  widget: "weather"
  position:
    row: 3
    column: 10
    span: 3
  config:
    location: "30033"                 # Required: zip code or city
    displayName: "Decatur, GA"        # Optional: custom display name
    units: "fahrenheit"               # Optional: fahrenheit, celsius
    apiKey: "your-openweather-key"    # Required: OpenWeatherMap API key
```

**Requirements**: OpenWeatherMap API key

---

### 9. Radar Widget
**Purpose**: Weather radar overlay

**Configuration**:
```yaml
- id: "radar-widget"
  type: "widget"
  widget: "radar"
  config:
    location: "30033"                 # Required: zip code for center
    displayName: "Decatur, GA"        # Optional: display name
    apiKey: "your-openweather-key"    # Required: OpenWeatherMap API key
```

---

### 10. Clock Widget
**Purpose**: Digital clock with date

**Configuration**:
```yaml
- id: "header-clock"
  type: "widget"
  widget: "clock"
  config:
    format: "12h"                     # Optional: 12h, 24h
    showDate: true                    # Optional: show date
```

---

### 11. Theme Switcher Widget
**Purpose**: Real-time theme switching

**Configuration**:
```yaml
- id: "theme-switcher"
  type: "widget"
  widget: "theme-switcher"
  config:
    availableThemes: ["dark", "light", "retro", "synthwave", "tokyo-night"]
```

---

### 12. Image Widget
**Purpose**: Display images/logos

**Configuration**:
```yaml
- id: "logo"
  type: "widget"
  widget: "image"
  config:
    src: "logo.png"                   # Required: image path
    alt: "Logo"                       # Optional: alt text
    height: "60px"                    # Optional: height
    objectFit: "contain"              # Optional: CSS object-fit
    className: "logo-widget"          # Optional: CSS class
```

---

### 13. Status Summary Widget
**Purpose**: Aggregate status monitoring

**Configuration**:
```yaml
- id: "status-summary"
  type: "widget"
  widget: "status-summary"
```

**Note**: Automatically aggregates status from all links with `statusCheck: true`

---

## Position System

All widgets support two positioning syntaxes:

### New Intuitive Syntax (Recommended)
```yaml
position:
  row: 1                              # Row number (1-based)
  column: 10                          # Starting column (1-based)
  span: 3                             # Number of columns to span
```

### Legacy CSS Grid Syntax
```yaml
position:
  row: "1"                            # Row as string
  column: "10 / 13"                   # CSS Grid line syntax
```

## Widget vs Group Items

**Standalone Widgets**: Use `type: "widget"` with `widget:` property
```yaml
- id: "my-clock"
  type: "widget"
  widget: "clock"
  config: {...}
```

**Group Items**: Use `type:` directly within a group's `items:`
```yaml
- id: "my-group"
  type: "group"
  items:
    - type: "link"                    # Direct type, no widget: property
      name: "Example"
      url: "https://example.com"
```

## Environment Variables Required

Some widgets require environment variables in `.env`:

```bash
# Trilium
TRILIUM_TOKEN=your_trilium_token
TRILIUM_URL=https://trilium.example.com

# Linkwarden  
LINKWARDEN_API_KEY=your_linkwarden_key
LINKWARDEN_URL=https://linkwarden.example.com

# Obsidian
OBSIDIAN_API_KEY=your_obsidian_key
OBSIDIAN_API_URL=http://localhost:27123

# Weather
OPENWEATHER_API_KEY=your_openweather_key

# Todoist (can also be in widget config)
TODOIST_API_TOKEN=your_todoist_token
```

## Custom Styling

All widgets support:
- `backgroundColor`: Custom background colors/gradients
- Custom CSS classes through various `className` properties
- Theme-based styling through CSS custom properties

## Server API Endpoints

Widgets that use external services go through server proxy:
- `/api/trilium` - Trilium tag search
- `/api/trilium/recent` - Recent Trilium notes
- `/api/linkwarden/recent` - Recent Linkwarden bookmarks  
- `/api/obsidian` - Obsidian search (limited)
- `/api/obsidian/recent` - Recent Obsidian files