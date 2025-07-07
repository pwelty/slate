export default class TodoistWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.updateInterval = null
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
      console.log('Todoist widget render started with config:', this.config)
      this.renderLoading()
      const tasks = await this.fetchTasksByTag()
      console.log('Todoist tasks fetched:', tasks)
      this.renderTasks(tasks)
    } catch (error) {
      console.error('Todoist widget error:', error)
      this.renderError(error)
    }
  }

  async fetchTasksByTag() {
    const { apiToken, tag, projectName } = this.config
    
    // Try to get token from config or environment variable
    const token = apiToken || window.TODOIST_API_TOKEN
    
    if (!token) {
      throw new Error('Todoist API token is required. Set it in your dashboard.yaml config.')
    }
    
    // Fetch tasks from Todoist API
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    // First get all tasks, then filter client-side for more reliable results
    let url = 'https://api.todoist.com/rest/v2/tasks'
    
    // If we have a project name, try to filter by it
    if (projectName) {
      // Get projects first to find the project ID
      const projectsResponse = await fetch('https://api.todoist.com/rest/v2/projects', { headers })
      if (projectsResponse.ok) {
        const projects = await projectsResponse.json()
        const project = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase())
        if (project) {
          url += `?project_id=${project.id}`
        }
      }
    }
    
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`Todoist API error: ${response.status}`)
    }
    
    let tasks = await response.json()
    
    // Filter by label if specified
    if (tag) {
      tasks = tasks.filter(task => 
        task.labels && task.labels.includes(tag)
      )
    }
    
    return tasks
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="todoist-widget">
        <div class="loading">Loading tasks...</div>
      </div>
    `
  }

  renderTasks(tasks) {
    const maxTasks = this.config.maxTasks || 5
    const displayTasks = tasks.slice(0, maxTasks)
    
    if (displayTasks.length === 0) {
      this.container.innerHTML = ''
      return
    }
    
    this.container.innerHTML = `
      <div class="todoist-widget">
        ${displayTasks.map(task => `
          <a href="${task.url}" target="_blank" rel="noopener noreferrer" class="todoist-task">
            <span class="task-checkbox">☐</span>
            <span class="task-content">${this.escapeHtml(task.content)}</span>
            ${task.due ? `<span class="task-due">${new Date(task.due.date).toLocaleDateString()}</span>` : ''}
          </a>
        `).join('')}
      </div>
    `
  }

  renderError(error) {
    console.error('Todoist widget error:', error)
    this.container.innerHTML = `
      <div class="todoist-widget">
        <div class="error">
          <small>Failed to load tasks: ${this.escapeHtml(error.message)}</small>
        </div>
      </div>
    `
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