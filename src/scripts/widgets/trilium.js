/**
 * Trilium Widget - Self-contained widget definition
 */

// Widget Definition - Schema, capabilities, templates
export const WIDGET_DEFINITION = {
  type: 'service',
  description: 'Displays Trilium notes filtered by tag',
  schema: {
    tag: { type: 'string', required: true, description: 'Trilium tag to search for (without #)' },
    maxNotes: { type: 'integer', required: false, default: 5, description: 'Maximum notes to display' }
  },
  capabilities: {
    apiIntegration: true,
    caching: true,
    realTimeUpdates: true
  },
  dependencies: {
    env: ['TRILIUM_TOKEN', 'TRILIUM_URL'],
    endpoints: ['/api/trilium']
  },
  templates: {
    loading: `
      <div class="trilium-widget">
        <div class="loading">Loading notes...</div>
      </div>
    `,
    empty: (config) => `
      <div class="trilium-widget">
        <div class="no-notes">No notes found${config.tag ? ` with tag #${config.tag}` : ''}</div>
      </div>
    `,
    error: (error) => `
      <div class="trilium-widget">
        <div class="error">
          <small>Notes not available: ${error.message}</small>
        </div>
      </div>
    `,
    item: (note) => `
      <a href="${note.url}" target="_blank" rel="noopener noreferrer" class="trilium-note">
        <div class="note-title">${note.title}</div>
        ${note.description ? `<div class="note-description">${note.description}</div>` : ''}
        <div class="note-meta">
          <span class="note-modified">${note.formattedDate}</span>
          ${note.tags && note.tags.length > 0 ? `<span class="note-tags">${note.tags.map(tag => `#${tag}`).join(' ')}</span>` : ''}
        </div>
      </a>
    `,
    container: (items) => `
      <div class="trilium-widget">
        ${items.join('')}
      </div>
    `
  }
}

export default class TriliumWidget {
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
      console.log('Trilium widget render started with config:', this.config)
      this.renderLoading()
      const notes = await this.fetchNotesByTag()
      console.log('Trilium notes fetched:', notes)
      this.renderNotes(notes)
    } catch (error) {
      console.error('Trilium widget error:', error)
      this.renderError(error)
    }
  }

  async fetchNotesByTag() {
    const { tag, maxNotes = 5 } = this.config
    
    console.log(`Fetching Trilium notes for tag: #${tag}`)
    
    try {
      // Use the server-side API proxy to avoid CORS issues
      const response = await fetch(`http://localhost:3001/api/trilium?tag=${encodeURIComponent(tag)}&limit=${maxNotes}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.notes || []
    } catch (error) {
      console.error('Failed to fetch Trilium notes:', error)
      return []
    }
  }

  renderLoading() {
    this.container.innerHTML = WIDGET_DEFINITION.templates.loading
  }

  renderNotes(notes) {
    const maxNotes = this.config.maxNotes || 5
    const displayNotes = notes.slice(0, maxNotes)
    
    if (displayNotes.length === 0) {
      this.container.innerHTML = WIDGET_DEFINITION.templates.empty(this.config)
      return
    }
    
    // Process notes with formatting and escaping
    const processedNotes = displayNotes.map(note => ({
      ...note,
      title: this.escapeHtml(note.title),
      description: note.description ? this.escapeHtml(note.description) : null,
      formattedDate: this.formatDate(note.date)
    }))
    
    // Generate HTML using templates
    const noteItems = processedNotes.map(note => WIDGET_DEFINITION.templates.item(note))
    this.container.innerHTML = WIDGET_DEFINITION.templates.container(noteItems)
  }

  renderError(error) {
    console.error('Trilium widget error:', error)
    this.container.innerHTML = WIDGET_DEFINITION.templates.error({
      message: this.escapeHtml(error.message)
    })
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