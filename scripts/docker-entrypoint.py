#!/usr/bin/env python3
"""
Docker entrypoint that runs both auto-rebuild and server
"""

import subprocess
import sys
import os
import signal
import time
from pathlib import Path

def signal_handler(signum, frame):
    """Handle shutdown gracefully"""
    print("\n🛑 Shutting down...")
    sys.exit(0)

def main():
    # Set up signal handlers
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # Get theme from environment variable
    theme = os.environ.get('THEME', 'dark')
    port = int(os.environ.get('PORT', 5173))
    
    print(f"🚀 Starting Slate Dashboard")
    print(f"   Theme: {theme}")
    print(f"   Port: {port}")
    
    # Start auto-rebuild in background
    print("\n📦 Starting auto-rebuild process...")
    rebuild_process = subprocess.Popen([
        sys.executable, 
        "scripts/auto-rebuild.py", 
        "--theme", theme
    ])
    
    # Give it time to do initial build
    time.sleep(3)
    
    # Start server
    print("\n🌐 Starting server...")
    server_process = subprocess.Popen([
        sys.executable,
        "src/scripts/serve.py",
        "--port", str(port)
    ])
    
    try:
        # Wait for either process to exit
        while True:
            rebuild_status = rebuild_process.poll()
            server_status = server_process.poll()
            
            if rebuild_status is not None:
                print(f"⚠️  Auto-rebuild process exited with code {rebuild_status}")
                server_process.terminate()
                sys.exit(rebuild_status)
                
            if server_status is not None:
                print(f"⚠️  Server process exited with code {server_status}")
                rebuild_process.terminate()
                sys.exit(server_status)
                
            time.sleep(1)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        rebuild_process.terminate()
        server_process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    main()