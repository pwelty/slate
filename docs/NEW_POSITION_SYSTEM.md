# New Position System Documentation

## Overview

The dashboard now uses a **standard CSS Grid position system** with intuitive `row`, `column`, `width`, and `height` properties. This provides complete layout control with natural, easy-to-understand syntax.

## Standard Position Format

```yaml
position:
  row: 1        # Which row to start at (1, 2, 3, etc.) - Default: 1
  column: 1     # Which column to start at (1-12) - Default: 1
  width: 6      # How many columns to span - Default: 1
  height: 1     # How many rows to span - Default: 1
```

**Default Values:**
- If no position is specified: `row: 1, column: 1, width: 1, height: 1`
- All properties are optional and will use sensible defaults
- Minimal configuration: just specify what you want to change from defaults

## CSS Grid Translation

The system translates directly to standard CSS Grid:

**Your YAML:**
```yaml
position:
  row: 2
  column: 3
  width: 4
  height: 2
```

**Generated CSS:**
```css
grid-row: 2 / 4;      /* row 2, height 2 = "2 / 4" */
grid-column: 3 / 7;   /* column 3, width 4 = "3 / 7" */
```

## Grid Layout (12-column system)

```
+---+---+---+---+---+---+---+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12|
+---+---+---+---+---+---+---+---+---+---+---+---+
```

## Widget Examples

### Header Layout
```yaml
# Logo - small left
- id: "logo"
  position: { row: 1, column: 1, width: 2 }

# Status - center  
- id: "status"
  position: { row: 1, column: 7, width: 3 }

# Clock - right
- id: "clock"
  position: { row: 1, column: 10, width: 3 }
```

### Two-Column Layout
```yaml
# Left column (half width)
- id: "left-content"
  position: { row: 2, column: 1, width: 6 }

# Right column (half width)
- id: "right-content"
  position: { row: 2, column: 7, width: 6 }
```

### Three-Column Layout
```yaml
# Left (1/3 width)
- position: { row: 1, column: 1, width: 4 }

# Center (1/3 width)
- position: { row: 1, column: 5, width: 4 }

# Right (1/3 width)
- position: { row: 1, column: 9, width: 4 }
```

### Full-Width Components
```yaml
# Full width header
- position: { row: 1, column: 1, width: 12 }

# Full width footer
- position: { row: 5, column: 1, width: 12 }
```

### Multi-Row Spanning
```yaml
# Tall sidebar (spans 3 rows)
- position: { row: 1, column: 10, width: 3, height: 3 }

# Main content area (spans 2 rows)
- position: { row: 1, column: 1, width: 9, height: 2 }
```

### Minimal Configuration Examples

```yaml
# Just specify what you want to change from defaults

# Widget at default position (row 1, column 1, 1 column wide)
- id: "simple-widget"
  # No position needed - uses defaults: row: 1, column: 1, width: 2, height: 1

# Widget positioned at column 3
- id: "second-widget"
  position: { column: 3 }      # Uses defaults: row: 1, width: 2, height: 1

# Wide widget
- id: "wide-widget"  
  position: { width: 6 }       # Uses defaults: row: 1, column: 1, height: 1

# Widget positioned at row 2
- id: "second-row-widget"
  position: { row: 2 }         # Uses defaults: column: 1, width: 2, height: 1

# Widget with height 2
- id: "tall-widget"
  position: { height: 2 }      # Uses defaults: row: 1, column: 1, width: 2
```

## Group Internal Layout

Groups automatically flow their items **left-to-right** based on **individual item widths**, wrapping when the total width exceeds the group's width.

### Item Width System

**Each item within a group can have its own width:**

```yaml
- id: "my-group"
  type: "group"
  position: { row: 2, width: 8 }    # Group is 8 columns wide
  items:
    - type: "link"
      name: "Small Link"
      width: 1                      # Takes 1/8 of group width
      
    - type: "link" 
      name: "Medium Link"
      width: 2                      # Takes 2/8 of group width
      
    - type: "link"
      name: "Large Link" 
      width: 3                      # Takes 3/8 of group width
      
    - type: "link"
      name: "Another Small"
      # No width specified = defaults to 1
```

**Layout Result:**
- **Row 1**: Small(1) + Medium(2) + Large(3) = 6/8 columns used
- **Row 2**: Another Small(1) = 1/8 columns used
- Items wrap when total width would exceed group width

### Width Calculation

**Formula:** `item_width / group_width * 100%`

**Examples:**
- Item width 1 in group width 6 = `1/6 * 100% = 16.666%`
- Item width 2 in group width 8 = `2/8 * 100% = 25%`  
- Item width 3 in group width 12 = `3/12 * 100% = 25%`

### Advanced Group Layouts

**Equal Width Items (Default):**
```yaml
- id: "equal-items"
  position: { width: 6 }
  items:
    - type: "link"
      name: "Link 1"         # width: 1 (default)
    - type: "link" 
      name: "Link 2"         # width: 1 (default)
    - type: "link"
      name: "Link 3"         # width: 1 (default)
```
Result: All 6 items fit on one row (each 1/6 width)

**Mixed Width Items:**
```yaml
- id: "mixed-items"
  position: { width: 8 }
  items:
    - type: "link"
      name: "Main Action"
      width: 4               # Takes half the group width
    - type: "link"
      name: "Secondary"  
      width: 2               # Takes 1/4 group width  
    - type: "link"
      name: "Small"
      width: 1               # Takes 1/8 group width
    - type: "link"
      name: "Another Small"
      width: 1               # Takes 1/8 group width, wraps to next row
```
Result: 
- Row 1: Main(4) + Secondary(2) + Small(1) = 7/8 used
- Row 2: Another Small(1) = 1/8 used

**Responsive Dashboard Layout:**
```yaml
- id: "responsive-toolbar"
  position: { width: 12 }    # Full width
  items:
    - type: "link"
      name: "Logo"
      width: 2               # Logo area
    - type: "link" 
      name: "Search"
      width: 6               # Main search takes most space
    - type: "link"
      name: "Profile"
      width: 2               # Profile area
    - type: "link"
      name: "Settings"
      width: 2               # Settings area
```
Result: Perfect toolbar layout with proportional spacing

## Group Internal Layout

Groups automatically flow their items **left-to-right** and **wrap to the next line** when the group's width is reached.

### Group Layout Rules

**Narrow Groups (1-3 columns):**
- Items stack **vertically** (1 per row)
- Best for sidebar-style layouts

**Medium Groups (4-6 columns):**
- Items flow **2 per row**, then wrap
- Good for balanced layouts

**Wide Groups (7-12 columns):**
- Items flow **3 per row**, then wrap
- Best for full-width content areas

### Example Group Layouts

**Narrow Group (3 columns wide):**
```yaml
- id: "sidebar"
  type: "group"
  position: { row: 1, column: 10, width: 3 }
  items:
    - type: "link"
      name: "Link 1"
    - type: "link"  
      name: "Link 2"
    - type: "link"
      name: "Link 3"
```

**Result:** Items stack vertically (1 per row)

**Medium Group (6 columns wide):**
```yaml
- id: "main-links"
  type: "group"
  position: { row: 2, column: 1, width: 6 }
  items:
    - type: "link"
      name: "Link 1"
    - type: "link"
      name: "Link 2"
    - type: "link"
      name: "Link 3"
    - type: "link"
      name: "Link 4"
```

**Result:** 2 items per row, wraps to next line

**Wide Group (12 columns wide):**
```yaml
- id: "full-width-grid"
  type: "group"
  position: { row: 3, column: 1, width: 12 }
  items:
    - type: "link"
      name: "Link 1"
    - type: "link"
      name: "Link 2"
    - type: "link"
      name: "Link 3"
    - type: "link"
      name: "Link 4"
    - type: "link"
      name: "Link 5"
    - type: "link"
      name: "Link 6"
```

**Result:** 3 items per row, wraps to next line

## Advanced Layouts

### Complex Dashboard
```yaml
components:
  # Header - full width
  - id: "header"
    position: { row: 1, column: 1, width: 12 }
    
  # Main content - 2/3 width, 2 rows tall
  - id: "main"
    position: { row: 2, column: 1, width: 8, height: 2 }
    
  # Sidebar - 1/3 width, 2 rows tall
  - id: "sidebar"
    position: { row: 2, column: 9, width: 4, height: 2 }
    
  # Footer - full width
  - id: "footer"
    position: { row: 4, column: 1, width: 12 }
```

### Grid-Based Layout
```yaml
# 2x2 grid of equal-sized widgets
- position: { row: 1, column: 1, width: 6 }    # Top-left
- position: { row: 1, column: 7, width: 6 }    # Top-right
- position: { row: 2, column: 1, width: 6 }    # Bottom-left
- position: { row: 2, column: 7, width: 6 }    # Bottom-right
```

### Asymmetric Layout
```yaml
# Large main widget
- position: { row: 1, column: 1, width: 8, height: 2 }

# Small widgets on the right
- position: { row: 1, column: 9, width: 4, height: 1 }
- position: { row: 2, column: 9, width: 2, height: 1 }
- position: { row: 2, column: 11, width: 2, height: 1 }
```

## Benefits

✅ **Intuitive**: `row`, `column`, `width`, `height` are natural concepts  
✅ **Standard**: Maps directly to CSS Grid  
✅ **Flexible**: Supports any layout arrangement  
✅ **Responsive**: Group items automatically adapt to container width  
✅ **Backward Compatible**: Still supports old `span` and `"1 / 7"` formats  

## Migration

The old format still works for backward compatibility:

**Old Format:**
```yaml
position:
  row: 1
  column: "1 / 7"    # or column: 1, span: 6
```

**New Format:**
```yaml
position:
  row: 1
  column: 1
  width: 6
  height: 1
```

Both generate the same CSS, but the new format is more intuitive and powerful! 