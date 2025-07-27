# Slate Dashboard

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/pwelty/slate.svg)](https://github.com/pwelty/slate/releases)

🎯 **A self-hosted personal dashboard that brings together all your services, tools, and information in one beautiful interface.**

Built with Python, configured with YAML, and rendered server-side for blazing fast performance.

![Slate Dashboard](src/screenshots/slate%20db%20v1.png)

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/pwelty/slate.git
cd slate

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Build and serve
python3 src/scripts/dashboard_renderer.py && python3 serve.py

# Open http://localhost:5173
```

Your dashboard is now running with the Ocean theme! 🌊

## 🎯 Features

- **🐍 Python-powered** - No Node.js or npm required
- **📄 YAML configuration** - Simple, readable configuration files  
- **🎨 Server-side rendering** - Fast builds with Jinja2 templates
- **🔌 Smart widgets** - Built-in integrations for popular services
- **🌈 Beautiful themes** - Ocean, Synthwave, Tokyo Night, and more
- **⚡ Auto-rebuild** - File watching for instant development
- **🔒 Secure by design** - Tailscale integration, private by default

## 🔌 Available Widgets

- **🕒 Clock** - Customizable time display
- **🌤️ Weather** - OpenWeatherMap integration with forecasts  
- **📋 Todoist** - Task management with priority indicators
- **📚 Trilium** - Recent notes from your knowledge base
- **🔖 Linkwarden** - Bookmark management
- **🛡️ Pi-hole** - Ad blocking statistics (v5 & v6+ support)
- **🔗 Links** - Service shortcuts with status monitoring
- **📊 Status Summary** - System health overview
- **📝 Text** - Custom content and messages
- **📡 Radar** - Weather radar visualization

## 🎨 Themes

Choose from beautiful pre-built themes:

- **🌊 Ocean** - Calming blue with wave animations
- **🌙 Dark** - Professional dark theme
- **☀️ Light** - Clean minimalist design  
- **🌃 Tokyo Night** - Popular developer theme
- **🕹️ Synthwave** - 80s neon cyberpunk
- **💚 Retro** - Classic terminal aesthetic

## ⚙️ Configuration

Configure your dashboard by editing `config/dashboard.yaml`:

```yaml
dashboard:
  title: "My Dashboard"
  theme: "ocean"
  columns: 12

components:
  - id: "clock"
    type: "clock"
    position: { row: 1, column: 10, width: 3, height: 1 }
    config:
      format: "12h"
      showDate: true

  - id: "weather"
    type: "weather"
    position: { row: 2, column: 1, width: 4, height: 2 }
    config:
      location: "30033"
      apiKey: "YOUR_OPENWEATHER_API_KEY"  # Get from openweathermap.org
      units: "fahrenheit"

  - id: "todoist"
    type: "todoist"
    position: { row: 2, column: 5, width: 4, height: 2 }
    config:
      apiToken: "your-todoist-token"
      limit: 5
```

## 🔧 Development

### Auto-rebuild with file watching
```bash
source venv/bin/activate
python3 scripts/auto-rebuild.py
```

### Manual build
```bash
python3 src/scripts/dashboard_renderer.py
python3 serve.py  # http://localhost:5173
```

### Create custom theme
```bash
cp src/themes/ocean.yaml src/themes/mytheme.yaml
# Edit colors and configure in dashboard.yaml
```

## 🚀 Deployment

### Production
```bash
python3 src/scripts/dashboard_renderer.py
cd dist && python3 -m http.server 8080
```

### Secure Remote Access with Tailscale
```bash
# Install and connect Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Serve with Tailscale
python3 serve.py
tailscale serve / http://localhost:5173
```

Access from anywhere at `https://slate.TSNAME.ts.net` 🌐

## 📚 Documentation

- **[Configuration Guide](docs/CONFIGURATION.md)** - Complete YAML reference
- **[Widget Reference](docs/WIDGET_DEFINITIONS.md)** - All available widgets
- **[Theming Guide](docs/THEMING_ARCHITECTURE.md)** - Creating custom themes
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues

## ❓ Frequently Asked Questions

### What makes Slate different from other dashboards?

Slate uses **Python and YAML** instead of Node.js and databases. Unlike Dashy, Homepage, Homarr, or Heimdall, Slate focuses on **server-side rendering** for blazing fast performance and includes **first-class Tailscale integration** for secure remote access without complex setup.

### Can I use Slate without Docker?

Yes! Slate runs natively with Python. Just create a virtual environment, install requirements, and run the build script. Docker is completely optional.

### How do I add custom widgets?

Create a new YAML file in `src/widgets/` following the existing patterns. Slate's widget system is flexible and supports HTML templates, CSS styling, and API integrations.

### Does Slate support mobile devices?

Yes, Slate is fully responsive and works great on tablets and phones. The themes adapt automatically to different screen sizes.

### How secure is Slate?

Slate is designed to be **private by default**. It runs entirely on your network, includes Tailscale integration for secure remote access, and never sends data to external services except for widget APIs you configure.

### Can I contribute themes or widgets?

Absolutely! We welcome contributions of new themes, widgets, and documentation. Check out the [contribution guidelines](docs/CONTRIBUTING.md) to get started.

## 🌟 Alternatives

Slate is one of many excellent FOSS dashboard solutions. Consider these alternatives:

- **[Dashy](https://dashy.to/)** - Highly customizable with 50+ widgets and extensive theming
- **[Homepage](https://gethomepage.dev/)** - Modern design with 100+ service integrations  
- **[Homarr](https://homarr.dev/)** - GUI-based configuration with user management
- **[Heimdall](https://github.com/linuxserver/Heimdall)** - Simple, lightweight application launcher
- **[Homer](https://github.com/bastienwirtz/homer)** - Minimal static homepage

Slate differentiates itself with **Python-based builds**, **server-side rendering**, and **integrated Tailscale support**.

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, documentation improvements, or new themes and widgets.

- **🐛 Issues:** [GitHub Issues](https://github.com/pwelty/slate/issues)
- **💡 Discussions:** [GitHub Discussions](https://github.com/pwelty/slate/discussions)
- **📖 Documentation:** Edit files in the `docs/` folder
- **🎨 Themes:** Add new themes in `src/themes/`

## About the Author

This project is developed by **Dr. Paul Welty**, Vice Provost for Academic Innovation at Emory University and founder of [Synaxis, LLC](https://www.synaxis.ai). With a Ph.D. in Philosophy and 25+ years of technology solution experience, Paul specializes in strategic AI implementation and team capability transformation.

At Emory, Paul's major achievements include launching three transformative initiatives: the Center for AI Learning (CAIL), The Hatchery (Emory's Center for Student Innovation and Entrepreneurship), and Facet (Emory's Faculty Information and Action System). Through Synaxis, he helps teams dramatically increase their capacity through practical AI integration - from customer support to market research.

Slate reflects Paul's commitment to making self-hosted tools accessible and practical for real-world workflows, bringing together the services and information you need in one beautiful interface.

🌐 **Learn more:** [paulwelty.com](https://www.paulwelty.com) | [synaxis.ai](https://www.synaxis.ai)

*Interested in team AI implementation or custom dashboard solutions? Let's talk about transforming your workflow.*

## 📄 License

MIT License © 2025 Paul Welty

---

**Ready to get started?** Clone the repo, run the setup commands above, and you'll have your dashboard running in minutes! 🚀