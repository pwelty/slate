# Slate - Modern Personal Dashboard

> A Python-powered personal dashboard with YAML configuration, server-side rendering, and beautiful themes.

![Slate Dashboard](src/screenshots/slate%20db%20v1.png)

## ✨ Quick Start

```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Build and serve dashboard
python3 src/scripts/dashboard_renderer.py && python3 serve.py

# 4. Open http://localhost:5173
```

Your dashboard is now running with the Ocean theme! 🌊

## 🎯 What is Slate?

Slate is a **self-hosted personal dashboard** that brings together all your services, tools, and information in one beautiful interface. Unlike traditional dashboards, Slate uses:

- **🐍 Python Build System** - No Node.js or npm required
- **📄 YAML Configuration** - Simple, readable configuration files  
- **🎨 Server-Side Rendering** - Fast, pre-built HTML with Jinja2 templates
- **🔌 Smart Widgets** - Built-in integrations for Trilium, Linkwarden, Todoist, and more
- **🌈 Beautiful Themes** - Ocean, Synthwave, Tokyo Night, and more with animated effects
- **⚡ Auto-Rebuild** - File watching for instant updates during development

## 🚀 Features

### ✅ **Built-in Widgets**
- **🕒 Clock** - Real-time clock with customizable format
- **🌤️ Weather** - OpenWeatherMap integration with forecasts  
- **📋 Todoist** - Recent tasks with priority indicators
- **📚 Trilium** - Recent notes from your Trilium instance
- **🔖 Linkwarden** - Recent bookmarks and collections
- **🔗 Links** - Service shortcuts with status monitoring
- **📊 Status Summary** - System health overview
- **📝 Text** - Custom messages and information
- **🖼️ Images** - Logos and visual elements
- **📡 Radar** - Weather radar visualization
- **📈 Forecast** - Extended weather forecasting

### 🎨 **Modern Themes**
- **🌊 Ocean** - Calming blue theme with wave animations
- **🌙 Dark** - Professional dark theme
- **☀️ Light** - Clean minimalist light theme  
- **🌃 Tokyo Night** - Popular developer theme with subtle effects
- **🕹️ Synthwave** - 80s neon cyberpunk with animated borders
- **💚 Retro** - Classic terminal green-on-black aesthetic

### 🛠️ **Developer Experience**
- **⚡ Auto-rebuild** - File watching for instant updates
- **🔧 YAML-based** - Easy configuration without code
- **🎯 Server-side rendering** - Fast, pre-built static files
- **🐍 Pure Python** - No JavaScript build tools required
- **📦 Virtual environment** - Isolated dependencies

### 🔒 **Security & Access**
- **🌐 Tailscale Integration** - Secure remote access without port forwarding
- **🏠 Self-hosted** - Your data stays on your network
- **🔐 Private by design** - No cloud dependencies or data collection

## 📁 Project Structure

```
slate/
├── config/
│   └── dashboard.yaml          # Main configuration file
├── src/
│   ├── themes/                 # Theme definitions (YAML + JS)
│   │   ├── ocean.yaml         # Theme colors & typography
│   │   └── ocean.js           # Theme effects & animations
│   ├── widgets/                # Widget definitions (YAML)
│   │   ├── clock.yaml         # Clock widget configuration
│   │   ├── weather.yaml       # Weather widget with API integration
│   │   └── todoist.yaml       # Todoist integration
│   ├── template/               # Base HTML/CSS/JS templates
│   └── scripts/                # Python build system
│       ├── dashboard_renderer.py  # Main build script
│       ├── theme_renderer.py      # Theme processing
│       └── widget_renderer.py     # Widget processing
├── dist/                       # Generated dashboard files
├── docs/                       # Comprehensive documentation
└── serve.py                    # Development server
```

## ⚙️ Configuration

Edit `config/dashboard.yaml` to customize your dashboard:

```yaml
# Global settings
dashboard:
  title: "My Dashboard"
  theme: "ocean"
  columns: 12

# Widget layout
components:
  # Header with logo and clock
  - id: "header-clock"
    type: "clock"
    position: { row: 1, column: 10, width: 3, height: 1 }
    config:
      format: "12h"
      showDate: true

  # Recent activity group
  - id: "recent-activity"
    type: "group"
    title: "Recent Activity"
    position: { row: 3, column: 1, width: 9, height: 1 }
    items:
      - type: "trilium"
        config:
          title: "Recent Notes"
          baseUrl: "https://trilium.example.com"
          apiToken: "your-token"
          limit: 5
```

## 🔌 Service Integrations

Slate includes server-side integrations for popular services:

### **📚 Trilium Notes**
```yaml
- type: "trilium"
  config:
    baseUrl: "https://trilium.example.com"
    apiToken: "your-etapi-token"
    limit: 5
```

### **🔖 Linkwarden Bookmarks**
```yaml
- type: "linkwarden"
  config:
    baseUrl: "https://linkwarden.example.com"
    apiKey: "your-api-key"
    limit: 5
```

### **📋 Todoist Tasks**
```yaml
- type: "todoist"
  config:
    apiToken: "your-todoist-token"
    limit: 5
```

### **🌤️ Weather**
```yaml
- type: "weather"
  config:
    location: "30033"  # ZIP code or city
    apiKey: "your-openweather-key"
    units: "fahrenheit"
```

## 🎨 Themes

Slate includes beautiful pre-built themes. Set your theme in `config/dashboard.yaml`:

### **🌊 Ocean Theme (Default)**
Calming blue palette with wave animations:
```yaml
dashboard:
  theme: "ocean"        # Theme from src/themes/
```

### **🕹️ Synthwave Theme** 
80s neon cyberpunk with animated effects:
```yaml
dashboard:
  theme: "synthwave"    # Theme from src/themes/
```

### **🌃 Tokyo Night Theme**
Popular VS Code theme with subtle animations:
```yaml
dashboard:
  theme: "tokyo-night"  # Theme from src/themes/
```

## 🔧 Development

### **Auto-rebuild with file watching:**
```bash
# Activate virtual environment
source venv/bin/activate

# Start auto-rebuild (rebuilds on file changes)
python3 scripts/auto-rebuild.py
```

### **Manual build:**
```bash
# Build dashboard (uses theme from dashboard.yaml)
python3 src/scripts/dashboard_renderer.py

# Serve built files
python3 serve.py  # http://localhost:5173
```

### **Create custom theme:**
```bash
# Copy existing theme
cp src/themes/ocean.yaml src/themes/mytheme.yaml

# Edit colors and effects
vim src/themes/mytheme.yaml

# Set theme in dashboard.yaml
echo "dashboard:\n  theme: \"mytheme\"" >> config/dashboard.yaml

# Build with your theme
python3 src/scripts/dashboard_renderer.py
```

## 📚 Documentation

- **[Configuration Guide](docs/CONFIGURATION.md)** - Complete YAML reference
- **[Widget Reference](docs/WIDGET_DEFINITIONS.md)** - All available widgets
- **[Theming Guide](docs/THEMING_ARCHITECTURE.md)** - Creating custom themes
- **[Build System](BUILD.md)** - Python renderer details
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues

## 🚀 Deployment

### **Development**
```bash
python3 serve.py  # http://localhost:5173
```

### **Production**
```bash
# Build for production (uses theme from dashboard.yaml)
python3 src/scripts/dashboard_renderer.py

# Serve with any web server
cd dist && python3 -m http.server 8080
```

### **Secure Remote Access with Tailscale** ⭐
For secure access from anywhere without exposing ports:

```bash
# 1. Install Tailscale on your server
curl -fsSL https://tailscale.com/install.sh | sh

# 2. Connect to your Tailscale network
sudo tailscale up

# 3. Serve dashboard with Tailscale Serve
python3 serve.py
tailscale serve / http://localhost:5173

# 4. Access from any Tailscale device at:
# https://slate.TSNAME.ts.net
```

**Benefits:**
- 🔒 **Zero-config VPN** - No port forwarding or firewall rules
- 🌍 **Access anywhere** - Secure access from any device  
- 🛡️ **Private network** - Dashboard never exposed to internet
- 🌐 **Clean URLs** - No ports, just https://slate.TSNAME.ts.net
- ⚡ **Fast setup** - Working in minutes

### **Docker** 🐳
```bash
# 1. Copy environment and config templates
cp .env.example .env
cp config/dashboard-example.yaml config/dashboard.yaml

# 2. Edit .env with your Tailscale auth key
# 3. Edit config/dashboard.yaml with your widgets and services

# 4. Start the dashboard
docker-compose up -d

# Access at https://your-hostname.YOUR-TAILNET.ts.net
```

**Required files:**
- `.env` - Tailscale auth key and API keys for widgets
- `config/dashboard.yaml` - Your dashboard layout and widget configuration

## 🎯 Why Slate?

### **vs Homer/Homepage/Homarr**
- ✅ **Simpler**: YAML configuration, no database
- ✅ **Faster**: Python build system, server-side rendering  
- ✅ **More Secure**: Tailscale integration, private by design
- ✅ **Beautiful**: Modern themes with animations
- ✅ **Integrated**: Built-in service connections

### **Design Philosophy**
1. **📄 Configuration over Code** - YAML files, not JavaScript
2. **🎨 Beauty over Complexity** - Gorgeous themes, simple setup
3. **⚡ Performance over Features** - Fast builds, efficient rendering
4. **🔒 Security over Convenience** - Tailscale integration, private networks
5. **🏠 Self-hosting over Cloud** - Your data, your network, your control

## 🤝 Contributing

1. **🐛 Found a bug?** [Open an issue](https://github.com/pwelty/slate/issues)
2. **💡 Have an idea?** [Start a discussion](https://github.com/pwelty/slate/discussions)  
3. **📖 Improve docs** - Edit files in `docs/` folder
4. **🎨 Create a theme** - Add new themes in `src/themes/`

## 📄 License

MIT License - feel free to use for your personal dashboard!

---

## 🚀 Get Started Now

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 src/scripts/dashboard_renderer.py && python3 serve.py
```

**Open http://localhost:5173 and enjoy your new dashboard! 🎉**