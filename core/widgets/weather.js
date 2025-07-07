export default class WeatherWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.updateInterval = null
  }

  init() {
    this.render()
    // Update every 10 minutes
    this.updateInterval = setInterval(() => this.render(), 600000)
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.destroy())
  }

  async render() {
    try {
      // Show loading state
      this.renderLoading()
      
      // Get weather data from OpenWeatherMap API
      const weatherData = await this.getWeatherData()
      this.renderWeather(weatherData)
    } catch (error) {
      this.renderError(error)
    }
  }

  async getWeatherData() {
    const apiKey = this.config.apiKey
    const location = this.config.location || 'New York'
    const units = this.config.units || 'fahrenheit'
    
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is required')
    }

    // Convert units for API call
    const apiUnits = units === 'celsius' ? 'metric' : 'imperial'
    
    // Build API URL - handle zip codes vs city names
    let apiUrl
    if (/^\d{5}$/.test(location)) {
      // If location is a 5-digit zip code, use zip parameter with US country code
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(location)},US&appid=${apiKey}&units=${apiUnits}`
    } else {
      // Otherwise use q parameter for city names
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${apiUnits}`
    }
    
    try {
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key')
        } else if (response.status === 404) {
          throw new Error(`Location "${location}" not found`)
        } else {
          throw new Error(`Weather API error: ${response.status}`)
        }
      }
      
      const data = await response.json()
      
      // Transform API response to our format
      return {
        location: data.name,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        high: Math.round(data.main.temp_max),
        low: Math.round(data.main.temp_min),
        humidity: data.main.humidity,
        units: units,
        icon: data.weather[0].icon,
        windSpeed: Math.round(data.wind?.speed || 0),
        feelsLike: Math.round(data.main.feels_like)
      }
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to weather service')
      }
      throw error
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="weather-widget">
        <div class="weather-loading">
          <div class="loading-spinner"></div>
          <p>Loading weather...</p>
        </div>
      </div>
    `
  }

  renderWeather(data) {
    const tempUnit = data.units === 'celsius' ? '°C' : '°F'
    const speedUnit = data.units === 'celsius' ? 'm/s' : 'mph'
    
    // Use custom display name if provided, otherwise use API location
    const displayLocation = this.config.displayName || data.location
    
    this.container.innerHTML = `
      <div class="weather-widget">
        <div class="weather-main">
          <div class="weather-temp">${data.temp}${tempUnit}</div>
          <div class="weather-condition">${data.condition}</div>
        </div>
        <div class="weather-details">
          <div class="weather-row">
            <span>H: ${data.high}${tempUnit}</span>
            <span>L: ${data.low}${tempUnit}</span>
          </div>
          <div class="weather-row">
            <span>💧 ${data.humidity}%</span>
            <span>🌡️ ${data.feelsLike}${tempUnit}</span>
          </div>
          ${data.windSpeed > 0 ? `<div class="weather-row"><span>💨 ${data.windSpeed} ${speedUnit}</span></div>` : ''}
        </div>
        <div class="weather-location">📍 ${displayLocation}</div>
      </div>
    `
  }

  renderError(error) {
    this.container.innerHTML = `
      <div class="weather-widget">
        <div class="weather-error">
          <p>⚠️ Weather unavailable</p>
          <small>${error.message}</small>
          <button onclick="location.reload()" class="retry-button">Retry</button>
        </div>
      </div>
    `
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  }
}