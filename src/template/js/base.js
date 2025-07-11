// Base Dashboard JavaScript
const Dashboard = {
    widgets: new Map(),
    liveReload: {
        enabled: false,
        interval: null,
        currentTimestamp: null,
        checkInterval: 2000 // Check every 2 seconds
    },
    
    init() {
        console.log('Initializing dashboard...');
        
        // Initialize theme switcher
        this.initThemeSwitcher();
        
        // Initialize live reload in development
        this.initLiveReload();
        
        // Initialize widgets
        this.widgets.forEach((widget, id) => {
            try {
                if (widget.init && typeof widget.init === 'function') {
                    widget.init();
                }
            } catch (error) {
                console.error(`Error initializing widget ${id}:`, error);
            }
        });
        
        // Initialize inline widget functions
        this.initInlineWidgets();
        
        // Apply saved theme on load
        this.applySavedTheme();
        
        console.log('✅ Dashboard initialized successfully');
    },
    
    initThemeSwitcher() {
        // Initialize footer theme selector only
        const footerSelector = document.getElementById('footer-theme-selector');
        
        if (footerSelector) {
            this.setupThemeSelector(footerSelector);
        }
    },
    
    setupThemeSelector(selector) {
        // Set current theme from localStorage or default
        const currentTheme = this.getCurrentTheme();
        selector.value = currentTheme;
        
        // Handle theme changes
        selector.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            this.switchTheme(newTheme);
        });
    },
    
    getCurrentTheme() {
        // Get theme from localStorage or body class
        const saved = localStorage.getItem('slate-theme');
        if (saved) {
            return saved;
        }
        
        // Fallback to body class
        const bodyClass = document.body.className;
        const themeMatch = bodyClass.match(/theme-([a-z-]+)/);
        return themeMatch ? themeMatch[1] : 'dark';
    },
    
    applySavedTheme() {
        const savedTheme = localStorage.getItem('slate-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
            this.syncThemeSelectors(savedTheme);
        } else {
            // Sync the current theme display with the default theme
            const currentTheme = this.getCurrentTheme();
            this.syncThemeSelectors(currentTheme);
        }
    },
    
    switchTheme(newTheme) {
        console.log(`🎨 Switching theme to: ${newTheme}`);
        
        // Store in localStorage
        localStorage.setItem('slate-theme', newTheme);
        
        // Apply theme
        this.setTheme(newTheme);
        
        // Update all theme selectors to stay in sync
        this.syncThemeSelectors(newTheme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('theme-changed', { 
            detail: { theme: newTheme } 
        }));
    },
    
    setTheme(themeName) {
        console.log(`🎨 Setting theme to: ${themeName}`);
        
        // Remove existing theme link
        const existingThemeLink = document.querySelector('link[href*="theme-"]');
        if (existingThemeLink) {
            existingThemeLink.remove();
        }
        
        // Clean up existing theme JS effects
        this.cleanupThemeEffects();
        
        // Get cache-busting parameter from current theme link or build timestamp
        const buildTimestamp = document.body.getAttribute('data-build-timestamp') || Date.now();
        
        // Add new theme CSS link
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.href = `css/theme-${themeName}.css?v=${buildTimestamp}`;
        document.head.appendChild(themeLink);
        
        // Add theme JS if it exists
        const themeJsFiles = {
            'synthwave': 'synthwave.js',
            'tokyo-night': 'tokyo-night.js'
        };
        
        if (themeJsFiles[themeName]) {
            const themeScript = document.createElement('script');
            themeScript.src = `js/${themeJsFiles[themeName]}?v=${buildTimestamp}`;
            document.body.appendChild(themeScript);
            console.log(`✓ Theme JS loaded: ${themeJsFiles[themeName]}`);
        }
        
        // Remove all existing theme classes
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        // Add new theme class
        document.body.classList.add(`theme-${themeName}`);
        
        // Set data attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', themeName);
        
        console.log(`✓ Theme applied: ${themeName}`);
    },
    
    cleanupThemeEffects() {
        console.log('🧹 Cleaning up theme effects');
        
        // Remove existing theme JS scripts
        const existingThemeScripts = document.querySelectorAll('script[src*="js/synthwave.js"], script[src*="js/tokyo-night.js"]');
        existingThemeScripts.forEach(script => script.remove());
        
        // Clean up Synthwave effects if they exist
        if (window.SynthwaveTheme && typeof window.SynthwaveTheme.remove === 'function') {
            window.SynthwaveTheme.remove();
        }
        
        // Clean up Tokyo Night effects if they exist
        if (window.TokyoNightTheme && typeof window.TokyoNightTheme.remove === 'function') {
            window.TokyoNightTheme.remove();
        }
        
        // Remove any theme-specific elements
        const themeElements = document.querySelectorAll('#synthwave-grid-effect, #synthwave-shapes, #synthwave-scanlines, #tokyo-night-effects');
        themeElements.forEach(el => el.remove());
        
        // Remove theme-specific CSS animations and styles
        const themeStyles = document.querySelectorAll('style[data-theme-effect]');
        themeStyles.forEach(style => style.remove());
        
        // Reset any modified element styles
        const modifiedElements = document.querySelectorAll('[data-effect], [style*="text-shadow"], [style*="animation"]');
        modifiedElements.forEach(el => {
            // Remove data-effect attributes
            el.removeAttribute('data-effect');
            
            // Remove theme-specific classes
            el.classList.remove('effect-color-synthwave', 'effect-color-tokyo-night');
            
            // Reset styles that might have been set by themes
            if (el.style.textShadow && el.style.textShadow.includes('rgba(255, 0, 255)')) {
                el.style.textShadow = '';
            }
            if (el.style.animation && el.style.animation.includes('synthwave')) {
                el.style.animation = '';
            }
            if (el.style.animation && el.style.animation.includes('tokyo')) {
                el.style.animation = '';
            }
        });
        
        // Clear any theme-specific intervals
        if (window.synthwaveIntervals) {
            window.synthwaveIntervals.forEach(interval => clearInterval(interval));
            window.synthwaveIntervals = [];
        }
        
        if (window.tokyoNightIntervals) {
            window.tokyoNightIntervals.forEach(interval => clearInterval(interval));
            window.tokyoNightIntervals = [];
        }
        
        console.log('✓ Theme effects cleaned up');
    },
    
    syncThemeSelectors(theme) {
        const footerSelector = document.getElementById('footer-theme-selector');
        
        if (footerSelector && footerSelector.value !== theme) {
            footerSelector.value = theme;
        }
        
        // Update the theme display text in the footer
        const currentThemeSpan = document.querySelector('.current-theme');
        if (currentThemeSpan) {
            // Get the display name from the dropdown option
            const option = footerSelector.querySelector(`option[value="${theme}"]`);
            const displayName = option ? option.textContent : theme.charAt(0).toUpperCase() + theme.slice(1);
            currentThemeSpan.textContent = displayName;
        }
    },
    
    initInlineWidgets() {
        // Find all widgets with data-widget attributes and initialize them
        const widgets = document.querySelectorAll('[data-widget]');
        
        widgets.forEach(widgetElement => {
            const widgetType = widgetElement.getAttribute('data-widget');
            const widgetId = widgetElement.getAttribute('id');
            
            // Get widget config from the dashboard config or use defaults
            const config = this.getWidgetConfig(widgetId) || {};
            
            // Call the appropriate init function if it exists
            const initFunctionName = `init${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}Widget`;
            
            if (typeof window[initFunctionName] === 'function') {
                try {
                    window[initFunctionName](widgetElement, config);
                    console.log(`✓ Initialized ${widgetType} widget: ${widgetId}`);
                } catch (error) {
                    console.error(`Error initializing ${widgetType} widget ${widgetId}:`, error);
                }
            } else {
                console.warn(`No init function found for ${widgetType} widget: ${initFunctionName}`);
            }
        });
    },
    
    getWidgetConfig(widgetId) {
        // Extract widget configuration from dashboard config
        // This is a simplified version - in a real app you'd store the config
        const configs = {
            'header-clock': {
                format: '12h',
                showDate: true,
                updateInterval: 1000
            },
            'weather-widget': {
                location: '30033',
                displayName: 'Decatur, GA',
                units: 'fahrenheit',
                apiKey: 'a8ef47eaa6bec9780dad5ad07c880c61'
            }
        };
        
        return configs[widgetId] || {};
    },
    
    // Widget management
    registerWidget(id, widget) {
        this.widgets.set(id, widget);
        console.log(`Widget registered: ${id}`);
    },
    
    getWidget(id) {
        return this.widgets.get(id);
    },
    
    // Utility functions
    utils: {
        formatTime(date, format = '12h') {
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: format === '12h'
            };
            return date.toLocaleTimeString('en-US', options);
        },
        
        formatDate(date) {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    },
    
    initLiveReload() {
        // Enable live reload in development mode
        const isDevelopment = (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '5173'
        );
        
        if (!isDevelopment) {
            console.log('🔧 Live reload disabled (not in development mode)');
            return;
        }
        
        // Get initial build timestamp
        this.liveReload.currentTimestamp = this.getBuildTimestamp();
        
        if (!this.liveReload.currentTimestamp) {
            console.log('🔧 Live reload disabled (no build timestamp found)');
            return;
        }
        
        this.liveReload.enabled = true;
        console.log('🔄 Live reload enabled - dashboard will auto-refresh when rebuilt');
        
        // Start checking for changes
        this.liveReload.interval = setInterval(() => {
            this.checkForUpdates();
        }, this.liveReload.checkInterval);
    },
    
    getBuildTimestamp() {
        // Try to get timestamp from meta tag first
        const metaTag = document.querySelector('meta[name="build-timestamp"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // Fallback to body data attribute
        return document.body.getAttribute('data-build-timestamp');
    },
    
    async checkForUpdates() {
        try {
            // Fetch the current page to check for timestamp changes
            const response = await fetch(window.location.href, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                console.warn('🔄 Live reload: Failed to check for updates');
                return;
            }
            
            const html = await response.text();
            
            // Extract build timestamp from the new HTML
            const timestampMatch = html.match(/name="build-timestamp" content="([^"]+)"/);
            if (!timestampMatch) {
                return;
            }
            
            const newTimestamp = timestampMatch[1];
            
            // Compare timestamps
            if (newTimestamp !== this.liveReload.currentTimestamp) {
                console.log(`🔄 Dashboard updated detected! Reloading...`);
                console.log(`   Old: ${this.liveReload.currentTimestamp}`);
                console.log(`   New: ${newTimestamp}`);
                
                // Add a slight delay to ensure file writes are complete
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
            
        } catch (error) {
            console.warn('🔄 Live reload check failed:', error.message);
        }
    },
    
    // Method to manually disable live reload
    disableLiveReload() {
        if (this.liveReload.interval) {
            clearInterval(this.liveReload.interval);
            this.liveReload.interval = null;
            this.liveReload.enabled = false;
            console.log('🔄 Live reload disabled');
        }
    }
};

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Dashboard error:', event.error);
});

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
    Dashboard.init();
}

// Make Dashboard globally available
window.Dashboard = Dashboard; 