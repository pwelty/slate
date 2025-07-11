#!/usr/bin/env python3
"""
Build CSS files for all themes without overwriting the main build
"""

import os
import sys
import yaml
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
THEMES_DIR = PROJECT_ROOT / "src" / "themes"
DIST_DIR = PROJECT_ROOT / "dist"

def load_yaml(file_path):
    """Load a YAML file"""
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

def build_theme_css(theme_name):
    """Build theme CSS from theme configuration"""
    print(f"🎨 Building {theme_name} theme CSS...")
    
    theme_file = THEMES_DIR / f"{theme_name}.yaml"
    if not theme_file.exists():
        print(f"   ⚠️  Theme file not found: {theme_file}")
        return False
    
    theme_config = load_yaml(theme_file)
    
    # Build CSS variables
    css_content = f"/* {theme_name.title()} Theme CSS */\n"
    css_content += ":root {\n"
    
    # Skip metadata keys
    skip_keys = {'name', 'description', 'special-effects'}
    
    # Add all theme variables
    for key, value in theme_config.items():
        if key not in skip_keys:
            css_var = key.replace('_', '-')
            css_content += f"  --{css_var}: {value};\n"
    
    css_content += "}\n\n"
    
    # Add special effects if available
    special_effects = theme_config.get('special-effects')
    if special_effects and isinstance(special_effects, dict):
        css_content += "/* Special Effects */\n"
        
        # Add effect-specific CSS based on enabled flags
        if special_effects.get('blue-glow'):
            css_content += """
/* Blue glow effects */
.widget:hover, .widget-group:hover {
    box-shadow: var(--shadow), 0 0 20px rgba(122, 162, 247, 0.2);
}

.accent-glow {
    box-shadow: 0 0 15px rgba(122, 162, 247, 0.4);
}
"""
        
        if special_effects.get('depth-shadows'):
            css_content += """
/* Deep shadow effects */
.widget, .widget-group {
    box-shadow: var(--shadow);
}

.elevated {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(122, 162, 247, 0.15);
}
"""
        
        if special_effects.get('gradient-backgrounds'):
            css_content += """
/* Gradient background enhancements */
.dashboard-header {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.widget-content {
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(10px);
}
"""
    
    # Ensure dist/css directory exists
    css_dir = DIST_DIR / "css"
    css_dir.mkdir(parents=True, exist_ok=True)
    
    # Write theme CSS to dist
    theme_css_file = css_dir / f"theme-{theme_name}.css"
    with open(theme_css_file, 'w') as f:
        f.write(css_content)
    
    print(f"   ✓ Theme CSS built: {theme_css_file}")
    return True

def main():
    """Build all theme CSS files"""
    print("Building theme CSS files...")
    
    # Get all theme files
    theme_files = list(THEMES_DIR.glob("*.yaml"))
    theme_names = [f.stem for f in theme_files]
    
    print(f"Found themes: {', '.join(theme_names)}")
    
    success_count = 0
    for theme_name in theme_names:
        if build_theme_css(theme_name):
            success_count += 1
    
    print(f"\n✅ Built {success_count}/{len(theme_names)} theme CSS files")

if __name__ == "__main__":
    main()