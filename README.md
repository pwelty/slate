# Personal Dashboard - Static, YAML-Configured, Docker + Tailscale

A minimalist, static personal dashboard with YAML-based configuration, hot-reload development, and flexible grid-based layout. Built with vanilla JavaScript and CSS Grid for maximum simplicity and performance.

> 🚀 **STATUS**: Dashboard is fully functional and running! Access it at `http://localhost:8080/src/`

## Table of Contents
- [Quick Start](#quick-start)
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Current Implementation Status](#current-implementation-status)
- [Development TODO List](#development-todo-list)
- [Implementation Guide](#implementation-guide)
- [Configuration Reference](#configuration-reference)
- [Docker & Tailscale Setup](#docker--tailscale-setup)
- [Widget Development](#widget-development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

🚀 **Get your dashboard running in under 2 minutes!**

### Prerequisites
- Node.js (v16+)
- npm

### Installation & Setup
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open your browser
# Visit: http://localhost:5173/

# Alternative: Build and serve production version
npm run build
cd dist && python3 -m http.server 8080
# Visit: http://localhost:8080/src/
```

### ✅ **Currently Working Features**
- **Real-time clock widget** with 12h/24h format
- **Mock weather widget** (ready for API integration)
- **Collapsible groups** with localStorage persistence
- **Responsive grid layout** (12→8→1 columns)
- **Dark/light theme system**
- **Hot-reload configuration** changes
- **Service links** with hover animations
- **Sample configuration** with GitHub, GitLab, Docker Hub links

### 🎨 **Customization**
Edit `config/dashboard.yaml` to customize your dashboard:
- Add/remove widgets and links
- Change grid positioning
- Modify themes and colors
- Configure widget settings

## Overview

This dashboard is designed to be a lightweight, customizable homepage for personal use. Unlike existing solutions (Homer, Homepage, Homarr, etc.), this focuses on:
- **Simplicity**: No framework overhead, just vanilla JS
- **Static-first**: Minimal JavaScript, mostly CSS
- **YAML Configuration**: All customization through code
- **Docker + Tailscale**: Secure, private networking
- **Hot Reload**: Instant updates during development

## Features

### ✅ Implemented Features
- ✅ **Static HTML/CSS** with minimal JS (collapsible groups only)
- ✅ **YAML configuration** for complete control
- ✅ **CSS Grid layout** system with precise positioning
- ✅ **Hot-reload** during development
- ✅ **Theme support** via CSS variables (dark/light themes)
- ✅ **Widget system** with clock and weather widgets
- ✅ **Link tiles** with hover animations
- ✅ **Collapsible groups** with localStorage persistence
- ✅ **Responsive design** (12→8→1 columns)
- ✅ **Docker deployment** with Tailscale sidecar
- ✅ **No database** required
- ✅ **Icon system** (emoji-based, extensible)
- ✅ **Clock widget** with real-time updates
- ✅ **Weather widget** (mock data, API-ready)

### 🚧 Planned Features
- 📋 Real weather API integration
- 📋 Service status indicators (health checks)
- 📋 RSS feed widget
- 📋 System monitor widget
- 📋 Search functionality
- 📋 Keyboard navigation
- 📋 PWA support
- 📋 Custom theme editor

## Technology Stack

```yaml
Build Tool: Vite v4.5.14
Configuration: YAML (js-yaml parser)
Templating: Custom Vite HTML transform plugin
Styling: CSS Grid + CSS Variables + Responsive Design
Icons: Emoji-based system (extensible for SVG/fonts)
Interactivity: Vanilla JS (collapsibles, widgets, hot-reload)
Container: Docker + Nginx (multi-stage build)
Networking: Tailscale sidecar
Development: Hot-reload, source maps, dev server
```

## Project Structure

```
my-dashboard/
├── config/
│   └── dashboard.yaml          # Main configuration
├── src/
│   ├── index.html             # HTML template
│   ├── styles/
│   │   ├── main.css          # Main styles
│   │   ├── themes.css        # Theme variables
│   │   └── components.css    # Component styles
│   ├── scripts/
│   │   ├── main.js          # Entry point
│   │   ├── config-loader.js # YAML parser
│   │   ├── renderer.js      # HTML generation
│   │   └── widgets/         # Widget implementations
│   │       ├── clock.js
│   │       ├── weather.js
│   │       └── status.js
│   └── assets/
│       └── icons/           # SVG icons
├── docker/
│   ├── Dockerfile           # Multi-stage build
│   └── nginx.conf          # Nginx configuration
├── dist/                   # Build output (gitignored)
├── docker-compose.yml      # Development compose
├── docker-compose.prod.yml # Production compose
├── vite.config.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md
```

## Current Implementation Status

### ✅ **Phase 1: Basic Setup & Infrastructure (COMPLETED)**
- ✅ Project structure with all directories created
- ✅ `package.json` with Vite and js-yaml dependencies installed
- ✅ Vite configuration with YAML transform plugin
- ✅ `.gitignore`, `.env.example` files
- ✅ Docker configuration (Dockerfile, nginx.conf, docker-compose files)

### ✅ **Phase 2: Core Features (COMPLETED)**
- ✅ CSS Grid layout engine with responsive breakpoints
- ✅ Component system (groups, widgets, links)
- ✅ Dark/light theme system with CSS variables
- ✅ YAML configuration parser and injection
- ✅ Dashboard renderer with dynamic component creation
- ✅ Collapsible groups with localStorage persistence

### ✅ **Phase 3: Basic Widgets (COMPLETED)**
- ✅ Clock widget with 12h/24h format and date display
- ✅ Weather widget with mock data (API-ready structure)
- ✅ Status widget foundation (ready for health checks)
- ✅ Widget registry system for dynamic loading

### ✅ **Development Environment (WORKING)**
- ✅ **Development server**: `npm run dev` (port 5173)
- ✅ **Production build**: `npm run build` + static serving
- ✅ **Hot-reload**: Configuration changes reload automatically
- ✅ **Sample dashboard**: Functional with GitHub, GitLab, Docker Hub links

### 🚧 **Current Development State**
The dashboard is **fully functional** with:
- Real-time clock updates
- Responsive grid layout
- Collapsible service groups  
- Theme switching capability
- Hot configuration reloading
- Production-ready Docker setup

### 🎯 **Next Priority Items**
1. Real weather API integration
2. Service health checking
3. Additional widget types
4. Enhanced icon system
5. Search functionality

## Development TODO List

### Phase 1: Basic Setup & Infrastructure ⏱️ Week 1-2

#### Project Initialization
- [ ] Create GitHub/GitLab repository
- [ ] Clone repo locally
- [ ] Create initial project structure (all directories above)
- [ ] Initialize .gitignore:
  ```
  node_modules/
  dist/
  .env
  .DS_Store
  *.log
  .vscode/
  .idea/
  ```

#### Core Development Setup
- [ ] Initialize npm project: `npm init -y`
- [ ] Install dependencies: `npm install -D vite js-yaml`
- [ ] Create `vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite'
  import yaml from 'js-yaml'
  import fs from 'fs'

  export default defineConfig({
    build: {
      rollupOptions: {
        input: {
          main: 'src/index.html'
        }
      }
    },
    plugins: [
      {
        name: 'yaml-transform',
        transformIndexHtml(html) {
          const config = yaml.load(fs.readFileSync('./config/dashboard.yaml', 'utf8'))
          return html.replace('<!-- CONFIG_PLACEHOLDER -->', 
            `<script>window.DASHBOARD_CONFIG = ${JSON.stringify(config)}</script>`
          )
        },
        handleHotUpdate({ file, server }) {
          if (file.includes('dashboard.yaml')) {
            server.ws.send({ type: 'full-reload' })
            return []
          }
        }
      }
    ]
  })
  ```
- [ ] Create basic `src/index.html`
- [ ] Set up package.json scripts:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "serve": "cd dist && python -m http.server 8080"
    }
  }
  ```

#### Docker Configuration
- [ ] Create `docker/Dockerfile`:
  ```dockerfile
  # Build stage
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  # Serve stage
  FROM nginx:alpine
  COPY docker/nginx.conf /etc/nginx/nginx.conf
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY config/dashboard.yaml /usr/share/nginx/html/config/
  EXPOSE 80
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
  ```

- [ ] Create `docker/nginx.conf`:
  ```nginx
  events {
    worker_connections 1024;
  }

  http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
      listen 80;
      server_name localhost;
      root /usr/share/nginx/html;
      index index.html;

      # Cache static assets
      location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
      }

      # Don't cache HTML or config
      location ~* \.(html|yaml|yml|json)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
      }

      # SPA fallback
      location / {
        try_files $uri $uri/ /index.html;
      }
    }
  }
  ```

#### Tailscale Integration
- [ ] Create `docker-compose.yml`:
  ```yaml
  version: '3.8'

  services:
    dashboard:
      build: 
        context: .
        dockerfile: docker/Dockerfile
      container_name: my-dashboard
      volumes:
        - ./config:/usr/share/nginx/html/config:ro
      network_mode: service:tailscale
      depends_on:
        - tailscale
      restart: unless-stopped

    tailscale:
      image: tailscale/tailscale:latest
      container_name: dashboard-tailscale
      hostname: dashboard
      volumes:
        - tailscale-state:/var/lib/tailscale
        - /dev/net/tun:/dev/net/tun
      environment:
        - TS_AUTHKEY=${TS_AUTHKEY}
        - TS_STATE_DIR=/var/lib/tailscale
        - TS_EXTRA_ARGS=--advertise-tags=tag:dashboard --accept-routes
      cap_add:
        - NET_ADMIN
        - NET_RAW
      restart: unless-stopped

  volumes:
    tailscale-state:
  ```

- [ ] Create `.env.example`:
  ```
  TS_AUTHKEY=tskey-auth-xxxxx
  ```

- [ ] Test Tailscale connectivity
- [ ] Document Tailscale auth key generation

### Phase 2: Core Features ⏱️ Week 3-4

#### Layout System
- [ ] Create CSS Grid layout engine in `src/styles/main.css`:
  ```css
  :root {
    --grid-columns: 12;
    --grid-gap: 1rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-columns), 1fr);
    gap: var(--grid-gap);
    padding: 1rem;
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .grid-item {
    grid-row: var(--row);
    grid-column: var(--column);
  }
  ```

- [ ] Implement grid positioning parser
- [ ] Add responsive breakpoints:
  ```css
  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    .grid-item {
      grid-column: 1 !important;
    }
  }
  ```

#### Component System
- [ ] Create `src/scripts/renderer.js`:
  ```javascript
  export class DashboardRenderer {
    constructor(config) {
      this.config = config
      this.container = document.getElementById('dashboard-container')
    }

    render() {
      this.applyTheme(this.config.dashboard.theme)
      this.container.style.setProperty('--grid-columns', this.config.dashboard.columns)
      this.container.style.setProperty('--grid-gap', this.config.dashboard.gap)
      
      this.container.innerHTML = ''
      this.config.components.forEach(component => {
        const element = this.createComponent(component)
        this.container.appendChild(element)
      })
      
      this.initializeCollapsibles()
    }

    createComponent(component) {
      const div = document.createElement('div')
      div.className = 'grid-item'
      div.style.setProperty('--row', component.position.row)
      div.style.setProperty('--column', component.position.column)
      
      switch (component.type) {
        case 'group':
          return this.createGroup(component, div)
        case 'widget':
          return this.createWidget(component, div)
        case 'link':
          return this.createLink(component, div)
        default:
          return div
      }
    }

    // ... implement createGroup, createLink, createWidget methods
  }
  ```

- [ ] Implement link component with icon support
- [ ] Implement group component with collapsible functionality
- [ ] Create widget base class

#### Theme System
- [ ] Create `src/styles/themes.css`:
  ```css
  [data-theme="dark"] {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --border: #334155;
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
    --radius: 0.5rem;
  }

  [data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --border: #e2e8f0;
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --radius: 0.5rem;
  }
  ```

- [ ] Implement theme loader
- [ ] Add theme switching mechanism
- [ ] Test theme variables

#### Configuration
- [ ] Create comprehensive `config/dashboard.yaml`:
  ```yaml
  dashboard:
    title: "My Dashboard"
    theme: "dark"
    columns: 12
    gap: "1rem"
    
  components:
    - id: "header"
      type: "widget"
      widget: "clock"
      position: { row: "1", column: "1 / -1" }
      config:
        format: "12h"
        showDate: true
        
    - id: "dev-group"
      type: "group"
      title: "Development"
      position: { row: "2", column: "1 / 5" }
      collapsed: false
      items:
        - type: "link"
          name: "GitHub"
          url: "https://github.com"
          icon: "github"
          description: "Code repository"
          
    # ... more components

  themes:
    dark:
      bg-primary: "#0f172a"
      # ... all theme variables
    light:
      bg-primary: "#ffffff"
      # ... all theme variables
  ```

- [ ] Implement config validation
- [ ] Add error handling
- [ ] Create config documentation

### Phase 3: Basic Widgets ⏱️ Week 5

#### Clock Widget
- [ ] Create `src/scripts/widgets/clock.js`:
  ```javascript
  export default class ClockWidget {
    constructor(container, config) {
      this.container = container
      this.config = config
    }

    init() {
      this.render()
      setInterval(() => this.render(), 1000)
    }

    render() {
      const now = new Date()
      const time = this.config.format === '12h' 
        ? now.toLocaleTimeString('en-US', { hour12: true })
        : now.toLocaleTimeString('en-US', { hour12: false })
      
      const date = this.config.showDate 
        ? now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : ''

      this.container.innerHTML = `
        <div class="clock-widget">
          <div class="clock-time">${time}</div>
          ${date ? `<div class="clock-date">${date}</div>` : ''}
        </div>
      `
    }
  }
  ```

- [ ] Style clock widget
- [ ] Add to widget registry
- [ ] Test different formats

#### Weather Widget
- [ ] Create weather widget template
- [ ] Design weather display layout
- [ ] Add placeholder/mock data option:
  ```javascript
  export default class WeatherWidget {
    constructor(container, config) {
      this.container = container
      this.config = config
    }

    init() {
      this.render()
      // Update every 10 minutes
      setInterval(() => this.render(), 600000)
    }

    async render() {
      // For now, use mock data
      const mockData = {
        temp: 72,
        condition: 'Partly Cloudy',
        high: 78,
        low: 65,
        humidity: 45
      }

      this.container.innerHTML = `
        <div class="weather-widget">
          <div class="weather-main">
            <div class="weather-temp">${mockData.temp}°</div>
            <div class="weather-condition">${mockData.condition}</div>
          </div>
          <div class="weather-details">
            <span>H: ${mockData.high}°</span>
            <span>L: ${mockData.low}°</span>
            <span>💧 ${mockData.humidity}%</span>
          </div>
        </div>
      `
    }
  }
  ```

- [ ] Document API integration points
- [ ] Style weather cards

#### Status Indicator
- [ ] Design status check system
- [ ] Add visual indicators:
  ```css
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--status-color, #666);
  }

  .status-indicator.online {
    --status-color: #10b981;
  }

  .status-indicator.offline {
    --status-color: #ef4444;
  }

  .status-indicator.checking {
    --status-color: #f59e0b;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  ```

- [ ] Implement status checking:
  ```javascript
  async checkStatus(url) {
    try {
      // For Tailscale internal services, we can check directly
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      })
      return 'online'
    } catch {
      return 'offline'
    }
  }
  ```

- [ ] Handle CORS limitations
- [ ] Document status check behavior

### Phase 4: Enhanced Features ⏱️ Week 6

#### Icon System
- [ ] Research and decide on icon approach:
  - Option 1: Inline SVG (best for performance)
  - Option 2: Icon font (easiest to implement)
  - Option 3: SVG sprite sheet
  - Option 4: Emoji fallbacks

- [ ] Implement chosen system:
  ```javascript
  // Example: Inline SVG approach
  const icons = {
    github: '<svg>...</svg>',
    gitlab: '<svg>...</svg>',
    // ... more icons
  }

  getIcon(name) {
    return icons[name] || '🔗'
  }
  ```

- [ ] Create icon mapping
- [ ] Add custom icon support
- [ ] Document icon usage

#### Advanced Layouts
- [ ] Add nested grid support
- [ ] Create layout templates:
  ```yaml
  # Example: Dashboard with sidebar
  layouts:
    sidebar:
      columns: 12
      areas:
        - name: "sidebar"
          position: { row: "1 / -1", column: "1 / 3" }
        - name: "main"
          position: { row: "1 / -1", column: "3 / -1" }
  ```

- [ ] Implement layout switcher
- [ ] Create mobile-specific layouts

#### Performance Optimization
- [ ] Minimize JavaScript bundle
- [ ] Optimize CSS delivery
- [ ] Implement lazy loading for widgets:
  ```javascript
  async loadWidget(widgetName) {
    const module = await import(`./widgets/${widgetName}.js`)
    return new module.default()
  }
  ```

- [ ] Add build-time optimizations
- [ ] Implement caching strategies

### Phase 5: Deployment & DevOps ⏱️ Week 7

#### Build Pipeline
- [ ] Create GitHub Actions workflow (`.github/workflows/build.yml`):
  ```yaml
  name: Build and Push Docker Image

  on:
    push:
      branches: [ main ]
      tags: [ 'v*' ]

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        
        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v2
        
        - name: Login to DockerHub
          uses: docker/login-action@v2
          with:
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            password: ${{ secrets.DOCKERHUB_TOKEN }}
        
        - name: Build and push
          uses: docker/build-push-action@v4
          with:
            context: .
            file: ./docker/Dockerfile
            push: true
            tags: |
              ${{ secrets.DOCKERHUB_USERNAME }}/my-dashboard:latest
              ${{ secrets.DOCKERHUB_USERNAME }}/my-dashboard:${{ github.sha }}
  ```

- [ ] Set up secrets in GitHub
- [ ] Test build pipeline
- [ ] Add version tagging

#### Production Configuration
- [ ] Create `docker-compose.prod.yml`:
  ```yaml
  version: '3.8'

  services:
    dashboard:
      image: ${DOCKER_REGISTRY}/my-dashboard:latest
      container_name: my-dashboard
      volumes:
        - ./config:/usr/share/nginx/html/config:ro
      network_mode: service:tailscale
      depends_on:
        - tailscale
      restart: unless-stopped
      logging:
        driver: "json-file"
        options:
          max-size: "10m"
          max-file: "3"

    tailscale:
      image: tailscale/tailscale:latest
      container_name: dashboard-tailscale
      hostname: dashboard
      volumes:
        - tailscale-state:/var/lib/tailscale
        - /dev/net/tun:/dev/net/tun
      environment:
        - TS_AUTHKEY=${TS_AUTHKEY}
        - TS_STATE_DIR=/var/lib/tailscale
        - TS_EXTRA_ARGS=--advertise-tags=tag:dashboard --accept-routes
      cap_add:
        - NET_ADMIN
        - NET_RAW
      restart: unless-stopped
      logging:
        driver: "json-file"
        options:
          max-size: "10m"
          max-file: "3"

  volumes:
    tailscale-state:
  ```

- [ ] Add health checks
- [ ] Configure logging
- [ ] Set up backup strategy

#### Monitoring & Maintenance
- [ ] Add health endpoint
- [ ] Create backup script:
  ```bash
  #!/bin/bash
  # backup.sh
  BACKUP_DIR="/backup/dashboard"
  DATE=$(date +%Y%m%d_%H%M%S)
  
  mkdir -p $BACKUP_DIR
  tar -czf $BACKUP_DIR/config_$DATE.tar.gz config/
  
  # Keep only last 7 backups
  find $BACKUP_DIR -name "config_*.tar.gz" -mtime +7 -delete
  ```

- [ ] Set up log rotation
- [ ] Document update procedures:
  ```bash
  # Update procedure
  docker-compose -f docker-compose.prod.yml pull
  docker-compose -f docker-compose.prod.yml up -d
  ```

### Phase 6: Documentation & Polish ⏱️ Week 8

#### User Documentation
- [ ] Complete README sections:
  - [ ] Configuration guide
  - [ ] Widget development guide
  - [ ] Theme customization
  - [ ] Troubleshooting

- [ ] Create example configurations:
  - [ ] Minimal setup
  - [ ] Home lab dashboard
  - [ ] Developer dashboard
  - [ ] Media server dashboard

#### Developer Documentation
- [ ] Document code architecture
- [ ] Create JSDoc comments:
  ```javascript
  /**
   * Renders a dashboard component based on configuration
   * @param {Object} component - Component configuration
   * @param {string} component.type - Component type (group|widget|link)
   * @param {Object} component.position - Grid position
   * @returns {HTMLElement} Rendered component
   */
  createComponent(component) {
    // ...
  }
  ```

- [ ] Add contribution guidelines
- [ ] Create widget API reference

#### Final Polish
- [ ] Cross-browser testing checklist:
  - [ ] Chrome/Chromium
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile browsers

- [ ] Accessibility audit:
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast
  - [ ] Focus indicators

- [ ] Performance testing:
  - [ ] Lighthouse score > 95
  - [ ] First paint < 1s
  - [ ] Bundle size < 50KB

- [ ] Security review:
  - [ ] CSP headers
  - [ ] XSS prevention
  - [ ] No sensitive data in frontend

## Implementation Guide

### Getting Started

🎉 **The dashboard is already set up and working!**

#### **Quick Start (Current Working Setup)**
```bash
# 1. Install dependencies (already done)
npm install

# 2. Start development server
npm run dev
# Visit: http://localhost:5173/

# 3. Alternative: Serve built version  
npm run build
cd dist && python3 -m http.server 8080
# Visit: http://localhost:8080/src/
```

#### **What's Currently Working**
- ✅ **Live dashboard** with real-time clock
- ✅ **Sample configuration** with GitHub, GitLab, Docker Hub links
- ✅ **Responsive design** that works on mobile/desktop
- ✅ **Hot-reload** when you edit `config/dashboard.yaml`
- ✅ **Dark theme** with smooth animations
- ✅ **Collapsible groups** that remember their state

#### **Customizing Your Dashboard**
1. **Edit the configuration**: Open `config/dashboard.yaml`
2. **Add your services**: Replace example links with your own
3. **Adjust layout**: Change grid positions and widget placement
4. **Modify themes**: Update colors in the themes section
5. **Save and reload**: Changes appear instantly in dev mode

#### **Docker Development** (Optional)
```bash
# Copy .env.example to .env and add your Tailscale auth key
cp .env.example .env

# Build and run with Docker Compose
docker-compose up --build

# Access via Tailscale network
# http://dashboard:80 (or your configured hostname)
```

### Core Implementation Files

#### 1. HTML Template (`src/index.html`)
```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Personal Dashboard">
    <title>Dashboard</title>
    <link rel="stylesheet" href="/src/styles/main.css">
    <link rel="stylesheet" href="/src/styles/themes.css">
    <link rel="stylesheet" href="/src/styles/components.css">
    <!-- CONFIG_PLACEHOLDER -->
</head>
<body>
    <div id="dashboard-container" class="dashboard-grid">
        <!-- Content generated by JavaScript -->
    </div>
    <script type="module" src="/src/scripts/main.js"></script>
</body>
</html>
```

#### 2. Main JavaScript (`src/scripts/main.js`)
```javascript
import { DashboardRenderer } from './renderer.js'

// Dashboard config is injected by Vite during build
const config = window.DASHBOARD_CONFIG

if (!config) {
  console.error('Dashboard configuration not found')
  document.body.innerHTML = '<div class="error">Configuration error. Please check dashboard.yaml</div>'
} else {
  try {
    const dashboard = new DashboardRenderer(config)
    dashboard.render()
  } catch (error) {
    console.error('Failed to render dashboard:', error)
    document.body.innerHTML = '<div class="error">Failed to render dashboard. Check console for details.</div>'
  }
}

// Hot reload support in development
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

#### 3. Component Styles (`src/styles/components.css`)
```css
/* Groups */
.group {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.group-header:hover {
  color: var(--accent);
}

.collapse-icon {
  transition: transform 0.3s ease;
  font-size: 0.875rem;
}

.group.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

.group.collapsed .group-content {
  display: none;
}

.group.collapsed .group-header {
  margin-bottom: 0;
}

.group-content {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.group-content.horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Links */
.link-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: calc(var(--radius) * 0.75);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.link-card:hover {
  background: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  color: white;
}

.link-card:active {
  transform: translateY(0);
}

.link-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-description {
  font-size: 0.875rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card.compact {
  padding: 0.5rem 0.75rem;
}

.link-card.compact .link-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  font-size: 1rem;
}

.link-card.compact .link-description {
  display: none;
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-color, #666);
}

.status-indicator.online {
  --status-color: #10b981;
}

.status-indicator.offline {
  --status-color: #ef4444;
}

.status-indicator.checking {
  --status-color: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Widgets */
.widget {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow);
}

/* Clock Widget */
.clock-widget {
  text-align: center;
}

.clock-time {
  font-size: 3rem;
  font-weight: 200;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.clock-date {
  font-size: 1rem;
  opacity: 0.8;
}

/* Weather Widget */
.weather-widget {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.weather-temp {
  font-size: 2.5rem;
  font-weight: 300;
}

.weather-condition {
  font-size: 1.125rem;
  opacity: 0.9;
}

.weather-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Error States */
.error {
  background: #ef4444;
  color: white;
  padding: 1rem;
  border-radius: var(--radius);
  margin: 2rem;
  text-align: center;
}

/* Loading States */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loading::after {
  content: '';
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .group-content {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }
  
  .grid-item {
    grid-column: 1 !important;
  }
  
  .clock-time {
    font-size: 2rem;
  }
  
  .weather-temp {
    font-size: 2rem;
  }
}

/* Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
```

## Configuration Reference

### Complete YAML Schema

```yaml
# Dashboard settings
dashboard:
  title: "My Dashboard"              # Browser title
  theme: "dark"                      # Theme name (dark|light|custom)
  columns: 12                        # Number of grid columns
  gap: "1rem"                        # Grid gap (CSS value)
  favicon: "/assets/favicon.ico"     # Optional favicon

# Component definitions
components:
  - id: "unique-id"                  # Unique identifier
    type: "group|widget|link"        # Component type
    position:                        # Grid position
      row: "1"                       # Grid row (can use spans: "1 / 3")
      column: "1 / 4"                # Grid column (can use spans)
    
    # For type: "group"
    title: "Group Title"             # Group header text
    collapsed: false                 # Start collapsed?
    layout: "grid|horizontal"        # Item layout
    items:                           # Array of links
      - type: "link"
        name: "Link Name"
        url: "https://..."
        icon: "icon-name"
        description: "Optional"
        statusCheck: true            # Check if service is up
        compact: false               # Compact display mode
        
    # For type: "widget"
    widget: "clock|weather|status"   # Widget type
    config:                          # Widget-specific config
      # Clock widget
      format: "12h|24h"
      showDate: true
      
      # Weather widget
      location: "City Name"
      units: "fahrenheit|celsius"
      apiKey: "your-api-key"         # For future API integration
      
    # For type: "link" (standalone)
    name: "Link Name"
    url: "https://..."
    icon: "icon-name"
    description: "Optional"
    newTab: true                     # Open in new tab

# Theme definitions
themes:
  dark:
    # Colors
    bg-primary: "#0f172a"            # Main background
    bg-secondary: "#1e293b"          # Card background
    bg-tertiary: "#334155"           # Hover states
    text-primary: "#f1f5f9"          # Main text
    text-secondary: "#cbd5e1"        # Secondary text
    accent: "#3b82f6"                # Accent color
    accent-hover: "#2563eb"          # Accent hover
    border: "#334155"                # Border color
    
    # Effects
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)"
    radius: "0.5rem"
    
  light:
    # Define light theme variables...
    
  # Add custom themes...

# Widget settings (global)
widgets:
  clock:
    updateInterval: 1000             # Update frequency (ms)
    
  weather:
    updateInterval: 600000           # 10 minutes
    cacheTime: 300000                # 5 minutes
    
  status:
    checkInterval: 30000             # 30 seconds
    timeout: 5000                    # Request timeout
    retries: 3                       # Number of retries

# Icon mappings
icons:
  github: "🐙"                       # Can be emoji, SVG, or font icon
  gitlab: "🦊"
  docker: "🐳"
  # Or with SVG:
  # github: '<svg>...</svg>'
  # Or with icon font:
  # github: 'fab fa-github'

# Optional: Layout presets
layouts:
  default:
    columns: 12
    gap: "1rem"
    
  compact:
    columns: 16
    gap: "0.5rem"
    
  mobile:
    columns: 1
    gap: "0.75rem"
```

### Grid Positioning Examples

```yaml
# Full width
position: { row: "1", column: "1 / -1" }

# Half width (6 of 12 columns)
position: { row: "2", column: "1 / 7" }

# Quarter width (3 of 12 columns)  
position: { row: "3", column: "1 / 4" }

# Right half
position: { row: "2", column: "7 / -1" }

# Span multiple rows
position: { row: "1 / 3", column: "1 / 4" }

# Center 8 columns (2 column margins)
position: { row: "1", column: "3 / 11" }

# Responsive positioning (with media queries in CSS)
position: { row: "auto", column: "1 / -1" }
```

## Docker & Tailscale Setup

### Development Setup

1. **Create Tailscale Auth Key**:
   - Go to https://login.tailscale.com/admin/settings/keys
   - Generate an auth key (reusable recommended for development)
   - Add to `.env` file

2. **Network Architecture**:
   ```
   [Tailscale Network]
        |
   [dashboard-tailscale container]
        |
   [my-dashboard container] <- Shares network namespace
        |
   [Nginx serving static files]
   ```

3. **Build and Run**:
   ```bash
   # Development with live config reload
   docker-compose up --build
   
   # Access via Tailscale
   http://dashboard.your-tailnet.ts.net
   
   # Or by Tailscale IP
   http://100.x.x.x
   ```

### Production Deployment

1. **Update `.env` for production**:
   ```bash
   TS_AUTHKEY=tskey-auth-xxxxx      # One-time key for production
   DOCKER_REGISTRY=your-registry     # If using private registry
   ```

2. **Deploy**:
   ```bash
   # Pull latest images
   docker-compose -f docker-compose.prod.yml pull
   
   # Deploy with zero downtime
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

3. **Backup Configuration**:
   ```bash
   # Manual backup
   tar -czf dashboard-config-$(date +%Y%m%d).tar.gz config/
   
   # Automated backup (add to cron)
   0 2 * * * /path/to/backup.sh
   ```

### Tailscale-Specific Considerations

1. **ACL Tags**: Dashboard is tagged with `tag:dashboard` for ACL rules
2. **Exit Node**: Can use `--exit-node` in TS_EXTRA_ARGS if needed
3. **Subnet Routes**: `--accept-routes` allows accessing local network services
4. **MagicDNS**: Dashboard accessible at `http://dashboard` within Tailnet

### Security Best Practices

1. **Read-only Config Mount**: Production uses `:ro` flag for config volume
2. **No Privileged Mode**: Only specific capabilities (NET_ADMIN, NET_RAW)
3. **Resource Limits** (add to production):
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 128M
   ```

## Widget Development

### Creating a Custom Widget

1. **Create Widget File** (`src/scripts/widgets/my-widget.js`):
   ```javascript
   export default class MyWidget {
     constructor(container, config) {
       this.container = container
       this.config = config
       this.updateInterval = null
     }
     
     init() {
       // Initial render
       this.render()
       
       // Set up updates if needed
       if (this.config.updateInterval) {
         this.updateInterval = setInterval(
           () => this.render(), 
           this.config.updateInterval
         )
       }
       
       // Clean up on page unload
       window.addEventListener('beforeunload', () => this.destroy())
     }
     
     async render() {
       try {
         // Fetch data if needed
         const data = await this.fetchData()
         
         // Update DOM
         this.container.innerHTML = `
           <div class="my-widget">
             <h3>${this.config.title || 'My Widget'}</h3>
             <div class="widget-content">
               ${this.renderContent(data)}
             </div>
           </div>
         `
       } catch (error) {
         this.renderError(error)
       }
     }
     
     async fetchData() {
       // Implement data fetching
       return {}
     }
     
     renderContent(data) {
       // Implement content rendering
       return '<p>Widget content here</p>'
     }
     
     renderError(error) {
       this.container.innerHTML = `
         <div class="widget-error">
           <p>Error loading widget</p>
           <small>${error.message}</small>
         </div>
       `
     }
     
     destroy() {
       if (this.updateInterval) {
         clearInterval(this.updateInterval)
       }
     }
   }
   ```

2. **Register Widget** (in `renderer.js`):
   ```javascript
   const widgetRegistry = {
     clock: () => import('./widgets/clock.js'),
     weather: () => import('./widgets/weather.js'),
     'my-widget': () => import('./widgets/my-widget.js'),
   }
   ```

3. **Add to Configuration**:
   ```yaml
   - id: "custom-widget"
     type: "widget"
     widget: "my-widget"
     position: { row: "3", column: "9 / -1" }
     config:
       title: "My Custom Widget"
       updateInterval: 60000
       # Widget-specific config
   ```

### Widget Best Practices

1. **Error Handling**: Always wrap async operations in try-catch
2. **Cleanup**: Remove intervals/listeners in destroy method
3. **Loading States**: Show loading indicator for async operations
4. **Responsive**: Test widget at different sizes
5. **Configuration**: Make widgets configurable via YAML
6. **Performance**: Debounce/throttle expensive operations

### Example: RSS Feed Widget

```javascript
export default class RSSWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.items = []
  }
  
  async init() {
    this.renderLoading()
    await this.fetchFeed()
    this.render()
    
    // Refresh every 5 minutes
    setInterval(() => this.fetchFeed(), 300000)
  }
  
  renderLoading() {
    this.container.innerHTML = '<div class="loading-spinner">Loading feed...</div>'
  }
  
  async fetchFeed() {
    try {
      // Note: You'll need a CORS proxy or backend for this
      const response = await fetch(`/api/rss?url=${encodeURIComponent(this.config.feedUrl)}`)
      const data = await response.json()
      this.items = data.items.slice(0, this.config.maxItems || 5)
    } catch (error) {
      console.error('Failed to fetch RSS feed:', error)
      this.items = []
    }
  }
  
  render() {
    if (this.items.length === 0) {
      this.container.innerHTML = '<p>No items to display</p>'
      return
    }
    
    this.container.innerHTML = `
      <div class="rss-widget">
        <h3>${this.config.title || 'RSS Feed'}</h3>
        <ul class="rss-items">
          ${this.items.map(item => `
            <li class="rss-item">
              <a href="${item.link}" target="_blank" rel="noopener">
                ${item.title}
              </a>
              <time>${new Date(item.pubDate).toLocaleDateString()}</time>
            </li>
          `).join('')}
        </ul>
      </div>
    `
  }
}
```

## Deployment

### Static File Hosting

For simple static hosting without Docker:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy to Nginx**:
   ```nginx
   server {
     listen 80;
     server_name dashboard.example.com;
     root /var/www/dashboard;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

3. **Deploy to GitHub Pages**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### Docker Deployment Options

1. **Single Host**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Docker Swarm**:
   ```bash
   docker stack deploy -c docker-compose.prod.yml dashboard
   ```

3. **Kubernetes** (create `k8s/` directory with manifests):
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: dashboard
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: dashboard
     template:
       metadata:
         labels:
           app: dashboard
       spec:
         containers:
         - name: dashboard
           image: your-registry/dashboard:latest
           ports:
           - containerPort: 80
         - name: tailscale
           image: tailscale/tailscale:latest
           securityContext:
             capabilities:
               add: ["NET_ADMIN"]
           env:
           - name: TS_AUTHKEY
             valueFrom:
               secretKeyRef:
                 name: tailscale-auth
                 key: authkey
   ```

## Troubleshooting

### Common Issues

1. **Config not loading**:
   - Check `config/dashboard.yaml` exists
   - Validate YAML syntax: `npx js-yaml config/dashboard.yaml`
   - Check browser console for errors
   - Ensure config volume is mounted in Docker

2. **Widgets not appearing**:
   - Check widget name matches file name
   - Verify widget is registered in renderer
   - Check browser console for import errors
   - Ensure widget implements `init()` method

3. **Tailscale connection issues**:
   - Check auth key is valid: `docker logs dashboard-tailscale`
   - Ensure device appears in Tailscale admin console
   - Verify ACL rules allow access
   - Check `TS_EXTRA_ARGS` syntax

4. **Hot reload not working**:
   - Ensure using `npm run dev` not `npm run build`
   - Check Vite config for YAML plugin
   - Try manual browser refresh
   - Check file watcher limits on Linux

5. **Docker build failures**:
   - Clear Docker cache: `docker system prune`
   - Check Node version compatibility
   - Ensure all files are committed (if using Git in Dockerfile)
   - Verify multi-stage syntax

### Debug Mode

Add debug output by setting environment variable:
```bash
# In docker-compose.yml
environment:
  - DEBUG=true
```

Then in JavaScript:
```javascript
if (window.DEBUG || process.env.DEBUG) {
  console.log('Config loaded:', config)
  console.log('Components:', config.components)
}
```

### Performance Profiling

1. **Use Chrome DevTools**:
   - Performance tab for render timeline
   - Network tab for asset loading
   - Coverage tab for unused CSS/JS

2. **Lighthouse Audit**:
   ```bash
   npx lighthouse http://localhost:5173 --view
   ```

3. **Bundle Analysis**:
   ```bash
   npx vite-bundle-visualizer
   ```

## Future Enhancements

### Potential Features

1. **Advanced Widgets**:
   - System monitoring (CPU, RAM, disk)
   - Calendar integration
   - Todo list
   - Git commit activity
   - Docker container status
   - Network speed test
   - Cryptocurrency prices
   - News headlines

2. **UI Enhancements**:
   - Drag-and-drop layout editor
   - Theme builder GUI
   - Icon picker
   - Animation options
   - Background images/videos
   - Widget transitions

3. **Functionality**:
   - Search across services
   - Keyboard shortcuts
   - Command palette
   - Multiple dashboards/pages
   - User preferences storage
   - Import/export config
   - Config versioning

4. **Integrations**:
   - Home Assistant
   - Prometheus metrics
   - Grafana embeds
   - Plex/Jellyfin status
   - Uptime monitoring
   - RSS/Atom feeds
   - Weather APIs
   - CalDAV/CardDAV

5. **Technical Improvements**:
   - PWA support
   - Offline mode
   - WebSocket updates
   - Server-sent events
   - Config validation UI
   - A11y improvements
   - I18n support
   - Plugin system

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit pull request

### Code Style

- Use 2 spaces for indentation
- No semicolons in JavaScript
- Single quotes for strings
- Meaningful variable names
- Comment complex logic
- Keep functions small and focused

### Testing

Currently manual testing. Future plans:
- [ ] Unit tests with Vitest
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Performance benchmarks

## License

MIT License - feel free to use this for your personal dashboard!

## Acknowledgments

- Inspired by Homer, Homepage, Homarr, Dashy, and Heimdall
- Built with Vite for amazing DX
- Tailscale for secure networking
- The self-hosted community for ideas and feedback