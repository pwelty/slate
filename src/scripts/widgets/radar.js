export default class RadarWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.map = null
    this.radarLayer = null
    // Generate a unique ID for this widget instance
    this.widgetId = 'radar-' + Math.random().toString(36).substr(2, 9)
  }

  async init() {
    console.log('RadarWidget: Initializing radar widget', this.config)
    this.render()
    this.loadRadarMap()
  }

  render() {
    // Get location coordinates for centering the map
    const location = this.config.location || "30033"
    
    this.container.innerHTML = `
      <div class="radar-widget">
        <div class="radar-header">
          <h3>Weather Radar</h3>
          <div class="radar-controls">
            <button class="radar-refresh" onclick="this.closest('.radar-widget').refreshRadar()">🔄</button>
            <div class="radar-legend">
              <span class="legend-item">🟦 Light</span>
              <span class="legend-item">🟨 Moderate</span>
              <span class="legend-item">🟧 Heavy</span>
              <span class="legend-item">🟥 Intense</span>
            </div>
          </div>
        </div>
        <div class="radar-map" id="radar-map-${this.widgetId}">
          <div class="radar-loading">
            <div class="loading-spinner"></div>
            <p>Loading radar data...</p>
          </div>
        </div>
        <div class="radar-footer">
          <small>Live precipitation radar • Updates every 10 minutes</small>
        </div>
      </div>
    `

    // Add refresh method to the widget container for button access
    this.container.querySelector('.radar-widget').refreshRadar = () => this.refreshRadar()
  }

  async loadRadarMap() {
    try {
      console.log('RadarWidget: Loading radar map for location:', this.config.location)
      // Get coordinates for the location
      const coords = await this.getLocationCoordinates(this.config.location || "30033")
      console.log('RadarWidget: Got coordinates:', coords)
      this.createSimpleRadarDisplay(coords)
    } catch (error) {
      console.error('RadarWidget: Error loading radar map:', error)
      this.renderError(error)
    }
  }

  async getLocationCoordinates(location) {
    const apiKey = this.config.apiKey
    if (!apiKey) {
      throw new Error('API key required for radar widget')
    }

    try {
      // Use OpenWeatherMap Geocoding API to get coordinates
      const geoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${location},US&appid=${apiKey}`
      console.log('RadarWidget: Fetching coordinates from:', geoUrl)
      const response = await fetch(geoUrl)
      
      if (!response.ok) {
        throw new Error('Failed to get location coordinates')
      }
      
      const data = await response.json()
      return { lat: data.lat, lon: data.lon, name: data.name }
    } catch (error) {
      console.warn('RadarWidget: Using fallback coordinates due to error:', error)
      // Fallback coordinates for 30033 (Decatur, GA)
      return { lat: 33.7748, lon: -84.2963, name: 'Decatur' }
    }
  }

  createSimpleRadarDisplay(coords) {
    const mapContainer = this.container.querySelector(`#radar-map-${this.widgetId}`)
    const apiKey = this.config.apiKey
    
    if (!mapContainer) {
      console.error('RadarWidget: Could not find map container with ID:', `radar-map-${this.widgetId}`)
      return
    }
    
    // Use custom display name if provided, otherwise use API location
    const displayLocation = this.config.displayName || coords.name
    
    // Calculate tile coordinates
    const tileCoords = this.getTileCoordinates(coords.lat, coords.lon, 6) // Increased zoom for better detail
    const cloudsUrl = `https://tile.openweathermap.org/map/clouds_new/6/${tileCoords.x}/${tileCoords.y}.png?appid=${apiKey}`
    const precipitationUrl = `https://tile.openweathermap.org/map/precipitation_new/6/${tileCoords.x}/${tileCoords.y}.png?appid=${apiKey}`
    
    console.log('RadarWidget: Creating radar display', {
      coords,
      tileCoords,
      cloudsUrl,
      precipitationUrl,
      displayLocation
    })

    // Create a radar display with base clouds layer and precipitation overlay
    mapContainer.innerHTML = `
      <div class="simple-radar">
        <div class="radar-tiles">
          <div class="radar-base-layer">
            <img src="${cloudsUrl}" 
                 alt="Cloud Coverage" 
                 class="radar-clouds"
                 onload="console.log('RadarWidget: Clouds layer loaded - dimensions:', this.naturalWidth, 'x', this.naturalHeight);"
                 onerror="console.error('RadarWidget: Clouds layer failed:', this.src);" />
          </div>
          <div class="radar-precipitation-layer">
            <img src="${precipitationUrl}" 
                 alt="Precipitation Radar" 
                 class="radar-precipitation"
                 onload="console.log('RadarWidget: Precipitation layer loaded - dimensions:', this.naturalWidth, 'x', this.naturalHeight); this.closest('.simple-radar').checkPrecipitation(this)"
                 onerror="console.error('RadarWidget: Precipitation layer failed:', this.src); this.style.display='none'" />
          </div>
          <div class="radar-overlay">
            <div class="no-precipitation" style="display: none;">
              <div class="precipitation-status">
                <span class="status-icon">☀️</span>
                <span class="status-text">No Precipitation</span>
              </div>
            </div>
          </div>
        </div>
        <div class="radar-info">
          <div class="location-marker">📍 ${displayLocation}</div>
          <div class="radar-timestamp">Updated: ${new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    `

    // Add method to check if precipitation image is actually showing data
    const radarElement = mapContainer.querySelector('.simple-radar')
    radarElement.checkPrecipitation = (img) => {
      // Create a canvas to check if the image has any non-transparent pixels
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.naturalWidth || 256
      canvas.height = img.naturalHeight || 256
      
      try {
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Check for any non-transparent pixels (alpha > 0)
        let hasVisiblePixels = false
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 10) { // Alpha channel > 10 (not fully transparent)
            hasVisiblePixels = true
            break
          }
        }
        
        const noPrecipOverlay = mapContainer.querySelector('.no-precipitation')
        if (!hasVisiblePixels && noPrecipOverlay) {
          noPrecipOverlay.style.display = 'flex'
          console.log('RadarWidget: No visible precipitation data, showing overlay')
        } else {
          console.log('RadarWidget: Precipitation data visible')
        }
      } catch (error) {
        // CORS or other canvas error - just assume precipitation exists
        console.log('RadarWidget: Cannot analyze precipitation image (CORS):', error.message)
      }
    }

    // Add click handlers for full-screen radar
    const cloudsTile = mapContainer.querySelector('.radar-clouds')
    const precipTile = mapContainer.querySelector('.radar-precipitation')
    
    if (cloudsTile) {
      cloudsTile.addEventListener('click', () => this.openFullRadar(coords))
    }
    if (precipTile) {
      precipTile.addEventListener('click', () => this.openFullRadar(coords))
    }
  }

  getTileCoordinates(lat, lon, zoom) {
    // Convert lat/lon to tile coordinates for the given zoom level
    const latRad = lat * Math.PI / 180
    const n = Math.pow(2, zoom)
    const x = Math.floor((lon + 180) / 360 * n)
    const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n)
    return { x, y }
  }

  openFullRadar(coords) {
    const apiKey = this.config.apiKey
    const radarUrl = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=precipitation&lat=${coords.lat}&lon=${coords.lon}&zoom=8`
    
    // Open in new window/tab
    window.open(radarUrl, '_blank', 'noopener,noreferrer')
  }

  refreshRadar() {
    const mapContainer = this.container.querySelector(`#radar-map-${this.widgetId}`)
    if (!mapContainer) {
      console.error('RadarWidget: Could not find map container for refresh')
      return
    }
    
    mapContainer.innerHTML = `
      <div class="radar-loading">
        <div class="loading-spinner"></div>
        <p>Refreshing radar...</p>
      </div>
    `
    
    // Reload the radar data
    setTimeout(() => this.loadRadarMap(), 500)
  }

  renderError(error) {
    const mapContainer = this.container.querySelector(`#radar-map-${this.widgetId}`)
    if (!mapContainer) {
      console.error('RadarWidget: Could not find map container for error display')
      return
    }
    
    mapContainer.innerHTML = `
      <div class="radar-error">
        <p>⚠️ Radar unavailable</p>
        <small>${error.message}</small>
        <button onclick="this.closest('.radar-widget').refreshRadar()" class="retry-button">Retry</button>
      </div>
    `
  }

  destroy() {
    // Cleanup if needed
    if (this.map) {
      this.map = null
    }
  }
} 