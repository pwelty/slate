# Contributing to Slate Dashboard

Thank you for your interest in contributing to Slate Dashboard! This project welcomes contributions from the community.

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or request features
- Check existing issues first to avoid duplicates
- Provide clear reproduction steps for bugs
- Include relevant system information (OS, Python version, browser)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/slate.git
   cd slate
   ```

3. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start development with auto-rebuild:
   ```bash
   python3 scripts/auto-rebuild.py
   # Open http://localhost:5173
   ```

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards below
3. Test your changes thoroughly
4. Commit with clear, descriptive messages
5. Push to your fork and create a pull request

### Coding Standards

- Follow PEP 8 Python style guidelines
- Use meaningful variable and function names
- Add docstrings to new functions and classes
- Keep functions focused and concise
- Handle errors gracefully with appropriate exception handling
- Follow existing patterns in widget definitions and theme files

### Testing

- Test your changes with multiple themes
- Verify widgets work with real API endpoints
- Test responsive design on different screen sizes
- Ensure builds complete successfully
- Test error conditions and edge cases
- Update documentation if needed

### Pull Request Process

1. Ensure your PR has a clear title and description
2. Reference any related issues
3. Update the README if you've added new features
4. Ensure your code follows the project's coding standards
5. Be responsive to feedback during the review process

## Architecture

### Project Structure

- `src/scripts/dashboard_renderer.py` - Main build system
- `src/widgets/` - Widget definitions and templates
- `src/themes/` - Theme configurations
- `config/dashboard.yaml` - Dashboard configuration
- `docs/` - Documentation files

### Adding New Widgets

1. Create a new YAML definition in `src/widgets/`
2. Add corresponding HTML template if needed
3. Include CSS styling in the widget definition
4. Add API integration logic if required
5. Update the README and WIDGET_DEFINITIONS.md
6. Test the widget with multiple themes

### Adding New Themes

1. Create a new YAML file in `src/themes/`
2. Follow the existing theme structure
3. Test with all widget types
4. Update the README with theme information

## Widget Development Guidelines

When creating or updating widgets, ensure they conform to modern widget definitions like the `text` widget:

- Use consistent YAML structure
- Include proper CSS styling
- Support responsive design
- Handle error states gracefully
- Follow the established naming conventions

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and professional in all interactions
- Focus on constructive feedback and collaboration
- Help maintain a welcoming environment for all contributors

## Questions?

Feel free to open an issue for questions about contributing or join discussions in existing issues.