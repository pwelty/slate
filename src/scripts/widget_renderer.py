#!/usr/bin/env python3

import os
import sys
import yaml
import json
import shutil
import argparse
import requests
from pathlib import Path
from jinja2 import Environment, BaseLoader, select_autoescape
from typing import Dict, Any, List, Optional

def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from file"""
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading config from {config_path}: {e}")
        return {}

def load_widgets_config() -> Dict[str, Any]:
    """Load widgets configuration from config directory"""
    widgets_config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'dashboard.yaml')
    return load_config(widgets_config_path)

def load_dashboard_config() -> Dict[str, Any]:
    """Load dashboard configuration from config directory"""
    dashboard_config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'dashboard.yaml')
    return load_config(dashboard_config_path)

def load_widget_definition(widget_type: str) -> Dict[str, Any]:
    """Load a widget definition from /src/widgets/"""
    definition_path = Path(__file__).parent.parent / 'widgets' / f'{widget_type}.yaml'
    
    if not definition_path.exists():
        raise FileNotFoundError(f"Widget definition not found at {definition_path}")
    
    with open(definition_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def load_theme(theme_name: str, theme_cache: Dict[str, Any]) -> Dict[str, Any]:
    """Load and process a theme YAML file"""
    if theme_name in theme_cache:
        return theme_cache[theme_name]
    
    theme_path = Path(__file__).parent.parent / 'themes' / f'{theme_name}.yaml'
    
    if not theme_path.exists():
        print(f"⚠️  Theme not found: {theme_name}, falling back to 'dark'")
        if theme_name != 'dark':
            return load_theme('dark', theme_cache)
        else:
            # If even dark theme doesn't exist, return basic fallback
            return {
                'name': 'Basic',
                'bg-primary': '#0f172a',
                'text-primary': '#f1f5f9'
            }
    
    try:
        with open(theme_path, 'r', encoding='utf-8') as f:
            theme_config = yaml.safe_load(f)
        theme_cache[theme_name] = theme_config
        return theme_config
    except Exception as e:
        print(f"❌ Error loading theme {theme_name}: {e}")
        return load_theme('dark', theme_cache)

def generate_theme_css(theme_config: Dict[str, Any]) -> str:
    """Generate CSS custom properties from theme configuration"""
    css = ':root {\n'
    
    # Process all theme properties and categorize them
    for key, value in theme_config.items():
        # Skip metadata and complex objects
        if key in ['name', 'description', 'gradients', 'effects', 'fonts', 'custom-css', 
                  'widget-enhancements', 'stock-effects', 'effect-colors', 'effect-timing', 'grid-config', 'special-effects']:
            continue
        
        # Handle font properties specially
        if key.startswith('font-'):
            css += f'  --{key}: {value};\n'
        else:
            # Handle all other color/spacing properties
            css += f'  --{key.replace("_", "-")}: {value};\n'
    
    # Process gradients (for synthwave theme)
    if 'gradients' in theme_config:
        for key, value in theme_config['gradients'].items():
            css += f'  --gradient-{key.replace("_", "-")}: {value};\n'
    
    # Process effect colors (for synthwave theme)
    if 'effect-colors' in theme_config:
        for key, value in theme_config['effect-colors'].items():
            css += f'  --effect-color-{key.replace("_", "-")}: {value};\n'
    
    # Process effect timing (for synthwave theme)
    if 'effect-timing' in theme_config:
        for key, value in theme_config['effect-timing'].items():
            css += f'  --{key.replace("_", "-")}: {value};\n'
    
    # Process grid config (for synthwave theme)
    if 'grid-config' in theme_config:
        for key, value in theme_config['grid-config'].items():
            css += f'  --grid-{key}: {value};\n'
    
    css += '}\n'
    
    # Add theme-specific custom CSS
    if 'custom-css' in theme_config:
        css += '\n' + theme_config['custom-css'] + '\n'
    
    return css

def generate_css_bundle(theme_name: str = 'dark', theme_cache: Dict[str, Any] = None) -> str:
    """Generate complete CSS bundle including theme, effects, and fonts"""
    if theme_cache is None:
        theme_cache = {}
        
    css = ''
    
    # Load theme configuration
    theme_config = load_theme(theme_name, theme_cache)
    
    # Include Google Fonts for synthwave theme
    if theme_name == 'synthwave':
        fonts_path = Path(__file__).parent.parent / 'assets' / 'fonts' / 'synthwave-fonts.css'
        if fonts_path.exists():
            with open(fonts_path, 'r', encoding='utf-8') as f:
                css += f.read() + '\n\n'
    
    # Include base styles
    base_css_path = Path(__file__).parent.parent / 'assets' / 'css' / 'base.css'
    if base_css_path.exists():
        with open(base_css_path, 'r', encoding='utf-8') as f:
            css += f.read() + '\n\n'
    
    # Include stock effects system
    effects_path = Path(__file__).parent.parent / 'assets' / 'effects' / 'base-effects.css'
    if effects_path.exists():
        with open(effects_path, 'r', encoding='utf-8') as f:
            css += f.read() + '\n\n'
    
    # Generate theme variables
    css += '/* Theme Variables */\n'
    css += generate_theme_css(theme_config) + '\n'
    
    return css

def copy_assets(output_dir: str):
    """Copy image and other static assets to output directory"""
    assets_source_dir = Path(__file__).parent.parent / 'assets'
    assets_output_dir = Path(output_dir) / 'assets'
    
    # Create assets directory structure
    assets_output_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy image files if they exist
    images_source_dir = assets_source_dir / 'images'
    if images_source_dir.exists():
        images_output_dir = assets_output_dir / 'images'
        images_output_dir.mkdir(exist_ok=True)
        
        for image_file in images_source_dir.glob('*'):
            if image_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']:
                shutil.copy2(image_file, images_output_dir / image_file.name)
                print(f"🖼️  Copied image asset: {image_file.name}")

def create_jinja_env() -> Environment:
    """Create and configure Jinja2 environment"""
    env = Environment(
        loader=BaseLoader(),
        autoescape=False  # Disable auto-escaping for HTML content
    )
    
    # Add custom filters for template processing
    env.filters['format_time'] = format_time
    env.filters['format_date'] = format_date
    
    return env

def format_time(value):
    """Format time value"""
    return str(value)

def format_date(value):
    """Format date value"""
    return str(value)

def convert_handlebars_to_jinja(template_str: str) -> str:
    """Convert Handlebars template syntax to Jinja2"""
    if not template_str:
        return ""
        
    # Basic conversions
    template_str = template_str.replace('{{', '{{')
    template_str = template_str.replace('}}', '}}')
    
    # Convert {{#if condition}} to {% if condition %}
    import re
    template_str = re.sub(r'\{\{#if\s+(.+?)\}\}', r'{% if \1 %}', template_str)
    template_str = re.sub(r'\{\{/if\}\}', r'{% endif %}', template_str)
    
    # Convert {{#each items}} to {% for item in items %}
    template_str = re.sub(r'\{\{#each\s+(.+?)\}\}', r'{% for item in \1 %}', template_str)
    template_str = re.sub(r'\{\{/each\}\}', r'{% endfor %}', template_str)
    
    return template_str

def execute_data_processing(data_function: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the data processing function to generate template data"""
    try:
        # If no data processing function, return config as-is
        if not data_function or data_function.strip() == '':
            return config
        
        # Skip if it's only comments (no actual code)
        lines = [line.strip() for line in data_function.strip().split('\n') if line.strip()]
        code_lines = [line for line in lines if not line.startswith('#')]
        if not code_lines:
            return config
            
        # All data processing should come from the YAML definition
        # The renderer should be completely generic
        if data_function.strip().startswith('function'):
            # Handle JavaScript-style functions by converting to Python or executing directly
            return execute_js_function(data_function, config)
        else:
            # Handle Python-style functions
            local_vars = {'config': config}
            exec(data_function, {}, local_vars)
            if 'result' in local_vars:
                return local_vars['result']
            else:
                return {}
    except Exception as e:
        print(f"⚠️  Data processing execution error: {e}")
        return config  # Fallback to config values

def execute_js_function(data_function: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Execute JavaScript-style function definition by converting to Python"""
    try:
        # For JavaScript functions, we need to provide Python equivalents
        # This is a simple conversion - in a real implementation, you might use a JS engine
        
        # Provide Python equivalents for common JavaScript Date functions
        import datetime
        now = datetime.datetime.now()
        
        # Replace JavaScript Date methods with Python equivalents
        js_context = {
            'config': config,
            'Date': datetime.datetime,
            'now': now,
            'Math': type('Math', (), {
                'round': round,
                'floor': int,
                'ceil': lambda x: int(x) + (1 if x > int(x) else 0)
            })
        }
        
        # Simple function execution - this should be enhanced for production
        # For now, we'll return the config as-is if we can't process the function
        return config
        
    except Exception as e:
        print(f"⚠️  JavaScript function execution error: {e}")
        return config

def apply_schema_defaults(config: Dict[str, Any], widget_def: Dict[str, Any]) -> Dict[str, Any]:
    """Apply default values from widget schema to config"""
    schema = widget_def.get('schema', {})
    properties = schema.get('properties', {})
    
    # Create a copy of config to avoid modifying the original
    result = dict(config)
    
    # Apply defaults for missing properties
    for prop_name, prop_def in properties.items():
        if prop_name not in result and 'default' in prop_def:
            result[prop_name] = prop_def['default']
    
    return result

def generate_grid_css(position: Dict[str, Any]) -> str:
    """Generate CSS grid positioning from position config
    
    New format:
    position:
      row: 1          # Grid row (1, 2, 3, etc.)
      column: 1       # Starting column (1-12)
      width: 6        # How many columns to span
      height: 1       # How many rows to span (optional, default 1)
    """
    css_parts = []
    
    row = position.get('row', 1)
    column = position.get('column', 1)
    width = position.get('width', 2)    # Default width of 2 columns
    height = position.get('height', 1)  # Default height of 1 row
    
    # Handle legacy format for backward compatibility
    if 'span' in position:
        # Legacy format: column + span
        span = position.get('span', 1)
        end_column = column + span
        css_parts.append(f'grid-column: {column} / {end_column};')
    elif isinstance(column, str) and '/' in column:
        # Legacy format: "start / end"
        css_parts.append(f'grid-column: {column};')
    else:
        # New format: column + width
        end_column = column + width
        css_parts.append(f'grid-column: {column} / {end_column};')
    
    # Handle row positioning
    if height > 1:
        end_row = row + height
        css_parts.append(f'grid-row: {row} / {end_row};')
    else:
        css_parts.append(f'grid-row: {row};')
    
    return ' '.join(css_parts)

def generate_group_flow_css() -> str:
    """Generate CSS for group items that flow based on individual item widths"""
    
    return '''
    .group .group-items {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        gap: 1rem !important;
        align-items: flex-start !important;
    }
    
    .group .group-items .group-item {
        min-width: 0 !important;
    }
    
    /* Responsive behavior for narrow screens */
    @media (max-width: 768px) {
        .group .group-items .group-item {
            flex: 0 0 100% !important;
            max-width: 100% !important;
        }
    }
    '''

def process_template(template_str: str, data: Dict[str, Any]) -> str:
    """
    Generic template replacement for {{variable}} and {{#if}} syntax.
    This is completely generic and works with any widget definition.
    """
    if not template_str:
        return ""
    
    rendered_str = template_str
    
    # Handle {{#if condition}} blocks
    import re
    
    # Find all {{#if variable}} ... {{/if}} blocks
    if_pattern = r'{{\s*#if\s+(\w+)\s*}}(.*?){{\s*/if\s*}}'
    
    def replace_if_block(match):
        condition_var = match.group(1)
        block_content = match.group(2)
        
        # Check if the condition variable is truthy
        if condition_var in data and data[condition_var]:
            return block_content
        else:
            return ""
    
    rendered_str = re.sub(if_pattern, replace_if_block, rendered_str, flags=re.DOTALL)
    
    # Handle simple {{variable}} replacements
    for key, value in data.items():
        rendered_str = rendered_str.replace(f"{{{{{key}}}}}", str(value))
    
    return rendered_str

def convert_widgets_to_components(widgets_config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Convert widgets.yaml format to dashboard components format"""
    components = []
    
    for widget_id, widget_config in widgets_config.items():
        if isinstance(widget_config, dict):
            component = {
                'id': widget_id,
                'type': widget_config.get('type', 'widget'),
                'position': widget_config.get('position', {'row': 1, 'column': 1, 'span': 3})
            }
            
            # Add widget-specific info
            if 'widget' in widget_config:
                component['widget'] = widget_config['widget']
            if 'config' in widget_config:
                component['config'] = widget_config['config']
            if 'backgroundColor' in widget_config:
                component['backgroundColor'] = widget_config['backgroundColor']
            
            components.append(component)
    
    return components

def render_link_item(item: Dict[str, Any]) -> str:
    """Render a link item with optional status indicator"""
    name = item.get('name', 'Link')
    url = item.get('url', '#')
    description = item.get('description', '')
    icon = item.get('icon', 'link')
    status_check = item.get('statusCheck', False)
    
    # Add status indicator if enabled
    status_indicator = ''
    status_css = ''
    if status_check:
        # For now, randomly show online/offline (in real implementation, this would check actual status)
        import random
        status = 'online' if random.choice([True, False, True, True]) else 'offline'  # Bias towards online
        status_indicator = f'<div class="status-indicator {status}" title="Service is {status}"></div>'
        
        # Include status indicator CSS inline
        status_css = '''
        <style>
        .status-indicator {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #666;
            transition: all 0.3s ease;
        }
        
        .status-indicator.online {
            background: #22c55e;
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }
        
        .status-indicator.offline {
            background: #ef4444;
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }
        
        .status-indicator.checking {
            background: #f59e0b;
            box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        </style>
        '''
    
    return f'''
    {status_css}
    <a href="{url}" class="link-item" target="_blank" rel="noopener noreferrer">
        <div class="link-icon">🔗</div>
        <div class="link-content">
            <div class="link-name">{name}</div>
            <div class="link-description">{description}</div>
        </div>
        {status_indicator}
    </a>
    '''

def render_motd_item(item: Dict[str, Any]) -> str:
    """Render a message of the day item"""
    title = item.get('title', 'Note')
    message = item.get('message', '')
    icon = item.get('icon', '📝')
    
    return f'''
    <div class="motd-item">
        <div class="motd-icon">{icon}</div>
        <div class="motd-content">
            <div class="motd-title">{title}</div>
            <div class="motd-message">{message}</div>
        </div>
    </div>
    '''

def render_obsidian_item(item: Dict[str, Any]) -> str:
    """Render an Obsidian item"""
    config = item.get('config', {})
    return f'<div class="obsidian-item">Obsidian: {config.get("tag", "notes")}</div>'

def render_todoist_item(item: Dict[str, Any]) -> str:
    """Render a Todoist item"""
    config = item.get('config', {})
    return f'<div class="todoist-item">Todoist: {config.get("tag", "tasks")}</div>'

def render_trilium_item(item: Dict[str, Any]) -> str:
    """Render a Trilium item"""
    config = item.get('config', {})
    return f'<div class="trilium-item">Trilium: {config.get("tag", "notes")}</div>'

def render_group_item(item: Dict[str, Any], widgets_config: Dict[str, Any]) -> str:
    """Render a single item within a group"""
    
    item_type = item.get('type', 'link')
    
    if item_type == 'link':
        return render_link_item(item)
    elif item_type == 'motd':
        return render_motd_item(item)
    elif item_type == 'obsidian':
        return render_obsidian_item(item)
    elif item_type == 'todoist':
        return render_todoist_item(item)
    elif item_type == 'trilium':
        return render_trilium_item(item)
    else:
        return f'<div class="group-item">Item: {item_type}</div>'

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description='Render Slate widgets from YAML definitions')
    parser.add_argument('--widget', '-w', help='Widget ID to render from /config/widgets.yaml')
    parser.add_argument('--dashboard', '-d', action='store_true', help='Render complete dashboard')
    parser.add_argument('--output', '-o', default='widget.html', help='Output file name (default: widget.html in /dist directory)')
    parser.add_argument('--theme', '-t', default='dark', choices=['dark', 'light', 'synthwave', 'retro', 'tokyo-night', 'ocean'], help='Theme name (default: dark)')
    parser.add_argument('--format', '-f', choices=['html'], default='html', help='Output format')
    
    args = parser.parse_args()
    
    try:
        if args.dashboard:
            # Render complete dashboard using standalone functions
            print("❌ Dashboard rendering should be done via dashboard_renderer.py")
            print("   Use: python3 src/scripts/dashboard_renderer.py --theme", args.theme)
            
        elif args.widget:
            # Render single widget using standalone functions
            if args.format == 'html':
                # Load widget configuration
                widgets_config = load_widgets_config()
                
                if args.widget not in widgets_config.get('widgets', {}):
                    print(f"❌ Widget '{args.widget}' not found in config")
                    return
                
                widget_config = widgets_config['widgets'][args.widget]
                widget_type = widget_config.get('widget', 'unknown')
                
                # Load widget definition
                try:
                    widget_def = load_widget_definition(widget_type)
                except FileNotFoundError as e:
                    print(f"❌ Error loading widget definition: {e}")
                    return
                
                # Generate widget HTML
                template_data = apply_schema_defaults(widget_config.get('config', {}), widget_def)
                
                # Process widget template
                widget_body = widget_def.get('widget-body', '')
                if widget_body:
                    rendered_html = process_template(widget_body, template_data)
                else:
                    rendered_html = '<div>No widget template found</div>'
                
                # Create complete HTML page
                css_bundle = generate_css_bundle(args.theme)
                
                html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{widget_type.title()} Widget</title>
    <style>
{css_bundle}
    </style>
</head>
<body>
    <div class="widget {widget_type}-widget">
        {rendered_html}
    </div>
</body>
</html>'''
                
                # Ensure output directory exists
                output_path = Path('dist') / args.output
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Write to file
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                print(f"✅ Widget rendered successfully to {output_path}")
        else:
            print("❌ Please specify either --widget WIDGET_ID or --dashboard")
            parser.print_help()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 