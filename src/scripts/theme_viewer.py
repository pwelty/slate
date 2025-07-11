#!/usr/bin/env python3
"""
Theme Viewer Generator
Generates HTML files that showcase all the values and styling for each theme
"""

import yaml
import os
from pathlib import Path
from jinja2 import Template

def load_theme(theme_path):
    """Load theme YAML file"""
    with open(theme_path, 'r') as f:
        return yaml.safe_load(f)

def generate_theme_viewer(theme_name, theme_data, output_dir):
    """Generate an HTML viewer for a theme"""
    
    template_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ theme_name }} Theme Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: {{ colors.primary if colors.primary else '#000000' }};
            color: {{ colors.text if colors.text else '#ffffff' }};
            line-height: 1.6;
            padding: 2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: {{ colors.secondary if colors.secondary else '#111111' }};
            border-radius: 1rem;
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
        }
        
        .theme-title {
            font-size: 3rem;
            color: {{ colors.accent if colors.accent else '#3b82f6' }};
            margin-bottom: 0.5rem;
            font-weight: {{ typography.get('weight-bold', '600') if typography else '600' }};
        }
        
        .theme-description {
            font-size: 1.2rem;
            color: {{ colors.get('text-secondary', colors.text) if colors else '#cccccc' }};
            opacity: 0.8;
        }
        
        .section {
            margin-bottom: 3rem;
            padding: 2rem;
            background: {{ colors.secondary if colors.secondary else '#111111' }};
            border-radius: 1rem;
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
        }
        
        .section-title {
            font-size: 2rem;
            color: {{ colors.accent if colors.accent else '#3b82f6' }};
            margin-bottom: 1.5rem;
            border-bottom: 2px solid {{ colors.accent if colors.accent else '#3b82f6' }};
            padding-bottom: 0.5rem;
        }
        
        .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .color-item {
            background: {{ colors.tertiary if colors.tertiary else '#222222' }};
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
        }
        
        .color-swatch {
            width: 100%;
            height: 60px;
            border-radius: 0.25rem;
            margin-bottom: 0.5rem;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .color-name {
            font-weight: 600;
            color: {{ colors.accent if colors.accent else '#3b82f6' }};
        }
        
        .color-value {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9rem;
            opacity: 0.8;
            color: {{ colors.get('text-secondary', colors.text) if colors else '#cccccc' }};
        }
        
        .typography-demo {
            display: grid;
            gap: 1.5rem;
        }
        
        .typography-item {
            background: {{ colors.tertiary if colors.tertiary else '#222222' }};
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
        }
        
        .demo-text {
            margin-bottom: 0.5rem;
        }
        
        .demo-large {
            font-size: {{ typography.get('size-xl', '1.25rem') if typography else '1.25rem' }};
            font-weight: {{ typography.get('weight-bold', '600') if typography else '600' }};
        }
        
        .demo-medium {
            font-size: {{ typography.get('size-large', '1.125rem') if typography else '1.125rem' }};
            font-weight: {{ typography.get('weight-medium', '500') if typography else '500' }};
        }
        
        .demo-small {
            font-size: {{ typography.get('size-small', '0.875rem') if typography else '0.875rem' }};
            font-weight: {{ typography.get('weight-normal', '400') if typography else '400' }};
        }
        
        .spacing-demo {
            display: grid;
            gap: 1rem;
        }
        
        .spacing-item {
            background: {{ colors.tertiary if colors.tertiary else '#222222' }};
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .spacing-bar {
            background: {{ colors.accent if colors.accent else '#3b82f6' }};
            height: 20px;
            border-radius: 0.25rem;
        }
        
        .effects-demo {
            display: grid;
            gap: 1rem;
        }
        
        .effect-item {
            background: {{ colors.tertiary if colors.tertiary else '#222222' }};
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
            transition: all 0.3s ease;
        }
        
        .effect-item:hover {
            transform: {{ effects.get('hover-lift', 'translateY(-2px)') if effects else 'translateY(-2px)' }};
            box-shadow: {{ effects.get('hover-shadow', '0 4px 12px rgba(0,0,0,0.3)') if effects else '0 4px 12px rgba(0,0,0,0.3)' }};
        }
        
        .widget-preview {
            background: {{ colors.secondary if colors.secondary else '#111111' }};
            border: 1px solid {{ colors.border if colors.border else 'rgba(255,255,255,0.1)' }};
            border-radius: 0.5rem;
            padding: 1.5rem;
            transition: all 0.3s ease;
        }
        
        .widget-preview:hover {
            transform: {{ effects.get('hover-lift', 'translateY(-2px)') if effects else 'translateY(-2px)' }};
            box-shadow: {{ effects.get('hover-shadow', '0 4px 12px rgba(0,0,0,0.3)') if effects else '0 4px 12px rgba(0,0,0,0.3)' }};
            border-color: {{ colors.accent if colors.accent else '#3b82f6' }};
        }
        
        .widget-title {
            color: {{ colors.accent if colors.accent else '#3b82f6' }};
            font-size: 1.3rem;
            font-weight: {{ typography.get('weight-medium', '500') if typography else '500' }};
            margin-bottom: 1rem;
        }
        
        .widget-content {
            color: {{ colors.text if colors.text else '#ffffff' }};
            line-height: 1.6;
        }
        
        .code {
            font-family: 'Monaco', 'Consolas', monospace;
            background: {{ colors.primary if colors.primary else '#000000' }};
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="theme-title">{{ theme_name }}</h1>
            <p class="theme-description">{{ description or "Theme preview and documentation" }}</p>
        </div>
        
        {% if colors %}
        <div class="section">
            <h2 class="section-title">Colors</h2>
            <div class="color-grid">
                {% for color_name, color_value in colors.items() %}
                <div class="color-item">
                    <div class="color-swatch" style="background-color: {{ color_value }};"></div>
                    <div class="color-name">{{ color_name }}</div>
                    <div class="color-value">{{ color_value }}</div>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}
        
        {% if typography %}
        <div class="section">
            <h2 class="section-title">Typography</h2>
            <div class="typography-demo">
                <div class="typography-item">
                    <div class="demo-text demo-large">Large Text ({{ typography.get('size-xl', '1.25rem') }})</div>
                    <div class="code">font-family: {{ typography.get('family', 'Inter') }}</div>
                </div>
                <div class="typography-item">
                    <div class="demo-text demo-medium">Medium Text ({{ typography.get('size-large', '1.125rem') }})</div>
                    <div class="code">font-weight: {{ typography.get('weight-medium', '500') }}</div>
                </div>
                <div class="typography-item">
                    <div class="demo-text demo-small">Small Text ({{ typography.get('size-small', '0.875rem') }})</div>
                    <div class="code">font-weight: {{ typography.get('weight-normal', '400') }}</div>
                </div>
                {% if typography.get('mono-family') %}
                <div class="typography-item">
                    <div class="demo-text" style="font-family: {{ typography.get('mono-family') }};">Monospace Text</div>
                    <div class="code">font-family: {{ typography.get('mono-family') }}</div>
                </div>
                {% endif %}
            </div>
        </div>
        {% endif %}
        
        {% if spacing %}
        <div class="section">
            <h2 class="section-title">Spacing</h2>
            <div class="spacing-demo">
                {% for spacing_name, spacing_value in spacing.items() %}
                <div class="spacing-item">
                    <div class="spacing-bar" style="width: {{ spacing_value }};"></div>
                    <div>
                        <div class="color-name">{{ spacing_name }}</div>
                        <div class="color-value">{{ spacing_value }}</div>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}
        
        {% if effects %}
        <div class="section">
            <h2 class="section-title">Effects</h2>
            <div class="effects-demo">
                {% for effect_name, effect_value in effects.items() %}
                <div class="effect-item">
                    <div class="color-name">{{ effect_name }}</div>
                    <div class="color-value">{{ effect_value }}</div>
                    <div style="margin-top: 0.5rem; opacity: 0.7;">Hover to see effect</div>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}
        
        <div class="section">
            <h2 class="section-title">Widget Preview</h2>
            <div class="widget-preview">
                <h3 class="widget-title">Sample Widget</h3>
                <div class="widget-content">
                    This is how a widget would look with this theme applied. 
                    You can see the colors, typography, and hover effects in action.
                    <br><br>
                    Hover over this widget to see the transition effects.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    """
    
    template = Template(template_html)
    html_content = template.render(
        theme_name=theme_data.get('name', theme_name),
        description=theme_data.get('description', ''),
        colors=theme_data.get('colors', {}),
        typography=theme_data.get('typography', {}),
        spacing=theme_data.get('spacing', {}),
        effects=theme_data.get('effects', {})
    )
    
    output_file = output_dir / f"{theme_name}.html"
    with open(output_file, 'w') as f:
        f.write(html_content)
    
    return output_file

def main():
    """Generate theme viewers for all themes"""
    script_dir = Path(__file__).parent
    themes_dir = script_dir.parent / 'themes'
    output_dir = script_dir.parent.parent / 'theme-views'
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    print("🎨 Generating theme viewers...")
    
    # Process each theme file
    generated_files = []
    for theme_file in themes_dir.glob('*.yaml'):
        if theme_file.name == 'theme-switcher.js':
            continue
            
        theme_name = theme_file.stem
        print(f"   📄 Processing {theme_name}...")
        
        try:
            theme_data = load_theme(theme_file)
            output_file = generate_theme_viewer(theme_name, theme_data, output_dir)
            generated_files.append(output_file)
            print(f"   ✓ Generated: {output_file}")
        except Exception as e:
            print(f"   ❌ Error processing {theme_name}: {e}")
    
    print(f"\n✅ Generated {len(generated_files)} theme viewers in: {output_dir}")
    print("\n📁 Generated files:")
    for file in generated_files:
        print(f"   - {file.name}")
    
    print(f"\n🌐 Open any file in your browser to view the theme preview!")

if __name__ == "__main__":
    main()