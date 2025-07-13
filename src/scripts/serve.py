#!/usr/bin/env python3
"""
Slate Dashboard Server
Development server with auto-reload for serving the built dashboard
"""

import os
import http.server
import socketserver
import webbrowser
import threading
import time
from pathlib import Path

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False

def serve_dashboard(port=5173):
    """Serve the dashboard using Python's built-in HTTP server"""
    
    # Get dist directory path but don't change to it yet
    project_root = Path(__file__).parent.parent.parent
    dist_dir = project_root / "dist"
    if not dist_dir.exists():
        print("❌ dist/ directory not found. Run the build script first:")
        print("   python3 src/scripts/dashboard_renderer.py")
        return
    
    # Create server with better CORS headers and error handling
    class RobustHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            # Set the directory to serve from
            super().__init__(*args, directory=str(dist_dir), **kwargs)
            
        def end_headers(self):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            super().end_headers()
        
        def log_message(self, format, *args):
            # Suppress routine GET request logs
            if not (args[1] == '200' and 'GET' in args[0]):
                super().log_message(format, *args)
                
        def do_GET(self):
            try:
                # Check if dist directory still exists
                if not dist_dir.exists():
                    self.send_error(503, "Build directory not found - rebuild in progress")
                    return
                super().do_GET()
            except (FileNotFoundError, OSError, PermissionError) as e:
                # Handle file system errors gracefully during rebuilds
                self.send_error(503, f"Temporary file system error: {str(e)}")
            except Exception as e:
                # Handle any other errors
                self.send_error(500, f"Server error: {str(e)}")
                
        def handle_error(self):
            # Better error handling - don't crash on broken connections
            pass
    
    try:
        with socketserver.TCPServer(("", port), RobustHandler) as httpd:
            print(f"🌐 Serving Slate Dashboard at http://localhost:{port}")
            print(f"   📁 Serving from: {dist_dir}")
            print(f"   🔄 Press Ctrl+C to stop")
            
            # Open browser in a separate thread to avoid blocking
            def open_browser():
                import time
                time.sleep(1)  # Give server time to start
                webbrowser.open(f"http://localhost:{port}")
            
            threading.Thread(target=open_browser, daemon=True).start()
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use")
            print(f"   Try: python3 serve.py --port {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Serve Slate Dashboard')
    parser.add_argument('--port', type=int, default=5173, help='Port to serve on (default: 5173)')
    
    args = parser.parse_args()
    serve_dashboard(args.port)