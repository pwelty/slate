import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// Load environment variables from parent directory
dotenv.config({ path: '../.env' })

// Load config files
const configPath = path.join(process.cwd(), '../config/config.yaml')
const widgetsPath = path.join(process.cwd(), '../config/widgets.yaml')

let config = {}
let widgets = {}

try {
  config = yaml.load(fs.readFileSync(configPath, 'utf8'))
  widgets = yaml.load(fs.readFileSync(widgetsPath, 'utf8'))
  console.log('📄 Loaded configuration files')
} catch (error) {
  console.error('❌ Failed to load config files:', error)
}

// Helper function to detect if running in Docker
function isRunningInDocker() {
  try {
    // Check for Docker-specific files
    return require('fs').existsSync('/.dockerenv') || 
           require('fs').existsSync('/proc/1/cgroup') && 
           require('fs').readFileSync('/proc/1/cgroup', 'utf8').includes('docker')
  } catch (error) {
    return false
  }
}

// Helper function to get the right URL based on environment
function getObsidianUrl() {
  const baseUrl = isRunningInDocker() ? 
    process.env.OBSIDIAN_API_URL_DOCKER : 
    process.env.OBSIDIAN_API_URL
  return baseUrl?.startsWith('http') ? baseUrl : `http://${baseUrl}`
}

const app = express()
const port = 3001

// Enable CORS for both dev and production
app.use(cors({
  origin: [
    'http://localhost:5173',  // Development server
    'https://slate.squirrel-corn.ts.net'  // Production server
  ],
  credentials: true
}))

app.use(express.json())

// Cache to store API responses
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Helper function to get cached data or fetch fresh
async function getCachedData(key, fetchFn) {
  const cached = cache.get(key)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`Cache hit for ${key}`)
    return cached.data
  }
  
  console.log(`Cache miss for ${key}, fetching fresh data`)
  try {
    const data = await fetchFn()
    cache.set(key, { data, timestamp: now })
    return data
  } catch (error) {
    console.error(`Error fetching ${key}:`, error)
    // Return cached data if available, even if stale
    if (cached) {
      return cached.data
    }
    throw error
  }
}

// 🔐 SECURE WIDGET CONFIGURATION API
// Widget config endpoint - provides sanitized config for each widget
app.get('/api/widget-config/:widgetId', async (req, res) => {
  try {
    const widgetId = req.params.widgetId.replace('widget-', '') // Remove prefix
    const widget = widgets[widgetId]
    
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' })
    }
    
    // Sanitize configuration - remove sensitive data
    const safeConfig = sanitizeWidgetConfig(widget.config || {})
    
    // Add any computed config values
    const finalConfig = {
      ...safeConfig,
      // Add any server-computed values here
      serverTime: Date.now(),
      apiBase: '/api' // Client can use this to make API calls
    }
    
    res.json(finalConfig)
  } catch (error) {
    console.error('Widget config error:', error)
    res.status(500).json({ error: 'Failed to load widget configuration' })
  }
})

// Removed old generated route for security - use /app instead

// Helper function to sanitize widget configuration
function sanitizeWidgetConfig(config) {
  const safeConfig = { ...config }
  
  // Remove sensitive keys that should never reach client
  const sensitiveKeys = [
    'apiKey', 'apiToken', 'token', 'password', 'secret', 'key',
    'vaultPath', 'basePath', 'filePath', 'privateKey', 'accessToken'
  ]
  
  sensitiveKeys.forEach(key => {
    if (safeConfig[key]) {
      delete safeConfig[key]
    }
  })
  
  return safeConfig
}

// Linkwarden API endpoint
app.get('/api/linkwarden/recent', async (req, res) => {
  try {
    const data = await getCachedData('linkwarden', async () => {
      const apiKey = process.env.LINKWARDEN_API_KEY
      const baseUrl = process.env.LINKWARDEN_URL || 'https://linkwarden.squirrel-corn.ts.net'
      const limit = req.query.limit || 3
      
      if (!apiKey) {
        throw new Error('LINKWARDEN_API_KEY not set')
      }
      
      const response = await fetch(`${baseUrl}/api/v1/links?sort=createdAt&take=${limit}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Linkwarden API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      return data.response?.map(link => ({
        title: link.name || link.url,
        description: link.description || '',
        url: link.url,
        date: link.createdAt,
        tags: link.tags?.map(tag => tag.name) || []
      })) || []
    })
    
    res.json(data)
  } catch (error) {
    console.error('Linkwarden API error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Trilium API endpoint
app.get('/api/trilium/recent', async (req, res) => {
  try {
    const data = await getCachedData('trilium', async () => {
      const token = process.env.TRILIUM_TOKEN
      const baseUrl = process.env.TRILIUM_URL || 'https://trilium.squirrel-corn.ts.net'
      const limit = req.query.limit || 3
      
      if (!token) {
        throw new Error('TRILIUM_TOKEN not set')
      }
      
      // Trilium ETAPI to get recently modified notes using search
      const response = await fetch(`${baseUrl}/etapi/notes?search=*&limit=${limit}&orderBy=dateModified&orderDirection=desc`, {
        headers: {
          'Authorization': token,  // Direct token, no Bearer prefix
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Trilium API error: ${response.status}`)
      }
      
      const data = await response.json()
      const notes = data.results || []
      
      return notes.slice(0, limit).map(note => ({
        title: note.title,
        description: note.type === 'text' ? 'Text note' : `${note.type} note`,
        url: `${baseUrl}/#${note.noteId}`, // Web link to note
        date: note.dateModified,
        tags: note.attributes?.filter(l => l.name === 'tag').map(l => l.value) || []
      }))
    })
    
    res.json(data)
  } catch (error) {
    console.error('Trilium API error:', error)
    res.json([]) // Return empty array instead of mock data
  }
})

// Trilium API endpoint for searching by tag
app.get('/api/trilium', async (req, res) => {
  try {
    const tag = req.query.tag
    const limit = parseInt(req.query.limit) || 3
    
    const data = await getCachedData(`trilium_tag_${tag}`, async () => {
      const token = process.env.TRILIUM_TOKEN
      const baseUrl = process.env.TRILIUM_URL || 'https://trilium.squirrel-corn.ts.net'
      
      if (!token) {
        throw new Error('TRILIUM_TOKEN not set')
      }
      
      // Use Trilium's ETAPI search to find notes with specific tag
      // Search syntax: #tag searches for notes with that tag
      const searchQuery = tag ? `#${tag}` : '*'
      const response = await fetch(`${baseUrl}/etapi/notes?search=${encodeURIComponent(searchQuery)}&limit=${limit}&orderBy=dateModified&orderDirection=desc`, {
        headers: {
          'Authorization': token,  // Direct token, no Bearer prefix
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Trilium API error: ${response.status}`)
      }
      
      const data = await response.json()
      const notes = data.results || []
      
      return notes.slice(0, limit).map(note => ({
        title: note.title,
        description: note.type === 'text' ? 'Text note' : `${note.type} note`,
        url: `${baseUrl}/#${note.noteId}`, // Web link to note
        date: note.dateModified,
        tags: note.attributes?.filter(l => l.name === 'tag').map(l => l.value) || []
      }))
    })
    
    res.json({ notes: data })
  } catch (error) {
    console.error('Trilium tag search error:', error)
    res.json({ 
      notes: [], 
      error: error.message 
    })
  }
})

// Obsidian API endpoints
app.get('/api/obsidian/recent', async (req, res) => {
  try {
    const data = await getCachedData('obsidian', async () => {
      const apiKey = process.env.OBSIDIAN_API_KEY
      const baseUrl = getObsidianUrl()
      const limit = req.query.limit || 3
      
      if (!apiKey) {
        throw new Error('OBSIDIAN_API_KEY not set')
      }
      
      if (!baseUrl) {
        throw new Error('OBSIDIAN_API_URL not set')
      }
      
      // Get recent notes from Obsidian API
      const response = await fetch(`${baseUrl}/vault/`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Obsidian API error: ${response.status}`)
      }
      
      const data = await response.json()
      const files = data.files || []
      
      // Filter for markdown files and take the first few (API doesn't provide modification time)
      const markdownFiles = files
        .filter(file => typeof file === 'string' && file.endsWith('.md'))
        .slice(0, limit)
      
      return markdownFiles.map(file => ({
        title: file.replace('.md', '').split('/').pop(),
        description: 'Obsidian note',
        url: `obsidian://open?vault=Vault42&file=${encodeURIComponent(file)}`,
        date: new Date().toISOString(), // Use current time since API doesn't provide modification time
        tags: []
      }))
    })
    
    res.json(data)
  } catch (error) {
    console.error('Obsidian API error:', error)
    res.json([]) // Return empty array instead of error
  }
})

// Obsidian API endpoint for searching by tag
app.get('/api/obsidian', async (req, res) => {
  try {
    const tag = req.query.tag
    const limit = parseInt(req.query.limit) || 3
    
    // NOTE: Obsidian Local REST API doesn't support tag search or content search
    // It only provides file listing and basic file operations
    // For now, we'll return a message explaining this limitation
    
    console.log(`Obsidian tag search requested for: ${tag}`)
    console.log('WARNING: Obsidian Local REST API does not support tag search')
    
    res.json({
      notes: [],
      message: 'Obsidian Local REST API does not support tag search. Only file listing is available.',
      limitation: 'The Obsidian Local REST API plugin provides basic file operations but cannot search note content or tags.'
    })
  } catch (error) {
    console.error('Obsidian tag search error:', error)
    res.json({ 
      notes: [], 
      error: error.message 
    })
  }
})

// Serve app structure (no semantic naming)
app.get('/app', (req, res) => {
  const structurePath = path.join(process.cwd(), '../dist/app.html')
  res.sendFile(structurePath)
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', cache_size: cache.size })
})

app.listen(port, () => {
  console.log(`Preview API server running on http://localhost:${port}`)
})