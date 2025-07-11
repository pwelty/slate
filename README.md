# Slate - Personal Dashboard

> A completely static, secure personal dashboard with zero dependencies.

## Quick Start

```bash
# Install dependencies
npm install

# Build static files
npm run build

# Serve locally
npm run serve
```

This generates 3 static files:
- `index.html` - Complete HTML with all widgets
- `app.css` - All styles with theme support
- `app.js` - All widget code inlined

## Development

```bash
# Watch for config changes and rebuild
npm run watch

# Edit configuration
vim config/config.yaml
vim config/widgets.yaml
```

## Features

- **Static Generation**: All configuration compiled at build time
- **Zero Dependencies**: No runtime dependencies, APIs, or external services
- **Secure**: No configuration exposed to client-side
- **Instant Themes**: CSS-based theme switching
- **Responsive Grid**: Flexible grid layout system
- **Widget System**: Extensible widget architecture

## Configuration

Edit `config/config.yaml` and `config/widgets.yaml` to customize your dashboard.

## Deployment

Copy the 3 generated files to any web server:
- `index.html`
- `app.css`  
- `app.js`

No build process, no APIs, no complexity - just static files.

## Overview

Slate is designed to be a lightweight, customizable homepage for personal use. Unlike existing solutions, this focuses on:

- **Simplicity**: No framework overhead, just vanilla JS
- **Static-first**: Minimal JavaScript, mostly CSS
- **YAML Configuration**: All customization through code
- **Docker + Tailscale**: Secure, private networking
- **Hot Reload**: Instant updates during development

## Features

### ✅ Core Features
- **YAML configuration** for complete control
- **CSS Grid layout** system with precise positioning
- **Hot-reload** during development
- **Theme support** with granular font controls
- **Widget system** with 13 built-in widget types
- **Collapsible groups** with localStorage persistence
- **Responsive design** (12→8→1 columns)
- **Docker deployment** with Tailscale sidecar
- **No database** required
- **Service integrations** for popular tools

### 🧩 Available Widgets (13 Types)

1. **Clock** - Real-time clock with 12h/24h format
2. **Weather** - OpenWeatherMap integration with radar
3. **Links** - Service bookmarks with status checking
4. **MOTD** - Message of the Day with alerts
5. **Groups** - Collapsible containers for organization
6. **Image** - Logo/image display with custom styling
7. **Obsidian** - Notes integration via Local REST API
8. **Trilium** - Hierarchical notes via ETAPI
9. **Todoist** - Task management with project filtering
10. **Linkwarden** - Bookmark management integration
11. **Preview** - Recent items from external services
12. **Status** - Service health monitoring
13. **Theme Switcher** - Real-time theme switching

### 🎨 Built-in Themes
- **Dark** - Professional dark theme
- **Light** - Clean light theme  
- **Tokyo Night** - Popular developer theme
- **Retro** - Classic terminal aesthetic
- **Synthwave** - 80s neon cyberpunk

## Technology Stack

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **CSS Grid** - Modern layout system
- **CSS Custom Properties** - Dynamic theming
- **ES6 Modules** - Modern JavaScript features

### Build & Development
- **Vite** - Fast development server and bundler
- **js-yaml** - YAML configuration parsing
- **Hot Module Reload** - Instant configuration updates

### Deployment
- **Docker** - Containerized deployment
- **Tailscale** - Secure network access
- **Nginx** - Static file serving
- **Node.js** - API server for service integrations

## Project Structure

```
slate/
├── config/                 # Configuration files
│   ├── config.yaml        # Global dashboard settings
│   └── widgets.yaml       # Widget layout configuration
├── core/                  # Core framework files
│   ├── themes/           # Theme definitions (5 built-in themes)
│   └── widgets/          # Widget implementations (13 widgets)
├── docs/                 # All documentation
│   ├── CONFIGURATION.md  # Complete configuration guide
│   ├── DEPLOYMENT.md     # Docker & deployment guide
│   ├── TROUBLESHOOTING.md # Common issues & solutions
│   ├── WIDGET_DEFINITIONS.md # Complete widget reference
│   ├── ROADMAP.md        # Future development plans
│   ├── NOTES.md          # Project overview & architecture
│   └── CLAUDE.md         # Development notes for AI assistance
├── server/               # API server for service integrations
├── src/                  # Frontend source code
│   ├── assets/          # Static assets
│   │   └── styles/      # CSS files
│   ├── scripts/         # JavaScript modules
│   └── index.html       # Main HTML file
├── docker/              # Docker configuration
```

## Quick Configuration

### Global Settings (`config/config.yaml`)
```yaml
title: \"My Dashboard\"
theme: \"tokyo-night\"
columns: 12
gap: \"1rem\"
```

### Widget Layout (`config/widgets.yaml`)
```yaml
# Groups (containers)
dev-group:
  type: \"group\"
  title: \"Development\"
  position: { row: 2, column: 1, span: 6 }
  collapsible: true

# Widgets reference groups
github-link:
  type: \"link\"
  group: \"dev-group\"
  name: \"GitHub\"
  url: \"https://github.com\"
  icon: \"github\"

# Standalone widgets
header-clock:
  type: \"widget\"
  widget: \"clock\"
  position: { row: 1, column: 10, span: 3 }
  config:
    format: \"12h\"
    showDate: true
```

## Current Implementation Status

### ✅ Fully Implemented
- **Core Framework**: Widget loading, theme system, configuration
- **Layout System**: CSS Grid with intuitive positioning
- **13 Widget Types**: All major widget categories covered
- **5 Themes**: Professional themes for different preferences
- **Service Integrations**: Obsidian, Trilium, Linkwarden, Todoist
- **Docker Deployment**: Production-ready containerization
- **Hot Reload**: Development server with instant updates
- **Documentation**: Comprehensive guides and references

### 🔧 Configuration-Ready
- **Weather Integration**: OpenWeatherMap API ready
- **Status Monitoring**: Service health checking
- **Tailscale Integration**: Secure private network access
- **Theme Customization**: Granular font and color controls

## Documentation

### 📚 Complete Guides
- **[Configuration Reference](docs/CONFIGURATION.md)** - Complete YAML configuration guide
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Docker, Tailscale, and production setup
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Widget Reference](docs/WIDGET_DEFINITIONS.md)** - All 13 widgets with examples
- **[Roadmap](docs/ROADMAP.md)** - Future development plans

### 🚀 Quick References
- **[Project Notes](docs/NOTES.md)** - Architecture overview and philosophy
- **[Development Notes](docs/CLAUDE.md)** - Guidelines for AI-assisted development

## Deployment Options

### Development
```bash
npm run dev
# Dashboard available at http://localhost:5173
```

### Docker (Recommended)
```bash
# With Tailscale for secure access
docker-compose up --build
# Access via Tailscale network
```

### Static Hosting
```bash
npm run build
# Deploy `dist/` folder to any static host
```

> **Detailed deployment instructions**: See [Deployment Guide](docs/DEPLOYMENT.md)

## Service Integrations

Slate integrates with popular productivity and development tools:

- **📝 Note-taking**: Obsidian, Trilium
- **📋 Task Management**: Todoist
- **🔖 Bookmarks**: Linkwarden  
- **🌤️ Weather**: OpenWeatherMap
- **🔗 Links**: Any web service
- **📊 Monitoring**: Service status checking
- **🎨 Themes**: Real-time theme switching

> **Complete configuration details**: See [Widget Reference](docs/WIDGET_DEFINITIONS.md)

## Why Slate?

### Compared to Homer/Homepage/Homarr
- **Simpler**: No database, just YAML files
- **Faster**: Vanilla JS, minimal dependencies
- **Secure**: Tailscale integration for private access
- **Flexible**: Plugin architecture with flat configuration

### Design Philosophy
1. **Configuration over Code**: Customize through YAML, not JavaScript
2. **Simplicity over Features**: Core functionality done extremely well
3. **Performance over Convenience**: Fast loading, efficient updates
4. **Self-hosting over Cloud**: Full control of your data and deployment

## Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/slate/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/your-username/slate/discussions)
- **📖 Documentation**: Comprehensive guides in `docs/` folder
- **🤝 Contributing**: See [Roadmap](docs/ROADMAP.md) for contribution guidelines

## License

MIT License - feel free to use this for your personal dashboard!

---

**Ready to get started?** Follow the [Quick Start](#quick-start) guide above, then customize your dashboard using the [Configuration Reference](docs/CONFIGURATION.md).