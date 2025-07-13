# CI/CD Pipeline Documentation

## Overview

Slate Dashboard uses GitHub Actions for automated testing, validation, and deployment. The CI/CD pipeline ensures code quality, prevents broken configurations from being deployed, and maintains consistent build processes.

## Pipeline Components

### 1. Validation Pipeline (`.github/workflows/validation.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests, Manual dispatch

**Jobs:**
- **validate-configuration**: Validates YAML configs, widget definitions, themes
- **validate-build**: Tests build process and CSS rendering
- **lint-and-format**: Code quality checks with flake8, black, isort
- **security-scan**: Vulnerability scanning with Trivy and TruffleHog

**Key Features:**
- ✅ Validates all dashboard configurations before build
- ✅ Tests widget schema compliance
- ✅ Validates CSS syntax with cssutils
- ✅ Checks for security vulnerabilities
- ✅ Automatic Python code formatting validation

### 2. Pull Request Checks (`.github/workflows/pr-checks.yml`)

**Triggers:** PR opened/updated against `main`/`develop`

**Jobs:**
- **validate-changes**: Smart validation of only changed files
- **preview-build**: Generates preview artifacts for testing
- **test-multiple-themes**: Matrix testing across all themes

**Key Features:**
- 🎯 Only validates files that changed (performance optimization)
- 📦 Generates downloadable preview builds
- 🤖 Automatic PR comments with build status
- 🎨 Tests all themes in parallel

### 3. Release Pipeline (`.github/workflows/release.yml`)

**Triggers:** Version tags (`v*`), GitHub releases

**Jobs:**
- **validate-and-build**: Full validation suite + production build
- **docker-build**: Containerized deployment (optional)

**Key Features:**
- 🏗️ Full production build with all themes
- 📦 Release artifacts and Docker images
- 📋 Automated build reports
- 🚀 Ready-to-deploy packages

## Local Development

### Pre-commit Hooks

Install pre-commit hooks to run validations automatically:

```bash
pip install pre-commit
pre-commit install
```

**What gets validated on commit:**
- YAML syntax checking
- Python code formatting (black, isort)
- Python linting (flake8)
- Dashboard configuration validation
- Widget/theme validation (only for changed files)

### Manual Validation

Run all validations locally:

```bash
# Run all validations
./scripts/validate-all.sh

# Run individual validations
source venv/bin/activate
python src/scripts/test_dashboard.py
python src/scripts/test_widgets.py
python src/scripts/test_themes.py
```

### Build with Validation

The build process now includes automatic validation:

```bash
# Build with validation (recommended)
python src/scripts/dashboard_renderer.py

# Skip validation (development only)
python src/scripts/dashboard_renderer.py --skip-validation
```

## Configuration Files

### Required Dependencies

The pipeline automatically installs:
- `pyyaml` - YAML parsing and validation
- `cssutils` - CSS validation and linting
- `tinycss2` - Lightweight CSS parsing (fallback)

### Environment Variables

- `SLATE_THEME` - Override default theme for builds
- `GITHUB_TOKEN` - Automatic (for release uploads)

## Validation Rules

### Dashboard Configuration
- ✅ Valid YAML syntax
- ✅ Required sections: `dashboard`, `components`
- ✅ Theme references exist
- ✅ Grid positioning conflicts
- ✅ Widget instance schema compliance

### Widget Definitions
- ✅ Valid YAML syntax and structure
- ✅ Required metadata fields
- ✅ Schema type validation
- ✅ Template syntax (Jinja2)
- ✅ CSS syntax validation
- ✅ Inheritance chain validation

### Theme Definitions
- ✅ V2 structured format compliance
- ✅ Color format validation
- ✅ Typography consistency
- ✅ Rendered CSS validation
- ✅ CSS variable usage

## Workflow Examples

### Feature Development
1. Create feature branch: `git checkout -b feature/new-widget`
2. Make changes to widgets/themes/config
3. Run local validation: `./scripts/validate-all.sh`
4. Commit changes (pre-commit hooks run automatically)
5. Push branch and create PR
6. PR checks run automatically
7. Download preview build from PR comments
8. Review and merge

### Hotfix Process
1. Create hotfix branch: `git checkout -b hotfix/critical-fix`
2. Make minimal changes
3. Validate: `./scripts/validate-all.sh`
4. Create PR with `[HOTFIX]` prefix
5. Fast-track review and merge
6. Tag release if needed

### Release Process
1. Update version numbers
2. Create release tag: `git tag v1.2.3`
3. Push tag: `git push origin v1.2.3`
4. GitHub release pipeline runs automatically
5. Download release artifacts from GitHub Releases

## Troubleshooting

### Validation Failures
```bash
# Check specific validation
python src/scripts/test_dashboard.py  # Dashboard config issues
python src/scripts/test_widgets.py   # Widget schema problems
python src/scripts/test_themes.py    # Theme validation errors
```

### Build Failures
```bash
# Build with verbose output
python src/scripts/dashboard_renderer.py --skip-validation
# Check dist/ directory for partial builds
ls -la dist/
```

### CSS Validation Issues
```bash
# Install proper CSS validator
pip install cssutils

# Check CSS syntax manually
python -c "import cssutils; cssutils.parseString(open('dist/css/theme-paper.css').read())"
```

## Security Considerations

### Automated Security Scanning
- **Trivy**: Scans for known vulnerabilities in dependencies
- **TruffleHog**: Detects exposed secrets and credentials
- **SARIF Upload**: Results sent to GitHub Security tab

### Safe Configuration
- ❌ Never commit API keys or secrets
- ✅ Use environment variables for sensitive data
- ✅ Validate all user-provided configurations
- ✅ Sanitize template variables

## Performance Optimizations

### Smart Validation
- Only validates changed files in PRs
- Parallel theme testing
- Cached dependencies in CI

### Build Optimizations
- CSS minification in production
- Asset compression
- Cache-busting timestamps

## Monitoring

### Success Metrics
- ✅ All validation tests pass
- ✅ Build artifacts generated successfully
- ✅ No security vulnerabilities detected
- ✅ Code quality standards met

### Failure Alerts
- ❌ Validation failures block PR merges
- ❌ Build failures prevent releases
- ❌ Security issues require immediate attention

---

## Next Steps

1. **TODO**: Fix interstitial `{{ }}` visible in live server during builds
2. **Enhancement**: Add visual regression testing for themes
3. **Enhancement**: Automated performance testing
4. **Enhancement**: Integration with external monitoring tools