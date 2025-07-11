# Stock Effects System

The Stock Effects System provides reusable visual effects that can be easily activated by themes and widgets without needing to implement custom CSS or JavaScript for each effect.

## 🎯 **Core Concept**

Instead of every theme or widget creating custom gradient, glow, or animation effects, they can simply "call on" pre-built stock effects from the base system. This promotes:

- **Consistency** - All widgets use the same high-quality effects
- **Performance** - Shared CSS reduces bundle size
- **Maintainability** - Effects are centralized and can be improved in one place
- **Ease of Use** - Just add `data-effect="neon-glow"` to any element
- **Theme-Widget Separation** - Widgets remain theme-agnostic while themes control visual styling

## 🔀 **Theme-Widget Separation Principle**

**CRITICAL**: Widgets should be defined as **theme-agnostic** components. Visual effects should be applied by **themes**, not hardcoded into widget definitions.

### ❌ **Bad Approach (Theme-Coupled)**
```yaml
# DON'T: Widget hardcoded for specific theme
- id: "synthwave-weather"
  type: "widget" 
  widget: "weather"
  config:
    synthwaveEffects: true        # ❌ This couples widget to synthwave theme
    effectIntensity: "high"       # ❌ Widget won't work well on other themes
```

### ✅ **Good Approach (Theme-Agnostic)**
```yaml
# DO: Widget defined neutrally
- id: "weather-widget"
  type: "widget"
  widget: "weather"
  config:
    location: "30033"             # ✅ Only functional configuration
    apiKey: "your-key"            # ✅ No theme-specific settings
    
# Theme applies effects globally
# In synthwave.yaml theme:
widget-enhancements:
  weather:
    effects: ["neon-glow-border", "pulse-glow"]  # ✅ Theme controls effects
```

## 📁 **System Components**

### 1. Base Effects CSS (`src/assets/effects/base-effects.css`)
Contains all the stock visual effects as pure CSS using data attributes and CSS custom properties.

### 2. Effect Manager (`src/assets/effects/effect-manager.js`)
JavaScript API for programmatically applying effects, with theme integration.

### 3. Theme Integration (`src/themes/*.yaml`)
Themes specify which effects to apply to which widgets, maintaining separation.

## 🎨 **How Themes Control Widget Effects**

### Theme-Level Effect Application
```yaml
# In theme.yaml (e.g., synthwave.yaml)
name: "Synthwave"

# Global page effects
effects:
  page-effects:
    - "grid-overlay"
    - "scanlines"

# Effects applied to ALL widgets of certain types
widget-enhancements:
  weather:
    effects: ["neon-glow-border", "pulse-glow", "hover-electric"]
    colors: ["primary", "secondary"]
    
  status-summary:
    effects: ["electric-border", "neon-glow"]
    colors: ["primary", "accent"]
    
  text:
    effects: ["neon-glow", "hover-pulse"]
    colors: ["primary"]

# Effect configuration
effect-colors:
  primary: "255, 0, 128"          # Hot magenta
  secondary: "0, 255, 255"        # Electric cyan
```

### Automatic Theme Application
When a theme is activated, the Effect Manager automatically:
1. **Reads theme configuration** for widget enhancements
2. **Applies effects to matching widgets** based on widget type
3. **Removes effects when theme changes** to avoid conflicts
4. **Maintains theme color consistency** across all effects

## 🔧 **Widget-Level Effect Opt-In (Optional)**

Widgets can optionally support effects, but should remain functional without them:

```yaml
# Widget definition (theme-agnostic)
schema:
  # Functional configuration
  location:
    type: "string"
    required: true
    
  # Optional effect support (defaults that work on any theme)
  enableEffects:
    type: "boolean"
    required: false
    default: true
    description: "Allow themes to apply visual effects"
    
  effectIntensity:
    type: "string"
    required: false  
    default: "medium"
    enum: ["low", "medium", "high"]
    description: "Maximum effect intensity allowed"
```

### Widget Effect Capability Declaration
```yaml
# In widget definition
capabilities:
  stockEffects: true              # ✅ Widget supports stock effects
  themeable: true                 # ✅ Widget adapts to themes
  responsive: true                # ✅ Widget is responsive
  
# Theme-neutral effect hooks (optional)
effectSupport:
  - name: "border-effects"
    target: ".widget-container"
    description: "Effects can be applied to main container"
    
  - name: "text-effects" 
    target: ".widget-title"
    description: "Effects can be applied to title"
```

## 🚀 **Implementation Strategy**

### 1. Theme-Driven Effects (Primary)
```javascript
// Effect Manager automatically applies theme effects
function applyThemeEffects(theme) {
  const themeConfig = loadTheme(theme);
  
  // Apply effects based on theme configuration
  if (themeConfig.widgetEnhancements?.weather) {
    const weatherWidgets = document.querySelectorAll('[data-widget="weather"]');
    weatherWidgets.forEach(widget => {
      applyEffects(widget, themeConfig.widgetEnhancements.weather.effects);
    });
  }
}
```

### 2. Manual Override (Secondary)
```javascript
// Developers can still manually apply effects if needed
window.EffectManager.applyEffects('.specific-widget', ['neon-glow-border'], {
  colorScheme: 'custom',
  effectColor: '255, 100, 50'
});
```

### 3. Widget Configuration (Minimal)
```yaml
# Only for widgets that need specific effect behavior
config:
  enableEffects: false            # Opt out of theme effects entirely
  maxIntensity: "low"             # Limit effect intensity
```

## 📋 **Available Stock Effects**

### Border & Glow Effects
- **`neon-glow-border`**: Glowing neon border around elements
- **`electric-border`**: Animated electric border with rotating gradient  
- **`pulse-border`**: Subtle pulsing border animation
- **`pulse-glow`**: Pulsing glow effect that breathes

### Background Effects
- **`grid-overlay`**: Tron-style grid pattern overlay
- **`scanlines`**: CRT screen scanline effect for retro themes
- **`retro-gradient-bg`**: Animated gradient background effects

### Text Effects  
- **`neon-glow`**: Glowing text effect with customizable colors
- **`chromatic-aberration`**: Retro text distortion effect

### Interactive Effects
- **`hover-pulse`**: Pulse effect activated on mouse hover
- **`hover-electric`**: Electric border effect on hover
- **`hover-glow`**: Enhanced glow effect on hover

## 🎯 **Benefits of This Approach**

### For Widget Developers
- **Theme agnostic** - Widgets work beautifully on any theme
- **No effect code needed** - Focus on functionality, not styling
- **Consistent API** - Same widget definition works everywhere
- **Optional enhancement** - Effects are additive, not required

### For Theme Designers
- **Full visual control** - Themes determine the entire aesthetic
- **Reusable effects** - Same effects work across all widgets
- **Easy customization** - Change effects globally by editing theme
- **Performance optimized** - Effects are shared, not duplicated

### For Users
- **Consistent experience** - All widgets match the theme aesthetic
- **Easy theme switching** - No broken widgets when changing themes
- **Visual coherence** - Everything looks designed together
- **Performance benefits** - Shared effect system is more efficient

## 🔮 **Future Extensibility**

Adding new effects is simple:

1. **Add effect CSS** to `base-effects.css`
2. **Update effect list** in Effect Manager
3. **Effects automatically available** to all themes and widgets
4. **No widget updates needed** - separation of concerns maintained

Just add them to `base-effects.css` and they become available to all widgets and themes!

## 🚨 **Migration Guide for Existing Widgets**

If you have widgets with hardcoded theme effects:

### Before (Theme-Coupled)
```yaml
config:
  synthwaveEffects: true
  effectIntensity: "high"
  color: "primary"
```

### After (Theme-Agnostic)  
```yaml
config:
  enableEffects: true             # Optional: allow theme effects
  maxIntensity: "high"            # Optional: limit intensity
  # Remove theme-specific configuration
```

Move effect configuration to theme files:
```yaml
# In synthwave.yaml
widget-enhancements:
  your-widget-type:
    effects: ["neon-glow-border", "pulse-glow"]
    colors: ["primary"]
```

This ensures widgets remain universally compatible while themes control the visual experience. 