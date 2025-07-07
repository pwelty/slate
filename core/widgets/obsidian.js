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
    
    console.log(`Fetching notes from vault: ${vaultPath} for tag: #${fullTag}`)
    
    try {
      // Use the server-side API proxy to avoid CORS issues
      const response = await fetch(`http://localhost:3001/api/obsidian?tag=${encodeURIComponent(fullTag)}&limit=${maxNotes}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.notes || []
    } catch (error) {
      console.error('Failed to fetch Obsidian notes:', error)
      return []
    }
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