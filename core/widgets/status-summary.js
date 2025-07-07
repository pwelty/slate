// Status Summary Widget
// Displays a compact overview of service status for header placement

export default class StatusSummaryWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.totalServices = 0
    this.onlineServices = 0
    this.offlineServices = 0
    this.refreshInterval = this.config.refreshInterval || 30000 // 30 seconds
  }

  async init() {
    this.render()
    this.checkServiceStatus()
    
    // Set up periodic refresh
    if (this.refreshInterval > 0) {
      setInterval(() => {
        this.checkServiceStatus()
      }, this.refreshInterval)
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="status-summary-widget">
        <div class="status-summary-header">
          <span class="status-icon">🔍</span>
          <span class="status-title">Services</span>
        </div>
        <div class="status-summary-stats">
          <div class="stat-item online">
            <span class="stat-value" id="online-count">-</span>
            <span class="stat-label">Online</span>
          </div>
          <div class="stat-item offline">
            <span class="stat-value" id="offline-count">-</span>
            <span class="stat-label">Offline</span>
          </div>
          <div class="stat-item total">
            <span class="stat-value" id="total-count">-</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div class="status-summary-health">
          <div class="health-indicator" id="health-indicator">
            <span class="health-dot"></span>
            <span class="health-text">Checking...</span>
          </div>
        </div>
      </div>
    `
  }

  async checkServiceStatus() {
    try {
      // Find all links with status checking enabled
      const statusLinks = document.querySelectorAll('[data-status-url]')
      this.totalServices = statusLinks.length
      
      if (this.totalServices === 0) {
        this.updateDisplay(0, 0, 0, 'no-services')
        return
      }

      let onlineCount = 0
      let offlineCount = 0
      
      // Check each service status
      const statusPromises = Array.from(statusLinks).map(async (link, index) => {
        const url = link.dataset.statusUrl
        const name = link.querySelector('.link-name')?.textContent || 'Unknown'
        const isOnline = await this.checkSingleService(url, name)
        
        // Update individual link status indicator
        const statusIndicator = link.querySelector('.status-indicator')
        if (statusIndicator) {
          statusIndicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`
        }
        
        return isOnline
      })

      const results = await Promise.all(statusPromises)
      onlineCount = results.filter(Boolean).length
      offlineCount = this.totalServices - onlineCount
      
      this.onlineServices = onlineCount
      this.offlineServices = offlineCount
      
      // Determine overall health
      let health = 'healthy'
      if (offlineCount === this.totalServices) {
        health = 'critical'
      } else if (offlineCount > 0) {
        health = 'warning'
      }
      
      this.updateDisplay(onlineCount, offlineCount, this.totalServices, health)
      
    } catch (error) {
      console.error('Error checking service status:', error)
      this.updateDisplay(0, 0, this.totalServices, 'error')
    }
  }

  async checkSingleService(url, name = 'Unknown') {
    try {
      const startTime = Date.now()
      
      // For Tailscale URLs, we need to work around CORS limitations
      // Try multiple strategies to determine if service is accessible
      const strategies = [
        this.checkWithFetch(url),
        this.checkWithImage(url)
      ]
      
      // Use Promise.allSettled to try all strategies
      const results = await Promise.allSettled(strategies)
      
      // If any strategy succeeds, consider the service online
      const isOnline = results.some(result => result.status === 'fulfilled' && result.value === true)
      
      const duration = Date.now() - startTime
      console.log(`Status check: ${name} (${url}) - ${isOnline ? 'ONLINE' : 'OFFLINE'} in ${duration}ms`)
      
      return isOnline
    } catch (error) {
      console.log(`Status check: ${name} (${url}) - OFFLINE (${error.message})`)
      return false
    }
  }

  async checkWithFetch(url) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: AbortSignal.timeout(8000)
      })
      // With no-cors, we can't read the status, but no error means it's reachable
      return true
    } catch (error) {
      // Network error means service is definitely offline
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return false
      }
      return false
    }
  }

  async checkWithImage(url) {
    // Try multiple common endpoints that might serve images
    const imagePaths = [
      '/favicon.ico',
      '/static/favicon.ico',
      '/assets/favicon.ico',
      '/favicon.png',
      '/apple-touch-icon.png'
    ]
    
    for (const path of imagePaths) {
      try {
        const result = await this.tryImageLoad(url + path)
        if (result) {
          return true
        }
      } catch (error) {
        // Continue to next path
      }
    }
    
    return false
  }
  
  async tryImageLoad(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      const timeout = setTimeout(() => {
        resolve(false)
      }, 4000)
      
      img.onload = () => {
        clearTimeout(timeout)
        resolve(true)
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        resolve(false)
      }
      
      // Add cache busting to avoid cached results
      img.src = imageUrl + '?' + Date.now()
    })
  }



  updateDisplay(online, offline, total, health) {
    const onlineEl = document.getElementById('online-count')
    const offlineEl = document.getElementById('offline-count')
    const totalEl = document.getElementById('total-count')
    const healthEl = document.getElementById('health-indicator')
    
    if (onlineEl) onlineEl.textContent = online
    if (offlineEl) offlineEl.textContent = offline
    if (totalEl) totalEl.textContent = total
    
    if (healthEl) {
      healthEl.className = `health-indicator ${health}`
      const healthText = healthEl.querySelector('.health-text')
      if (healthText) {
        switch (health) {
          case 'healthy':
            healthText.textContent = 'All systems operational'
            break
          case 'warning':
            healthText.textContent = 'Some services down'
            break
          case 'critical':
            healthText.textContent = 'Multiple services down'
            break
          case 'no-services':
            healthText.textContent = 'No monitored services'
            break
          case 'error':
            healthText.textContent = 'Status check failed'
            break
          default:
            healthText.textContent = 'Unknown status'
        }
      }
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }
} 