#!/bin/bash
set -e

# Slate Dashboard - Local Validation Script
# Run all validation tests locally before committing

echo "🔍 Slate Dashboard Validation Suite"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "config/dashboard.yaml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📦 Setting up dependencies..."
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install pyyaml cssutils tinycss2 > /dev/null 2>&1

echo ""
echo "🔍 Running Dashboard Configuration Validation..."
echo "------------------------------------------------"
python src/scripts/test_dashboard.py

echo ""
echo "🧩 Running Widget Definition Validation..."
echo "------------------------------------------"
python src/scripts/test_widgets.py

echo ""
echo "🎨 Running Theme Definition Validation..."
echo "----------------------------------------"
python src/scripts/test_themes.py

echo ""
echo "🚀 Testing Build Process..."
echo "---------------------------"
python src/scripts/dashboard_renderer.py

echo ""
echo "✅ All validations completed successfully!"
echo ""
echo "💡 Tips:"
echo "   - Run this script before committing changes"
echo "   - Use 'git add . && git commit -m \"your message\"' to commit"
echo "   - CI/CD will run these same tests on your PR"