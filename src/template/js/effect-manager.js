/**
 * Visual Effects Manager
 * Handles activation and configuration of stock visual effects
 */

class EffectManager {
  constructor() {
    this.activeEffects = new Set();
    this.effectConfig = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the effect system
   */
  init() {
    if (this.initialized) return;
    
    // Load base effects CSS
    this.loadEffectsCSS();
    
    this.initialized = true;
    console.log('Effect Manager initialized');
  }

  /**
   * Load the base effects CSS if not already loaded
   */
  loadEffectsCSS() {
    if (document.querySelector('#base-effects-css')) return;
    
    const link = document.createElement('link');
    link.id = 'base-effects-css';
    link.rel = 'stylesheet';
    link.href = '/src/assets/effects/base-effects.css';
    document.head.appendChild(link);
  }

  /**
   * Load synthwave fonts when synthwave theme is activated
   */
  loadSynthwaveFonts() {
    if (document.querySelector('#synthwave-fonts-css')) return;
    
    const link = document.createElement('link');
    link.id = 'synthwave-fonts-css';
    link.rel = 'stylesheet';
    link.href = '/src/assets/fonts/synthwave-fonts.css';
    document.head.appendChild(link);
    
    // Add preload element to trigger font loading
    const preload = document.createElement('div');
    preload.className = 'synthwave-font-preload';
    document.body.appendChild(preload);
    
    console.log('Synthwave fonts loaded');
  }

  /**
   * Apply effects to an element or elements
   */
  applyEffects(selector, effects, config = {}) {
    const elements = typeof selector === 'string' 
      ? document.querySelectorAll(selector)
      : [selector];

    elements.forEach(element => {
      if (!element) return;

      // Apply effect color configuration
      if (config.effectColor) {
        element.style.setProperty('--effect-color', config.effectColor);
      }
      if (config.effectColorAlt) {
        element.style.setProperty('--effect-color-alt', config.effectColorAlt);
      }

      // Apply speed configuration
      if (config.speed) {
        const speedClass = `effect-speed-${config.speed}`;
        element.classList.add(speedClass);
      }

      // Apply effects
      effects.forEach(effect => {
        if (this.isValidEffect(effect)) {
          element.setAttribute('data-effect', effect);
          this.activeEffects.add(effect);
        } else if (this.isValidHoverEffect(effect)) {
          element.setAttribute('data-effect-hover', effect.replace('hover-', ''));
        }
      });

      // Apply utility classes
      if (config.colorScheme) {
        element.classList.add(`effect-color-${config.colorScheme}`);
      }
    });
  }

  /**
   * Remove effects from elements
   */
  removeEffects(selector, effects = null) {
    const elements = typeof selector === 'string' 
      ? document.querySelectorAll(selector)
      : [selector];

    elements.forEach(element => {
      if (!element) return;

      if (effects === null) {
        // Remove all effects
        element.removeAttribute('data-effect');
        element.removeAttribute('data-effect-hover');
        element.classList.remove('effect-color-synthwave', 'effect-color-retro', 'effect-color-cyber');
        element.classList.remove('effect-speed-slow', 'effect-speed-fast');
      } else {
        // Remove specific effects
        effects.forEach(effect => {
          if (this.isValidEffect(effect)) {
            element.removeAttribute('data-effect');
          } else if (this.isValidHoverEffect(effect)) {
            element.removeAttribute('data-effect-hover');
          }
        });
      }
    });
  }

  /**
   * Apply theme-based effects to the entire page
   */
  applyThemeEffects(theme, effects) {
    const body = document.body;
    
    // Clear existing theme effects
    this.clearThemeEffects();
    
    // Apply new theme effects
    if (effects.includes('grid-overlay')) {
      body.setAttribute('data-effect', 'grid-overlay');
      if (theme === 'synthwave') {
        body.classList.add('effect-color-synthwave');
      } else if (theme === 'retro') {
        body.classList.add('effect-color-retro');
      } else if (theme === 'tokyo-night') {
        body.classList.add('effect-color-tokyo-blue');
      }
    }

    if (effects.includes('scanlines')) {
      body.setAttribute('data-effect', 'scanlines');
    }

    if (effects.includes('subtle-scanlines')) {
      body.setAttribute('data-effect', 'subtle-scanlines');
      if (theme === 'tokyo-night') {
        body.classList.add('effect-color-tokyo-blue');
      }
    }

    // Apply effects to all widgets
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
      if (effects.includes('neon-glow')) {
        widget.setAttribute('data-effect', 'neon-glow-border');
      }
      
      if (effects.includes('pulse-animation')) {
        widget.setAttribute('data-effect-hover', 'pulse');
      }

      if (effects.includes('electric-borders')) {
        widget.setAttribute('data-effect', 'electric-border');
      }

      // Apply color scheme
      if (theme === 'synthwave') {
        widget.classList.add('effect-color-synthwave');
      } else if (theme === 'retro') {
        widget.classList.add('effect-color-retro');
      } else if (theme === 'tokyo-night') {
        widget.classList.add('effect-color-tokyo-blue');
      }
    });

    console.log(`Applied ${effects.length} theme effects for ${theme}`);
  }

  /**
   * Clear all theme-applied effects
   */
  clearThemeEffects() {
    const body = document.body;
    body.removeAttribute('data-effect');
    body.classList.remove('effect-color-synthwave', 'effect-color-retro', 'effect-color-cyber', 'effect-color-tokyo-blue', 'effect-color-tokyo-purple', 'effect-color-tokyo-cyan');

    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
      widget.removeAttribute('data-effect');
      widget.removeAttribute('data-effect-hover');
      widget.classList.remove('effect-color-synthwave', 'effect-color-retro', 'effect-color-cyber', 'effect-color-tokyo-blue', 'effect-color-tokyo-purple', 'effect-color-tokyo-cyan');
    });
  }

  /**
   * Check if effect name is valid
   */
  isValidEffect(effect) {
    const validEffects = [
      'grid-overlay', 'scanlines', 'neon-glow', 'neon-glow-border',
      'pulse-glow', 'pulse-border', 'chromatic-aberration', 
      'electric-border', 'retro-gradient-bg', 'neon-gradient-bg',
      'subtle-scanlines', 'subtle-glow', 'tokyo-grid-overlay'
    ];
    return validEffects.includes(effect);
  }

  /**
   * Check if hover effect name is valid
   */
  isValidHoverEffect(effect) {
    const validHoverEffects = [
      'hover-glow', 'hover-pulse', 'hover-electric'
    ];
    return validHoverEffects.includes(effect);
  }

  /**
   * Create effect configuration for widgets
   */
  createWidgetEffectConfig(effectList, options = {}) {
    return {
      effects: effectList,
      colorScheme: options.colorScheme || 'synthwave',
      speed: options.speed || 'normal',
      intensity: options.intensity || 'medium'
    };
  }

  /**
   * Quick effect application methods
   */
  makeSynthwave(selector, effects = ['neon-glow-border', 'hover-pulse']) {
    this.loadSynthwaveFonts(); // Auto-load fonts for synthwave
    this.applyEffects(selector, effects, {
      colorScheme: 'synthwave',
      speed: 'normal'
    });
  }

  makeRetro(selector, effects = ['scanlines', 'neon-glow']) {
    this.applyEffects(selector, effects, {
      colorScheme: 'retro',
      speed: 'slow'
    });
  }

  makeCyber(selector, effects = ['electric-border', 'hover-glow']) {
    this.applyEffects(selector, effects, {
      colorScheme: 'cyber',
      speed: 'fast'
    });
  }

  makeTokyoNight(selector, effects = ['subtle-glow', 'neon-glow-border']) {
    this.applyEffects(selector, effects, {
      colorScheme: 'tokyo-blue',
      speed: 'normal'
    });
  }
}

// Create global instance
window.EffectManager = new EffectManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.EffectManager.init();
  });
} else {
  window.EffectManager.init();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EffectManager;
} 