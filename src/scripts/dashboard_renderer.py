#!/usr/bin/env python3
"""
Dashboard Renderer
Renders the Slate dashboard with widgets and themes
"""

import os
import sys
import yaml
import json
import shutil
from pathlib import Path
import argparse

try:
    from jinja2 import Template
    import requests
except ImportError:
    print("Installing required dependencies...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "jinja2", "pyyaml", "requests"])
    from jinja2 import Template
    import requests

from theme_renderer import (
    get_available_themes, load_theme as load_theme_from_renderer, build_all_themes, 
    get_theme_info, build_theme_css
)
from widget_renderer import (
    load_config, load_widgets_config, load_dashboard_config, load_widget_definition,
    generate_grid_css, generate_group_flow_css, process_template,
    convert_widgets_to_components, render_group_item, render_link_item,
    render_motd_item, render_obsidian_item, render_todoist_item, render_trilium_item,
    execute_data_processing, apply_schema_defaults, copy_assets,
    generate_css_bundle, load_theme, generate_theme_css
)

PROJECT_ROOT = Path(__file__).parent.parent.parent
TEMPLATE_DIR = PROJECT_ROOT / "src" / "template"
THEMES_DIR = PROJECT_ROOT / "src" / "themes"
WIDGETS_DIR = PROJECT_ROOT / "src" / "widgets"
CONFIG_DIR = PROJECT_ROOT / "config"
DIST_DIR = PROJECT_ROOT / "dist"

def load_yaml(file_path):
    """Load a YAML file"""
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

def load_widget_template(template_name):
    """Load and cache widget templates"""
    template_file = WIDGETS_DIR / f"{template_name}.yaml"
    if template_file.exists():
        return load_yaml(template_file)
    return None

def load_group_template():
    """Load the group template"""
    template_file = WIDGETS_DIR / "group.yaml"
    if template_file.exists():
        return load_yaml(template_file)
    return None

def merge_widget_with_template(widget_definition, template_name='widget'):
    """Merge widget definition with its template (supports recursive inheritance)"""
    # Load the base template
    base_template = load_widget_template(template_name)
    if not base_template:
        return widget_definition
    
    # Check if this template extends another template (recursive inheritance)
    if 'extends' in base_template:
        parent_template_name = base_template['extends']
        # Recursively merge with parent template
        base_template = merge_widget_with_template(base_template, parent_template_name)
    
    # Merge schema (template schema + widget-specific schema)
    merged_schema = {}
    if 'schema' in base_template:
        merged_schema.update(base_template['schema'])
    if 'schema' in widget_definition:
        merged_schema.update(widget_definition['schema'])
    
    # Merge capabilities
    merged_capabilities = {}
    if 'capabilities' in base_template:
        merged_capabilities.update(base_template['capabilities'])
    if 'capabilities' in widget_definition:
        merged_capabilities.update(widget_definition['capabilities'])
    
    # Start with template base
    merged_widget = base_template.copy()
    
    # Override with widget-specific properties
    merged_widget.update(widget_definition)
    
    # Set merged schema and capabilities
    merged_widget['schema'] = merged_schema
    merged_widget['capabilities'] = merged_capabilities
    
    return merged_widget

def render_widget_html_from_template(widget_definition, template_context):
    """Render widget HTML using template system"""
    # Check if widget extends a template or has its own HTML
    extends = widget_definition.get('extends', None)
    
    if extends:
        # Widget extends a template - merge with template
        merged_widget = merge_widget_with_template(widget_definition, extends)
    else:
        # Widget has its own HTML - use directly
        merged_widget = widget_definition
    
    # Get HTML template
    html_template = merged_widget.get('html', '')
    
    # Handle widget-body substitution
    if 'widget-body' in widget_definition:
        widget_body = widget_definition['widget-body']
        html_template = html_template.replace('{{widget-body}}', widget_body)
    
    # Handle widget-type substitution - use actual widget name from context
    widget_type_name = template_context.get('widget_type', 'generic')
    html_template = html_template.replace('{{widget-type}}', widget_type_name)
    
    # Handle widget-title substitution (allow custom title content)
    widget_title = template_context.get('title', '')
    if 'widget-title' in widget_definition:
        widget_title = widget_definition['widget-title']
    html_template = html_template.replace('{{widget-title}}', widget_title)
    
    # Handle widget CSS injection - inject CSS directly into widget HTML
    widget_css = ""
    if 'css' in widget_definition and widget_definition['css']:
        css_content = widget_definition['css']
        widget_css = f'<style>\n{css_content}\n</style>'
    elif 'widget-css' in widget_definition and widget_definition['widget-css']:
        # Handle legacy widget-css format (remove style tags if present)
        css_content = widget_definition['widget-css']
        if css_content.strip().startswith('<style>'):
            css_content = css_content.strip()[7:-8]  # Remove <style> and </style>
        widget_css = f'<style>\n{css_content}\n</style>'
    
    html_template = html_template.replace('{{widget-css}}', widget_css)
    
    # Handle widget JS injection - inject JS directly into widget HTML
    widget_js = ""
    if 'js' in widget_definition and widget_definition['js']:
        js_content = widget_definition['js']
        widget_js = f'<script>\n{js_content}\n</script>'
    elif 'widget-js' in widget_definition and widget_definition['widget-js']:
        # Handle legacy widget-js format (remove script tags if present)
        js_content = widget_definition['widget-js']
        if js_content.strip().startswith('<script>'):
            js_content = js_content.strip()[8:-9]  # Remove <script> and </script>
        widget_js = f'<script>\n{js_content}\n</script>'
    
    html_template = html_template.replace('{{widget-js}}', widget_js)
    
    # Render with Jinja2
    if html_template:
        template = Template(html_template)
        return template.render(**template_context)
    
    return ''

def render_group_from_template(group_config, group_template):
    """Render a group using the group template"""
    group_id = group_config.get('id', 'unknown')
    title = group_config.get('title', 'Group')
    position = group_config.get('position', {})
    items = group_config.get('items', [])
    background_color = group_config.get('backgroundColor', '')
    
    # Generate position CSS
    position_css = generate_grid_position_css(position)
    
    # Generate background style
    background_style = f' background: {background_color};' if background_color else ''
    
    # Generate group content
    group_content = render_group_items(items)
    
    # Create template context
    template_context = {
        'id': group_id,
        'title': title,
        'position_css': position_css,
        'background_style': background_style,
        'group_content': group_content
    }
    
    # Get HTML template
    html_template = group_template.get('html', '')
    
    # Handle group CSS injection - inject CSS directly into group HTML
    group_css = ""
    if 'css' in group_template:
        css_content = group_template['css']
        group_css = f'<style>\n{css_content}\n</style>'
    
    # Handle group JS injection - inject JS directly into group HTML
    group_js = ""
    if 'js' in group_template:
        js_content = group_template['js']
        group_js = f'<script>\n{js_content}\n</script>'
    
    # Inject CSS and JS into template
    html_template = html_template.replace('{{group-css}}', group_css)
    html_template = html_template.replace('{{group-js}}', group_js)
    
    # Render with Jinja2
    if html_template:
        template = Template(html_template)
        html_content = template.render(**template_context)
        return html_content
    
    return ''

def render_group_items(items):
    """Render items within a group"""
    content = ""
    
    for item in items:
        item_type = item.get('type')
        
        if item_type == 'link':
            name = item.get('name', 'Link')
            url = item.get('url', '#')
            description = item.get('description', '')
            icon = item.get('icon', '🔗')
            width = item.get('width', None)
            
            # Apply width styling if specified
            if width:
                width_percent = (width / 12) * 100
                style = f' style="flex: 0 0 calc({width_percent}% - 0.75rem) !important;"'
            else:
                style = ''
                
            content += f'      <a href="{url}" class="link-item" target="_blank" rel="noopener"{style}>\n'
            content += f'        <div class="link-icon">{icon}</div>\n'
            content += f'        <div class="link-content">\n'
            content += f'          <div class="link-name">{name}</div>\n'
            if description:
                content += f'          <div class="link-description">{description}</div>\n'
            content += f'        </div>\n'
            content += f'      </a>\n'
        
        elif item_type in ['motd', 'todoist', 'trilium', 'obsidian', 'preview', 'linkwarden']:
            # Widget items within groups
            # Check for position configuration and apply width styling
            position = item.get('position', {})
            width = position.get('width', None)
            
            if width:
                # Calculate flex-basis for the specified width (assuming 12-column grid within group)
                width_percent = (width / 12) * 100
                style = f'style="flex: 0 0 calc({width_percent}% - 0.75rem) !important;"'
                content += f'      <div class="group-widget" {style}>\n'
            else:
                content += f'      <div class="group-widget">\n'
            
            # Load widget CSS and JS for group widgets too
            try:
                widget_definition = load_widget_definition(item_type)
                
                # Merge with template if widget extends one
                extends = widget_definition.get('extends', 'widget')
                merged_widget = merge_widget_with_template(widget_definition, extends)
                
                # Fetch widget data if available
                item_config = item.get('config', {})
                widget_data = fetch_widget_data(merged_widget, item_config)
                
                # Prepare template context
                template_context = {**item_config}
                
                # Add widget type to template context for {{widget-type}} substitution
                template_context['widget_type'] = item_type
                
                # Add group context for proper heading hierarchy
                template_context['is_in_group'] = True
                
                if widget_data:
                    template_context['data'] = widget_data
                    if isinstance(widget_data, list):
                        template_context['items'] = widget_data
                
                # Render HTML using template system (CSS/JS now handled in template)
                rendered_html = render_widget_html_from_template(widget_definition, template_context)
                if rendered_html:
                    content += f'        {rendered_html}\n'
                else:
                    content += f'        <!-- {item_type} mini-widget -->\n'
                    
            except Exception as e:
                print(f"   ⚠️  Error loading group widget definition {item_type}: {e}")
                content += f'        <!-- {item_type} mini-widget -->\n'
            
            content += f'      </div>\n'
    
    return content

def fetch_widget_data(widget_definition, config):
    """Generic data fetcher for widgets with dataFetcher configuration"""
    if 'dataFetcher' not in widget_definition:
        return None
    
    fetcher_config = widget_definition['dataFetcher']
    
    if fetcher_config.get('type') != 'api':
        print(f"   ⚠️  Unsupported data fetcher type: {fetcher_config.get('type')}")
        return None
    
    try:
        # Build URL from template
        url_template = fetcher_config.get('urlTemplate', '')
        url = url_template.format(**config)
        
        # Build headers
        headers = {}
        if 'headers' in fetcher_config:
            for key, value in fetcher_config['headers'].items():
                headers[key] = value.format(**config)
        
        # Build request body if specified
        json_data = None
        if 'body' in fetcher_config:
            json_data = {}
            for key, value in fetcher_config['body'].items():
                if isinstance(value, str):
                    json_data[key] = value.format(**config)
                else:
                    json_data[key] = value

        # Make API request
        method = fetcher_config.get('method', 'GET').upper()
        response = requests.request(method, url, headers=headers, json=json_data, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Apply response mapping
        if 'responseMapping' in fetcher_config:
            mapping = fetcher_config['responseMapping']
            items_path = mapping.get('items', '')
            
            # Extract items from response
            items = data
            if items_path:
                for path_part in items_path.split('.'):
                    if path_part and path_part in items:
                        items = items[path_part]
            
            # Map fields if specified
            if 'fields' in mapping and isinstance(items, list):
                field_mapping = mapping['fields']
                mapped_items = []
                
                for item in items:
                    mapped_item = {}
                    for new_key, old_path in field_mapping.items():
                        # Handle nested paths like "collection.name"
                        value = item
                        for path_part in old_path.split('.'):
                            if isinstance(value, dict) and path_part in value:
                                value = value[path_part]
                            else:
                                value = None
                                break
                        mapped_item[new_key] = value
                    mapped_items.append(mapped_item)
                
                return mapped_items
            
            return items
        
        return data
        
    except Exception as e:
        print(f"   ⚠️  Data fetch failed: {e}")
        return None

def copy_template_to_dist():
    """Copy the template directory to dist"""
    print("📁 Copying template to dist...")
    
    # Create dist directory if it doesn't exist
    DIST_DIR.mkdir(exist_ok=True)
    
    # Copy template files to dist (update in place)
    for item in TEMPLATE_DIR.iterdir():
        if item.is_file():
            shutil.copy2(item, DIST_DIR / item.name)
        elif item.is_dir():
            dest_dir = DIST_DIR / item.name
            if dest_dir.exists():
                shutil.rmtree(dest_dir)
            shutil.copytree(item, dest_dir)
    
    print(f"   ✓ Template copied to {DIST_DIR}")
    
    # Also copy preview.html for theme previewing
    preview_src = TEMPLATE_DIR / "preview.html"
    if preview_src.exists():
        preview_dst = DIST_DIR / "preview.html"
        shutil.copy2(preview_src, preview_dst)
        print(f"   ✓ Theme preview copied to {preview_dst}")


def copy_theme_js_files():
    """Copy theme JS files to dist/js if they have effects-js property"""
    print("📜 Copying theme JS files...")
    
    # Ensure dist/js directory exists
    js_dir = DIST_DIR / "js"
    js_dir.mkdir(exist_ok=True)
    
    # Check each theme for effects-js property
    for theme_name in get_available_themes(THEMES_DIR):
        theme_config = load_theme_from_renderer(theme_name, THEMES_DIR)
        if theme_config and 'effects-js' in theme_config:
            js_filename = theme_config['effects-js']
            src_js_file = THEMES_DIR / js_filename
            
            if src_js_file.exists():
                dest_js_file = js_dir / js_filename
                shutil.copy2(src_js_file, dest_js_file)
                print(f"   ✓ Theme JS copied: {js_filename}")
            else:
                print(f"   ⚠️  Theme JS not found: {src_js_file}")
    
    # Update theme-switcher.js with available themes
    update_theme_switcher_js()
    
    print(f"   ✓ Theme JS files processed")


def update_theme_switcher_js():
    """Generate theme-switcher.js with dynamically discovered available themes"""
    theme_switcher_template = Path(__file__).parent / "theme-switcher.js.template"
    theme_switcher_dest = DIST_DIR / "js" / "theme-switcher.js"
    
    if not theme_switcher_template.exists():
        print(f"   ⚠️  Theme switcher template not found: {theme_switcher_template}")
        return
    
    # Get available themes
    available_themes = get_available_themes(THEMES_DIR)
    
    # Read the theme-switcher.js template
    with open(theme_switcher_template, 'r') as f:
        js_content = f.read()
    
    # Replace the availableThemes array placeholder with actual themes
    themes_array = json.dumps(available_themes)
    js_content = js_content.replace(
        'availableThemes: [], // Will be populated by theme_renderer.py',
        f'availableThemes: {themes_array}, // Populated by theme_renderer.py'
    )
    
    # Write the updated content to dist
    with open(theme_switcher_dest, 'w') as f:
        f.write(js_content)
    
    print(f"   ✓ Theme switcher generated with {len(available_themes)} themes: {', '.join(available_themes)}")


def build_effects_css():
    """Build effects CSS"""
    print("✨ Building effects CSS...")
    
    # Read base effects CSS
    base_effects_file = DIST_DIR / "css" / "base-effects.css"
    if base_effects_file.exists():
        return '<link rel="stylesheet" href="css/base-effects.css">'
    
    return ""

def load_dashboard_config_local():
    """Load dashboard configuration"""
    dashboard_config_file = CONFIG_DIR / "dashboard.yaml"
    if not dashboard_config_file.exists():
        print(f"   ⚠️  Dashboard config not found: {dashboard_config_file}")
        return {}
    
    return load_yaml(dashboard_config_file)

def render_widgets(dashboard_config):
    """Render all widgets with inline CSS/JS"""
    print("🧩 Rendering widgets...")
    
    widgets_content = ""
    
    # Get components configuration
    components = dashboard_config.get('components', [])
    
    if not components:
        print("   ⚠️  No components found in dashboard config")
        return {"html": ""}
    
    # Build dashboard grid
    widgets_content += '<div class="dashboard-grid">\n'
    
    for component in components:
        component_type = component.get('type')
        component_id = component.get('id', 'unknown')
        
        if component_type == 'widget':
            # Traditional format: type=widget, widget=clock
            widget_type = component.get('widget')
            position = component.get('position', {})
            config = component.get('config', {})
            
            if not widget_type:
                continue
        elif component_type != 'group':
            # Simplified format: type=clock (component_type is the widget type)
            widget_type = component_type
            position = component.get('position', {})
            config = component.get('config', {})
        else:
            # Groups don't have widget_type
            widget_type = None
        
        # Handle widget rendering (both traditional and simplified formats)
        if widget_type:
            # Create widget HTML container
            css_position = generate_grid_position_css(position)
            bg_color = component.get('backgroundColor', '')
            bg_style = f'background: {bg_color};' if bg_color else ''
            
            # Load widget definition from YAML to get template info
            widget_classes = ["widget"]
            
            try:
                widget_definition = load_widget_definition(widget_type)
                
                # Add widget type class
                widget_classes.append(f"widget-{widget_type}")
                
                # Add template class if widget extends a template
                extends_template = widget_definition.get('extends', None)
                if extends_template and extends_template != 'widget':
                    # If template already starts with 'widget-', don't add prefix
                    if extends_template.startswith('widget-'):
                        widget_classes.append(extends_template)
                    else:
                        widget_classes.append(f"widget-{extends_template}")
                
                # Add component ID as class
                widget_classes.append(component_id)
                
                # Create class string
                class_string = " ".join(widget_classes)
                
                widgets_content += f'  <div class="{class_string}" id="{component_id}" data-widget="{widget_type}" style="{css_position} {bg_style}">\n'
                
                # Create template context using widget config
                template_context = config.copy()
                
                # Add widget type to template context for {{widget-type}} substitution
                template_context['widget_type'] = widget_type
                
                # Add group context for proper heading hierarchy (standalone widgets)
                template_context['is_in_group'] = False
                
                # Add default values from schema if not provided in config
                if 'schema' in widget_definition:
                    for field_name, field_def in widget_definition['schema'].items():
                        if field_name not in template_context and 'default' in field_def:
                            template_context[field_name] = field_def['default']
                    
                    # Execute data processing function if present
                    if 'dataProcessing' in widget_definition and 'generateData' in widget_definition['dataProcessing']:
                        try:
                            data_function = widget_definition['dataProcessing']['generateData']
                            processed_data = execute_data_processing(data_function, template_context)
                            template_context.update(processed_data)
                            print(f"   ✓ Executed data processing for {widget_type}")
                        except Exception as e:
                            print(f"   ⚠️  Data processing error for {widget_type}: {e}")
                    
                    # Generate initial data for specific widget types that need it
                    if widget_type == 'clock':
                            import datetime
                            now = datetime.datetime.now()
                            format_type = template_context.get('format', '12h')
                            
                            if format_type == '12h':
                                time_str = now.strftime('%I:%M:%S %p')
                            else:
                                time_str = now.strftime('%H:%M:%S')
                            
                            template_context.update({
                                'time': time_str,
                                'date': now.strftime('%A, %B %d, %Y'),
                                'showDate': template_context.get('showDate', True)
                            })
                            print(f"   ✓ Generated time data for clock: {time_str}")
                            
                    elif widget_type == 'status-summary':
                            import random
                            
                            # Generate simulated status data
                            total_services = 12
                            online_services = random.randint(8, 12)
                            offline_services = total_services - online_services
                            
                            # Simulate uptime
                            uptime_seconds = random.randint(86400, 604800)
                            uptime_days = uptime_seconds // 86400
                            uptime_hours = (uptime_seconds % 86400) // 3600
                            
                            if uptime_days > 0:
                                uptime = f"{uptime_days}d {uptime_hours}h"
                            else:
                                uptime = f"{uptime_hours}h {uptime_hours % 60}m"
                            
                            # Health status
                            health_percentage = (online_services / total_services) * 100
                            if health_percentage >= 90:
                                health_status = "OPTIMAL PERFORMANCE"
                            elif health_percentage >= 70:
                                health_status = "DEGRADED PERFORMANCE"
                            else:
                                health_status = "CRITICAL STATUS"
                            
                            template_context.update({
                                'totalServices': total_services,
                                'onlineServices': online_services,
                                'offlineServices': offline_services,
                                'uptime': uptime,
                                'healthStatus': health_status,
                                'showStats': template_context.get('showStats', True),
                                'showUptime': template_context.get('showUptime', True)
                            })
                            print(f"   ✓ Generated status data: {online_services}/{total_services} services online")
                    
                    # Use template system for rendering
                    rendered_html = render_widget_html_from_template(widget_definition, template_context)
                    
                    if rendered_html:
                        # Check if widget extends widget-image template - if so, skip wrapper
                        extends_template = widget_definition.get('extends', 'widget')
                        if extends_template == 'widget-image':
                            # Widget-image templates handle their own structure, no wrapper needed
                            widgets_content += f'      {rendered_html}\n'
                        else:
                            # Standard widgets need the content wrapper
                            widgets_content += f'    <div class="widget-content">\n'
                            widgets_content += f'      {rendered_html}\n'
                            widgets_content += f'    </div>\n'
                        print(f"   ✓ Widget rendered using template: {widget_type}")
                    else:
                        widgets_content += f'    <div class="widget-content">\n'
                        widgets_content += f'      <!-- {widget_type} widget: template rendering failed -->\n'
                        widgets_content += f'    </div>\n'
                        
            except Exception as e:
                print(f"   ⚠️  Error loading widget definition {widget_type}: {e}")
                widgets_content += f'    <div class="widget-content">\n'
                widgets_content += f'      <!-- Error loading {widget_type} widget: {e} -->\n'
                widgets_content += f'    </div>\n'
            
            widgets_content += f'  </div>\n'
        
        elif component_type == 'group':
            # Group component - use template system
            group_template = load_group_template()
            if group_template:
                try:
                    group_result = render_group_from_template(component, group_template)
                    widgets_content += f'  {group_result}\n'
                    print(f"   ✓ Group rendered using template: {component_id}")
                except Exception as e:
                    print(f"   ⚠️  Error rendering group {component_id} with template: {e}")
                    # Fallback to old method
                    widgets_content += f'  <!-- Error rendering group {component_id}: {e} -->\n'
            else:
                print(f"   ⚠️  Group template not found, skipping group {component_id}")
                widgets_content += f'  <!-- Group template not found for {component_id} -->\n'
    
    widgets_content += '</div>\n'
    
    print(f"   ✓ Rendered {len(components)} components")
    return {"html": widgets_content}

def generate_grid_css(dashboard_config):
    """Generate CSS grid configuration from dashboard config"""
    dashboard_info = dashboard_config.get('dashboard', {})
    css_vars = []
    additional_css = ""  # For non-variable CSS rules
    
    # Check if row expansion is allowed
    allow_row_expansion = dashboard_info.get('allowRowExpansion', False)
    
    # Handle row heights
    if 'rowHeights' in dashboard_info:
        # Specific row heights - use grid-template-rows
        row_heights = dashboard_info['rowHeights']
        grid_template_rows = ' '.join(row_heights)
        
        if allow_row_expansion:
            # Convert fixed heights to minimum heights that can expand with maximum limits
            max_row_height = dashboard_info.get('maxRowHeight', '250px')  # Default max height
            
            # Handle "auto" as unlimited growth, anything else as widget max-height constraint
            if max_row_height == "auto":
                # No max limit - allow unlimited growth
                flexible_heights = []
                for height in row_heights:
                    flexible_heights.append(f"minmax({height}, auto)")
                grid_template_rows = ' '.join(flexible_heights)
                css_vars.append(f"  --grid-template-rows: {grid_template_rows};")
                css_vars.append(f"  --grid-auto-rows: minmax(80px, auto);")  # Auto rows unlimited
                print(f"   📐 Using flexible row heights (unlimited growth): {' '.join(row_heights)} / unlimited")
            else:
                # Let rows grow naturally, but constrain widgets to max height
                flexible_heights = []
                for height in row_heights:
                    flexible_heights.append(f"minmax({height}, auto)")  # Rows grow naturally
                grid_template_rows = ' '.join(flexible_heights)
                css_vars.append(f"  --grid-template-rows: {grid_template_rows};")
                css_vars.append(f"  --grid-auto-rows: minmax(80px, auto);")  # Auto rows grow naturally
                # Add CSS rule to constrain widgets to max height
                additional_css = f"""
/* Widget height constraint from dashboard config */
.widget, .widget-group {{
    max-height: {max_row_height};
    overflow-y: auto;
}}"""
                print(f"   📐 Using natural row heights with widget max-height: {' '.join(row_heights)} / widgets limited to {max_row_height}")
        else:
            # Fixed row heights
            css_vars.append(f"  --grid-template-rows: {grid_template_rows};")
            css_vars.append("  --grid-auto-rows: none;")  # Disable auto rows
            print(f"   📐 Using fixed row heights: {grid_template_rows}")
    elif 'defaultRowHeight' in dashboard_info:
        # Fixed row height for all rows - use grid-auto-rows with fixed height
        default_height = dashboard_info['defaultRowHeight']
        css_vars.append("  --grid-template-rows: none;")  # No template rows
        
        if allow_row_expansion:
            max_row_height = dashboard_info.get('maxRowHeight', '250px')  # Default max height
            if max_row_height == "auto":
                css_vars.append(f"  --grid-auto-rows: minmax({default_height}, auto);")  # Unlimited growth
                print(f"   📐 Using flexible row height (unlimited growth): {default_height} / unlimited")
            else:
                css_vars.append(f"  --grid-auto-rows: minmax({default_height}, auto);")  # Rows grow naturally
                # Add CSS rule to constrain widgets to max height
                additional_css = f"""
/* Widget height constraint from dashboard config */
.widget, .widget-group {{
    max-height: {max_row_height};
    overflow-y: auto;
}}"""
                print(f"   📐 Using natural row height with widget max-height: {default_height} / widgets limited to {max_row_height}")
        else:
            css_vars.append(f"  --grid-auto-rows: {default_height};")  # Fixed height
            print(f"   📐 Using fixed row height: {default_height}")
    else:
        # Minimum row height (allows content to grow - current behavior)
        min_height = dashboard_info.get('minRowHeight', '80px')
        max_row_height = dashboard_info.get('maxRowHeight', '250px')  # Default max height
        css_vars.append("  --grid-template-rows: none;")  # No template rows
        if max_row_height == "auto":
            css_vars.append(f"  --grid-auto-rows: minmax({min_height}, auto);")  # Unlimited growth
            css_vars.append(f"  --widget-max-height: none;")  # No widget height limit
            print(f"   📐 Using flexible row height (unlimited growth): {min_height} / unlimited")
        else:
            css_vars.append(f"  --grid-auto-rows: minmax({min_height}, auto);")  # Rows grow naturally
            # Add CSS rule to constrain widgets to max height
            additional_css = f"""
/* Widget height constraint from dashboard config */
.widget, .widget-group {{
    max-height: {max_row_height};
    overflow-y: auto;
}}"""
            print(f"   📐 Using natural row height with widget max-height: {min_height} / widgets limited to {max_row_height}")
    
    # Handle grid gap
    if 'gap' in dashboard_info:
        css_vars.append(f"  --grid-gap: {dashboard_info['gap']};")
    
    # Handle columns
    columns = dashboard_info.get('columns', 12)
    css_vars.append(f"  --grid-columns: {columns};")
    
    css_output = ""
    if css_vars:
        css_output += "<style>\n:root {\n" + "\n".join(css_vars) + "\n}\n"
    if additional_css:
        css_output += additional_css
    if css_output:
        css_output += "</style>\n\n"
        return css_output
    return ""

def generate_grid_position_css(position):
    """Generate CSS grid positioning from position config"""
    css_parts = []
    
    # Handle column positioning
    column = position.get('column', 1)
    width = position.get('width', 1)
    
    if width > 1:
        end_column = column + width
        css_parts.append(f'grid-column: {column} / {end_column};')
    else:
        css_parts.append(f'grid-column: {column};')
    
    # Handle row positioning  
    row = position.get('row', 1)
    height = position.get('height', 1)
    
    if height > 1:
        end_row = row + height
        css_parts.append(f'grid-row: {row} / {end_row};')
    else:
        css_parts.append(f'grid-row: {row};')
    
    return ' '.join(css_parts)

def generate_final_css(css_variables, theme_name='dark'):
    """Convert collected CSS variables to final CSS"""
    css_content = ""
    
    if css_variables:
        css_content += "/* Widget and Component CSS - Generated from variables */\n"
        
        # Group variables by type
        widget_vars = {k: v for k, v in css_variables.items() if k.startswith('widget-')}
        group_vars = {k: v for k, v in css_variables.items() if k.startswith('group-')}
        other_vars = {k: v for k, v in css_variables.items() if not k.startswith(('widget-', 'group-'))}
        
        # Generate widget CSS
        if widget_vars:
            css_content += "\n/* Widget Styles */\n"
            for widget_type, styles in widget_vars.items():
                if isinstance(styles, dict) and 'raw_css' in styles:
                    css_content += f"/* {widget_type} */\n"
                    css_content += f"{styles['raw_css']}\n\n"
        
        # Generate group CSS
        if group_vars:
            css_content += "\n/* Group Styles */\n"
            for group_type, styles in group_vars.items():
                if isinstance(styles, dict) and 'raw_css' in styles:
                    css_content += f"/* {group_type} */\n"
                    css_content += f"{styles['raw_css']}\n\n"
        
        # Generate other CSS
        if other_vars:
            css_content += "\n/* Other Styles */\n"
            for var_name, styles in other_vars.items():
                if isinstance(styles, dict) and 'raw_css' in styles:
                    css_content += f"/* {var_name} */\n"
                    css_content += f"{styles['raw_css']}\n\n"
    
    # Wrap CSS in style tags if there's content
    if css_content.strip():
        return f'<style>\n{css_content}\n</style>'
    
    return ""

def generate_final_js(js_functions, theme_name='dark'):
    """Convert collected JS functions to final JavaScript"""
    js_content = ""
    
    if js_functions:
        js_content += "/* Widget and Component JavaScript - Generated from functions */\n"
        
        for function_name in js_functions:
            # Generate standard widget initialization function
            js_content += f"""
// {function_name} Widget JS
function init{function_name.title()}Widget(element, config) {{
  console.log('{function_name.title()} widget initialized:', config);
  
  // Add widget-specific initialization here
  // This can be extended by themes or custom configurations
}}
"""
    
    # Wrap JS in script tags if there's content
    if js_content.strip():
        return f'<script>\n{js_content}\n</script>'
    
    return ""

def render_dashboard(theme_name=None):
    """Render the complete dashboard"""
    
    # Step 4: Load dashboard configuration first to get theme
    dashboard_config = load_dashboard_config_local()
    
    # Get theme from dashboard config if not provided
    if theme_name is None:
        theme_name = dashboard_config.get('dashboard', {}).get('theme', 'dark')
    
    print(f"🚀 Rendering dashboard with {theme_name} theme...")
    
    # Step 1: Copy template to dist
    copy_template_to_dist()
    
    # Generate build timestamp for cache busting
    import time
    build_timestamp = int(time.time() * 1000)  # Milliseconds for more precision
    
    # Step 2: Build theme CSS for all themes
    built_themes = build_all_themes(THEMES_DIR, DIST_DIR)
    
    # Step 2a: Copy theme JS files to dist/js if they have effects-js property
    copy_theme_js_files()
    
    # Set the current theme CSS link
    theme_css = f'<link rel="stylesheet" href="css/theme-{theme_name}.css?v={build_timestamp}">'
    
    # Load theme JS if the current theme has effects-js
    theme_js = ""
    current_theme_config = load_theme_from_renderer(theme_name, THEMES_DIR)
    if current_theme_config and 'effects-js' in current_theme_config:
        js_filename = current_theme_config['effects-js']
        theme_js = f'<script src="js/{js_filename}?v={build_timestamp}"></script>'
    
    # Step 3: Build effects CSS
    effects_css = build_effects_css().replace('css/base-effects.css">', f'css/base-effects.css?v={build_timestamp}">')
    
    # Step 5: Generate grid configuration CSS
    grid_css = generate_grid_css(dashboard_config)
    
    # Step 6: Render widgets (CSS/JS now injected inline)
    widgets_result = render_widgets(dashboard_config)
    widgets_content = widgets_result["html"]
    
    # Step 7: Load index.html template
    index_template_file = DIST_DIR / "index.html"
    with open(index_template_file, 'r') as f:
        template_content = f.read()
    
    # Step 8: Replace placeholders
    template = Template(template_content)
    
    # Get dashboard info
    dashboard_info = dashboard_config.get('dashboard', {})
    title = dashboard_info.get('title', 'Slate Dashboard')
    subtitle = dashboard_info.get('subtitle', 'Personal Dashboard')
    
    # Create footer message with proper HTML formatting
    footer_message = f"""
        <span>&copy; 2025 {title}</span>
        <span class="separator">•</span>
        <span>Built with Slate Dashboard System</span>
        <span class="separator">•</span>
        <span>Theme: <span class="current-theme">{theme_name.title()}</span></span>
    """.strip()
    
    # Generate dynamic theme options for the footer selector
    available_themes = get_available_themes(THEMES_DIR)
    theme_options = []
    for theme_id in available_themes:
        theme_info = get_theme_info(theme_id, THEMES_DIR)
        if theme_info:
            theme_display_name = theme_info['name']
            selected = 'selected' if theme_id == theme_name else ''
            theme_options.append(f'<option value="{theme_id}" {selected}>{theme_display_name}</option>')
        else:
            # Fallback to theme ID as display name
            selected = 'selected' if theme_id == theme_name else ''
            display_name = theme_id.replace('-', ' ').title()
            theme_options.append(f'<option value="{theme_id}" {selected}>{display_name}</option>')
    
    theme_options_html = '\n                            '.join(theme_options)
    
    # Render final HTML
    rendered_html = template.render(
        title=title,
        subtitle=subtitle,
        theme_name=theme_name,
        theme_css=theme_css,
        effects_css=effects_css,
        custom_css=grid_css,
        widgets_content=widgets_content,
        footer_message=footer_message,
        theme_options=theme_options_html,
        effect_manager_js="",
        theme_js=theme_js,
        widget_css="",  # No global widget CSS - all inline now
        widget_js="",   # No global widget JS - all inline now
        build_timestamp=build_timestamp
    )
    
    # Step 9: Write final index.html atomically
    import tempfile
    final_index_file = DIST_DIR / "index.html"
    
    # Write to temp file first, then move to final location to avoid partial reads
    with tempfile.NamedTemporaryFile(mode='w', dir=DIST_DIR, delete=False, suffix='.tmp') as temp_file:
        temp_file.write(rendered_html)
        temp_path = Path(temp_file.name)
    
    # Atomic move to final location
    temp_path.replace(final_index_file)
    
    print(f"✅ Dashboard rendered successfully!")
    print(f"   📄 Output: {final_index_file}")
    print(f"   🌐 Serve with: python3 serve.py")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Slate Dashboard Builder')
    parser.add_argument('--theme', default=None, help='Theme to use (default: read from config)')
    
    args = parser.parse_args()
    
    try:
        render_dashboard(args.theme)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 