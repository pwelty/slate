#!/usr/bin/env python3
"""
Build all theme CSS files for the Slate dashboard
"""

import os
import sys
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
THEMES_DIR = PROJECT_ROOT / "src" / "themes"

def build_theme(theme_name):
    """Build a single theme CSS file"""
    print(f"Building theme: {theme_name}")
    try:
        # Run the dashboard renderer to build the theme CSS
        result = subprocess.run([
            sys.executable, 
            "src/scripts/dashboard_renderer.py", 
            "--theme", theme_name
        ], cwd=PROJECT_ROOT, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Error building {theme_name}: {result.stderr}")
            return False
        
        print(f"✓ {theme_name} theme built successfully")
        return True
        
    except Exception as e:
        print(f"Error building {theme_name}: {e}")
        return False

def main():
    """Build all available themes"""
    print("Building all theme CSS files...")
    
    # Get all theme files
    theme_files = list(THEMES_DIR.glob("*.yaml"))
    theme_names = [f.stem for f in theme_files]
    
    print(f"Found themes: {', '.join(theme_names)}")
    
    success_count = 0
    for theme_name in theme_names:
        if build_theme(theme_name):
            success_count += 1
    
    print(f"\nBuilt {success_count}/{len(theme_names)} themes successfully")
    
    # Build the dark theme last to set it as default
    print("\nSetting dark theme as default...")
    build_theme("dark")

if __name__ == "__main__":
    main()