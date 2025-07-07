# Troubleshooting Guide

Solutions for common issues when setting up and running Slate dashboard.

## Common Issues

### Configuration Problems

#### Config not loading
**Symptoms**: Dashboard shows blank screen or default layout

**Solutions**:
1. Check configuration files exist:
   ```bash
   ls -la config/
   # Should show: config.yaml, widgets.yaml
   ```

2. Validate YAML syntax:
   ```bash
   # Using Node.js
   node -e "console.log(require('js-yaml').load(require('fs').readFileSync('config/widgets.yaml', 'utf8')))"
   
   # Using online validator
   # Copy content to yamllint.com
   ```

3. Check browser console for errors:
   - Open DevTools (F12)
   - Look for red error messages
   - Check Network tab for failed requests

4. Verify file permissions:
   ```bash
   chmod 644 config/*.yaml
   ```

#### Configuration not updating
**Symptoms**: Changes to YAML files not reflected in dashboard

**Solutions**:
1. Ensure development server is running:
   ```bash
   npm run dev
   # Should see "Local: http://localhost:5173"
   ```

2. Check hot reload is working:
   - Edit config file
   - Look for browser refresh or console message
   - Try manual refresh (Ctrl+R)

3. Clear browser cache:
   - Hard refresh: Ctrl+Shift+R
   - Clear site data in DevTools

### Widget Issues

#### Widgets not appearing
**Symptoms**: Empty grid cells where widgets should be

**Solutions**:
1. Check widget type spelling:
   ```yaml
   # Correct
   type: "widget"
   widget: "clock"
   
   # Incorrect
   type: "widget"
   widget: "Clock"  # Case sensitive!
   ```

2. Verify widget file exists:
   ```bash
   ls -la core/widgets/
   # Should show your widget files
   ```

3. Check browser console for import errors:
   - Look for "Failed to load module" messages
   - Check file paths are correct

4. Validate widget configuration:
   ```yaml
   my-widget:
     type: "widget"           # Required
     widget: "clock"          # Required
     position:                # Required
       row: 1
       column: 1
       span: 3
     config:                  # Optional
       format: "12h"
   ```

#### Widget errors or crashes
**Symptoms**: Error messages in widget containers

**Solutions**:
1. Check widget configuration matches schema:
   ```javascript
   // In widget file, check WIDGET_DEFINITION.schema
   export const WIDGET_DEFINITION = {
     schema: {
       format: { type: 'string', required: true }
     }
   }
   ```

2. Verify API endpoints are accessible:
   ```bash
   # Test API server
   curl http://localhost:3001/api/obsidian
   ```

3. Check for missing environment variables:
   ```bash
   # Create .env file if missing
   cp .env.example .env
   # Add your API keys
   ```

### Network & Connection Issues

#### Tailscale connection problems
**Symptoms**: Cannot access dashboard via Tailscale IP/hostname

**Solutions**:
1. Check Tailscale container logs:
   ```bash
   docker-compose logs dashboard-tailscale
   ```

2. Verify auth key is valid:
   - Check Tailscale admin console
   - Ensure key hasn't expired
   - Regenerate if needed

3. Check device appears in Tailscale network:
   - Go to https://login.tailscale.com/admin/machines
   - Look for "dashboard" device
   - Verify it's connected and accessible

4. Test ACL rules:
   ```json
   {
     "acls": [
       {
         "action": "accept",
         "src": ["group:users"],
         "dst": ["tag:dashboard:80"]
       }
     ]
   }
   ```

5. Verify network connectivity:
   ```bash
   # From another Tailscale device
   ping dashboard.your-tailnet.ts.net
   curl http://100.x.x.x  # Tailscale IP
   ```

#### API server not responding
**Symptoms**: Widgets show loading or error states

**Solutions**:
1. Start API server:
   ```bash
   cd server && node server.js
   # Should see: "Preview API server running on http://localhost:3001"
   ```

2. Check port availability:
   ```bash
   lsof -i :3001
   # Should show node process
   ```

3. Test API endpoints:
   ```bash
   curl http://localhost:3001/api/obsidian
   curl http://localhost:3001/api/trilium
   curl http://localhost:3001/api/linkwarden
   ```

4. Check API server logs:
   - Look at console output
   - Check for error messages
   - Verify cache operations

### Development Issues

#### Hot reload not working
**Symptoms**: Changes require manual browser refresh

**Solutions**:
1. Ensure using development server:
   ```bash
   npm run dev  # NOT npm run build
   ```

2. Check Vite configuration:
   ```javascript
   // vite.config.js should have hot reload plugin
   export default defineConfig({
     plugins: [
       // YAML hot reload plugin
     ]
   })
   ```

3. Verify file watcher limits (Linux):
   ```bash
   # Increase inotify limits
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

4. Check network restrictions:
   - Try different port: `npm run dev -- --port 3000`
   - Check firewall settings

#### Build failures
**Symptoms**: `npm run build` fails with errors

**Solutions**:
1. Clear node modules:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

3. Verify all imports exist:
   ```bash
   # Check for missing files
   find src -name "*.js" -exec node -c {} \;
   ```

4. Check build configuration:
   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         input: {
           main: 'src/index.html'  // Verify path exists
         }
       }
     }
   })
   ```

### Docker Issues

#### Container build failures
**Symptoms**: `docker-compose up` fails during build

**Solutions**:
1. Clear Docker cache:
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

2. Check Dockerfile syntax:
   ```dockerfile
   # Verify multi-stage build syntax
   FROM node:18-alpine AS builder
   # ...
   FROM nginx:alpine
   ```

3. Verify files are accessible:
   ```bash
   # Check .dockerignore doesn't exclude needed files
   cat .dockerignore
   ```

4. Check available disk space:
   ```bash
   df -h
   docker system df
   ```

#### Container runtime issues
**Symptoms**: Containers start but dashboard not accessible

**Solutions**:
1. Check container status:
   ```bash
   docker-compose ps
   # All containers should be "Up"
   ```

2. Check container logs:
   ```bash
   docker-compose logs my-dashboard
   docker-compose logs dashboard-tailscale
   ```

3. Verify port mappings:
   ```bash
   docker-compose port my-dashboard 80
   ```

4. Test internal connectivity:
   ```bash
   # Exec into container
   docker-compose exec my-dashboard sh
   # Test nginx
   wget -O- localhost:80
   ```

### Performance Issues

#### Slow loading times
**Symptoms**: Dashboard takes long time to load

**Solutions**:
1. Check network requests:
   - Open DevTools → Network tab
   - Look for slow requests
   - Check if APIs are responding slowly

2. Optimize widget update intervals:
   ```yaml
   config:
     updateInterval: 30000  # 30 seconds instead of 5
   ```

3. Reduce concurrent API calls:
   ```javascript
   // In widgets, stagger update times
   setTimeout(() => this.startAutoUpdate(), Math.random() * 5000)
   ```

4. Enable caching:
   ```javascript
   // In API server
   const CACHE_DURATION = 5 * 60 * 1000  // 5 minutes
   ```

#### High CPU/memory usage
**Symptoms**: System becomes slow when dashboard is running

**Solutions**:
1. Limit widget updates:
   ```yaml
   config:
     updateInterval: 60000  # 1 minute minimum
   ```

2. Add resource limits:
   ```yaml
   # docker-compose.yml
   services:
     my-dashboard:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 128M
   ```

3. Optimize widget code:
   ```javascript
   // Cleanup intervals on destroy
   destroy() {
     if (this.updateInterval) {
       clearInterval(this.updateInterval)
     }
   }
   ```

## Debug Tools

### Enable Debug Mode

1. **Development**:
   ```bash
   DEBUG=1 npm run dev
   ```

2. **Docker**:
   ```yaml
   # docker-compose.yml
   environment:
     - DEBUG=true
   ```

3. **Browser console**:
   ```javascript
   // Check loaded configuration
   console.log(window.dashboard?.config)
   
   // Check widget instances
   console.log(window.dashboard?.widgets)
   ```

### Performance Profiling

1. **Chrome DevTools**:
   - Performance tab: Record render timeline
   - Network tab: Check asset loading
   - Memory tab: Look for memory leaks
   - Coverage tab: Find unused CSS/JS

2. **Lighthouse audit**:
   ```bash
   npx lighthouse http://localhost:5173 --view
   ```

3. **Bundle analysis**:
   ```bash
   npx vite-bundle-visualizer
   ```

### Network Debugging

1. **Check API responses**:
   ```bash
   # Test all API endpoints
   curl -v http://localhost:3001/api/obsidian
   curl -v http://localhost:3001/api/trilium
   curl -v http://localhost:3001/api/linkwarden
   ```

2. **Monitor network traffic**:
   ```bash
   # Watch network connections
   netstat -tulpn | grep :3001
   netstat -tulpn | grep :5173
   ```

3. **Test Tailscale connectivity**:
   ```bash
   # From dashboard container
   docker-compose exec dashboard-tailscale tailscale status
   docker-compose exec dashboard-tailscale tailscale ping other-device
   ```

## Validation Tools

### Configuration Validation

```bash
# Create config validator script
cat > validate-config.js << 'EOF'
const yaml = require('js-yaml')
const fs = require('fs')

try {
  const config = yaml.load(fs.readFileSync('config/config.yaml', 'utf8'))
  const widgets = yaml.load(fs.readFileSync('config/widgets.yaml', 'utf8'))
  
  console.log('✓ Configuration files are valid')
  console.log(`✓ Found ${Object.keys(widgets).length} widgets`)
  console.log(`✓ Theme: ${config.theme}`)
  console.log(`✓ Columns: ${config.columns}`)
  
} catch (error) {
  console.error('✗ Configuration error:', error.message)
  process.exit(1)
}
EOF

node validate-config.js
```

### Widget Validation

```bash
# Check widget implementations
cat > validate-widgets.js << 'EOF'
const fs = require('fs')
const path = require('path')

const widgetDir = 'core/widgets'
const widgets = fs.readdirSync(widgetDir)

widgets.forEach(file => {
  if (file.endsWith('.js')) {
    const widgetPath = path.join(widgetDir, file)
    const content = fs.readFileSync(widgetPath, 'utf8')
    
    // Check for required exports
    if (!content.includes('export default')) {
      console.error(`✗ ${file}: Missing default export`)
    }
    
    if (!content.includes('WIDGET_DEFINITION')) {
      console.warn(`⚠ ${file}: Missing WIDGET_DEFINITION`)
    }
    
    console.log(`✓ ${file}: OK`)
  }
})
EOF

node validate-widgets.js
```

## Recovery Procedures

### Reset to Default Configuration

```bash
# Backup current config
cp -r config config.backup.$(date +%Y%m%d)

# Reset to defaults
git checkout HEAD -- config/
# Or restore from template
cp config.example/* config/
```

### Clean Installation

```bash
# Complete reset
rm -rf node_modules package-lock.json
npm install

# Clear all caches
npm run clean  # If available
rm -rf dist/

# Rebuild
npm run build
```

### Container Reset

```bash
# Stop and remove all containers
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

## Getting Help

### Log Collection

When reporting issues, collect these logs:

```bash
# Application logs
npm run dev > app.log 2>&1

# Docker logs
docker-compose logs > docker.log 2>&1

# System info
node --version > system.log
npm --version >> system.log
docker --version >> system.log
```

### Issue Template

When reporting bugs, include:

1. **Environment**:
   - OS and version
   - Node.js version
   - Docker version (if using)
   - Browser and version

2. **Configuration**:
   - Sanitized config files
   - Widget list
   - Theme being used

3. **Error details**:
   - Full error message
   - Browser console output
   - Server logs
   - Steps to reproduce

4. **Expected vs actual behavior**

### Community Resources

- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share configurations
- **Wiki**: Community guides and examples
- **Discord**: Real-time community support (if available)