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
      const statusPromises = Array.from(statusLinks).map(async (link) => {
        const url = link.dataset.statusUrl
        try {
          const response = await fetch(url, { 
            method: 'HEAD', 
            mode: 'no-cors',
            timeout: 5000 
          })
          return true // Assume online if no error
        } catch (error) {
          return false // Offline if error
        }
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