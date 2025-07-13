#!/usr/bin/env python3
"""
Dashboard Configuration Validator
=================================

Tests dashboard.yaml for:
- Valid YAML syntax
- Required sections and fields
- Component references
- Grid positioning conflicts
- Theme references

Usage: python src/scripts/test_dashboard.py
"""

import os
import sys
import yaml
from pathlib import Path
from typing import Dict, List

PROJECT_ROOT = Path(__file__).parent.parent.parent

class DashboardTester:
    def __init__(self):
        self.config_dir = PROJECT_ROOT / "config"
        self.widgets_dir = PROJECT_ROOT / "src" / "widgets"
        self.themes_dir = PROJECT_ROOT / "src" / "themes"
        self.errors = []
        self.warnings = []
    
    def error(self, message: str):
        self.errors.append(f"❌ {message}")
    
    def warning(self, message: str):
        self.warnings.append(f"⚠️  {message}")
    
    def success(self, message: str):
        print(f"✅ {message}")
    
    def load_dashboard_config(self) -> Dict:
        """Load and validate dashboard.yaml syntax"""
        dashboard_file = self.config_dir / "dashboard.yaml"
        
        if not dashboard_file.exists():
            self.error(f"Dashboard config not found: {dashboard_file}")
            return {}
        
        try:
            with open(dashboard_file, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            self.success("Dashboard YAML syntax is valid")
            return config
        except yaml.YAMLError as e:
            self.error(f"Invalid YAML syntax in dashboard.yaml: {e}")
            return {}
    
    def test_required_sections(self, config: Dict):
        """Test for required top-level sections"""
        required = ["dashboard", "components"]
        
        for section in required:
            if section in config:
                self.success(f"Required section '{section}' present")
            else:
                self.error(f"Missing required section: {section}")
    
    def test_dashboard_metadata(self, config: Dict):
        """Test dashboard metadata fields"""
        if "dashboard" not in config:
            return
        
        dashboard = config["dashboard"]
        required_fields = ["title", "theme"]
        
        for field in required_fields:
            if field in dashboard:
                self.success(f"Dashboard has required field '{field}': {dashboard[field]}")
            else:
                self.error(f"Missing required dashboard field: {field}")
        
        # Test theme exists
        if "theme" in dashboard:
            theme_name = dashboard["theme"]
            theme_file = self.themes_dir / f"{theme_name}.yaml"
            if theme_file.exists():
                self.success(f"Theme '{theme_name}' file exists")
            else:
                self.error(f"Theme file not found: {theme_file}")
    
    def test_components(self, config: Dict):
        """Test component definitions"""
        if "components" not in config:
            return
        
        components = config["components"]
        component_ids = set()
        
        for i, component in enumerate(components):
            comp_ref = f"Component[{i}]"
            
            # Test required fields
            if "type" not in component:
                self.error(f"{comp_ref}: Missing 'type' field")
                continue
            
            comp_type = component["type"]
            self.success(f"{comp_ref}: Type '{comp_type}' specified")
            
            # Test ID uniqueness
            if "id" in component:
                comp_id = component["id"]
                if comp_id in component_ids:
                    self.error(f"{comp_ref}: Duplicate ID '{comp_id}'")
                else:
                    component_ids.add(comp_id)
                    self.success(f"{comp_ref}: Unique ID '{comp_id}'")
            else:
                self.warning(f"{comp_ref}: Missing ID field")
            
            # Test widget references and validate instance configuration
            if comp_type == "widget" and "widget" in component:
                widget_name = component["widget"]
                widget_file = self.widgets_dir / f"{widget_name}.yaml"
                if widget_file.exists():
                    self.success(f"{comp_ref}: Widget '{widget_name}' exists")
                    # Validate widget instance configuration against schema
                    self.test_widget_instance_config(component, widget_name, comp_ref)
                else:
                    self.error(f"{comp_ref}: Widget '{widget_name}' not found")
            
            # Test positioning
            if "position" in component:
                self.test_component_position(component["position"], comp_ref)
    
    def test_component_position(self, position: Dict, comp_ref: str):
        """Test component positioning"""
        required_fields = ["row", "column", "width", "height"]
        
        for field in required_fields:
            if field in position:
                value = position[field]
                if isinstance(value, int) and value > 0:
                    self.success(f"{comp_ref}: Valid {field}={value}")
                else:
                    self.error(f"{comp_ref}: Invalid {field}={value} (must be positive integer)")
            else:
                self.warning(f"{comp_ref}: Missing position.{field}")
        
        # Test reasonable grid values
        if "width" in position and position["width"] > 12:
            self.warning(f"{comp_ref}: Width {position['width']} exceeds typical grid (12)")
        
        if "column" in position and position["column"] > 12:
            self.warning(f"{comp_ref}: Column {position['column']} exceeds typical grid (12)")
    
    def test_grid_conflicts(self, config: Dict):
        """Test for grid positioning conflicts"""
        if "components" not in config:
            return
        
        # Build grid map to detect overlaps
        grid_map = {}
        
        for i, component in enumerate(config["components"]):
            if "position" not in component:
                continue
            
            pos = component["position"]
            if not all(field in pos for field in ["row", "column", "width", "height"]):
                continue
            
            row, col, width, height = pos["row"], pos["column"], pos["width"], pos["height"]
            
            # Check each cell this component occupies
            for r in range(row, row + height):
                for c in range(col, col + width):
                    cell = (r, c)
                    if cell in grid_map:
                        other_comp = grid_map[cell]
                        self.error(f"Grid conflict: Component[{i}] overlaps with Component[{other_comp}] at ({r},{c})")
                    else:
                        grid_map[cell] = i
        
        if not self.errors:
            self.success("No grid positioning conflicts detected")
    
    def load_widget_schema(self, widget_name: str) -> Dict:
        """Load widget definition and return its schema"""
        widget_file = self.widgets_dir / f"{widget_name}.yaml"
        if not widget_file.exists():
            return {}
        
        try:
            with open(widget_file, 'r', encoding='utf-8') as f:
                widget_def = yaml.safe_load(f)
            return widget_def.get("schema", {})
        except yaml.YAMLError:
            return {}
    
    def test_widget_instance_config(self, component: Dict, widget_name: str, comp_ref: str):
        """Validate widget instance configuration against widget schema"""
        widget_schema = self.load_widget_schema(widget_name)
        
        if not widget_schema:
            self.warning(f"{comp_ref}: Widget '{widget_name}' has no schema (not configurable)")
            return
        
        # Get the configuration for this widget instance
        widget_config = component.get("config", {})
        
        if not widget_config:
            # Check if any schema fields are required
            required_fields = []
            for field_name, field_def in widget_schema.items():
                if isinstance(field_def, dict) and field_def.get("required", False):
                    required_fields.append(field_name)
            
            if required_fields:
                self.warning(f"{comp_ref}: No config provided but schema has fields: {', '.join(widget_schema.keys())}")
            else:
                self.success(f"{comp_ref}: No config needed (all schema fields optional)")
            return
        
        # Check for unknown fields in widget config
        schema_fields = set(widget_schema.keys())
        config_fields = set(widget_config.keys())
        
        # Find fields in config that aren't in schema
        unknown_fields = config_fields - schema_fields
        if unknown_fields:
            for field in unknown_fields:
                self.error(f"{comp_ref}: Unknown config field '{field}' (not in widget schema)")
        
        # Find missing required fields
        for field_name, field_def in widget_schema.items():
            if isinstance(field_def, dict):
                is_required = field_def.get("required", False)
                if is_required and field_name not in widget_config:
                    self.error(f"{comp_ref}: Missing required config field '{field_name}'")
                elif field_name in widget_config:
                    # Validate field type if specified
                    expected_type = field_def.get("type")
                    actual_value = widget_config[field_name]
                    
                    if expected_type and not self.validate_config_field_type(actual_value, expected_type):
                        self.error(f"{comp_ref}: Config field '{field_name}' has wrong type (expected {expected_type}, got {type(actual_value).__name__})")
                    else:
                        self.success(f"{comp_ref}: Valid config field '{field_name}': {actual_value}")
        
        # Summary
        if not unknown_fields:
            self.success(f"{comp_ref}: All config fields match widget schema")
    
    def validate_config_field_type(self, value, expected_type: str) -> bool:
        """Validate that a config field matches expected type"""
        type_mapping = {
            "string": str,
            "number": (int, float),
            "integer": int,
            "boolean": bool,
            "array": list,
            "object": dict
        }
        
        expected_python_type = type_mapping.get(expected_type)
        if expected_python_type is None:
            return True  # Unknown type, assume valid
        
        return isinstance(value, expected_python_type)
    
    def run_tests(self):
        """Run all dashboard tests"""
        print("🔍 Testing Dashboard Configuration\n")
        
        config = self.load_dashboard_config()
        if not config:
            return False
        
        self.test_required_sections(config)
        self.test_dashboard_metadata(config)
        self.test_components(config)
        self.test_grid_conflicts(config)
        
        return self.report_results()
    
    def report_results(self):
        """Report test results"""
        print(f"\n📊 Dashboard Test Results:")
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
            print(f"\n✅ Dashboard configuration is valid!")
        else:
            print(f"\n❌ Dashboard validation failed with {len(self.errors)} errors")
        
        return success

if __name__ == "__main__":
    tester = DashboardTester()
    success = tester.run_tests()
    sys.exit(0 if success else 1)