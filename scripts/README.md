# Slate Dashboard - Scripts

This directory contains utility scripts for managing the Slate dashboard project.

## GitHub Issue Creation Scripts

### Prerequisites

1. **GitHub CLI installed**:
   ```bash
   # macOS (using Homebrew)
   brew install gh
   
   # Linux (using apt)
   sudo apt install gh
   
   # Windows (using Chocolatey)
   choco install gh
   ```

2. **GitHub CLI authenticated**:
   ```bash
   gh auth login
   ```

## Quick Start

1. **Test your setup first** (recommended):
   ```bash
   ./scripts/test-labels.sh
   ```

2. **Create critical issues only**:
   ```bash
   ./scripts/create-critical-issues.sh
   ```

3. **Create all v1 issues**:
   ```bash
   ./scripts/create-v1-issues.sh
   ```

### Available Scripts

#### `test-labels.sh` - Setup Verification
Tests GitHub CLI setup and permissions before running the main scripts.

```bash
# Run from project root
./scripts/test-labels.sh
```

**Verifies:**
- GitHub CLI is installed and authenticated
- Repository access permissions
- Label creation capabilities
- Milestone creation via API
- Provides clear error messages if setup is incomplete

#### `create-v1-issues.sh` - Complete Issue Set
Creates all 47 v1 launch issues with proper labels, milestones, and dependencies.

```bash
# Run from project root
./scripts/create-v1-issues.sh
```

**Creates:**
- v1.0 Launch milestone
- 47 comprehensive issues across all priority levels
- Rich metadata and labels:
  - Issue types (epic, task, security, bug, feature)
  - Priorities (critical, high, medium, low)
  - V1 blocker identification (v1-blocker, status:blocked)
  - Effort estimates (small, medium, large, extra-large)
  - Category labels (testing, security, performance, etc.)
- Detailed descriptions with:
  - Impact assessment and current state analysis
  - Goals and acceptance criteria
  - Definition of done checklists
  - Security implications (where applicable)
  - Dependencies between issues

#### `create-critical-issues.sh` - Critical Issues Only
Creates only the 5 most critical v1 launch issues.

```bash
# Run from project root
./scripts/create-critical-issues.sh
```

**Creates:**
- v1.0 Launch milestone
- 5 comprehensive critical priority issues
- Rich metadata for essential v1 blockers:
  - Detailed impact analysis
  - Security implications
  - Current state assessment
  - Clear definition of done
  - Proper categorization and effort estimates

### Manual Import Options

#### JSON Export
The file `v1-launch-issues.json` contains all issues in structured JSON format for:
- Manual GitHub issue creation
- Import into other project management tools
- Custom automation scripts

#### CSV Export
You can convert the JSON to CSV for spreadsheet import:

```bash
# Using jq (install with: brew install jq)
cat v1-launch-issues.json | jq -r '.issues[] | [.title, .priority, (.labels | join("; ")), .body] | @csv' > v1-issues.csv
```

### Usage Examples

#### Create all issues at once:
```bash
./scripts/create-v1-issues.sh
```

#### Create only critical issues first:
```bash
./scripts/create-critical-issues.sh
```

#### Verify issues were created:
```bash
gh issue list --milestone "v1.0 Launch"
```

#### View issues in browser:
```bash
gh issue list --web
```

### Issue Metadata Explained

Each issue is created with comprehensive metadata to help with project management:

#### Issue Types
- **Epic**: Large foundational work (e.g., testing framework setup)
- **Task**: Standard development work (e.g., code cleanup, refactoring)
- **Security**: Security-related hardening and vulnerability fixes
- **Bug**: Issues that need fixing in existing functionality
- **Feature**: New functionality or enhancements
- **Documentation**: Writing or updating documentation

#### Priority Levels
- **Critical**: Must be done for v1 launch (blockers)
- **High**: Important for v1 but not strictly blocking
- **Medium**: Nice to have for v1, can be deferred
- **Low**: Future enhancement, not needed for v1

#### V1 Blocker Identification
- Issues marked as **V1 Blocker** include detailed impact analysis
- Clear explanation of why it blocks the v1 release
- Security, testing, and critical user experience issues are typically blockers

#### Effort Estimates
- **Small**: 1-2 days of work
- **Medium**: 3-5 days of work
- **Large**: 1-2 weeks of work
- **Extra-Large**: 2+ weeks of work

### Script Features

- **Safety checks**: Verifies gh CLI is installed and authenticated
- **Error handling**: Graceful failure if issues already exist
- **Milestone creation**: Automatically creates v1.0 Launch milestone
- **Comprehensive metadata**: Each issue includes:
  - Issue type classification (epic, task, security, bug, feature, documentation)
  - Priority levels (critical, high, medium, low)
  - V1 blocker identification with clear impact assessment
  - Effort estimates (small, medium, large, extra-large)
  - Multiple relevant category labels
- **Rich descriptions**: Each issue includes:
  - Detailed problem analysis and current state
  - Clear goals and success criteria
  - Security implications (where applicable)
  - Step-by-step task breakdowns
  - Definition of done checklists
  - Dependencies and prerequisites
- **Professional formatting**: GitHub-ready markdown with proper structure
- **Color output**: Clear terminal output with color coding and metadata display

### Troubleshooting

#### "gh command not found"
Install GitHub CLI following the prerequisites above.

#### "Not authenticated with GitHub"
Run `gh auth login` and follow the prompts.

#### "Milestone already exists"
This is normal - the script will continue creating issues.

#### "Issue already exists"
GitHub will skip duplicate issues. You can safely re-run the script.

### Customization

To customize the issues:
1. Edit the script files directly
2. Modify the JSON export and create your own import script
3. Create additional scripts for specific issue subsets

### Integration with GitHub Projects

After creating issues, you can add them to GitHub Projects:

```bash
# List available projects
gh project list

# Add issues to a project
gh project item-add PROJECT_ID --url https://github.com/owner/repo/issues/ISSUE_NUMBER
```

### Next Steps

1. Run one of the scripts to create GitHub issues
2. Review and prioritize issues in your GitHub repository
3. Start with the critical issues (testing, logging, security)
4. Use GitHub Projects or milestones to track progress
5. Close issues as you complete the v1 launch tasks

The scripts are designed to give you a complete roadmap for your v1 launch - pick the approach that works best for your workflow! 