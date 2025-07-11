# Live Reload System

The Slate dashboard includes automatic live reload functionality that refreshes the page when the dashboard is rebuilt during development.

## ✨ Features

- **Automatic page refresh** when dashboard files change
- **Development mode only** - disabled in production
- **Smart detection** using build timestamps
- **Debounced rebuilds** to prevent rapid fire changes
- **Multiple auto-rebuild options** (Node.js, Python, Shell)

## 🚀 Quick Start

### Option 1: Complete Development Setup (Recommended)
```bash
# Start file watching + web server in one command
npm run dev:watch
```

This will:
1. Start watching for file changes
2. Automatically rebuild the dashboard when files change  
3. Serve the dashboard at http://localhost:5173
4. Auto-refresh the page when rebuild completes

### Option 2: Manual Setup
```bash
# Terminal 1: Start auto-rebuild watcher
npm run watch:dashboard

# Terminal 2: Start web server  
npm run serve
```

### Option 3: Different Themes
```bash
# Watch with specific themes
npm run watch:dashboard:light
npm run watch:dashboard:retro
```

## 🔍 What Files Are Watched

The live reload system monitors these paths for changes:

- `config/dashboard.yaml` - Main dashboard configuration
- `config/widgets.yaml` - Widget configuration  
- `src/widgets/` - Widget definitions (*.yaml files)
- `src/themes/` - Theme definitions
- `src/template/` - Template files (HTML/CSS/JS)

## ⚙️ How It Works

### 1. Build Timestamp Injection
When the dashboard is rendered, a unique timestamp is injected into the HTML:

```html
<meta name="build-timestamp" content="1752077593648">
<body data-build-timestamp="1752077593648">
```

### 2. Frontend Detection
The dashboard JavaScript (`base.js`) periodically checks for timestamp changes:

- Runs every 2 seconds (configurable)
- Only active in development mode (localhost:5173)
- Fetches current page to check for new timestamp
- Reloads page when change detected

### 3. File Watching
The auto-rebuild scripts watch for file changes and trigger rebuilds:

- **Node.js version**: Uses built-in `fs.watch()` (no dependencies)
- **Python version**: Uses `watchdog` library (requires installation)
- **Shell version**: Uses `fswatch` (requires brew install)

## 🎛️ Configuration

### Disable Live Reload
```javascript
// In browser console
Dashboard.disableLiveReload();
```

### Change Check Interval
Edit `src/template/js/base.js`:
```javascript
liveReload: {
    checkInterval: 5000 // Check every 5 seconds instead of 2
}
```

### Production Builds
Live reload is automatically disabled when:
- Hostname is not `localhost` or `127.0.0.1`
- Port is not `5173`
- Build timestamp is missing

## 🧪 Testing Live Reload

1. Start the development setup: `npm run dev:watch`
2. Open http://localhost:5173 in your browser
3. Open browser console to see live reload messages
4. Edit `config/dashboard.yaml` (change title, add widget, etc.)
5. Watch the console and page automatically refresh

### Expected Console Output
```
🔧 Live reload enabled - dashboard will auto-refresh when rebuilt
🔄 Dashboard updated detected! Reloading...
   Old: 1752077593648
   New: 1752077594123
```

## 🐛 Troubleshooting

### Live Reload Not Working?

1. **Check development mode**: Must be on `localhost:5173`
2. **Check console**: Look for live reload initialization messages
3. **Check build timestamp**: Verify meta tag is present in HTML
4. **Check auto-rebuild**: Ensure file watcher is running and rebuilding

### Common Issues

- **Port conflicts**: Make sure port 5173 is available
- **Python not found**: Use `python3` instead of `python`
- **Permission errors**: Make scripts executable with `chmod +x`
- **Cache issues**: Hard refresh with Ctrl+F5

## 🔧 Advanced Usage

### Custom Rebuild Script
You can create your own rebuild trigger:
```bash
# Trigger manual rebuild
python3 src/scripts/dashboard_renderer.py --theme dark
```

### Integration with IDEs
Many IDEs can run npm scripts directly:
- **VS Code**: Terminal → Run Task → `npm: dev:watch`
- **WebStorm**: npm Scripts panel → `dev:watch`

### Multiple Theme Development
```bash
# Watch different themes in separate terminals
npm run watch:dashboard:dark    # Terminal 1
npm run watch:dashboard:light   # Terminal 2  
npm run watch:dashboard:retro   # Terminal 3
``` 