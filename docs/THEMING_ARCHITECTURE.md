# Slate Dashboard Theming Architecture

## Overview

The Slate Dashboard uses a hierarchical theming system with three levels of customization: **Themes**, **Widget Definitions**, and **Widget Instances**. This document outlines the current architecture and defines what can be customized at each level.

---

## 🎨 Theme System Hierarchy

### Level 1: Themes (`src/themes/*.yaml`)

**Purpose**: Define the global visual identity and base styling variables

**What Themes Control:**
- **Base Colors**: Primary, secondary, tertiary backgrounds, text colors, accent colors  
- **Typography**: Font families, sizes, weights for all text elements
- **Layout Variables**: Spacing, borders, border radius, shadows
- **Component Styling**: Default styling for headings (H2/H3), widget bodies, text elements
- **Status Indicators**: Colors and effects for online/offline/warning states
- **Widget-Specific Defaults**: Default sizes and styling for clock, weather, etc.
- **Special Effects**: Theme-wide visual effects (glows, animations, gradients)
- **CSS Variables Only**: Themes now only define YAML values converted to CSS variables

**Theme Structure (V2 - Structured Format):**
```yaml
# Modern structured theme format
name: "Theme Name"
description: "Theme description"

# Colors - Core theme palette (REQUIRED)
colors:
  primary: "#color"        # Primary background
  secondary: "#color"      # Secondary background
  tertiary: "#color"       # Tertiary background
  text: "#color"          # Primary text
  text-secondary: "#color" # Secondary text
  accent: "#color"        # Interactive elements
  border: "rgba(...)"     # Border colors

# Typography - Font definitions (REQUIRED)
typography:
  family: "font-stack"
  mono-family: "mono-font-stack"
  size-base: "1rem"
  size-small: "0.875rem"
  size-large: "1.125rem"
  size-xl: "1.25rem"
  weight-normal: "400"
  weight-medium: "500"
  weight-bold: "600"

# Spacing - Layout spacing (REQUIRED)
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  base: "1rem"
  lg: "1.5rem"
  xl: "2rem"

# Effects - Visual enhancements (OPTIONAL)
effects:
  hover-lift: "translateY(-1px)"
  focus-glow: "0 0 0 2px var(--color-accent)"
  subtle-shadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
  hover-shadow: "0 4px 12px rgba(0, 0, 0, 0.4)"
  # ... more effects

# NO CUSTOM CSS ALLOWED - Only structured YAML values
```

---

## 🔄 Architecture Change: V2 Structured Format

**Major Change**: Themes no longer contain raw CSS. The `custom-css: |` sections have been removed from all theme files.

**What Changed:**
- ❌ **Removed**: `custom-css: |` sections with raw CSS selectors and rules
- ✅ **Added**: Structured YAML format with `colors`, `typography`, `spacing`, `effects`
- ✅ **Improved**: Clean separation between theme values and CSS implementation
- ✅ **Enhanced**: Better maintainability and theme inheritance

**Why This Change:**
- **Separation of Concerns**: Themes define values, CSS files implement styling
- **Maintainability**: Easier to modify themes without breaking CSS
- **Consistency**: All themes follow the same structural pattern
- **Performance**: Cleaner CSS generation and better caching

**Migration Path:**
- Old themes with `custom-css` sections → New structured format
- Raw CSS moved to dedicated CSS files or widget definitions
- Theme values converted to structured YAML format

---

### Level 2: Widget Definitions (`src/widgets/*.yaml`)

**Purpose**: Define widget-specific structure, behavior, and styling that works with themes

**What Widget Definitions Control:**
- **HTML Structure**: Widget layout and content structure
- **Widget-Specific CSS**: Styling that uses theme variables but adds widget-specific behavior
- **JavaScript Behavior**: Widget functionality and interactions
- **Configuration Schema**: What properties the widget accepts
- **Template Inheritance**: Extending base widget template or other widgets

**Widget Definition Structure:**
```yaml
# Metadata
metadata:
  type: "widget"
  description: "Widget description"
  version: "1.0.0"

# Template inheritance
extends: "widget"  # or "widget-image", etc.

# Configuration schema
schema:
  property_name:
    type: "string"
    required: true
    default: "value"

# Widget content (injected into {{widget-body}})
widget-body: |
  <div class="widget-content">
    <!-- Widget HTML structure -->
  </div>

# Widget-specific CSS (uses theme variables)
css: |
  .my-widget {
    color: var(--text-primary);
    background: var(--bg-secondary);
    font-size: var(--widget-text-size);
  }
  
  .my-widget .special-element {
    border: 1px solid var(--accent);
  }

# Widget JavaScript
js: |
  function initMyWidget(element, config) {
    // Widget functionality
  }
```

**Current Widget Definition Capabilities:**
- ✅ Use theme CSS variables in widget CSS
- ✅ Define widget-specific CSS classes and styling
- ✅ Create widget-specific layout and structure
- ✅ Define JavaScript behavior
- ❓ Override theme variables for this widget type (NEEDS DEFINITION)
- ❓ Define widget-specific CSS variables (NEEDS DEFINITION)

---

### Level 3: Widget Instances (`config/dashboard.yaml`)

**Purpose**: Configure individual widget instances with specific content and positioning

**What Widget Instances Currently Control:**
- **Widget Configuration**: Content, API keys, settings specific to this instance
- **Grid Positioning**: Where the widget appears on the dashboard
- **Background Colors**: Instance-specific background colors
- **Widget Sizing**: Grid span (columns/rows)

**Current Instance Structure:**
```yaml
widgets:
  - id: "my-widget"
    type: "clock"           # Widget type to instantiate
    position:
      column: "1 / 3"       # Grid column span
      row: "1"              # Grid row
    backgroundColor: "#color"  # Instance background override
    
    # Widget-specific configuration
    showDate: true
    format: "12h"
    updateInterval: 1000
    # ... other widget config
```

**Current Widget Instance Capabilities:**
- ✅ Set widget configuration properties
- ✅ Set grid positioning  
- ✅ Override background color
- ❓ Override theme colors for this instance (NEEDS DEFINITION)
- ❓ Add custom CSS classes (NEEDS DEFINITION)
- ❓ Override widget styling (NEEDS DEFINITION)
- ❓ Set instance-specific CSS variables (NEEDS DEFINITION)

---

## 🔧 Technical Implementation

### CSS Variable System (V2 Update)

**How it works:**
1. **Themes** define structured YAML values in sections (colors, typography, spacing, effects)
2. **Build System** converts YAML to CSS variables with consistent naming
3. **Widget Definitions** reference theme variables with fallbacks: `var(--theme-variable, fallback)`
4. **Widget Instances** can potentially override variables (needs implementation)

**New CSS Variable Naming Convention:**
```css
/* Generated from theme YAML */
:root {
  /* Colors section: colors.primary → --color-primary */
  --color-primary: #0f172a;
  --color-secondary: #1e293b;
  --color-text: #f1f5f9;
  --color-accent: #3b82f6;
  
  /* Typography section: typography.family → --font-family */
  --font-family: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  
  /* Spacing section: spacing.base → --spacing-base */
  --spacing-base: 1rem;
  --spacing-sm: 0.5rem;
  
  /* Effects section: effects.hover-lift → --effect-hover-lift */
  --effect-hover-lift: translateY(-1px);
  --effect-subtle-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

**Example Widget CSS Using New Variables:**
```css
.clock-widget {
  color: var(--color-text, #ffffff);
  font-size: var(--font-size-large, 1.125rem);
  background: var(--color-secondary, #1e293b);
  border: 1px solid var(--color-border, rgba(0,0,0,0.1));
  box-shadow: var(--effect-subtle-shadow, 0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.2s ease;
}

.clock-widget:hover {
  transform: var(--effect-hover-lift, translateY(-1px));
  box-shadow: var(--effect-hover-shadow, 0 4px 8px rgba(0,0,0,0.2));
}
```

### Template Inheritance System

**Base Templates:**
- `widget.yaml`: Base template for standard widgets
- `widget-image.yaml`: Specialized template for image widgets
- `group.yaml`: Template for widget groups

**Inheritance Chain:**
```
widget.yaml (base)
  ├── clock.yaml (extends widget)
  ├── weather.yaml (extends widget)  
  └── image.yaml (extends widget-image)
```

---

## 🎯 Current Questions & Decisions Needed

### 1. CSS Variable Override Hierarchy

**Question**: Should we allow CSS variable overrides at widget definition and instance levels?

**Current**: Only themes define CSS variables
**Proposed Options**:
- **Option A**: Theme only (current) - simple but less flexible
- **Option B**: Theme → Widget Definition → Instance - full flexibility
- **Option C**: Theme → Instance only - skip widget definition level

### 2. Widget Instance Styling

**Question**: How much styling control should individual widget instances have?

**Current**: Only background color override
**Proposed Options**:
- **Minimal**: Background color only (current)
- **Moderate**: Background, text color, border styling
- **Full**: Any CSS property override via custom CSS or variables

### 3. Widget Definition Scope

**Question**: Should widget definitions be able to override theme-level defaults?

**Examples**:
- Clock widget defines its own color scheme
- Image widget defines its own hover effects
- Status widget defines its own status colors

### 4. Styling Specificity Rules

**Question**: What's the CSS specificity hierarchy?

**Current**: Theme CSS → Widget CSS (both at same level)
**Proposed**: Clear cascade with proper specificity

---

## 📋 Proposed Enhancements

### Enhanced Widget Instance Configuration

```yaml
widgets:
  - id: "custom-clock"
    type: "clock"
    position: { column: "1 / 3", row: "1" }
    
    # Current capabilities
    showDate: true
    format: "12h"
    
    # Proposed styling overrides
    style:
      backgroundColor: "#1a365d"
      textColor: "#ffffff"
      borderColor: "#3b82f6"
      
    # Proposed CSS variable overrides  
    variables:
      clock-time-size: "3rem"
      clock-time-color: "#ff6b6b"
      
    # Proposed custom CSS classes
    classes: ["large-clock", "highlighted"]
```

### Enhanced Widget Definition Variables

```yaml
# In widget definition
css: |
  .clock-widget {
    --clock-default-size: 2rem;
    --clock-special-color: var(--accent);
    
    font-size: var(--clock-time-size, var(--clock-default-size));
    color: var(--clock-time-color, var(--clock-special-color));
  }
```

---

## 🚀 Implementation Priority

1. **Define CSS Variable Override System** - Establish clear hierarchy
2. **Enhance Widget Instance Styling** - Add style configuration options  
3. **Improve Widget Definition Variables** - Allow widget-specific CSS variables
4. **Create Styling Validation** - Ensure consistent styling application
5. **Document Best Practices** - Guidelines for theme/widget/instance styling

---

## 📚 Related Documentation

- `src/scripts/theme_renderer.py` - Theme processing implementation
- `src/scripts/dashboard_renderer.py` - Widget and dashboard rendering
- `src/themes/` - Available theme definitions
- `src/widgets/` - Widget definitions and templates
- `config/dashboard.yaml` - Dashboard and widget instance configuration

---

*This document is a living specification. Edit and modify as the architecture evolves.*