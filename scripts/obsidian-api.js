#!/usr/bin/env node

/**
 * Simple Obsidian API server for Slate Dashboard
 * Scans Obsidian vault for notes with specific tags
 */

const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Function to scan markdown files for tags
function scanVaultForNotes(vaultPath, tag, maxNotes = 5, namespace = 'dashboard') {
  try {
    if (!fs.existsSync(vaultPath)) {
      throw new Error(`Vault path does not exist: ${vaultPath}`)
    }

    const notes = []
    
    function scanDirectory(dir) {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          // Recursively scan subdirectories, but skip hidden ones
          scanDirectory(fullPath)
        } else if (stat.isFile() && item.endsWith('.md')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8')
            const fileName = path.relative(vaultPath, fullPath)
            
            // Extract title (first # heading or filename)
            const titleMatch = content.match(/^#\s+(.+)$/m)
            const title = titleMatch ? titleMatch[1] : path.basename(item, '.md')
            
            // Extract tags
            const tagMatches = content.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g) || []
            const tags = tagMatches.map(t => t.slice(1)) // Remove # prefix
            
            // Build the full namespaced tag
            const fullTag = tag ? `${namespace}-${tag}` : null
            
            // Check if note has the specified namespaced tag (if tag filter is provided)
            if (!fullTag || tags.includes(fullTag)) {
              // Extract excerpt (first paragraph after title)
              const lines = content.split('\n')
              let excerpt = ''
              let foundContent = false
              
              for (const line of lines) {
                const trimmed = line.trim()
                if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
                  if (trimmed.length > 10) { // Skip very short lines
                    excerpt = trimmed.substring(0, 120) + (trimmed.length > 120 ? '...' : '')
                    break
                  }
                }
              }
              
              notes.push({
                title,
                fileName: fileName.replace(/\.md$/, ''), // Remove .md for Obsidian links
                excerpt,
                tags,
                modified: stat.mtime.toISOString(),
                path: fullPath
              })
            }
          } catch (err) {
            console.warn(`Error reading file ${fullPath}:`, err.message)
          }
        }
      }
    }
    
    scanDirectory(vaultPath)
    
    // Sort by modification time (newest first) and limit results
    return notes
      .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      .slice(0, maxNotes)
      
  } catch (error) {
    console.error('Error scanning vault:', error)
    throw error
  }
}

// API endpoint
app.post('/api/obsidian/notes', (req, res) => {
  try {
    const { vaultPath, tag, maxNotes, namespace = 'dashboard' } = req.body
    
    if (!vaultPath) {
      return res.status(400).json({ error: 'vaultPath is required' })
    }
    
    const fullTag = tag ? `${namespace}-${tag}` : null
    console.log(`Scanning vault: ${vaultPath} for tag: #${fullTag || 'all'}`)
    
    const notes = scanVaultForNotes(vaultPath, tag, maxNotes, namespace)
    
    console.log(`Found ${notes.length} notes`)
    
    res.json(notes)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'obsidian-api' })
})

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Obsidian API server running on http://127.0.0.1:${PORT}`)
  })
}

module.exports = app