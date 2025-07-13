# Widget Reference

Complete reference for all available widgets in the Slate dashboard system.

## 🎯 Widget System Overview

Slate widgets are **YAML-defined components** with server-side data fetching and theme-agnostic design. Each widget is defined in `src/widgets/` and can be used in your dashboard configuration.

### Widget Architecture

- **📄 YAML Configuration** - Widget behavior defined in `src/widgets/*.yaml`
- **🎨 Theme Integration** - Visual styling controlled by themes
- **🔌 Server-side Data** - API calls happen during build, not client-side
- **♻️ Template Inheritance** - Widgets extend base templates for consistency

## 📋 Available Widgets

### 🕒 Clock Widget

Real-time clock with customizable format and display options.

**Type:** `clock`

**Configuration:**
```yaml
- id: "header-clock"
  type: "clock"
  position: { row: 1, column: 10, width: 3, height: 1 }
  config:
    format: "12h"          # "12h" or "24h"
    showDate: true         # Show date below time
    centered: true         # Center alignment
```

**Features:**
- Real-time updates via JavaScript
- Responsive font sizing
- Theme-aware styling
- Optional date display

---

### 🌤️ Weather Widget

Current weather conditions with OpenWeatherMap integration.

**Type:** `weather`

**Configuration:**
```yaml
- id: "weather-widget"
  type: "weather"
  position: { row: 3, column: 10, width: 3, height: 1 }
  config:
    location: "30033"              # ZIP code or city name
    displayName: "Atlanta, GA"     # Custom display name (optional)
    units: "fahrenheit"            # "fahrenheit" or "celsius"
    apiKey: "your-openweather-key" # OpenWeatherMap API key
```

**Features:**
- Current temperature and conditions
- Weather icon display
- Humidity and wind information
- Server-side API integration
- Responsive layout

**Setup:**
1. Get API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add key to widget configuration

---

### 📈 Forecast Widget

Extended weather forecast for multiple days.

**Type:** `forecast`

**Configuration:**
```yaml
- id: "forecast-widget"
  type: "forecast"
  position: { row: 4, column: 10, width: 3, height: 1 }
  config:
    location: "30033"              # ZIP code or city name
    displayName: "Atlanta, GA"     # Custom display name (optional)
    units: "fahrenheit"            # "fahrenheit" or "celsius"
    apiKey: "your-openweather-key" # OpenWeatherMap API key
    days: 5                        # Number of forecast days (1-7)
```

**Features:**
- Multi-day weather forecast
- High/low temperatures
- Weather icons for each day
- Compact vertical layout
- Hover effects

---

### 📝 Text Widget

Custom text content with formatting options.

**Type:** `text`

**Configuration:**
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

**Features:**
- Rich text content
- Multiple alignment options
- Size variants
- Theme-aware typography
- Optional title display

---

### 🖼️ Image Widget

Display logos, icons, or images with responsive sizing.

**Type:** `image`

**Configuration:**
```yaml
- id: "slate-logo"
  type: "image"
  position: { row: 1, column: 1, width: 2, height: 1 }
  config:
    src: "images/slate_logo_821_286.png"  # Image path relative to dist/
    alt: "Slate Logo"                     # Alt text for accessibility
    height: "60px"                        # Optional height constraint
    objectFit: "contain"                  # CSS object-fit property
    className: "custom-image"             # Optional CSS class
```

**Features:**
- Responsive image display
- Multiple object-fit options
- Hover effects (theme-dependent)
- Accessibility support
- Custom CSS class support

---

### 📊 Status Summary Widget

Overview of system or service status.

**Type:** `status-summary`

**Configuration:**
```yaml
- id: "status-summary"
  type: "status-summary"
  position: { row: 1, column: 7, width: 3, height: 1 }
  config:
    title: "Services"              # Widget title
    refreshInterval: 30000         # Refresh every 30 seconds
```

**Features:**
- Service status indicators
- Real-time status checking
- Color-coded status (online/offline/warning)
- Automatic refresh
- Compact display format

---

## 🔗 Service Integration Widgets

### 📚 Trilium Notes Widget

Display recent notes from your Trilium Notes instance.

**Type:** `trilium`

**Configuration:**
```yaml
- type: "trilium"
  config:
    title: "Recent Notes"              # Widget title
    baseUrl: "https://trilium.example.com"  # Trilium instance URL
    apiToken: "your-etapi-token"       # ETAPI authentication token
    limit: 5                           # Number of notes to display (1-20)
```

**Features:**
- Server-side data fetching
- Recent notes with titles and dates
- Click to open notes in Trilium
- Note type indicators
- Responsive note list

**Setup:**
1. Enable ETAPI in Trilium (Options → ETAPI)
2. Generate API token
3. Use token in configuration

**Data Fetcher:**
- **API Endpoint:** `{baseUrl}/etapi/notes?search=*&limit={limit}&orderBy=dateModified&orderDirection=desc`
- **Authentication:** `Authorization: {apiToken}`
- **Response:** Recent notes with metadata

---

### 🔖 Linkwarden Bookmarks Widget

Display recent bookmarks from your Linkwarden instance.

**Type:** `linkwarden`

**Configuration:**
```yaml
- type: "linkwarden"
  config:
    title: "Recent Bookmarks"         # Widget title
    icon: "📚"                        # Optional icon
    baseUrl: "https://linkwarden.example.com"  # Linkwarden instance URL
    apiKey: "your-linkwarden-api-key" # API authentication key
    limit: 5                          # Number of bookmarks to display (1-20)
```

**Features:**
- Recent bookmarks with titles and URLs
- Collection indicators
- Creation dates
- Click to open bookmarks
- Responsive bookmark list

**Setup:**
1. Generate API key in Linkwarden settings
2. Use API key in configuration

**Data Fetcher:**
- **API Endpoint:** `{baseUrl}/api/v1/links?take={limit}&sort=0`
- **Authentication:** `Authorization: Bearer {apiKey}`
- **Response:** Recent bookmarks with metadata

---

### ✅ Todoist Tasks Widget

Display recent tasks from your Todoist account.

**Type:** `todoist`

**Configuration:**
```yaml
- type: "todoist"
  config:
    title: "Recent Tasks"             # Widget title
    icon: "✅"                        # Optional icon
    apiToken: "your-todoist-token"    # Todoist API token
    projectName: "Dashboard"          # Optional: filter by project name
    limit: 5                          # Number of tasks to display (1-20)
```

**Features:**
- Recent incomplete tasks
- Priority indicators (P1-P4 with colors)
- Due date display
- Click to open tasks in Todoist
- Project filtering (optional)

**Setup:**
1. Get API token from Todoist Settings → Integrations
2. Use token in configuration

**Data Fetcher:**
- **API Endpoint:** `https://api.todoist.com/rest/v2/tasks`
- **Authentication:** `Authorization: Bearer {apiToken}`
- **Response:** Active tasks with priority and due dates

---

### 📡 Radar Widget

Interactive weather radar display.

**Type:** `radar`

**Configuration:**
```yaml
- id: "radar-widget"
  type: "radar"
  position: { row: 4, column: 8, width: 2, height: 1 }
  config:
    location: "30033"              # ZIP code for radar center
    displayName: "Atlanta, GA"     # Custom display name (optional)
    apiKey: "your-openweather-key" # OpenWeatherMap API key
```

**Features:**
- Weather radar visualization
- Location-centered display
- Interactive radar imagery
- Real-time weather patterns

---

### 🛡️ Pi-hole Widget

Display Pi-hole network ad blocking statistics and status.

**Type:** `pihole`

**Configuration:**
```yaml
- id: "pihole-widget"
  type: "pihole"
  position: { row: 6, column: 7, width: 6, height: 1 }
  config:
    title: "Pi-hole"                                    # Widget title
    baseUrl: "https://pihole.example.com"               # Pi-hole instance URL (without /admin)
    apiToken: "your-application-password"               # Pi-hole application password
    updateInterval: 300000                              # Update interval in ms (default: 5 minutes)
```

**Features:**
- Real-time blocking statistics
- DNS query counts and percentages
- Pi-hole service status (enabled/disabled)
- **Full Pi-hole v6+ support** with modern authentication
- Automatic data refresh
- Responsive status indicators

**Setup:**
1. **For Pi-hole v6+** (recommended):
   - Navigate to Pi-hole admin → Settings → Web Interface/API
   - Toggle "Basic" to "Expert" mode
   - Click "Configure app password"
   - Copy the generated application password
   - Use the password as `apiToken` in configuration

2. **For Pi-hole v5** (legacy):
   - Use your admin password as `apiToken`
   - Widget will automatically detect API version

**Version Support:**
- ✅ **Pi-hole v6.0+** - Full support with session-based authentication
- ✅ **Pi-hole v5.x** - Backward compatibility with legacy API
- ❌ **Pi-hole v4.x and older** - Not supported

**Data Display:**
- 🛡️ **Status**: Enabled/Disabled indicator with appropriate icon
- **Blocked Today**: Number of blocked requests and percentage
- **Total Queries**: Total DNS queries processed today

**API Integration:**
- **v6 Authentication**: POST `/api/auth` → session-based requests
- **v6 Endpoints**: `/api/stats/summary`, `/api/dns/blocking`
- **v5 Fallback**: `/admin/api.php?summary`, `/admin/api.php?status`
- **Server-side data fetching** during dashboard build
- **Error handling** with graceful fallbacks

> **🎯 Unique Feature**: This is one of the first dashboard widgets to fully support Pi-hole v6's new authentication system, making it compatible with the latest Pi-hole releases.

---

## 📁 Group Widgets

Groups organize related widgets and links into collapsible containers.

**Type:** `group`

**Configuration:**
```yaml
- id: "dev-group"
  type: "group"
  title: "Development"
  position: { row: 2, column: 1, width: 6, height: 1 }
  collapsed: false                   # Start expanded (true = collapsed)
  items:
    - type: "link"
      name: "GitHub"
      url: "https://github.com"
      icon: "🐙"
      description: "Code repository"
      statusCheck: false             # Optional status monitoring
      
    - type: "trilium"
      config:
        baseUrl: "https://trilium.example.com"
        apiToken: "your-token"
        limit: 3
```

### Group Features

- **Collapsible interface** - Click title to expand/collapse
- **Mixed content** - Combine links and widgets
- **Responsive layout** - Items flow based on container width
- **Status indicators** - Optional service monitoring for links
- **Custom backgrounds** - Optional `backgroundColor` property

### Link Items in Groups

```yaml
- type: "link"
  name: "Service Name"             # Display name
  url: "https://example.com"       # Target URL
  icon: "🔧"                       # Icon (emoji, Unicode, or HTML)
  description: "Service description" # Optional description text
  statusCheck: true                # Monitor service availability
  width: 3                         # Optional: columns to span in group
```

**Link Features:**
- **Status monitoring** - Automatic up/down detection
- **Hover effects** - Theme-aware interactions
- **Icon support** - Emoji, Unicode, or custom icons
- **Responsive sizing** - Automatic width calculation

---

## 🎨 Widget Theming

### Theme-Agnostic Design

Widgets are designed to work beautifully with all themes:

- **Colors** - Use CSS custom properties from active theme
- **Typography** - Inherit font families and sizes from theme
- **Effects** - Themes can add animations and visual enhancements
- **Spacing** - Consistent with theme spacing system

### Theme Integration

Themes can enhance widgets with:

```yaml
# In theme YAML file
widget-enhancements:
  weather:
    effects: ["neon-glow-border", "pulse-glow"]
    colors: ["primary", "secondary"]
  
  trilium:
    effects: ["subtle-glow"]
    colors: ["accent"]
```

### CSS Custom Properties

Widgets use standardized CSS variables:

- `--text-primary` - Main text color
- `--text-secondary` - Secondary text color
- `--bg-tertiary` - Widget background color
- `--accent` - Accent color for highlights
- `--border` - Border color
- `--radius` - Border radius

---

## 🔧 Widget Development

### Creating Custom Widgets

1. **Create widget definition** - `src/widgets/mywidget.yaml`
2. **Define schema** - Required and optional configuration
3. **Add template** - HTML template with Jinja2
4. **Style with CSS** - Theme-aware styling
5. **Add data fetcher** - Optional server-side data integration

### Widget Template Structure

```yaml
# Basic widget template
extends: "widget"  # Inherit from base widget

metadata:
  type: "api"
  description: "Widget description"
  version: "1.0.0"

schema:
  title:
    type: "string"
    required: true
    description: "Widget title"

dataFetcher:
  type: "api"
  method: "GET"
  urlTemplate: "https://api.example.com/data"
  headers:
    Authorization: "Bearer {apiKey}"

widget-body: |
  <div class="custom-widget">
    {% if data %}
      <!-- Widget content -->
    {% else %}
      <div class="error">No data available</div>
    {% endif %}
  </div>

css: |
  .custom-widget {
    /* Theme-aware styling */
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }
```

### Data Fetcher System

Widgets can fetch data server-side during build:

**API Integration:**
```yaml
dataFetcher:
  type: "api"
  method: "GET"
  urlTemplate: "https://api.service.com/endpoint?param={configValue}"
  headers:
    Authorization: "Bearer {apiKey}"
    Content-Type: "application/json"
  responseMapping:
    items: "response.data"
    fields:
      title: "name"
      url: "link"
      date: "created_at"
```

**Response Processing:**
- Data is fetched during dashboard build
- Processed and mapped to template variables
- Available in widget template as `{{ items }}`
- No client-side API calls required

---

## 📝 Widget Best Practices

### Configuration Design

1. **Clear naming** - Use descriptive configuration keys
2. **Sensible defaults** - Minimize required configuration
3. **Validation** - Include type checking and constraints
4. **Documentation** - Clear descriptions for all options

### Template Design

1. **Error handling** - Graceful fallbacks for missing data
2. **Loading states** - Show appropriate messages during data fetch
3. **Responsive design** - Work well at different sizes
4. **Accessibility** - Include proper ARIA labels and alt text

### Styling Guidelines

1. **Theme variables** - Use CSS custom properties exclusively
2. **Consistent spacing** - Follow theme spacing system
3. **Hover effects** - Provide appropriate interactive feedback
4. **Typography** - Use theme font families and sizes

### Performance Considerations

1. **Server-side rendering** - Fetch data during build, not runtime
2. **Efficient CSS** - Minimize custom styles
3. **Image optimization** - Use appropriate image formats and sizes
4. **Caching** - Leverage build-time caching for API responses

---

## 🔍 Troubleshooting Widgets

### Common Issues

**Widget not displaying:**
- Check widget type spelling in configuration
- Verify required configuration fields are present
- Check for YAML syntax errors

**Service integration failing:**
- Verify API keys/tokens are correct
- Check service URLs are accessible
- Review API rate limits and quotas
- Test API endpoints manually

**Styling issues:**
- Ensure CSS uses theme variables
- Check for CSS conflicts with theme styles
- Verify responsive behavior at different sizes

### Debug Mode

Build with debug output to see widget processing:

```bash
python3 src/scripts/dashboard_renderer.py --debug
```

### Widget Validation

The build system validates:
- Widget type exists
- Required configuration present
- API connectivity (for service widgets)
- Template syntax
- CSS validity

---

## 🚀 Widget Examples

### Simple Text Widget
```yaml
- id: "welcome"
  type: "text"
  position: { row: 1, column: 1, width: 6, height: 1 }
  config:
    content: "Welcome to my dashboard!"
    alignment: "center"
```

### Weather with Forecast
```yaml
- id: "weather"
  type: "weather"
  position: { row: 2, column: 1, width: 3, height: 1 }
  config:
    location: "30033"
    apiKey: "your-key"

- id: "forecast"
  type: "forecast"
  position: { row: 2, column: 4, width: 3, height: 1 }
  config:
    location: "30033"
    apiKey: "your-key"
    days: 3
```

### Service Integration Group
```yaml
- id: "productivity"
  type: "group"
  title: "Productivity"
  position: { row: 3, column: 1, width: 12, height: 1 }
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
        
    - type: "linkwarden"
      config:
        baseUrl: "https://linkwarden.example.com"
        apiKey: "your-key"
        limit: 3
```

---

For configuration details, see [Configuration Reference](CONFIGURATION.md).
For theming information, see [Theming Guide](THEMING_ARCHITECTURE.md).