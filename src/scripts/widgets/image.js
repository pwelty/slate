export default class ImageWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.src = this.config.src || ''
    this.alt = this.config.alt || 'Image'
    this.width = this.config.width || 'auto'
    this.height = this.config.height || 'auto'
    this.objectFit = this.config.objectFit || 'contain'
    this.className = this.config.className || ''
  }

  init() {
    this.render()
  }

  render() {
    if (!this.src) {
      this.container.innerHTML = `
        <div class="image-widget error">
          <p>No image source provided</p>
        </div>
      `
      return
    }

    this.container.innerHTML = `
      <div class="image-widget ${this.className}">
        <img 
          src="${this.src}" 
          alt="${this.alt}"
          style="
            width: ${this.width};
            height: ${this.height};
            object-fit: ${this.objectFit};
            max-width: 100%;
            max-height: 100%;
          "
          onload="this.style.opacity = '1'"
          onerror="this.style.display = 'none'; this.nextElementSibling.style.display = 'block'"
        />
        <div class="image-error" style="display: none;">
          <p>Failed to load image</p>
          <small>${this.src}</small>
        </div>
      </div>
    `
  }

  destroy() {
    // No cleanup needed for image widget
  }
} 