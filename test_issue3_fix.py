#!/usr/bin/env python3
"""
Test script to demonstrate Issue #3 fix: Atomic builds prevent template variable exposure

This script demonstrates that:
1. Legacy builds expose template variables during build process
2. Atomic builds prevent template variable exposure completely
"""

import os
import time
import subprocess
import requests
from pathlib import Path

def check_for_template_variables(html_content):
    """Check if HTML content contains unprocessed Jinja2 template variables"""
    template_patterns = [
        '{{ title }}',
        '{{ theme_name }}', 
        '{{ widgets_content }}',
        '{{ theme_css }}',
        '{{ build_timestamp }}',
        '{{ footer_message }}'
    ]
    
    found_variables = []
    for pattern in template_patterns:
        if pattern in html_content:
            found_variables.append(pattern)
    
    return found_variables

def test_build_mode(mode_name, build_command, server_url="http://localhost:8080"):
    """Test a build mode for template variable exposure"""
    print(f"\n🧪 Testing {mode_name}...")
    print(f"   Command: {' '.join(build_command)}")
    
    # Start build process
    build_process = subprocess.Popen(build_command, cwd="/Users/paul/Projects/slate")
    
    # Give build a moment to start
    time.sleep(0.5)
    
    # Check for template variables during build
    template_vars_found = []
    check_attempts = 0
    max_attempts = 5
    
    while build_process.poll() is None and check_attempts < max_attempts:
        try:
            response = requests.get(server_url, timeout=2)
            if response.status_code == 200:
                vars_found = check_for_template_variables(response.text)
                if vars_found:
                    template_vars_found.extend(vars_found)
                    print(f"   ⚠️  Template variables exposed: {vars_found}")
        except requests.RequestException:
            pass  # Server might not be ready yet
        
        time.sleep(0.2)
        check_attempts += 1
    
    # Wait for build to complete
    build_process.wait()
    
    if template_vars_found:
        print(f"   ❌ {mode_name}: Template variables were exposed during build!")
        print(f"      Found: {set(template_vars_found)}")
        return False
    else:
        print(f"   ✅ {mode_name}: No template variables exposed during build")
        return True

def main():
    print("🔍 Issue #3 Fix Verification: Atomic Builds Prevent Template Variable Exposure")
    print("=" * 80)
    
    # Check if we're in the right directory
    if not Path("src/scripts/dashboard_renderer.py").exists():
        print("❌ Error: Please run this script from the Slate project root directory")
        return
    
    print("\nℹ️  This test requires a web server to be running on http://localhost:8080")
    print("   Start server with: python serve.py")
    
    input("\nPress Enter when server is ready...")
    
    # Test legacy build mode (should expose template variables)
    legacy_success = test_build_mode(
        "Legacy Build Mode",
        ["python", "src/scripts/dashboard_renderer.py", "--skip-validation", "--legacy-build"]
    )
    
    # Small delay between tests
    time.sleep(1)
    
    # Test atomic build mode (should NOT expose template variables)
    atomic_success = test_build_mode(
        "Atomic Build Mode", 
        ["python", "src/scripts/dashboard_renderer.py", "--skip-validation"]
    )
    
    print("\n" + "=" * 80)
    print("📊 Test Results:")
    
    if not legacy_success and atomic_success:
        print("✅ PASS: Fix verified! Atomic builds prevent template variable exposure")
        print("   - Legacy mode: Template variables exposed (expected)")
        print("   - Atomic mode: No template variables exposed (fix working)")
    elif legacy_success and atomic_success:
        print("⚠️  INCONCLUSIVE: Neither mode showed template variables")
        print("   This might mean the build is too fast to catch, or server isn't responding")
    elif not legacy_success and not atomic_success:
        print("❌ FAIL: Both modes exposed template variables")
        print("   Atomic build fix may not be working correctly")
    else:
        print("🤔 UNEXPECTED: Legacy mode didn't expose variables but atomic mode did")
        print("   This suggests an issue with the test setup")

if __name__ == "__main__":
    main()