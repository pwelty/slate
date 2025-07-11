# Widget YAML Specification
# Complete list of ALL POSSIBLE attributes for widget definitions

## Core Metadata
```yaml
name: "Widget Display Name"           # Human-readable widget name
description: "What this widget does"  # Widget description
version: "1.0.0"                     # Semantic version
category: "display|monitoring|input" # Widget category
author: "Author Name"                # Widget author
```

## Configuration Schema
```yaml
schema:
  properties:
    propertyName:
      type: "string|number|boolean|array|object"
      required: true|false
      default: "default value"
      description: "Property description"
      enum: ["option1", "option2"]    # For limited choice properties
      minimum: 0                      # For number validation
      maximum: 100                    # For number validation
      pattern: "regex"                # For string validation
```

## Widget Capabilities
```yaml
capabilities:
  - displayOnly                      # Static display widget
  - realTimeUpdates                  # Updates data automatically
  - userInteraction                  # Responds to user input
  - apiIntegration                   # Makes external API calls
  - caching                          # Caches data locally
  - responsive                       # Responsive design
  - customStyling                    # Supports custom CSS
  - statusAggregation                # Aggregates status from other widgets
```

## Templates
```yaml
templates:
  html: |                           # Main widget HTML template
    <div class="widget">{{content}}</div>
  
  main: |                           # Alternative to 'html'
    <div class="widget">{{content}}</div>
  
  css: |                            # Widget-specific CSS
    .widget { display: block; }
  
  javascript: |                     # Widget-specific JavaScript (passed to browser)
    console.log('Widget initialized');
  
  js: |                             # Alternative to 'javascript'
    console.log('Widget initialized');
  
  error: |                          # Error state template
    <div class="error">{{error}}</div>
  
  loading: |                        # Loading state template
    <div class="loading">Loading...</div>
  
  empty: |                          # Empty state template
    <div class="empty">No data</div>
```

## Styling
```yaml
styling:
  classes:                          # CSS classes used by widget
    - "widget-class"
    - "another-class"
  
  defaultStyles: |                  # Alternative to templates.css
    .widget {
      background: #fff;
    }
```

## Data Processing
```yaml
dataProcessing:
  generateData: |                   # JavaScript/Python for data generation
    // JavaScript that runs in browser
    return { key: 'value' };
  
  transformApiData: |               # Transform API responses
    function(apiData, config) {
      return { processed: apiData };
    }
  
  handleError: |                    # Error handling logic
    function(error, config) {
      return { error: error.message };
    }
```

## API Integration
```yaml
api:
  baseUrl: "https://api.example.com"     # Base API URL
  method: "GET|POST|PUT|DELETE"          # HTTP method
  headers:                               # Request headers
    "Content-Type": "application/json"
    "Authorization": "Bearer {{token}}"
  
  buildUrl: |                            # Dynamic URL building
    function(config) {
      return `${baseUrl}/data/${config.id}`;
    }
  
  timeout: 5000                          # Request timeout in ms
  retries: 3                             # Number of retries
  cache: true                            # Enable caching
  cacheDuration: 300000                  # Cache duration in ms
```

## Lifecycle Hooks
```yaml
lifecycle:
  init: |                           # Widget initialization
    function(container, config) {
      // Setup code
    }
  
  destroy: |                        # Widget cleanup
    function(container) {
      // Cleanup code
    }
  
  update: |                         # Widget update
    function(container, newConfig) {
      // Update code
    }
  
  refresh: |                        # Data refresh
    function(container) {
      // Refresh code
    }
```

## Dependencies
```yaml
dependencies:                       # Widget dependencies
  - "jquery"                        # External library
  - "chart.js"                      # Chart library
  - "Links with statusCheck enabled" # Other widgets/config
```

## Validation
```yaml
validation:
  required:                         # Required configuration
    - "apiKey"
    - "location"
  
  conditional:                      # Conditional requirements
    - if: "type === 'api'"
      then: ["apiKey"]
```

## Security
```yaml
security:
  allowedDomains:                   # Allowed API domains
    - "api.openweathermap.org"
    - "*.trusted-domain.com"
  
  sanitizeHtml: true                # Enable HTML sanitization
  allowInlineStyles: false          # Allow inline CSS
  allowInlineScripts: false         # Allow inline JavaScript
```

## Performance
```yaml
performance:
  updateInterval: 30000             # Auto-update interval (ms)
  maxRetries: 3                     # Maximum API retries
  timeout: 5000                     # Operation timeout (ms)
  debounce: 500                     # Input debounce (ms)
  lazy: true                        # Lazy loading
```

## Display Options
```yaml
display:
  responsive: true                  # Responsive design
  fullWidth: false                  # Take full container width
  aspectRatio: "16:9"              # Maintain aspect ratio
  minHeight: "200px"               # Minimum height
  maxHeight: "400px"               # Maximum height
```

## Metadata
```yaml
metadata:
  type: "ui|data|integration"       # Widget type classification
  tags:                             # Searchable tags
    - "weather"
    - "dashboard"
  
  documentation: "https://..."      # Documentation URL
  repository: "https://github..."   # Source code repository
  license: "MIT"                    # License type
```

## Complete Example
```yaml
name: "Weather Widget"
description: "Current weather display"
version: "1.0.0"
category: "monitoring"

schema:
  properties:
    location:
      type: "string"
      required: true
      description: "City name or zip code"
      default: "New York"
    units:
      type: "string"
      required: false
      default: "fahrenheit"
      enum: ["fahrenheit", "celsius"]
      description: "Temperature units"

capabilities:
  - realTimeUpdates
  - apiIntegration
  - responsive

templates:
  html: |
    <div class="weather-widget">
      <div class="temperature">{{temp}}°{{unit}}</div>
      <div class="condition">{{condition}}</div>
    </div>
  
  css: |
    .weather-widget {
      text-align: center;
      padding: 1rem;
    }
  
  javascript: |
    // Weather widget initialization
    console.log('Weather widget loaded for:', '{{location}}');

api:
  baseUrl: "https://api.openweathermap.org/data/2.5/weather"
  method: "GET"
  
dataProcessing:
  generateData: |
    // Process weather data
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description,
      unit: config.units === 'celsius' ? 'C' : 'F'
    };

performance:
  updateInterval: 600000  # 10 minutes
  timeout: 5000
``` 