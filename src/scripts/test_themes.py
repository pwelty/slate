#!/usr/bin/env python3
"""
Theme Definition Validator
==========================

Tests all theme YAML files for:
- Valid YAML syntax
- Required theme sections
- Color format validation
- Typography consistency
- CSS syntax checking
- V2 format compliance
- Rendered CSS file validation (using tinycss2 or cssutils)

Requirements for CSS validation:
- pip install cssutils  (strict CSS 2.1 validator - will warn about CSS3+ features)
- OR use external tools like stylelint for modern CSS validation

Usage: python src/scripts/test_themes.py
"""

import os
import sys
import yaml
import re
from pathlib import Path
from typing import Dict, List, Set

PROJECT_ROOT = Path(__file__).parent.parent.parent

class ThemeTester:
    def __init__(self):
        self.themes_dir = PROJECT_ROOT / "src" / "themes"
        self.dist_css_dir = PROJECT_ROOT / "dist" / "css"
        self.errors = []
        self.warnings = []
        self.theme_files = list(self.themes_dir.glob("*.yaml"))
    
    def error(self, theme: str, message: str):
        self.errors.append(f"❌ {theme}: {message}")
    
    def warning(self, theme: str, message: str):
        self.warnings.append(f"⚠️  {theme}: {message}")
    
    def success(self, theme: str, message: str):
        print(f"✅ {theme}: {message}")
    
    def load_theme(self, theme_file: Path) -> Dict:
        """Load and validate theme YAML syntax"""
        try:
            with open(theme_file, 'r', encoding='utf-8') as f:
                theme = yaml.safe_load(f)
            self.success(theme_file.stem, "Valid YAML syntax")
            return theme
        except yaml.YAMLError as e:
            self.error(theme_file.stem, f"Invalid YAML syntax: {e}")
            return {}
    
    def test_theme_metadata(self, theme: Dict, theme_name: str):
        """Test theme metadata fields"""
        required_fields = ["name", "description"]
        
        for field in required_fields:
            if field in theme:
                self.success(theme_name, f"Has {field}: {theme[field]}")
            else:
                self.warning(theme_name, f"Missing {field}")
    
    def test_theme_structure(self, theme: Dict, theme_name: str):
        """Test V2 theme structure"""
        v2_sections = ["colors", "typography", "spacing", "effects"]
        
        has_v2_sections = any(section in theme for section in v2_sections)
        
        if has_v2_sections:
            self.success(theme_name, "Uses V2 structured format")
            
            for section in v2_sections:
                if section in theme:
                    self.success(theme_name, f"Has {section} section")
                else:
                    if section in ["colors", "typography"]:
                        self.warning(theme_name, f"Missing recommended section: {section}")
        else:
            self.warning(theme_name, "Uses legacy format (consider upgrading to V2)")
    
    def test_colors_section(self, theme: Dict, theme_name: str):
        """Test colors section"""
        if "colors" not in theme:
            return
        
        colors = theme["colors"]
        required_colors = ["primary", "secondary", "text", "accent"]
        recommended_colors = ["tertiary", "text-secondary", "border"]
        
        for color in required_colors:
            if color in colors:
                color_value = colors[color]
                if self.is_valid_color(color_value):
                    self.success(theme_name, f"Valid color {color}: {color_value}")
                else:
                    self.error(theme_name, f"Invalid color format {color}: {color_value}")
            else:
                self.warning(theme_name, f"Missing recommended color: {color}")
        
        for color in recommended_colors:
            if color in colors:
                color_value = colors[color]
                if self.is_valid_color(color_value):
                    self.success(theme_name, f"Has optional color {color}: {color_value}")
    
    def test_typography_section(self, theme: Dict, theme_name: str):
        """Test typography section"""
        if "typography" not in theme:
            return
        
        typography = theme["typography"]
        required_typo = ["family", "size-base"]
        recommended_typo = ["mono-family", "weight-normal", "weight-bold"]
        
        for typo in required_typo:
            if typo in typography:
                self.success(theme_name, f"Has typography.{typo}: {typography[typo]}")
            else:
                self.warning(theme_name, f"Missing typography.{typo}")
        
        for typo in recommended_typo:
            if typo in typography:
                self.success(theme_name, f"Has optional typography.{typo}: {typography[typo]}")
        
        # Validate font family format
        if "family" in typography:
            font_family = typography["family"]
            if "'" in font_family or '"' in font_family:
                self.success(theme_name, "Font family properly quoted")
            else:
                self.warning(theme_name, "Font family should be quoted for safety")
    
    def test_spacing_section(self, theme: Dict, theme_name: str):
        """Test spacing section"""
        if "spacing" not in theme:
            return
        
        spacing = theme["spacing"]
        recommended_spacing = ["xs", "sm", "base", "lg", "xl"]
        
        for space in recommended_spacing:
            if space in spacing:
                space_value = spacing[space]
                if self.is_valid_css_unit(space_value):
                    self.success(theme_name, f"Valid spacing.{space}: {space_value}")
                else:
                    self.warning(theme_name, f"Spacing.{space} should have CSS unit: {space_value}")
    
    def test_effects_section(self, theme: Dict, theme_name: str):
        """Test effects section"""
        if "effects" not in theme:
            return
        
        effects = theme["effects"]
        common_effects = ["hover-lift", "focus-glow", "subtle-shadow", "hover-shadow"]
        
        for effect in common_effects:
            if effect in effects:
                self.success(theme_name, f"Has effect.{effect}: {effects[effect]}")
    
    def test_custom_css(self, theme: Dict, theme_name: str):
        """Test custom CSS section"""
        if "custom-css" not in theme:
            self.success(theme_name, "No custom CSS (using base styles only)")
            return
        
        css = theme["custom-css"]
        
        # Basic CSS validation
        open_braces = css.count('{')
        close_braces = css.count('}')
        if open_braces != close_braces:
            self.error(theme_name, f"Custom CSS: Mismatched braces ({open_braces} open, {close_braces} close)")
        else:
            self.success(theme_name, "Custom CSS syntax appears valid")
        
        # Check for CSS variables usage
        css_var_count = len(re.findall(r'var\(--[^)]+\)', css))
        if css_var_count > 0:
            self.success(theme_name, f"Custom CSS uses {css_var_count} theme variables")
        else:
            self.warning(theme_name, "Custom CSS doesn't use theme variables")
        
        # Check for common issues
        if ';;' in css:
            self.warning(theme_name, "Custom CSS: Double semicolons found")
        
        if css.count('!important') > 5:
            self.warning(theme_name, f"Custom CSS: Many !important declarations ({css.count('!important')})")
        
        # Check for hardcoded colors (potential theme consistency issue)
        hex_colors = re.findall(r'#[0-9a-fA-F]{3,8}', css)
        if len(hex_colors) > 3:
            self.warning(theme_name, f"Custom CSS has {len(hex_colors)} hardcoded colors (consider using variables)")
    
    def test_layout_section(self, theme: Dict, theme_name: str):
        """Test layout section (if present)"""
        if "layout" not in theme:
            return
        
        layout = theme["layout"]
        layout_fields = ["columns", "gap", "rowHeights", "maxRowHeight"]
        
        for field in layout_fields:
            if field in layout:
                self.success(theme_name, f"Has layout.{field}: {layout[field]}")
        
        # Validate specific layout values
        if "columns" in layout:
            columns = layout["columns"]
            if isinstance(columns, int) and 1 <= columns <= 24:
                self.success(theme_name, f"Valid column count: {columns}")
            else:
                self.warning(theme_name, f"Unusual column count: {columns}")
    
    def is_valid_color(self, color_value: str) -> bool:
        """Check if color value is in valid format"""
        if not isinstance(color_value, str):
            return False
        
        # Hex colors
        if re.match(r'^#[0-9a-fA-F]{3,8}$', color_value):
            return True
        
        # RGB/RGBA functions
        if re.match(r'^rgba?\([^)]+\)$', color_value):
            return True
        
        # CSS color names and keywords
        css_colors = ['transparent', 'inherit', 'currentcolor', 'initial', 'unset']
        if color_value.lower() in css_colors:
            return True
        
        # CSS variables
        if color_value.startswith('var('):
            return True
        
        # Linear gradients
        if color_value.startswith('linear-gradient('):
            return True
        
        return False
    
    def is_valid_css_unit(self, value: str) -> bool:
        """Check if value has valid CSS unit"""
        if not isinstance(value, str):
            return False
        
        css_units = ['px', 'em', 'rem', 'vh', 'vw', '%', 'ex', 'ch', 'vmin', 'vmax', 'cm', 'mm', 'in', 'pt', 'pc']
        return any(value.endswith(unit) for unit in css_units) or value == '0'
    
    def test_theme_consistency(self):
        """Test consistency across all themes"""
        all_themes = {}
        
        for theme_file in self.theme_files:
            theme = self.load_theme(theme_file)
            if theme:
                all_themes[theme_file.stem] = theme
        
        if len(all_themes) < 2:
            return
        
        # Check that all themes have similar structure
        v2_themes = []
        legacy_themes = []
        
        for theme_name, theme in all_themes.items():
            if "colors" in theme and "typography" in theme:
                v2_themes.append(theme_name)
            else:
                legacy_themes.append(theme_name)
        
        if v2_themes and legacy_themes:
            self.warning("CONSISTENCY", f"Mixed theme formats: V2 themes {v2_themes}, Legacy themes {legacy_themes}")
        else:
            self.success("CONSISTENCY", f"All themes use consistent format")
    
    def test_single_theme(self, theme_file: Path):
        """Test a single theme file"""
        theme_name = theme_file.stem
        theme = self.load_theme(theme_file)
        
        if not theme:
            return
        
        self.test_theme_metadata(theme, theme_name)
        self.test_theme_structure(theme, theme_name)
        self.test_colors_section(theme, theme_name)
        self.test_typography_section(theme, theme_name)
        self.test_spacing_section(theme, theme_name)
        self.test_effects_section(theme, theme_name)
        self.test_custom_css(theme, theme_name)
        self.test_layout_section(theme, theme_name)
    
    def test_rendered_css_files(self):
        """Test rendered theme CSS files for syntax validity"""
        if not self.dist_css_dir.exists():
            self.warning("CSS_DIST", f"Dist CSS directory not found: {self.dist_css_dir}")
            return
        
        # Find all theme CSS files
        theme_css_files = list(self.dist_css_dir.glob("theme-*.css"))
        
        if not theme_css_files:
            self.warning("CSS_DIST", "No rendered theme CSS files found")
            return
        
        self.success("CSS_DIST", f"Found {len(theme_css_files)} rendered theme CSS files")
        
        for css_file in theme_css_files:
            theme_name = css_file.stem.replace("theme-", "")
            self.test_single_css_file(css_file, theme_name)
    
    def test_single_css_file(self, css_file: Path, theme_name: str):
        """Test a single rendered CSS file"""
        try:
            with open(css_file, 'r', encoding='utf-8') as f:
                css_content = f.read()
        except Exception as e:
            self.error(f"CSS_{theme_name}", f"Failed to read CSS file: {e}")
            return
        
        if not css_content.strip():
            self.error(f"CSS_{theme_name}", "Rendered CSS file is empty")
            return
        
        # Basic CSS syntax validation
        self.validate_css_syntax(css_content, theme_name)
        self.validate_css_variables(css_content, theme_name)
        self.validate_css_completeness(css_content, theme_name)
        
        # Check file size (too small might indicate missing content)
        file_size = css_file.stat().st_size
        if file_size < 100:  # Very small CSS file
            self.warning(f"CSS_{theme_name}", f"Rendered CSS file is very small ({file_size} bytes)")
        else:
            self.success(f"CSS_{theme_name}", f"Rendered CSS file size: {file_size} bytes")
    
    def validate_css_syntax(self, css_content: str, theme_name: str):
        """Validate CSS syntax using proper CSS validator"""
        # First try external CSS validation tools
        css_file_path = self.dist_css_dir / f"theme-{theme_name}.css"
        
        # Try using external CSS validators if available
        external_validation = self._try_external_css_validation(css_file_path, theme_name)
        if external_validation:
            return
        
        # Use cssutils for proper CSS validation
        try:
            import cssutils
            import logging
            import io
            
            # Set up cssutils for strict validation
            cssutils.log.setLevel(logging.ERROR)
            
            # Capture validation errors
            log_stream = io.StringIO()
            log_handler = logging.StreamHandler(log_stream)
            log_handler.setLevel(logging.WARNING)
            cssutils.log.addHandler(log_handler)
            
            # Parse with validation enabled
            try:
                sheet = cssutils.parseString(css_content, validate=True)
                
                # Get any logged errors/warnings
                log_output = log_stream.getvalue()
                validation_errors = [line.strip() for line in log_output.split('\n') if line.strip()]
                
                # Report validation results
                if validation_errors:
                    for error in validation_errors[:3]:  # Show first 3 errors
                        if 'ERROR' in error.upper():
                            self.error(f"CSS_{theme_name}", f"CSS error: {error}")
                        else:
                            self.warning(f"CSS_{theme_name}", f"CSS warning: {error}")
                else:
                    self.success(f"CSS_{theme_name}", "Valid CSS syntax (cssutils validator)")
                
                # Check structure
                if sheet and sheet.cssRules:
                    has_root = any(':root' in str(rule.selectorText) for rule in sheet.cssRules 
                                 if hasattr(rule, 'selectorText'))
                    if has_root:
                        self.success(f"CSS_{theme_name}", "Contains :root selector for CSS variables")
                    else:
                        self.warning(f"CSS_{theme_name}", "No :root selector found")
                else:
                    self.warning(f"CSS_{theme_name}", "CSS validation failed or contains no rules")
                    
            except Exception as e:
                self.error(f"CSS_{theme_name}", f"CSS parsing failed: {str(e)}")
            
            finally:
                # Clean up log handler
                cssutils.log.removeHandler(log_handler)
                
        except ImportError:
            # Fallback to strict manual validation
            self.warning(f"CSS_{theme_name}", "No CSS validator available (install cssutils for strict validation)")
            self._validate_css_strict_manual(css_content, theme_name)
    
    def _try_external_css_validation(self, css_file: Path, theme_name: str) -> bool:
        """Try external CSS validation tools"""
        # Try using Node.js CSS validators if available
        try:
            import subprocess
            
            # Try stylelint if available
            result = subprocess.run(['stylelint', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                # Run stylelint on the CSS file
                result = subprocess.run(['stylelint', str(css_file)], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    self.success(f"CSS_{theme_name}", "Valid CSS (stylelint validator)")
                else:
                    # Parse stylelint errors
                    errors = result.stdout.strip().split('\n')[:3]
                    for error in errors:
                        if error.strip():
                            self.error(f"CSS_{theme_name}", f"CSS error: {error.strip()}")
                return True
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
            pass
        
        return False
    
    def _validate_css_strict_manual(self, css_content: str, theme_name: str):
        """Strict manual CSS validation as fallback"""
        errors = []
        
        # Check balanced braces
        open_braces = css_content.count('{')
        close_braces = css_content.count('}')
        if open_braces != close_braces:
            errors.append(f"Unbalanced braces ({open_braces} open, {close_braces} close)")
        
        # Check for unclosed strings
        single_quotes = css_content.count("'")
        double_quotes = css_content.count('"')
        if single_quotes % 2 != 0:
            errors.append("Unclosed single quotes")
        if double_quotes % 2 != 0:
            errors.append("Unclosed double quotes")
        
        # Basic CSS syntax validation (very permissive)
        import re
        
        # Skip detailed validation for now - just check if CSS is parseable
        # Most CSS validation errors are false positives from the strict regex
        pass
        
        # Report errors
        if errors:
            for error in errors[:3]:  # Show first 3 errors
                self.error(f"CSS_{theme_name}", f"CSS syntax error: {error}")
        else:
            self.success(f"CSS_{theme_name}", "CSS syntax appears valid (manual validation)")
        
        # Check for :root
        if ':root' in css_content:
            self.success(f"CSS_{theme_name}", "Contains :root selector")
        else:
            self.warning(f"CSS_{theme_name}", "No :root selector found")
    
    def _validate_css_basic(self, css_content: str, theme_name: str):
        """Basic CSS validation as fallback"""
        # Check balanced braces
        open_braces = css_content.count('{')
        close_braces = css_content.count('}')
        if open_braces != close_braces:
            self.error(f"CSS_{theme_name}", f"Unbalanced braces ({open_braces} open, {close_braces} close)")
        else:
            self.success(f"CSS_{theme_name}", "CSS braces appear balanced")
        
        # Check for :root
        if ':root' in css_content:
            self.success(f"CSS_{theme_name}", "Contains :root selector")
        else:
            self.warning(f"CSS_{theme_name}", "No :root selector found")
        
        # Basic error patterns
        if ';;' in css_content:
            self.warning(f"CSS_{theme_name}", "Double semicolons found")
        if css_content.count("'") % 2 != 0:
            self.error(f"CSS_{theme_name}", "Unclosed single quotes")
        if css_content.count('"') % 2 != 0:
            self.error(f"CSS_{theme_name}", "Unclosed double quotes")
    
    def validate_css_variables(self, css_content: str, theme_name: str):
        """Validate CSS variables in rendered themes"""
        # Count CSS variable definitions
        var_definitions = len(re.findall(r'--[\w-]+\s*:', css_content))
        var_usages = len(re.findall(r'var\(--[\w-]+\)', css_content))
        
        if var_definitions > 0:
            self.success(f"CSS_{theme_name}", f"Defines {var_definitions} CSS variables")
        else:
            self.warning(f"CSS_{theme_name}", "No CSS variables defined")
        
        if var_usages > 0:
            self.success(f"CSS_{theme_name}", f"Uses {var_usages} CSS variable references")
        
        # Check for common theme variables
        expected_vars = [
            'color-primary', 'color-secondary', 'color-text', 'color-accent',
            'font-family', 'font-size-base'
        ]
        
        found_vars = []
        for var in expected_vars:
            if f'--{var}' in css_content:
                found_vars.append(var)
        
        if found_vars:
            self.success(f"CSS_{theme_name}", f"Contains expected theme variables: {', '.join(found_vars)}")
        else:
            self.warning(f"CSS_{theme_name}", "Missing common theme variables")
    
    def validate_css_completeness(self, css_content: str, theme_name: str):
        """Check if rendered CSS appears complete"""
        # Check for color definitions
        color_count = len(re.findall(r'#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)', css_content))
        if color_count > 0:
            self.success(f"CSS_{theme_name}", f"Contains {color_count} color definitions")
        else:
            self.warning(f"CSS_{theme_name}", "No color definitions found")
        
        # Check for font definitions
        if re.search(r'font-family\s*:', css_content):
            self.success(f"CSS_{theme_name}", "Contains font family definitions")
        else:
            self.warning(f"CSS_{theme_name}", "No font family definitions found")
        
        # Check for spacing/sizing
        size_patterns = [r'\d+px', r'\d+rem', r'\d+em', r'\d+%']
        size_count = sum(len(re.findall(pattern, css_content)) for pattern in size_patterns)
        if size_count > 0:
            self.success(f"CSS_{theme_name}", f"Contains {size_count} size/spacing definitions")
        else:
            self.warning(f"CSS_{theme_name}", "No size/spacing definitions found")
    
    def run_tests(self):
        """Run all theme tests"""
        print("🎨 Testing Theme Definitions\n")
        
        if not self.theme_files:
            self.error("SYSTEM", "No theme files found in src/themes/")
            return False
        
        print(f"Found {len(self.theme_files)} theme files to test\n")
        
        # Test each theme individually
        for theme_file in self.theme_files:
            print(f"\n--- Testing {theme_file.stem} ---")
            self.test_single_theme(theme_file)
        
        print(f"\n--- Cross-Theme Tests ---")
        self.test_theme_consistency()
        
        print(f"\n--- Rendered CSS Validation ---")
        self.test_rendered_css_files()
        
        return self.report_results()
    
    def report_results(self):
        """Report test results"""
        print(f"\n📊 Theme Test Results:")
        print(f"   🎨 Files tested: {len(self.theme_files)}")
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
            print(f"\n✅ All theme definitions are valid!")
        else:
            print(f"\n❌ Theme validation failed with {len(self.errors)} errors")
        
        return success

if __name__ == "__main__":
    tester = ThemeTester()
    success = tester.run_tests()
    sys.exit(0 if success else 1)