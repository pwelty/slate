# Slate Dashboard - Build Instructions

Simple Python-based dashboard builder. No npm required!

## Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Quick Start

```bash
# Activate venv first
source venv/bin/activate

# Build and serve in one command
python3 src/scripts/dashboard_renderer.py --serve

# Build with specific theme
python3 src/scripts/dashboard_renderer.py --theme minimal-dark --serve

# Just build (no serve)
python3 src/scripts/dashboard_renderer.py --theme minimal-dark

# Just serve existing build
python3 src/scripts/dashboard_renderer.py --serve-only
```

## Available Themes

- `dark` (default)
- `light` 
- `minimal-dark` (new base config system)
- `retro`
- `synthwave`
- `tokyo-night`
- `ocean`

## How It Works

1. **Python renderer** reads YAML configs and widget templates
2. **Theme renderer** processes themes with base config explosion
3. **Built-in server** serves the static files
4. **Dynamic theme selector** auto-populates from available themes

## Files

- `src/scripts/dashboard_renderer.py` - Main build script
- `src/scripts/theme_renderer.py` - Theme processing with base config
- `src/base-config.yaml` - Universal styling rules
- `src/themes/*.yaml` - Theme definitions
- `src/widgets/*.yaml` - Widget templates
- `config/dashboard.yaml` - Dashboard layout

## Architecture

- **100% Python** - No npm, Node.js, or JavaScript build tools
- **YAML-based** - Configuration, widgets, and themes in YAML
- **Template inheritance** - Widgets extend base templates
- **Theme explosion** - Minimal themes generate complete CSS
- **Static output** - Builds to `dist/` for easy deployment