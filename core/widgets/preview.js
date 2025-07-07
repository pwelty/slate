export default class PreviewWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.updateInterval = null
    this.adapter = this.createAdapter(config.service)
  }

  createAdapter(service) {
    switch(service) {
      case 'linkwarden':
        return new LinkwardenAdapter(this.config)
      case 'trilium':
        return new TriliumAdapter(this.config)
      case 'obsidian':
        return new ObsidianAdapter(this.config)
      default:
        throw new Error(`Unknown preview service: ${service}`)
    }
  }

  async init() {
    await this.render()
    // Update every 5 minutes
    this.updateInterval = setInterval(() => this.render(), 300000)
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.destroy())
  }

  async render() {
    try {
      console.log('Preview widget render started with config:', this.config)
      this.renderLoading()
      const items = await this.adapter.fetchRecentItems()
      console.log('Preview items fetched:', items)
      this.renderItems(items)
    } catch (error) {
      console.error('Preview widget error:', error)
      this.renderError(error)
    }
  }

  renderLoading() {
    const title = this.config.title || `Recent ${this.config.service} items`
    this.container.innerHTML = `
      <div class="preview-widget">
        <div class="preview-header">
          <h3 class="preview-title">${this.escapeHtml(title)}</h3>
        </div>
        <div class="loading">Loading recent items...</div>
      </div>
    `
  }

  renderItems(items) {
    const title = this.config.title || `Recent ${this.config.service} items`
    const limit = this.config.limit || 3
    const displayItems = items.slice(0, limit)
    
    if (displayItems.length === 0) {
      this.container.innerHTML = `
        <div class="preview-widget">
          <div class="preview-header">
            <h3 class="preview-title">${this.escapeHtml(title)}</h3>
          </div>
          <div class="no-items">No recent items found</div>
        </div>
      `
      return
    }
    
    this.container.innerHTML = `
      <div class="preview-widget">
        <div class="preview-header">
          <h3 class="preview-title">${this.escapeHtml(title)}</h3>
        </div>
        <div class="preview-items">
          ${displayItems.map(item => this.renderItem(item)).join('')}
        </div>
      </div>
    `
  }

  renderItem(item) {
    return `
      <div class="preview-item">
        <a href="${item.url}" class="preview-item-link">
          <div class="preview-item-title">${this.escapeHtml(item.title)}</div>
          ${item.description ? `<div class="preview-item-description">${this.escapeHtml(item.description)}</div>` : ''}
          <div class="preview-item-meta">
            <span class="preview-item-date">${this.formatDate(item.date)}</span>
            ${item.tags ? `<span class="preview-item-tags">${item.tags.map(tag => `#${tag}`).join(' ')}</span>` : ''}
          </div>
        </a>
      </div>
    `
  }

  renderError(error) {
    const title = this.config.title || `Recent ${this.config.service} items`
    console.error('Preview widget error:', error)
    this.container.innerHTML = `
      <div class="preview-widget">
        <div class="preview-header">
          <h3 class="preview-title">${this.escapeHtml(title)}</h3>
        </div>
        <div class="error">
          <small>Failed to load items: ${this.escapeHtml(error.message)}</small>
        </div>
      </div>
    `
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    
    // Compare calendar dates, not 24-hour periods
    const dateDay = date.toDateString()
    const nowDay = now.toDateString()
    
    if (dateDay === nowDay) {
      return 'Today'
    }
    
    // Calculate actual calendar day difference
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  }
}

// Service Adapters
class LinkwardenAdapter {
  constructor(config) {
    this.config = config
  }

  async fetchRecentItems() {
    const { limit = 3 } = this.config
    const apiUrl = 'http://localhost:3001/api/linkwarden/recent'
    
    console.log('Linkwarden: Making API request to:', `${apiUrl}?limit=${limit}`)
    
    const response = await fetch(`${apiUrl}?limit=${limit}`)
    
    console.log('Linkwarden: Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Linkwarden: API error response:', errorText)
      throw new Error(`Linkwarden API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Linkwarden: Received data:', data)
    
    return data
  }
}

class TriliumAdapter {
  constructor(config) {
    this.config = config
  }

  async fetchRecentItems() {
    const { limit = 3 } = this.config
    const apiUrl = 'http://localhost:3001/api/trilium/recent'
    
    console.log('Trilium: Making API request to:', `${apiUrl}?limit=${limit}`)
    
    const response = await fetch(`${apiUrl}?limit=${limit}`)
    
    console.log('Trilium: Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Trilium: API error response:', errorText)
      throw new Error(`Trilium API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Trilium: Received data:', data)
    
    return data
  }
}

class ObsidianAdapter {
  constructor(config) {
    this.config = config
  }

  async fetchRecentItems() {
    const { limit = 3 } = this.config
    const apiUrl = 'http://localhost:3001/api/obsidian/recent'
    
    console.log('Obsidian: Making API request to:', `${apiUrl}?limit=${limit}`)
    
    const response = await fetch(`${apiUrl}?limit=${limit}`)
    
    console.log('Obsidian: Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Obsidian: API error response:', errorText)
      throw new Error(`Obsidian API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Obsidian: Received data:', data)
    
    return data
  }
}