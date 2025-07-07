export class StatusChecker {
  constructor() {
    this.cache = new Map()
    this.cacheTTL = 60000 // 1 minute cache
    this.timeout = 5000 // 5 second timeout
  }

  async init() {
    // Find all elements with status checking
    const statusElements = document.querySelectorAll('[data-status-url]')
    
    if (statusElements.length === 0) return
    
    console.log(`Found ${statusElements.length} links with status checking enabled`)
    
    // Check status for each element
    for (const element of statusElements) {
      const url = element.dataset.statusUrl
      if (url) {
        this.checkStatus(element, url)
      }
    }
  }

  async checkStatus(element, url) {
    const indicator = element.querySelector('.status-indicator')
    if (!indicator) return

    try {
      // Check cache first
      const cached = this.cache.get(url)
      if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
        this.updateIndicator(indicator, cached.status)
        return
      }

      // Set checking state
      this.updateIndicator(indicator, 'checking')
      
      // Create a controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      // Make request with timeout
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading content
        mode: 'no-cors', // Avoid CORS issues
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // For no-cors requests, we can't read the status, so if we get here it's reachable
      const status = 'online'
      
      // Cache the result
      this.cache.set(url, { status, timestamp: Date.now() })
      
      this.updateIndicator(indicator, status)
      
    } catch (error) {
      let status = 'offline'
      
      if (error.name === 'AbortError') {
        status = 'timeout'
        console.log(`Status check timeout for ${url}`)
      } else {
        console.log(`Status check failed for ${url}:`, error.message)
      }
      
      // Cache the result
      this.cache.set(url, { status, timestamp: Date.now() })
      
      this.updateIndicator(indicator, status)
    }
  }

  updateIndicator(indicator, status) {
    // Remove all status classes
    indicator.classList.remove('checking', 'online', 'offline', 'timeout')
    
    // Add the new status class
    indicator.classList.add(status)
    
    // Update title attribute for hover tooltip
    const statusText = {
      checking: 'Checking status...',
      online: 'Service is online',
      offline: 'Service is offline',
      timeout: 'Connection timeout'
    }
    
    indicator.title = statusText[status] || status
  }

  // Method to manually refresh all status checks
  refresh() {
    this.cache.clear()
    this.init()
  }
}