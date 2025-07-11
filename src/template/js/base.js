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
        
        console.log('✅ Dashboard initialized successfully');
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