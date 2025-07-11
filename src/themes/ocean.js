/**
 * Ocean Theme Effects
 * Deep blue ocean effects with fluid transitions
 */

console.log('🌊 Ocean effects script loaded - Welcome to the deep blue!');

// Apply Ocean effects when theme is loaded
function applyOceanEffects() {
    console.log('🌊 Applying Ocean effects - Dive into the deep blue!');
    
    // First, clean up any existing effects to prevent conflicts
    // Remove ocean-specific styles first
    const existingOceanStyles = document.querySelectorAll('style[data-theme-effect="ocean"]');
    existingOceanStyles.forEach(style => style.remove());
    
    const body = document.body;
    
    // Apply page-level effects
    body.setAttribute('data-effect', 'ocean-gradient-bg');
    body.classList.add('effect-color-ocean');
    
    // Remove test effect
    body.style.border = '';
    console.log('🌊 Removed test border from body');
    
    // Apply ocean glow to main content
    const dashboardMain = document.querySelector('.dashboard-main');
    if (dashboardMain) {
        dashboardMain.setAttribute('data-effect', 'ocean-glow');
        dashboardMain.classList.add('effect-color-ocean');
    }
    
    // Apply effects to widgets
    const widgets = document.querySelectorAll('[data-widget]');
    console.log(`🌊 Found ${widgets.length} widgets to apply ocean effects to`);
    widgets.forEach((widget, index) => {
        const widgetType = widget.getAttribute('data-widget');
        
        // Apply ocean-specific effects based on widget type
        switch (widgetType) {
            case 'weather':
                widget.setAttribute('data-effect', 'ocean-glow');
                widget.setAttribute('data-effect-hover', 'ocean-pulse');
                break;
            case 'status-summary':
                widget.setAttribute('data-effect', 'ocean-border');
                widget.setAttribute('data-effect-hover', 'ocean-pulse');
                break;
            case 'text':
                widget.setAttribute('data-effect', 'ocean-text-glow');
                break;
            case 'clock':
                widget.setAttribute('data-effect', 'ocean-glow');
                widget.setAttribute('data-effect-hover', 'ocean-pulse');
                break;
            default:
                widget.setAttribute('data-effect', 'ocean-subtle');
                widget.setAttribute('data-effect-hover', 'ocean-lift');
        }
        
        // Add staggered animation delay for natural ocean movement
        const delay = (index * 0.5) + 's';
        widget.style.animationDelay = delay;
        
        widget.classList.add('effect-color-ocean');
    });
    
    // Apply ocean effects to groups
    const groups = document.querySelectorAll('.widget-group, .group');
    console.log(`🌊 Found ${groups.length} groups to apply ocean effects to`);
    groups.forEach((group, index) => {
        group.setAttribute('data-effect', 'ocean-border');
        group.setAttribute('data-effect-hover', 'ocean-pulse');
        
        // Add staggered animation delay for groups (different timing than widgets)
        const delay = (index * 1.0 + 2.0) + 's';
        group.style.animationDelay = delay;
        
        group.classList.add('effect-color-ocean');
    });
    
    // Apply ocean effects to links
    const links = document.querySelectorAll('.link-item');
    console.log(`🌊 Found ${links.length} links to apply ocean effects to`);
    links.forEach(link => {
        link.setAttribute('data-effect', 'ocean-subtle');
        link.setAttribute('data-effect-hover', 'ocean-lift');
        link.classList.add('effect-color-ocean');
    });
    
    // Add ocean-specific CSS animations
    const style = document.createElement('style');
    style.setAttribute('data-theme-effect', 'ocean');
    style.textContent = `
        /* Ocean-specific effects */
        .effect-color-ocean {
            --effect-color: 0, 204, 170;  /* Ocean accent color */
            --effect-color-alt: 0, 102, 102;  /* Ocean secondary */
        }
        
        [data-effect="ocean-glow"] {
            box-shadow: var(--effect-ocean-glow, 0 0 20px rgba(0, 204, 170, 0.3)) !important;
            transition: all 0.3s ease;
        }
        
        [data-effect="ocean-border"] {
            border: 2px solid rgba(0, 204, 170, 0.8) !important;
            box-shadow: var(--effect-subtle-shadow, 0 4px 8px rgba(0, 102, 102, 0.4)) !important;
        }
        
        [data-effect="ocean-text-glow"] {
            text-shadow: 0 0 10px rgba(0, 204, 170, 0.6);
        }
        
        [data-effect="ocean-subtle"] {
            box-shadow: var(--effect-subtle-shadow, 0 4px 8px rgba(0, 102, 102, 0.4)) !important;
        }
        
        [data-effect-hover="ocean-lift"]:hover {
            transform: var(--effect-hover-lift, translateY(-2px));
            box-shadow: var(--effect-hover-shadow, 0 8px 16px rgba(0, 102, 102, 0.6));
        }
        
        [data-effect-hover="ocean-pulse"]:hover {
            animation: ocean-pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes ocean-pulse {
            from {
                box-shadow: var(--effect-ocean-glow, 0 0 20px rgba(0, 204, 170, 0.3));
            }
            to {
                box-shadow: var(--effect-accent-glow, 0 0 15px rgba(0, 204, 170, 0.4));
            }
        }
        
        /* Ocean Wave Animation */
        @keyframes ocean-waves {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
        
        /* Ocean Floating Animation */
        @keyframes ocean-float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        /* Ocean Bobbing Animation */
        @keyframes ocean-bob {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
            }
            25% {
                transform: translateY(-5px) rotate(0.5deg);
            }
            75% {
                transform: translateY(3px) rotate(-0.5deg);
            }
        }
        
        /* Ocean Ripple Effect */
        @keyframes ocean-ripple {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 204, 170, 0.7);
            }
            70% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(0, 204, 170, 0);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 204, 170, 0);
            }
        }
        
        body[data-effect="ocean-gradient-bg"] {
            background: linear-gradient(135deg, 
                rgba(0, 17, 34, 1) 0%,
                rgba(0, 51, 68, 1) 30%,
                rgba(0, 68, 102, 1) 60%,
                rgba(0, 102, 136, 1) 100%
            ) !important;
            background-size: 400% 400% !important;
            animation: ocean-waves 15s ease-in-out infinite !important;
        }
        
        /* Floating widgets */
        [data-effect="ocean-glow"] {
            animation: ocean-float 6s ease-in-out infinite !important;
        }
        
        /* Bobbing groups */
        [data-effect="ocean-border"] {
            animation: ocean-bob 8s ease-in-out infinite !important;
        }
        
        /* Ripple effect on hover */
        [data-effect-hover="ocean-lift"]:hover {
            animation: ocean-ripple 0.6s ease-out !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('🌊 Ocean effects applied - Welcome to the deep blue waters!');
}

// Remove Ocean effects
function removeOceanEffects() {
    console.log('🌊 Removing Ocean effects');
    
    // Remove data-effect attributes from all elements
    document.querySelectorAll('[data-effect]').forEach(el => {
        el.removeAttribute('data-effect');
        el.removeAttribute('data-effect-hover');
        el.classList.remove('effect-color-ocean');
        // Clear animation delays that were set
        el.style.animationDelay = '';
        el.style.animation = '';
    });
    
    // Remove body effects specifically
    document.body.removeAttribute('data-effect');
    document.body.classList.remove('effect-color-ocean');
    document.body.style.background = '';
    document.body.style.backgroundSize = '';
    document.body.style.animation = '';
    
    // Remove dashboard main effects
    const dashboardMain = document.querySelector('.dashboard-main');
    if (dashboardMain) {
        dashboardMain.removeAttribute('data-effect');
        dashboardMain.classList.remove('effect-color-ocean');
        dashboardMain.style.animation = '';
    }
    
    // Remove widget effects more thoroughly
    document.querySelectorAll('[data-widget]').forEach(widget => {
        widget.removeAttribute('data-effect');
        widget.removeAttribute('data-effect-hover');
        widget.classList.remove('effect-color-ocean');
        widget.style.animationDelay = '';
        widget.style.animation = '';
    });
    
    // Remove group effects more thoroughly
    document.querySelectorAll('.widget-group, .group').forEach(group => {
        group.removeAttribute('data-effect');
        group.removeAttribute('data-effect-hover');
        group.classList.remove('effect-color-ocean');
        group.style.animationDelay = '';
        group.style.animation = '';
    });
    
    // Remove link effects more thoroughly
    document.querySelectorAll('.link-item').forEach(link => {
        link.removeAttribute('data-effect');
        link.removeAttribute('data-effect-hover');
        link.classList.remove('effect-color-ocean');
        link.style.animation = '';
    });
    
    // Remove ocean-specific styles
    const oceanStyles = document.querySelectorAll('style[data-theme-effect="ocean"]');
    oceanStyles.forEach(style => style.remove());
    
    console.log('🌊 Ocean effects fully removed');
}

// Expose functions globally for theme switcher
window.OceanTheme = {
    apply: applyOceanEffects,
    remove: removeOceanEffects
};

// Apply effects immediately when script loads (like synthwave)
// Add small delay to ensure CSS is loaded when switching themes
setTimeout(() => {
    applyOceanEffects();
}, 100); 