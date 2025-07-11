#!/usr/bin/env python3
"""
Setup script for auto-rebuild functionality
Installs required dependencies
"""

import sys
import subprocess

def install_watchdog():
    """Install the watchdog package for file watching"""
    print("📦 Installing watchdog for file watching...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "watchdog"])
        print("✅ watchdog installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install watchdog")
        return False

def test_watchdog():
    """Test if watchdog is available"""
    try:
        import watchdog
        print("✅ watchdog is available")
        return True
    except ImportError:
        print("❌ watchdog not found")
        return False

def main():
    print("🔧 Setting up auto-rebuild functionality...")
    
    if test_watchdog():
        print("🎉 Auto-rebuild is ready to use!")
        print("   Run: python3 scripts/auto-rebuild.py")
        return
    
    print("📦 watchdog package not found. Installing...")
    if install_watchdog():
        print("🎉 Auto-rebuild setup complete!")
        print("   Run: python3 scripts/auto-rebuild.py")
    else:
        print("❌ Setup failed. Try installing manually:")
        print("   pip install watchdog")

if __name__ == "__main__":
    main() 