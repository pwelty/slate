# Claude Development Notes

## Port Configuration
- **ALWAYS run on port 5173** - never use different ports
- Development server: `npm run dev` should use port 5173
- If port 5173 is in use, fix the issue rather than using an alternative port

## Project Structure
- `/config/config.yaml` - Global dashboard settings (theme, columns, gap, etc.)
- `/config/widgets.yaml` - Widget layout configuration (flat structure)
- `/core/themes/` - Theme definitions with granular font size controls
- `/core/widgets/` - Self-contained widget definitions

## Widget Configuration
- Groups are containers only (no `items:` arrays)
- Widgets reference groups via `group: "group-id"` attribute
- All widgets and groups have flat structure in widgets.yaml
- Position uses intuitive syntax: `row: 1, column: 10, span: 3`

## Theme System
- Individual theme files in `/core/themes/`
- Granular font size controls:
  - `font-size-group-title` - Group header text size
  - `font-size-widget-title` - Widget title text size  
  - `font-size-widget-text` - Default widget content text size