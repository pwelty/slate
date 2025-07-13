#!/usr/bin/env python3
"""
Build all theme CSS files without overwriting main HTML
"""

import os
import sys
import yaml
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))

PROJECT_ROOT = Path(__file__).parent.parent
THEMES_DIR = PROJECT_ROOT / "src" / "themes"
DIST_DIR = PROJECT_ROOT / "dist"

def load_yaml(file_path):
    """Load a YAML file"""
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

def build_theme_css(theme_name):
    """Build theme CSS from theme configuration"""
    print(f"🎨 Building {theme_name} theme CSS...")
    
    # Load dashboard config
    config = load_yaml(PROJECT_ROOT / "config" / "dashboard.yaml")
    
    # Get theme configuration
    theme_config = config.get("themes", {}).get(theme_name, {})
    
    if not theme_config:
        print(f"❌ Theme '{theme_name}' not found in config")
        return
    
    # Generate CSS variables
    css_vars = []
    for key, value in theme_config.items():
        css_var = f"  --{key.replace('_', '-')}: {value};"
        css_vars.append(css_var)
    
    # Create theme CSS content
    theme_css = f"""/* {theme_name.title()} Theme CSS */
:root {{
{chr(10).join(css_vars)}
}}

"""
    
    # Write theme CSS file
    theme_file = DIST_DIR / "css" / f"theme-{theme_name}.css"
    theme_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(theme_file, 'w') as f:
        f.write(theme_css)
    
    print(f"   ✓ Theme CSS built: {theme_file}")

def run_validations():
    """Run validation suite before building themes"""
    print("🔍 Running validation suite...")
    
    validation_scripts = [
        ("Theme Definitions", PROJECT_ROOT / "src/scripts/test_themes.py"),
        ("Dashboard Configuration", PROJECT_ROOT / "src/scripts/test_dashboard.py")
    ]
    
    for name, script_path in validation_scripts:
        if not script_path.exists():
            print(f"⚠️  Warning: {name} validation script not found")
            continue
            
        print(f"   Validating {name}...")
        try:
            result = os.system(f"cd {PROJECT_ROOT} && python {script_path}")
            if result != 0:
                raise Exception(f"{name} validation failed")
            print(f"   ✅ {name} validation passed")
        except Exception as e:
            raise Exception(f"Validation failed: {e}")
    
    print("✅ All validations passed!")

def main():
    """Build all themes"""
    print("🚀 Building all theme CSS files...")
    
    # Run validations first
    run_validations()
    
    # Load dashboard config
    config = load_yaml(PROJECT_ROOT / "config" / "dashboard.yaml")
    themes = config.get("themes", {})
    
    for theme_name in themes.keys():
        build_theme_css(theme_name)
    
    print("✅ All themes built successfully!")

if __name__ == "__main__":
    main()