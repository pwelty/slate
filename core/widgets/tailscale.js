export default class TailscaleWidget {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.widgetId = `tailscale-${Date.now()}`
    this.refreshInterval = null
  }

  async init() {
    console.log('TailscaleWidget: Initializing Tailscale widget', this.config)
    this.render()
    await this.loadNodes()
    this.startAutoRefresh()
  }

  render() {
    this.container.innerHTML = `
      <div class="tailscale-widget" id="${this.widgetId}">
        <div class="widget-header">
          <h3 class="widget-title">Tailscale Nodes</h3>
          <button class="refresh-btn" onclick="this.closest('.tailscale-widget').refreshNodes()">
            <span class="refresh-icon">↻</span>
          </button>
        </div>
        <div class="widget-content">
          <div class="tailscale-nodes" id="tailscale-nodes-${this.widgetId}">
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading Tailscale nodes...</p>
            </div>
          </div>
        </div>
      </div>
    `

    // Bind refresh method to the widget element
    this.container.querySelector('.tailscale-widget').refreshNodes = () => this.refreshNodes()
  }

  async loadNodes() {
    const nodesContainer = this.container.querySelector(`#tailscale-nodes-${this.widgetId}`)
    
    if (!nodesContainer) {
      console.error('TailscaleWidget: Could not find nodes container')
      return
    }

    try {
      const nodes = await this.fetchTailscaleNodes()
      console.log('TailscaleWidget: Fetched nodes:', nodes)
      this.renderNodes(nodes)
    } catch (error) {
      console.error('TailscaleWidget: Error loading nodes:', error)
      this.renderError(error)
    }
  }

  async fetchTailscaleNodes() {
    const { tailnet, apiKey } = this.config
    
    if (!tailnet || !apiKey) {
      throw new Error('Tailnet and API key are required for Tailscale widget')
    }

    const url = `https://api.tailscale.com/api/v2/tailnet/${tailnet}/devices`
    console.log('TailscaleWidget: Fetching from:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Tailscale API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Group nodes by category
    const groupedNodes = this.groupNodes(data.devices)
    console.log('TailscaleWidget: Grouped nodes:', groupedNodes)
    
    return groupedNodes
  }

  groupNodes(devices) {
    const groups = {
      containers: { name: "Container Services", nodes: [], online: 0, total: 0 },
      hosts: { name: "Physical Hosts", nodes: [], online: 0, total: 0 },
      other: { name: "Other Devices", nodes: [], online: 0, total: 0 }
    }

    devices.forEach(device => {
      const hasContainerTag = device.tags && device.tags.some(tag => tag.includes('container'))
      const hasAnyTag = device.tags && device.tags.length > 0
      
      let category = 'other'
      if (hasContainerTag) {
        category = 'containers'
      } else if (!hasAnyTag) {
        category = 'hosts'
      }
      
      groups[category].nodes.push(device)
      groups[category].total++
      if (device.online) {
        groups[category].online++
      }
    })

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].total === 0) {
        delete groups[key]
      }
    })

    return groups
  }

  renderNodes(groupedNodes) {
    const nodesContainer = this.container.querySelector(`#tailscale-nodes-${this.widgetId}`)
    
    if (Object.keys(groupedNodes).length === 0) {
      nodesContainer.innerHTML = `
        <div class="no-nodes">
          <div class="no-nodes-icon">🔍</div>
          <p>No Tailscale nodes found</p>
          <small>Check your API key and network connectivity</small>
        </div>
      `
      return
    }

    const groupsHtml = Object.entries(groupedNodes)
      .map(([key, group]) => this.renderGroup(key, group))
      .join('')
    
    const totalNodes = Object.values(groupedNodes).reduce((sum, group) => sum + group.total, 0)
    const totalOnline = Object.values(groupedNodes).reduce((sum, group) => sum + group.online, 0)
    
    nodesContainer.innerHTML = `
      <div class="nodes-groups">
        ${groupsHtml}
      </div>
      <div class="nodes-summary">
        <span class="nodes-count">${totalOnline}/${totalNodes} nodes online</span>
        <span class="last-updated">Updated: ${new Date().toLocaleTimeString()}</span>
      </div>
    `
  }

  renderGroup(key, group) {
    const isExpanded = key === 'containers' // Expand containers by default
    const onlineNodes = group.nodes.filter(node => node.online)
    const offlineNodes = group.nodes.filter(node => !node.online)
    
    return `
      <div class="node-group" data-group="${key}">
        <div class="group-header" onclick="this.closest('.node-group').classList.toggle('collapsed')">
          <div class="group-info">
            <span class="group-name">${group.name}</span>
            <span class="group-stats">${group.online}/${group.total} online</span>
          </div>
          <span class="group-toggle">▼</span>
        </div>
        <div class="group-content ${isExpanded ? '' : 'collapsed'}">
          ${onlineNodes.length > 0 ? `
            <div class="status-section">
              <h4 class="status-title">🟢 Online (${onlineNodes.length})</h4>
              <div class="nodes-list">
                ${onlineNodes.map(node => this.renderNode(node)).join('')}
              </div>
            </div>
          ` : ''}
          ${offlineNodes.length > 0 ? `
            <div class="status-section">
              <h4 class="status-title">🔴 Offline (${offlineNodes.length})</h4>
              <div class="nodes-list">
                ${offlineNodes.map(node => this.renderNode(node)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  renderNode(node) {
    const tags = node.tags || []
    const tagsList = tags.length > 0 
      ? tags.map(tag => `<span class="node-tag">${tag}</span>`).join('')
      : '<span class="node-tag no-tags">untagged</span>'
    
    // Get the first tailscale IP (usually the 100.x.x.x address)
    const tailscaleIP = node.addresses?.find(addr => addr.startsWith('100.')) || node.addresses?.[0] || 'No IP'
    
    // Format last seen time
    const lastSeen = node.lastSeen ? new Date(node.lastSeen).toLocaleDateString() : 'Unknown'
    
    // Clean up hostname (remove domain suffix)
    const hostname = node.name?.split('.')[0] || 'Unknown'
    
    // Determine node status
    const status = node.online ? 'online' : 'offline'
    const statusIcon = node.online ? '🟢' : '🔴'
    
    return `
      <div class="node-item ${status}" data-node-id="${node.id}">
        <div class="node-header">
          <div class="node-name">
            <span class="node-status">${statusIcon}</span>
            <span class="node-hostname">${hostname}</span>
          </div>
          <div class="node-ip">${tailscaleIP}</div>
        </div>
        <div class="node-details">
          <div class="node-tags">
            ${tagsList}
          </div>
          <div class="node-meta">
            <small>Last seen: ${lastSeen}</small>
          </div>
        </div>
      </div>
    `
  }

  renderError(error) {
    const nodesContainer = this.container.querySelector(`#tailscale-nodes-${this.widgetId}`)
    nodesContainer.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>Failed to load Tailscale nodes</p>
        <small>${error.message}</small>
        <button class="retry-btn" onclick="this.closest('.tailscale-widget').refreshNodes()">
          Retry
        </button>
      </div>
    `
  }

  refreshNodes() {
    const nodesContainer = this.container.querySelector(`#tailscale-nodes-${this.widgetId}`)
    nodesContainer.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Refreshing nodes...</p>
      </div>
    `
    
    setTimeout(() => this.loadNodes(), 500)
  }

  startAutoRefresh() {
    // Refresh every 30 seconds
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    
    this.refreshInterval = setInterval(() => {
      console.log('TailscaleWidget: Auto-refreshing nodes')
      this.loadNodes()
    }, 30000)
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }
} 