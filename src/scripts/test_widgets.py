#!/usr/bin/env python3
"""
Widget Definition Validator
===========================

Tests all widget YAML files for:
- Valid YAML syntax
- Required metadata fields
- Schema compliance
- Template syntax validation
- CSS syntax checking
- Inheritance chains

Usage: python src/scripts/test_widgets.py
"""

import os
import sys
import yaml
import re
from pathlib import Path
from typing import Dict, List, Set

PROJECT_ROOT = Path(__file__).parent.parent.parent

class WidgetTester:
    def __init__(self):
        self.widgets_dir = PROJECT_ROOT / "src" / "widgets"
        self.errors = []
        self.warnings = []
        self.widget_files = list(self.widgets_dir.glob("*.yaml"))
    
    def error(self, widget: str, message: str):
        self.errors.append(f"❌ {widget}: {message}")
    
    def warning(self, widget: str, message: str):
        self.warnings.append(f"⚠️  {widget}: {message}")
    
    def success(self, widget: str, message: str):
        print(f"✅ {widget}: {message}")
    
    def load_widget(self, widget_file: Path) -> Dict:
        """Load and validate widget YAML syntax"""
        try:
            with open(widget_file, 'r', encoding='utf-8') as f:
                widget = yaml.safe_load(f)
            self.success(widget_file.stem, "Valid YAML syntax")
            return widget
        except yaml.YAMLError as e:
            self.error(widget_file.stem, f"Invalid YAML syntax: {e}")
            return {}
    
    def test_widget_metadata(self, widget: Dict, widget_name: str):
        """Test widget metadata section"""
        if "metadata" not in widget:
            self.warning(widget_name, "Missing metadata section")
            return
        
        metadata = widget["metadata"]
        required_fields = ["type", "description"]
        
        for field in required_fields:
            if field in metadata:
                self.success(widget_name, f"Has metadata.{field}: {metadata[field]}")
            else:
                self.warning(widget_name, f"Missing metadata.{field}")
        
        # Check optional but recommended fields
        recommended = ["version", "author"]
        for field in recommended:
            if field in metadata:
                self.success(widget_name, f"Has metadata.{field}: {metadata[field]}")
    
    def test_widget_inheritance(self, widget: Dict, widget_name: str):
        """Test widget inheritance chain"""
        if "extends" not in widget:
            self.success(widget_name, "Standalone widget (no inheritance)")
            return
        
        extends = widget["extends"]
        if extends == "widget":
            self.success(widget_name, "Extends base widget")
        else:
            # Check if parent widget exists
            parent_file = self.widgets_dir / f"{extends}.yaml"
            if parent_file.exists():
                self.success(widget_name, f"Valid inheritance from '{extends}'")
            else:
                self.error(widget_name, f"Parent widget '{extends}' not found")
    
    def test_widget_schema(self, widget: Dict, widget_name: str):
        """Test widget schema definition"""
        if "schema" not in widget:
            self.warning(widget_name, "No schema defined (not configurable)")
            return
        
        schema = widget["schema"]
        if not isinstance(schema, dict):
            self.error(widget_name, "Schema must be an object")
            return
        
        for field_name, field_def in schema.items():
            if not isinstance(field_def, dict):
                self.error(widget_name, f"Schema field '{field_name}' must be an object")
                continue
            
            # Check required properties
            if "type" in field_def:
                field_type = field_def["type"]
                if field_type in ["string", "number", "boolean", "array", "object"]:
                    self.success(widget_name, f"Schema.{field_name}: Valid type '{field_type}'")
                else:
                    self.warning(widget_name, f"Schema.{field_name}: Unknown type '{field_type}'")
            else:
                self.error(widget_name, f"Schema.{field_name}: Missing 'type' field")
            
            # Check for description
            if "description" in field_def:
                self.success(widget_name, f"Schema.{field_name}: Has description")
            else:
                self.warning(widget_name, f"Schema.{field_name}: Missing description")
    
    def test_widget_template(self, widget: Dict, widget_name: str):
        """Test widget template syntax"""
        if "widget-body" not in widget:
            self.warning(widget_name, "No widget-body template defined")
            return
        
        template = widget["widget-body"]
        
        # Basic Jinja2 syntax validation
        try:
            # Try to import Jinja2 for validation
            from jinja2 import Template, TemplateSyntaxError
            Template(template)
            self.success(widget_name, "Valid Jinja2 template syntax")
        except ImportError:
            # Fallback to basic validation
            self.validate_template_basic(template, widget_name)
        except TemplateSyntaxError as e:
            self.error(widget_name, f"Template syntax error: {e}")
    
    def validate_template_basic(self, template: str, widget_name: str):
        """Basic template validation without Jinja2"""
        # Check balanced braces
        open_braces = template.count('{{')
        close_braces = template.count('}}')
        if open_braces != close_braces:
            self.error(widget_name, f"Template: Unbalanced {{ }} braces ({open_braces} open, {close_braces} close)")
        
        open_blocks = template.count('{%')
        close_blocks = template.count('%}')
        if open_blocks != close_blocks:
            self.error(widget_name, f"Template: Unbalanced {{% %}} blocks ({open_blocks} open, {close_blocks} close)")
        
        # Check for common template variables
        if '{{' in template:
            self.success(widget_name, "Template uses variables")
        else:
            self.warning(widget_name, "Template has no variables (static content)")
    
    def test_widget_css(self, widget: Dict, widget_name: str):
        """Test widget CSS syntax"""
        if "css" not in widget:
            self.warning(widget_name, "No CSS defined")
            return
        
        css = widget["css"]
        
        # Basic CSS validation
        open_braces = css.count('{')
        close_braces = css.count('}')
        if open_braces != close_braces:
            self.error(widget_name, f"CSS: Mismatched braces ({open_braces} open, {close_braces} close)")
        else:
            self.success(widget_name, "CSS syntax appears valid")
        
        # Check for CSS variables usage
        if 'var(' in css:
            self.success(widget_name, "CSS uses theme variables")
        else:
            self.warning(widget_name, "CSS doesn't use theme variables (may not theme properly)")
        
        # Check for common issues
        if ';;' in css:
            self.warning(widget_name, "CSS: Double semicolons found")
        
        if css.count('!important') > 3:
            self.warning(widget_name, f"CSS: Many !important declarations ({css.count('!important')})")
    
    def test_widget_capabilities(self, widget: Dict, widget_name: str):
        """Test widget capabilities section"""
        if "capabilities" not in widget:
            self.warning(widget_name, "No capabilities defined")
            return
        
        capabilities = widget["capabilities"]
        known_capabilities = [
            "realTimeUpdates", "userInteraction", "apiIntegration", 
            "caching", "responsive", "configurable"
        ]
        
        for cap_name, cap_value in capabilities.items():
            if cap_name in known_capabilities:
                if isinstance(cap_value, bool):
                    self.success(widget_name, f"Capability {cap_name}: {cap_value}")
                else:
                    self.warning(widget_name, f"Capability {cap_name} should be boolean, got {type(cap_value)}")
            else:
                self.warning(widget_name, f"Unknown capability: {cap_name}")
    
    def test_single_widget(self, widget_file: Path):
        """Test a single widget file"""
        widget_name = widget_file.stem
        widget = self.load_widget(widget_file)
        
        if not widget:
            return
        
        self.test_widget_metadata(widget, widget_name)
        self.test_widget_inheritance(widget, widget_name)
        self.test_widget_schema(widget, widget_name)
        self.test_widget_template(widget, widget_name)
        self.test_widget_css(widget, widget_name)
        self.test_widget_capabilities(widget, widget_name)
    
    def test_widget_name_consistency(self):
        """Test that widget file names match their metadata types"""
        for widget_file in self.widget_files:
            widget = self.load_widget(widget_file)
            if not widget or "metadata" not in widget:
                continue
            
            file_name = widget_file.stem
            metadata_type = widget["metadata"].get("type", "")
            
            if metadata_type and metadata_type != file_name:
                self.warning(file_name, f"File name '{file_name}' doesn't match metadata type '{metadata_type}'")
            else:
                self.success(file_name, f"File name matches metadata type")
    
    def run_tests(self):
        """Run all widget tests"""
        print("🧩 Testing Widget Definitions\n")
        
        if not self.widget_files:
            self.error("SYSTEM", "No widget files found in src/widgets/")
            return False
        
        print(f"Found {len(self.widget_files)} widget files to test\n")
        
        # Test each widget individually
        for widget_file in self.widget_files:
            print(f"\n--- Testing {widget_file.stem} ---")
            self.test_single_widget(widget_file)
        
        print(f"\n--- Cross-Widget Tests ---")
        self.test_widget_name_consistency()
        
        return self.report_results()
    
    def report_results(self):
        """Report test results"""
        print(f"\n📊 Widget Test Results:")
        print(f"   📁 Files tested: {len(self.widget_files)}")
        print(f"   ❌ Errors: {len(self.errors)}")
        print(f"   ⚠️  Warnings: {len(self.warnings)}")
        
        if self.errors:
            print(f"\n❌ ERRORS:")
            for error in self.errors:
                print(f"   {error}")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"   {warning}")
        
        success = len(self.errors) == 0
        if success:
            print(f"\n✅ All widget definitions are valid!")
        else:
            print(f"\n❌ Widget validation failed with {len(self.errors)} errors")
        
        return success

if __name__ == "__main__":
    tester = WidgetTester()
    success = tester.run_tests()
    sys.exit(0 if success else 1)