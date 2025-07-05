export default class ObsidianWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.updateInterval = null
  }

  async init() {
    await this.render()
    // Update every 10 minutes (notes change less frequently than tasks)
    this.updateInterval = setInterval(() => this.render(), 600000)
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.destroy())
  }

  async render() {
    try {
      console.log('Obsidian widget render started with config:', this.config)
      this.renderLoading()
      const notes = await this.fetchNotesByTag()
      console.log('Obsidian notes fetched:', notes)
      this.renderNotes(notes)
    } catch (error) {
      console.error('Obsidian widget error:', error)
      this.renderError(error)
    }
  }

  async fetchNotesByTag() {
    const { tag, vaultPath, maxNotes = 5, namespace = 'dashboard', apiUrl = 'https://127.0.0.1:27124', apiKey } = this.config
    
    // Build the full namespaced tag
    const fullTag = `${namespace}-${tag}`
    
    console.log(`Would fetch notes from vault: ${vaultPath} for tag: #${fullTag}`)
    console.log('Using mock data for now due to API limitations')
    
    // Temporarily skip API calls due to networking/CORS issues
    // Fall back to mock data for demonstration
    return this.getMockData(fullTag)
  }

  getMockData(fullTag) {
    console.log(`Using mock data for tag: ${fullTag}`)
    
    // Mock data as fallback
    if (fullTag === 'dashboard-search') {
      return [
        {
          title: 'Search Engine Evaluation (Mock)',
          fileName: 'Search Engine Evaluation',
          excerpt: 'Comparing different search engines and their capabilities for research tasks...',
          tags: ['dashboard-search', 'tools', 'research'],
          modified: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          title: 'SearchXNG Configuration (Mock)',
          fileName: 'SearchXNG Configuration',
          excerpt: 'Notes on setting up and configuring SearchXNG for better privacy and better results...',
          tags: ['dashboard-search', 'privacy', 'self-hosted'],
          modified: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ]
    } else if (fullTag === 'dashboard-dev') {
      return [
        {
          title: 'Docker Best Practices (Mock)',
          fileName: 'Docker Best Practices',
          excerpt: 'Collection of Docker best practices and common patterns for development workflows...',
          tags: ['dashboard-dev', 'docker', 'devops'],
          modified: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
      ]
    }
    
    return []
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="obsidian-widget">
        <div class="loading">Loading notes...</div>
      </div>
    `
  }

  renderNotes(notes) {
    const maxNotes = this.config.maxNotes || 5
    const displayNotes = notes.slice(0, maxNotes)
    
    if (displayNotes.length === 0) {
      this.container.innerHTML = `
        <div class="obsidian-widget">
          <div class="no-notes">No notes found${this.config.tag ? ` with tag #${this.config.tag}` : ''}</div>
        </div>
      `
      return
    }
    
    this.container.innerHTML = `
      <div class="obsidian-widget">
        ${displayNotes.map(note => `
          <a href="obsidian://open?vault=Vault42&file=${encodeURIComponent(note.fileName)}" class="obsidian-note">
            <div class="note-title">${this.escapeHtml(note.title)}</div>
            ${note.excerpt ? `<div class="note-excerpt">${this.escapeHtml(note.excerpt)}</div>` : ''}
            <div class="note-meta">
              <span class="note-modified">${this.formatDate(note.modified)}</span>
              ${note.tags ? `<span class="note-tags">${note.tags.map(tag => `#${tag}`).join(' ')}</span>` : ''}
            </div>
          </a>
        `).join('')}
      </div>
    `
  }

  renderError(error) {
    console.error('Obsidian widget error:', error)
    this.container.innerHTML = `
      <div class="obsidian-widget">
        <div class="error">
          <small>Notes not available: ${this.escapeHtml(error.message)}</small>
        </div>
      </div>
    `
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
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