#!/bin/bash
# Auto-rebuild Dashboard (Shell Script)
# Uses macOS fswatch to rebuild dashboard when config files change

set -e

# Configuration
THEME="${1:-dark}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WATCH_PATHS=(
    "$PROJECT_ROOT/config"
    "$PROJECT_ROOT/src/widgets"
    "$PROJECT_ROOT/src/themes"
    "$PROJECT_ROOT/src/template"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if fswatch is available
if ! command -v fswatch &> /dev/null; then
    echo -e "${RED}❌ fswatch not found${NC}"
    echo "Install with: brew install fswatch"
    exit 1
fi

# Function to rebuild dashboard
rebuild_dashboard() {
    local changed_file="$1"
    local rel_path="${changed_file#$PROJECT_ROOT/}"
    
    echo -e "\n${BLUE}🔄 Change detected: ${rel_path}${NC}"
    echo -e "${YELLOW}⚡ Rebuilding dashboard with ${THEME} theme...${NC}"
    
    if python3 "$PROJECT_ROOT/src/scripts/dashboard_renderer.py" --theme "$THEME"; then
        echo -e "${GREEN}✅ Dashboard rebuilt successfully!${NC}"
        echo -e "   View at: http://localhost:5173"
    else
        echo -e "${RED}❌ Dashboard rebuild failed${NC}"
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping file watcher...${NC}"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🔍 Watching for changes to rebuild dashboard with ${THEME} theme...${NC}"
echo -e "${BLUE}📁 Watching paths:${NC}"
for path in "${WATCH_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "   👀 $(basename "$path")"
    else
        echo -e "   ${YELLOW}⚠️  Path not found: $(basename "$path")${NC}"
    fi
done
echo -e "${BLUE}🔄 Press Ctrl+C to stop${NC}"

# Initial build
echo -e "\n${YELLOW}⚡ Initial build...${NC}"
rebuild_dashboard "initial build"

# Watch for changes
fswatch -r "${WATCH_PATHS[@]}" | while read -r changed_file; do
    # Filter out irrelevant files
    case "$changed_file" in
        *.yaml|*.yml|*.html|*.css|*.js|*.py)
            # Debounce rapid changes (wait a bit for more changes)
            sleep 0.5
            rebuild_dashboard "$changed_file"
            ;;
        *)
            # Ignore other files
            ;;
    esac
done 