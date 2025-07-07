// Message of the Day (MOTD) Widget
// Displays customizable messages, notes, reminders, or status updates

export default class MOTDWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.message = this.config.message || "No message configured"
    this.title = this.config.title || "Message of the Day"
    this.icon = this.config.icon || "📢"
    this.priority = this.config.priority || "normal" // normal, high, urgent
    this.dismissible = this.config.dismissible || false
    this.timestamp = this.config.timestamp !== false // default true
    this.className = this.config.className || ""
  }

  init() {
    this.render()
  }

  render() {
    try {
      // Create MOTD container
      const motdHTML = `
        <div class="motd-widget ${this.className}" data-priority="${this.priority}">
          <div class="motd-header">
            <span class="motd-icon">${this.icon}</span>
            <h3 class="motd-title">${this.title}</h3>
            ${this.dismissible ? '<button class="motd-dismiss" title="Dismiss message">×</button>' : ''}
          </div>
          <div class="motd-message">${this.message}</div>
          ${this.timestamp ? `<div class="motd-timestamp">Updated: ${new Date().toLocaleString()}</div>` : ''}
        </div>
      `
      
      this.container.innerHTML = motdHTML
      
      // Add dismiss functionality if enabled
      if (this.dismissible) {
        const dismissButton = this.container.querySelector('.motd-dismiss')
        if (dismissButton) {
          dismissButton.onclick = () => {
            this.container.style.display = 'none'
          }
        }
      }
      
    } catch (error) {
      console.error('Error creating MOTD widget:', error)
      
      // Create error fallback
      this.container.innerHTML = `
        <div class="motd-widget motd-error">
          <div class="motd-header">
            <span class="motd-icon">⚠️</span>
            <h3 class="motd-title">MOTD Error</h3>
          </div>
          <div class="motd-message">Failed to load message: ${error.message}</div>
        </div>
      `
    }
  }

  destroy() {
    // No cleanup needed for MOTD widget
  }
} 