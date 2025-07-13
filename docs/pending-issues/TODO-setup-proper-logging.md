# TODO: Setup Proper Logging System Instead of Print Statements

## Issue Description
The current codebase uses `print()` statements throughout for debugging and status output. This should be replaced with a proper logging system that supports different log levels, structured output, and better control over output destinations.

## Context
- Multiple scripts use `print(f"...")` for status messages
- No centralized logging configuration
- Difficult to control verbosity or filter messages
- No structured logging for debugging or monitoring

## Priority
- [x] Medium (code quality improvement)

## Estimated Effort
- [x] Medium (2-8 hours)

## Implementation Notes
Recommended approach:
1. **Standard Library**: Use Python's built-in `logging` module
2. **Structured Logging**: JSON format for machine-readable logs
3. **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
4. **Centralized Config**: Single logging configuration
5. **Contextual Loggers**: Per-module loggers with context

## Related Files
- `src/scripts/dashboard_renderer.py` (many print statements)
- `src/scripts/test_dashboard.py` (validation output)
- `src/scripts/test_widgets.py` (validation output) 
- `src/scripts/test_themes.py` (validation output)
- `src/scripts/theme_renderer.py` (build output)
- `src/scripts/widget_renderer.py` (build output)

## Acceptance Criteria
- [ ] Replace all `print()` statements with proper logging calls
- [ ] Implement configurable log levels (DEBUG, INFO, WARNING, ERROR)
- [ ] Add structured logging with context (module, function, operation)
- [ ] Support different output formats (console, JSON, file)
- [ ] Maintain backwards compatibility for CI/CD output parsing
- [ ] Add logging configuration file or environment variables
- [ ] Include timestamps and log levels in output
- [ ] Support both human-readable and machine-readable formats

## Technical Approach
1. Create centralized logging configuration
2. Add logger instances to each module
3. Replace print statements systematically:
   - `print(f"✅ Success")` → `logger.info("Operation completed successfully")`
   - `print(f"❌ Error: {e}")` → `logger.error("Operation failed", error=str(e))`
   - `print(f"⚠️ Warning")` → `logger.warning("Potential issue detected")`
4. Add log level configuration via environment variables
5. Test output in CI/CD pipelines
6. Update documentation for logging configuration

## Example Implementation
```python
import logging
import json
from pathlib import Path

# Centralized logger setup
def setup_logging(level=logging.INFO, format="console"):
    if format == "json":
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
    else:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
    
    logging.basicConfig(level=level, handlers=[handler])

# Usage in modules
logger = logging.getLogger(__name__)
logger.info("Dashboard rendering started", theme=theme_name)
logger.error("Validation failed", component=comp_ref, error=str(e))
```