#!/usr/bin/env python3
"""
Auto-rebuild Dashboard
Watches for changes to configuration files and automatically rebuilds the dashboard
"""

import os
import sys
import time
import subprocess
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

class DashboardRebuildHandler(FileSystemEventHandler):
    def __init__(self, theme='dark'):
        self.theme = theme
        self.last_rebuild = 0
        self.debounce_seconds = 1  # Prevent rapid rebuilds
        
    def should_rebuild(self, event):
        """Check if this event should trigger a rebuild"""
        if event.is_directory:
            return False
            
        # Get the file path relative to project root
        try:
            rel_path = Path(event.src_path).relative_to(PROJECT_ROOT)
        except ValueError:
            return False
            
        # Watch these files/directories for changes
        watch_patterns = [
            'config/dashboard.yaml',           # Main dashboard config
            'config/widgets.yaml',             # Widget configuration  
            'src/widgets/',                    # Widget definitions
            'src/themes/',                     # Theme definitions
            'src/template/',                   # Template files
        ]
        
        # Check if the changed file matches any watch pattern
        for pattern in watch_patterns:
            if str(rel_path).startswith(pattern):
                return True
                
        return False
    
    def on_modified(self, event):
        if not self.should_rebuild(event):
            return
            
        # Debounce rapid changes
        now = time.time()
        if now - self.last_rebuild < self.debounce_seconds:
            return
            
        self.last_rebuild = now
        self.rebuild_dashboard(event.src_path)
    
    def rebuild_dashboard(self, changed_file):
        """Rebuild the dashboard"""
        if changed_file != "initial build":
            rel_path = Path(changed_file).relative_to(PROJECT_ROOT)
            print(f"\n🔄 Change detected: {rel_path}")
        else:
            print(f"\n🔄 Initial build requested")
        print(f"⚡ Rebuilding dashboard with {self.theme} theme...")
        
        try:
            # Run the dashboard renderer
            result = subprocess.run([
                sys.executable, 
                str(PROJECT_ROOT / "src/scripts/dashboard_renderer.py"),
                "--theme", self.theme,
                "--skip-validation"
            ], capture_output=True, text=True, cwd=PROJECT_ROOT)
            
            if result.returncode == 0:
                print("✅ Dashboard rebuilt successfully!")
                print(f"   View at: http://localhost:5173")
            else:
                print("❌ Dashboard rebuild failed:")
                print(result.stderr)
                
        except Exception as e:
            print(f"❌ Error rebuilding dashboard: {e}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Auto-rebuild dashboard on file changes')
    parser.add_argument('--theme', default='dark', help='Theme to use for dashboard')
    parser.add_argument('--paths', nargs='+', default=['config', 'src/widgets', 'src/themes', 'src/template'], 
                       help='Paths to watch for changes')
    args = parser.parse_args()
    
    print(f"🔍 Watching for changes to rebuild dashboard with {args.theme} theme...")
    print(f"📁 Watching paths: {', '.join(args.paths)}")
    print("🔄 Press Ctrl+C to stop")
    
    # Initial build
    handler = DashboardRebuildHandler(theme=args.theme)
    handler.rebuild_dashboard("initial build")
    
    # Set up file watcher
    observer = Observer()
    
    for watch_path in args.paths:
        full_path = PROJECT_ROOT / watch_path
        if full_path.exists():
            observer.schedule(handler, str(full_path), recursive=True)
            print(f"   👀 Watching: {watch_path}")
        else:
            print(f"   ⚠️  Path not found: {watch_path}")
    
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping file watcher...")
        observer.stop()
    
    observer.join()
    print("✅ File watcher stopped")

if __name__ == "__main__":
    main() 