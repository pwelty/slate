export default class StatusWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.updateInterval = null
  }

  init() {
    this.render()
    // Update every 30 seconds
    this.updateInterval = setInterval(() => this.render(), 30000)
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.destroy())
  }

  async render() {
    try {
      const services = this.config.services || []
      const statusResults = await Promise.all(
        services.map(service => this.checkStatus(service))
      )
      
      this.renderStatus(statusResults)
    } catch (error) {
      this.renderError(error)
    }
  }

  async checkStatus(service) {
    try {
      const response = await fetch(service.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      })
      
      return {
        ...service,
        status: 'online',
        responseTime: Date.now() - performance.now()
      }
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        error: error.message
      }
    }
  }

  renderStatus(services) {
    const onlineCount = services.filter(s => s.status === 'online').length
    const totalCount = services.length
    
    this.container.innerHTML = `
      <div class="status-widget">
        <div class="status-summary">
          <h3>Service Status</h3>
          <div class="status-count">${onlineCount}/${totalCount} online</div>
        </div>
        <div class="status-list">
          ${services.map(service => `
            <div class="status-item">
              <div class="status-indicator ${service.status}"></div>
              <span class="status-name">${service.name}</span>
              <span class="status-value">${service.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  renderError(error) {
    this.container.innerHTML = `
      <div class="status-widget">
        <div class="error">
          <p>Status check failed</p>
          <small>${error.message}</small>
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