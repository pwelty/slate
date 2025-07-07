export default class ClockWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.updateInterval = null
  }

  init() {
    this.render()
    this.updateInterval = setInterval(() => this.render(), 1000)
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.destroy())
  }

  render() {
    const now = new Date()
    const format = this.config.format || '12h'
    const showDate = this.config.showDate !== false
    
    const time = format === '12h' 
      ? now.toLocaleTimeString('en-US', { hour12: true })
      : now.toLocaleTimeString('en-US', { hour12: false })
    
    const date = showDate 
      ? now.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : ''

    this.container.innerHTML = `
      <div class="clock-widget">
        <div class="clock-time">${time}</div>
        ${date ? `<div class="clock-date">${date}</div>` : ''}
      </div>
    `
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  }
}