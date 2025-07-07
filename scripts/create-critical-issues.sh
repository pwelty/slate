#!/bin/bash

# Script to create CRITICAL v1 launch issues in GitHub
# Prerequisites: 
# - GitHub CLI installed (gh)
# - Authenticated with GitHub (gh auth login)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating Critical v1 Launch Issues for Slate Dashboard${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is not installed. Please install it first.${NC}"
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Not authenticated with GitHub. Please run: gh auth login${NC}"
    exit 1
fi

# Create labels first
echo -e "${GREEN}Creating labels if they don't exist...${NC}"
create_labels() {
    # Issue type labels
    gh label create "type:epic" --description "Large foundational work" --color "8A2BE2" || true
    gh label create "type:task" --description "Standard development work" --color "0075CA" || true
    gh label create "type:security" --description "Security-related work" --color "B60205" || true
    gh label create "type:bug" --description "Something isn't working" --color "D73A4A" || true
    gh label create "type:feature" --description "New feature or enhancement" --color "0E8A16" || true
    gh label create "type:documentation" --description "Documentation work" --color "5319E7" || true
    
    # Priority labels
    gh label create "priority:critical" --description "Must be done for v1" --color "B60205" || true
    gh label create "priority:high" --description "Important for v1" --color "D93F0B" || true
    gh label create "priority:medium" --description "Nice to have for v1" --color "FBCA04" || true
    gh label create "priority:low" --description "Future enhancement" --color "0E8A16" || true
    
    # Status labels
    gh label create "v1-blocker" --description "Blocks v1 release" --color "B60205" || true
    gh label create "status:blocked" --description "Cannot proceed" --color "6F42C1" || true
    
    # Effort labels
    gh label create "effort:small" --description "1-2 days" --color "C2E0C6" || true
    gh label create "effort:medium" --description "3-5 days" --color "FEF2C0" || true
    gh label create "effort:large" --description "1-2 weeks" --color "F9D0C4" || true
    gh label create "effort:extra-large" --description "2+ weeks" --color "D73A4A" || true
    
    # Category labels
    gh label create "testing" --description "Testing related" --color "1D76DB" || true
    gh label create "security" --description "Security related" --color "B60205" || true
    gh label create "production" --description "Production deployment" --color "0E8A16" || true
    gh label create "error-handling" --description "Error handling improvements" --color "D93F0B" || true
    gh label create "code-quality" --description "Code quality improvements" --color "0075CA" || true
    gh label create "refactoring" --description "Code refactoring" --color "FBCA04" || true
    gh label create "architecture" --description "Architecture changes" --color "5319E7" || true
    gh label create "ux" --description "User experience" --color "F9D0C4" || true
    gh label create "performance" --description "Performance improvements" --color "0E8A16" || true
    gh label create "optimization" --description "Optimization work" --color "C2E0C6" || true
    gh label create "validation" --description "Input/config validation" --color "1D76DB" || true
    gh label create "infrastructure" --description "Infrastructure setup" --color "6F42C1" || true
    gh label create "logging" --description "Logging improvements" --color "FBCA04" || true
}

create_labels

# Try to create milestone (may not be supported in all GH CLI versions)
echo -e "${GREEN}Creating v1.0 milestone...${NC}"
gh api repos/:owner/:repo/milestones -f title="v1.0 Launch" -f description="Critical items for v1.0 production release" || echo "Milestone creation failed or already exists"

# Function to create an issue with comprehensive metadata
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local issue_type="$4"
    local priority="$5"
    local is_blocker="$6"
    local estimated_effort="$7"
    
    # Build comprehensive label set
    local all_labels="$labels"
    if [ "$issue_type" != "" ]; then
        all_labels="$all_labels,type:$issue_type"
    fi
    if [ "$priority" != "" ]; then
        all_labels="$all_labels,priority:$priority"
    fi
    if [ "$is_blocker" = "true" ]; then
        all_labels="$all_labels,v1-blocker,status:blocked"
    fi
    if [ "$estimated_effort" != "" ]; then
        all_labels="$all_labels,effort:$estimated_effort"
    fi
    
    echo -e "${GREEN}Creating issue: $title${NC}"
    echo -e "${BLUE}  Type: $issue_type | Priority: $priority | Blocker: $is_blocker | Effort: $estimated_effort${NC}"
    
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$all_labels"
}

# Critical Priority Issues Only
echo -e "${BLUE}Creating Critical Priority Issues...${NC}"

create_issue "🧪 Create comprehensive testing strategy and implement automated tests" \
"## Description
Set up testing framework and implement comprehensive test coverage for the Slate dashboard.

## Issue Type
Epic - Large foundational work that enables other testing tasks

## Impact
**V1 Blocker** - Cannot ship v1 without proper testing in place

## Current State
- No automated testing framework
- No test coverage reporting
- No CI integration for testing
- Manual testing only

## Goals
- Establish robust testing foundation
- Enable automated testing in CI/CD
- Provide clear testing guidelines for contributors
- Achieve baseline test coverage

## Tasks
- [ ] Choose testing framework (Jest/Vitest recommended for Vite compatibility)
- [ ] Set up test configuration and environment
- [ ] Create test utilities and helpers
- [ ] Set up test scripts in package.json
- [ ] Create testing documentation and guidelines
- [ ] Configure coverage reporting
- [ ] Set up CI integration hooks

## Acceptance Criteria
- Testing framework is installed and configured
- Test scripts can be run with npm commands (npm test, npm run test:watch)
- Coverage reporting works and shows baseline metrics
- Documentation exists for writing tests
- CI integration is prepared and working
- Other team members can easily run tests

## Priority
Critical - Required for v1 launch

## Dependencies
None - this enables other testing tasks

## Definition of Done
- [ ] Framework chosen and documented
- [ ] Configuration files committed
- [ ] Test scripts work in package.json
- [ ] Documentation written and reviewed
- [ ] CI integration tested
- [ ] Coverage reporting functional" \
"testing,infrastructure" \
"epic" \
"critical" \
"true" \
"large"

create_issue "📝 Remove/replace console.log statements with proper logging for production" \
"## Description
Clean up development console.log statements and implement proper logging for production.

## Issue Type
Task - Code cleanup and production hardening

## Impact
**V1 Blocker** - Security vulnerability and unprofessional user experience

## Current State
- 50+ console.log statements throughout codebase
- No production logging strategy
- Debug information exposed to users in production
- Potential information leakage

## Security Implications
- Console.log statements can expose sensitive information
- Debug logs in production create security vulnerabilities
- No audit trail for production errors

## Tasks
- [ ] Audit all console.log statements across codebase
- [ ] Choose and implement proper logging library (winston, pino, etc.)
- [ ] Replace debug logs with appropriate logging levels
- [ ] Add production-safe error logging
- [ ] Create logging configuration (dev vs prod)
- [ ] Test logging in production environment

## Acceptance Criteria
- No console.log statements in production build
- Proper logging levels implemented (error, warn, info, debug)
- Error tracking available for debugging
- Logging configuration documented
- Production logs don't expose sensitive information

## Priority
Critical - Security and production readiness" \
"production,security,logging" \
"task" \
"critical" \
"true" \
"medium"

create_issue "🛡️ Improve error handling and user feedback across all widgets and core systems" \
"## Description
Standardize error handling patterns and improve user feedback when things go wrong.

## Issue Type
Task - Code improvement and user experience enhancement

## Impact
**V1 Blocker** - Poor error handling creates bad user experience and makes debugging difficult

## Current Issues
- Inconsistent error handling patterns across widgets
- Some widgets fail silently with no user feedback
- Generic error messages that don't help users
- No retry mechanisms for transient failures

## Tasks
- [ ] Audit current error handling across all widgets
- [ ] Create standardized error handling patterns/utilities
- [ ] Implement user-friendly error messages with context
- [ ] Add retry mechanisms where appropriate (API calls, etc.)
- [ ] Create error boundary components for React-like error handling

## Acceptance Criteria
- All widgets handle errors gracefully
- Users get helpful, actionable error messages
- Retry mechanisms work correctly for transient failures
- Error patterns are documented and standardized

## Priority
Critical - User experience" \
"error-handling,ux,code-quality" \
"task" \
"critical" \
"true" \
"large"

create_issue "🔒 Implement input validation, secure API key handling, and CSP headers" \
"## Description
Harden security by implementing proper input validation, secure API key management, and Content Security Policy headers.

## Issue Type
Security - Critical security hardening for production

## Impact
**V1 Blocker** - Security vulnerabilities must be addressed before public release

## Security Gaps Analysis
- User input not validated or sanitized (XSS risk)
- API keys stored in plain text in configuration files
- No Content Security Policy headers (XSS protection)
- No rate limiting for API calls (DoS vulnerability)

## Tasks
- [ ] Implement input validation for all user inputs (URLs, text, etc.)
- [ ] Secure API key storage and handling (environment variables, encryption)
- [ ] Add Content Security Policy headers
- [ ] Implement XSS protection and output sanitization
- [ ] Add rate limiting for external API calls
- [ ] Security audit of all endpoints and user inputs

## Acceptance Criteria
- All inputs are validated and sanitized
- API keys are properly secured (not in plain text)
- CSP headers are configured and tested
- Security audit passes with no critical findings

## Priority
Critical - Security is essential for v1" \
"security,validation,production" \
"security" \
"critical" \
"true" \
"large"

create_issue "🔄 Consolidate duplicate widgets between core/ and src/scripts/widgets/ directories" \
"## Description
Remove code duplication by consolidating widgets that exist in both directories.

## Issue Type
Task - Code refactoring and architecture cleanup

## Impact
**V1 Blocker** - Code duplication creates maintenance issues and potential bugs

## Current State
- Widgets duplicated in core/ and src/scripts/widgets/
- Potential for version conflicts between duplicates
- Maintenance burden - changes need to be made in multiple places

## Tasks
- [ ] Audit all widget files for duplicates
- [ ] Determine canonical location for each widget type
- [ ] Update imports and references throughout codebase
- [ ] Remove duplicate files
- [ ] Update documentation and architecture diagrams

## Acceptance Criteria
- No duplicate widget implementations exist
- All widgets load correctly from canonical locations
- Build process updated and working
- Documentation reflects new widget architecture

## Priority
High - Code quality and maintainability" \
"code-quality,refactoring,architecture" \
"task" \
"high" \
"true" \
"medium"

echo -e "${GREEN}Critical v1 launch issues created successfully!${NC}"

# Get repo info
REPO_INFO=$(gh repo view --json owner,name)
if [ $? -eq 0 ]; then
    OWNER=$(echo "$REPO_INFO" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
    NAME=$(echo "$REPO_INFO" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo -e "${BLUE}View issues at: https://github.com/$OWNER/$NAME/issues${NC}"
    echo -e "${BLUE}View milestones at: https://github.com/$OWNER/$NAME/milestones${NC}"
else
    echo -e "${BLUE}View issues in your GitHub repository${NC}"
fi 