#!/usr/bin/env node
/**
 * Auto-rebuild Dashboard (Node.js ES Module)
 * Watches for file changes and rebuilds dashboard
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const THEME = process.argv[2] || 'dark';

// Paths to watch
const WATCH_PATHS = [
    path.join(PROJECT_ROOT, 'config'),
    path.join(PROJECT_ROOT, 'src', 'widgets'),
    path.join(PROJECT_ROOT, 'src', 'themes'),
    path.join(PROJECT_ROOT, 'src', 'template'),
];

// Debounce settings
let rebuildTimeout = null;
const DEBOUNCE_MS = 1000;

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function rebuildDashboard(changedFile = 'initial build') {
    const relPath = changedFile.replace(PROJECT_ROOT + path.sep, '');
    
    console.log('');
    log('blue', `🔄 Change detected: ${relPath}`);
    log('yellow', `⚡ Rebuilding dashboard with ${THEME} theme...`);
    
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const rendererScript = path.join(PROJECT_ROOT, 'src', 'scripts', 'dashboard_renderer.py');
    
    const rebuild = spawn(pythonCmd, [rendererScript, '--theme', THEME], {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    
    rebuild.on('close', (code) => {
        if (code === 0) {
            log('green', '✅ Dashboard rebuilt successfully!');
            log('reset', '   View at: http://localhost:5173');
        } else {
            log('red', '❌ Dashboard rebuild failed');
        }
    });
    
    rebuild.on('error', (err) => {
        log('red', `❌ Error rebuilding dashboard: ${err.message}`);
    });
}

function shouldWatch(filePath) {
    const ext = path.extname(filePath);
    return ['.yaml', '.yml', '.html', '.css', '.js', '.py'].includes(ext);
}

function watchDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        log('yellow', `⚠️  Path not found: ${path.basename(dirPath)}`);
        return;
    }
    
    log('reset', `   👀 Watching: ${path.basename(dirPath)}`);
    
    fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        
        const fullPath = path.join(dirPath, filename);
        
        if (!shouldWatch(fullPath)) return;
        
        // Debounce rapid changes
        if (rebuildTimeout) {
            clearTimeout(rebuildTimeout);
        }
        
        rebuildTimeout = setTimeout(() => {
            rebuildDashboard(fullPath);
        }, DEBOUNCE_MS);
    });
}

function main() {
    log('blue', `🔍 Watching for changes to rebuild dashboard with ${THEME} theme...`);
    log('blue', '📁 Watching paths:');
    
    // Set up watchers
    WATCH_PATHS.forEach(watchDirectory);
    
    log('blue', '🔄 Press Ctrl+C to stop');
    
    // Initial build
    console.log('');
    log('yellow', '⚡ Initial build...');
    rebuildDashboard();
    
    // Handle cleanup
    process.on('SIGINT', () => {
        console.log('');
        log('yellow', '🛑 Stopping file watcher...');
        process.exit(0);
    });
}

main(); 