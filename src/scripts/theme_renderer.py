#!/usr/bin/env python3
"""
Theme Renderer
Handles theme loading, processing, and CSS generation for Slate Dashboard
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional


def load_yaml(file_path: Path) -> Dict[str, Any]:
    """Load a YAML file"""
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)


def get_available_themes(themes_dir: Path) -> List[str]:
    """Get list of available theme names"""
    available_themes = []
    
    if not themes_dir.exists():
        return available_themes
        
    for theme_file in themes_dir.glob("*.yaml"):
        # Skip non-theme files
        if theme_file.name not in ['theme-switcher.yaml']:
            theme_name = theme_file.stem
            available_themes.append(theme_name)
    
    return sorted(available_themes)


def load_theme(theme_name: str, themes_dir: Path) -> Optional[Dict[str, Any]]:
    """Load and parse a theme YAML file
    
    Args:
        theme_name: Name of the theme to load
        themes_dir: Path to themes directory
        
    Returns:
        dict: Theme configuration or None if not found
    """
    theme_file = themes_dir / f"{theme_name}.yaml"
    if not theme_file.exists():
        print(f"   ⚠️  Theme file not found: {theme_file}")
        return None
    
    try:
        theme_config = load_yaml(theme_file)
        return theme_config
    except Exception as e:
        print(f"   ❌ Error loading theme {theme_name}: {e}")
        return None


def validate_theme(theme_data: Dict[str, Any]) -> bool:
    """Validate theme structure and required properties
    
    Args:
        theme_data: Theme configuration dictionary
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not isinstance(theme_data, dict):
        return False
    
    # Check if structured theme format
    if _is_structured_theme(theme_data):
        return _validate_structured_theme(theme_data)
    else:
        return _validate_legacy_theme(theme_data)


def _validate_legacy_theme(theme_data: Dict[str, Any]) -> bool:
    """Validate legacy flat theme format"""
    required_props = [
        'bg-primary', 'bg-secondary', 'text-primary', 'text-secondary', 'accent'
    ]
    
    for prop in required_props:
        if prop not in theme_data:
            print(f"   ⚠️  Missing required theme property: {prop}")
            return False
    
    return True


def _validate_structured_theme(theme_data: Dict[str, Any]) -> bool:
    """Validate structured theme format"""
    # Check for required color properties
    if 'colors' not in theme_data:
        print("   ⚠️  Missing required 'colors' section")
        return False
    
    colors = theme_data['colors']
    required_colors = ['primary', 'secondary', 'text', 'accent']
    
    for color in required_colors:
        if color not in colors:
            print(f"   ⚠️  Missing required color: {color}")
            return False
    
    # Typography is optional but if present, should have basic properties
    if 'typography' in theme_data:
        typography = theme_data['typography']
        if 'family' not in typography:
            print("   ⚠️  Typography section missing 'family'")
            return False
    
    return True


def generate_css_variables(theme_data: Dict[str, Any]) -> str:
    """Convert theme YAML properties to CSS custom properties
    
    Args:
        theme_data: Theme configuration dictionary
        
    Returns:
        str: CSS variables as string
    """
    # Check if this is a new structured theme format
    if _is_structured_theme(theme_data):
        return _generate_exploded_css(theme_data)
    else:
        return _generate_legacy_css(theme_data)


def _is_structured_theme(theme_data: Dict[str, Any]) -> bool:
    """Check if theme uses new structured format"""
    structured_keys = {'colors', 'typography', 'spacing', 'effects'}
    return any(key in theme_data for key in structured_keys)


def _generate_legacy_css(theme_data: Dict[str, Any]) -> str:
    """Generate CSS from legacy flat theme format"""
    css_vars = ":root {\n"
    
    # Skip metadata and special keys
    skip_keys = {
        'name', 'description', 'special-effects', 'gradients', 
        'effect-colors', 'custom-css'
    }
    
    # Convert theme properties to CSS variables
    for key, value in theme_data.items():
        if key not in skip_keys and not isinstance(value, (dict, list)):
            css_var = key.replace('_', '-')
            css_vars += f"  --{css_var}: {value};\n"
    
    css_vars += "}\n\n"
    return css_vars


def _generate_exploded_css(theme_data: Dict[str, Any]) -> str:
    """Generate CSS variables from structured theme data (v2 format)"""
    css_content = ":root {\n"
    
    # Generate CSS variables from colors
    if 'colors' in theme_data:
        css_content += "  /* Colors */\n"
        for key, value in theme_data['colors'].items():
            # Map theme color keys to CSS variable names
            if key == 'primary':
                css_content += f"  --bg-primary: {value};\n"
                css_content += f"  --color-primary: {value};\n"
            elif key == 'secondary':
                css_content += f"  --bg-secondary: {value};\n"
                css_content += f"  --color-secondary: {value};\n"
            elif key == 'tertiary':
                css_content += f"  --bg-tertiary: {value};\n"
                css_content += f"  --color-tertiary: {value};\n"
            elif key == 'text':
                css_content += f"  --text-primary: {value};\n"
                css_content += f"  --color-text: {value};\n"
            elif key == 'text-secondary':
                css_content += f"  --text-secondary: {value};\n"
                css_content += f"  --color-text-secondary: {value};\n"
            elif key == 'accent':
                css_content += f"  --accent: {value};\n"
                css_content += f"  --color-accent: {value};\n"
                css_content += f"  --h2-color: {value};\n"  # Group titles use accent color
                # Create a semi-transparent version for group title background
                if value.startswith('#'):
                    # Convert hex to rgba with 0.1 opacity
                    hex_color = value.lstrip('#')
                    if len(hex_color) == 6:
                        r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
                        css_content += f"  --group-title-bg: rgba({r}, {g}, {b}, 0.1);\n"
                    else:
                        css_content += f"  --group-title-bg: rgba(59, 130, 246, 0.1);\n"  # fallback
                else:
                    css_content += f"  --group-title-bg: rgba(59, 130, 246, 0.1);\n"  # fallback for non-hex colors
            elif key == 'border':
                css_content += f"  --border: {value};\n"
                css_content += f"  --color-border: {value};\n"
            else:
                css_content += f"  --color-{key}: {value};\n"
        css_content += "\n"
    
    # Generate CSS variables from typography
    if 'typography' in theme_data:
        css_content += "  /* Typography */\n"
        for key, value in theme_data['typography'].items():
            if key == 'family':
                css_content += f"  --font-family: {value};\n"
            elif key == 'mono-family':
                css_content += f"  --font-family-mono: {value};\n"
            else:
                css_content += f"  --font-{key}: {value};\n"
        css_content += "\n"
    
    # Generate CSS variables from spacing
    if 'spacing' in theme_data:
        css_content += "  /* Spacing */\n"
        for key, value in theme_data['spacing'].items():
            css_content += f"  --spacing-{key}: {value};\n"
        css_content += "\n"
    
    # Generate CSS variables from effects
    if 'effects' in theme_data:
        css_content += "  /* Effects */\n"
        for key, value in theme_data['effects'].items():
            css_content += f"  --effect-{key}: {value};\n"
        css_content += "\n"
    
    css_content += "}\n\n"
    return css_content


def generate_core_layout_css(base_config: Dict[str, Any]) -> str:
    """Generate core layout CSS from base-config.yaml instead of loading static base.css
    
    Args:
        base_config: Base configuration dictionary from base-config.yaml
        
    Returns:
        str: Generated CSS for core layout and widget styles
    """
    css = """/*
 * Core Layout CSS - Generated from base-config.yaml
 * This file contains the essential layout styles that all themes depend on
 */

/* ==================== DASHBOARD LAYOUT ==================== */
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family, system-ui, -apple-system, sans-serif);
  background: var(--bg-primary, #0f172a);
  color: var(--text-primary, #ffffff);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ==================== HEADER ==================== */
.dashboard-header {
  background: var(--bg-secondary, #1e293b);
  border-bottom: 1px solid var(--border, #334155);
  padding: 1rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  height: 40px;
  width: auto;
}

/* ==================== MAIN CONTENT ==================== */
.dashboard-main {
  flex: 1;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* ==================== WIDGET GRID ==================== */
.widgets-grid,
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 12), 1fr);
  gap: var(--grid-gap, 1rem);
  grid-template-rows: var(--grid-template-rows, none);
  grid-auto-rows: var(--grid-auto-rows, minmax(80px, auto));
}

/* ==================== WIDGET BASE STYLES ==================== */
.widget {
  background: var(--bg-secondary, #1e293b);
  border: 1px solid var(--border, #334155);
  border-radius: var(--radius, 0.5rem);
  box-shadow: var(--shadow, 0 4px 6px -1px rgb(0 0 0 / 0.3));
  transition: all 0.2s ease;
  overflow: hidden;
}

.widget:hover {
  border-color: var(--accent, #3b82f6);
  transform: translateY(-1px);
  box-shadow: 0 8px 12px -1px rgb(0 0 0 / 0.4);
}

.widget-content {
  padding: 1rem;
  height: 100%;
  box-sizing: border-box;
}

/* ==================== GROUP STYLES ==================== */
.group {
  background: var(--bg-secondary, #1e293b);
  border: 1px solid var(--border, #334155);
  border-radius: var(--radius, 0.5rem);
  padding: 1rem;
  box-shadow: var(--shadow, 0 4px 6px -1px rgb(0 0 0 / 0.3));
}

.group-title {
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold, 600);
  color: var(--text-primary, #ffffff);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border, #334155);
}

.group-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* ==================== LINK ITEMS ==================== */
.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-tertiary, #334155);
  border: 1px solid var(--border, #334155);
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-primary, #ffffff);
  transition: all 0.2s ease;
  flex: 1;
  min-width: 200px;
}

.link-item:hover {
  background: var(--accent, #3b82f6);
  border-color: var(--accent, #3b82f6);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.link-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.link-content {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-weight: var(--font-weight-medium, 500);
  margin-bottom: 0.25rem;
}

.link-description {
  font-size: 0.875rem;
  color: var(--text-secondary, #cccccc);
}

/* ==================== FOOTER ==================== */
.dashboard-footer {
  background: var(--bg-secondary, #1e293b);
  border-top: 1px solid var(--border, #334155);
  padding: 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.footer-message {
  font-size: 0.875rem;
  color: var(--text-secondary, #cccccc);
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-theme-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #cccccc);
}

.footer-theme-switcher label {
  margin: 0;
}

.footer-theme-switcher select {
  background: var(--bg-tertiary, #334155);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border, #334155);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

/* ==================== UTILITY CLASSES ==================== */
.separator {
  color: var(--text-secondary, #cccccc);
  margin: 0 0.5rem;
}

.current-theme {
  color: var(--accent, #3b82f6);
  font-weight: var(--font-weight-medium, 500);
}

/* ==================== RESPONSIVE DESIGN ==================== */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 0.5rem;
  }
  
  .widgets-grid {
    gap: 0.5rem;
  }
  
  .widget-content {
    padding: 0.75rem;
  }
  
  .group-content {
    flex-direction: column;
  }
  
  .link-item {
    min-width: auto;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
  }
}
"""
    return css


def build_theme_css(theme_name: str, themes_dir: Path, dist_dir: Path) -> str:
    """Build complete CSS for a theme
    
    Args:
        theme_name: Name of the theme to build
        themes_dir: Path to themes directory
        dist_dir: Path to distribution directory
        
    Returns:
        str: Complete CSS content
    """
    # Load theme data
    theme_data = load_theme(theme_name, themes_dir)
    if not theme_data:
        return ""
    
    # Validate theme
    if not validate_theme(theme_data):
        print(f"   ❌ Theme {theme_name} validation failed")
        return ""
    
    # Start with base CSS
    css_content = ""
    
    # Load base CSS from template (prefer static file, fallback to generated)
    base_css_path = themes_dir.parent / "template" / "css" / "base.css"
    if base_css_path.exists():
        # Use the working static base.css file
        with open(base_css_path, 'r', encoding='utf-8') as f:
            css_content += f.read() + "\n\n"
        print(f"   ✓ Using static base.css")
    else:
        # Fallback to generated CSS from base-config.yaml
        base_config_path = themes_dir.parent / "base-config.yaml"
        if base_config_path.exists():
            try:
                base_config = load_yaml(base_config_path)
                css_content += generate_core_layout_css(base_config) + "\n\n"
                print(f"   ✓ Using generated base CSS from base-config.yaml")
            except Exception as e:
                print(f"   ⚠️  Warning: Could not load base-config.yaml: {e}")
        else:
            print(f"   ⚠️  Warning: No base.css or base-config.yaml found")
    
    # Load base effects CSS
    base_effects_path = themes_dir.parent / "template" / "css" / "base-effects.css"
    if base_effects_path.exists():
        with open(base_effects_path, 'r', encoding='utf-8') as f:
            css_content += f.read() + "\n\n"
    
    # Generate and prepend CSS variables (override base :root)
    theme_vars = generate_css_variables(theme_data)
    css_content = theme_vars + css_content
    
    # Add widget definition CSS to theme
    widget_css = generate_widget_definition_css(themes_dir.parent / "widgets")
    if widget_css:
        css_content += f"/* Widget Definition CSS */\n"
        css_content += widget_css + "\n\n"
    
    # Add custom CSS if present
    if 'custom-css' in theme_data:
        css_content += f"/* Custom CSS for {theme_name} */\n"
        css_content += theme_data['custom-css'] + "\n\n"
    
    return css_content


def build_all_themes(themes_dir: Path, dist_dir: Path) -> Dict[str, str]:
    """Build CSS for all available themes
    
    Args:
        themes_dir: Path to themes directory
        dist_dir: Path to distribution directory
        
    Returns:
        dict: Theme name to CSS content mapping
    """
    themes = {}
    available_themes = get_available_themes(themes_dir)
    
    print(f"🎨 Building {len(available_themes)} themes...")
    
    for theme_name in available_themes:
        print(f"   📝 Building theme: {theme_name}")
        css_content = build_theme_css(theme_name, themes_dir, dist_dir)
        if css_content:
            themes[theme_name] = css_content
            # Save the theme CSS to file
            save_theme_css(theme_name, css_content, dist_dir)
            print(f"   ✅ {theme_name} built successfully")
        else:
            print(f"   ❌ Failed to build {theme_name}")
    
    return themes





def generate_widget_definition_css(widgets_dir: Path) -> str:
    """Generate CSS from widget definitions (not instances)
    
    Args:
        widgets_dir: Path to widgets directory
        
    Returns:
        str: Combined widget definition CSS content
    """
    css_content = ""
    
    if not widgets_dir.exists():
        return css_content
    
    # Get all widget YAML files
    widget_files = list(widgets_dir.glob("*.yaml"))
    
    for widget_file in widget_files:
        try:
            widget_data = load_yaml(widget_file)
            widget_name = widget_file.stem
            
            # Extract CSS from widget definition
            if 'css' in widget_data:
                css_content += f"/* {widget_name} widget definition */\n"
                css_content += widget_data['css'] + "\n\n"
            elif 'widget-css' in widget_data:
                # Handle legacy widget-css format (remove style tags)
                widget_css = widget_data['widget-css']
                # Remove <style> tags if present
                if widget_css.strip().startswith('<style>'):
                    widget_css = widget_css.strip()[7:-8]  # Remove <style> and </style>
                css_content += f"/* {widget_name} widget definition */\n"
                css_content += widget_css + "\n\n"
                
        except Exception as e:
            print(f"   ⚠️  Warning: Could not load widget CSS from {widget_file.name}: {e}")
    
    return css_content


def save_theme_css(theme_name: str, css_content: str, dist_dir: Path) -> Path:
    """Save theme CSS to file
    
    Args:
        theme_name: Name of the theme
        css_content: CSS content to save
        dist_dir: Path to distribution directory
        
    Returns:
        Path: Path to saved CSS file
    """
    css_output_dir = dist_dir / "css"
    css_output_dir.mkdir(parents=True, exist_ok=True)
    
    css_file = css_output_dir / f"theme-{theme_name}.css"
    with open(css_file, 'w') as f:
        f.write(css_content)
    
    return css_file


def get_theme_info(theme_name: str, themes_dir: Path) -> Dict[str, Any]:
    """Get information about a theme
    
    Args:
        theme_name: Name of the theme
        themes_dir: Path to themes directory
        
    Returns:
        dict: Theme information
    """
    theme_data = load_theme(theme_name, themes_dir)
    if not theme_data:
        return {}
    
    return {
        'name': theme_data.get('name', theme_name),
        'description': theme_data.get('description', ''),
        'valid': validate_theme(theme_data),
        'structured': _is_structured_theme(theme_data)
    }


def list_themes_with_info(themes_dir: Path) -> List[Dict[str, Any]]:
    """List all themes with their information
    
    Args:
        themes_dir: Path to themes directory
        
    Returns:
        list: List of theme information dictionaries
    """
    themes_info = []
    available_themes = get_available_themes(themes_dir)
    
    for theme_name in available_themes:
        info = get_theme_info(theme_name, themes_dir)
        info['filename'] = theme_name
        themes_info.append(info)
    
    return themes_info


def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Theme Renderer for Slate Dashboard')
    parser.add_argument('--themes-dir', default='src/themes', help='Path to themes directory')
    parser.add_argument('--dist-dir', default='dist', help='Path to distribution directory')
    parser.add_argument('--theme', help='Build specific theme only')
    parser.add_argument('--list', action='store_true', help='List available themes')
    parser.add_argument('--info', help='Show info for specific theme')
    
    args = parser.parse_args()
    
    themes_dir = Path(args.themes_dir)
    dist_dir = Path(args.dist_dir)
    
    if args.list:
        themes_info = list_themes_with_info(themes_dir)
        print("Available themes:")
        for info in themes_info:
            status = "✅" if info['valid'] else "❌"
            print(f"  {status} {info['filename']}: {info['name']}")
            if info['description']:
                print(f"      {info['description']}")
        return
    
    if args.info:
        info = get_theme_info(args.info, themes_dir)
        if info:
            print(f"Theme: {info['name']}")
            print(f"Description: {info['description']}")
            print(f"Valid: {info['valid']}")
            print(f"Structured: {info['structured']}")
        else:
            print(f"Theme '{args.info}' not found")
        return
    
    if args.theme:
        # Build specific theme
        css_content = build_theme_css(args.theme, themes_dir, dist_dir)
        if css_content:
            css_file = save_theme_css(args.theme, css_content, dist_dir)
            print(f"✅ Theme '{args.theme}' built: {css_file}")
        else:
            print(f"❌ Failed to build theme '{args.theme}'")
    else:
        # Build all themes
        themes = build_all_themes(themes_dir, dist_dir)
        print(f"✅ Built {len(themes)} themes successfully")


if __name__ == '__main__':
    main()