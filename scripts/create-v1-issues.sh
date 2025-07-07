#!/bin/bash

# Script to create v1 launch issues in GitHub
# Prerequisites: 
# - GitHub CLI installed (gh)
# - Authenticated with GitHub (gh auth login)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating v1 Launch Issues for Slate Dashboard${NC}"

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
    gh label create "configuration" --description "Configuration related" --color "1D76DB" || true
    gh label create "environment" --description "Environment setup" --color "0E8A16" || true
    gh label create "docker" --description "Docker related" --color "0075CA" || true
    gh label create "documentation" --description "Documentation work" --color "5319E7" || true
    gh label create "user-guides" --description "User documentation" --color "C2E0C6" || true
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

# Critical Priority Issues
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
- No centralized logging configuration
- Potential information leakage

## Goals
- Clean production builds with no debug logging
- Proper logging levels (error, warn, info, debug)
- Centralized logging configuration
- Production-safe error tracking

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
- [ ] Configure log rotation and retention
- [ ] Test logging in production environment

## Acceptance Criteria
- No console.log statements in production build
- Proper logging levels implemented (error, warn, info, debug)
- Error tracking available for debugging
- Logging configuration documented
- Development logs still available in dev mode
- Production logs don't expose sensitive information

## Priority
Critical - Security and production readiness

## Definition of Done
- [ ] All console.log statements removed/replaced
- [ ] Logging library configured
- [ ] Environment-specific logging works
- [ ] Documentation updated
- [ ] Production build tested with clean console" \
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
- Errors not logged properly for debugging
- No graceful degradation strategies

## Goals
- Consistent error handling across all widgets
- User-friendly error messages with actionable guidance
- Graceful degradation when services are unavailable
- Proper error logging for debugging
- Retry mechanisms for transient failures

## User Experience Impact
- Users currently get confused when things break
- No clear indication of what went wrong
- No guidance on how to fix issues
- Silent failures lead to frustration

## Tasks
- [ ] Audit current error handling across all widgets
- [ ] Create standardized error handling patterns/utilities
- [ ] Implement user-friendly error messages with context
- [ ] Add retry mechanisms where appropriate (API calls, etc.)
- [ ] Create error boundary components for React-like error handling
- [ ] Add graceful degradation for offline/unavailable services
- [ ] Implement proper error logging integration
- [ ] Create error message style guide
- [ ] Add loading states and error states to all widgets

## Acceptance Criteria
- All widgets handle errors gracefully
- Users get helpful, actionable error messages
- Retry mechanisms work correctly for transient failures
- Error patterns are documented and standardized
- Error logging helps with debugging
- Graceful degradation works when services are down
- Error UI is consistent across all widgets

## Priority
Critical - User experience

## Definition of Done
- [ ] Error handling audit completed
- [ ] Standardized error utilities created
- [ ] All widgets updated with new error handling
- [ ] Error messages are user-friendly and actionable
- [ ] Retry mechanisms tested and working
- [ ] Documentation updated with error handling patterns" \
"error-handling,ux,code-quality" \
"task" \
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
- Unclear which version is canonical
- Build process may be using wrong versions

## Goals
- Single source of truth for each widget
- Clear widget architecture and organization
- Reduced maintenance burden
- Consistent widget loading system

## Technical Debt Impact
- Bug fixes need to be applied in multiple places
- Features may be inconsistent between versions
- Developers unsure which version to modify
- Testing complexity increased

## Tasks
- [ ] Audit all widget files for duplicates
- [ ] Determine canonical location for each widget type
- [ ] Create migration plan for consolidation
- [ ] Update imports and references throughout codebase
- [ ] Remove duplicate files
- [ ] Update widget loader to use canonical versions
- [ ] Update build process if needed
- [ ] Update documentation and architecture diagrams
- [ ] Test all widgets after consolidation

## Acceptance Criteria
- No duplicate widget implementations exist
- All widgets load correctly from canonical locations
- Build process updated and working
- Documentation reflects new widget architecture
- All imports point to correct widget locations
- No regression in widget functionality

## Priority
High - Code quality and maintainability

## Definition of Done
- [ ] Duplicate audit completed
- [ ] Canonical widget locations decided
- [ ] All duplicates removed
- [ ] Imports updated and tested
- [ ] Documentation updated
- [ ] All widgets tested and working" \
"code-quality,refactoring,architecture" \
"task" \
"high" \
"true" \
"medium"

# Security Issues
echo -e "${BLUE}Creating Security Issues...${NC}"

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
- No input sanitization in widget configurations
- No rate limiting for API calls (DoS vulnerability)
- Potential for injection attacks in YAML parsing

## Goals
- Secure application against common web vulnerabilities
- Protect user data and API credentials
- Implement defense-in-depth security model
- Pass basic security audit requirements

## Vulnerability Assessment
- **XSS Risk**: Unvalidated input in widgets and configuration
- **Credential Exposure**: API keys in plain text
- **DoS Risk**: No rate limiting on external API calls
- **Injection Risk**: YAML parsing without validation

## Tasks
- [ ] Implement input validation for all user inputs (URLs, text, etc.)
- [ ] Secure API key storage and handling (environment variables, encryption)
- [ ] Add Content Security Policy headers
- [ ] Implement XSS protection and output sanitization
- [ ] Add rate limiting for external API calls
- [ ] Security audit of all endpoints and user inputs
- [ ] Implement YAML configuration validation
- [ ] Add HTTPS enforcement
- [ ] Sanitize all widget configuration inputs
- [ ] Add security headers (HSTS, X-Frame-Options, etc.)

## Acceptance Criteria
- All inputs are validated and sanitized
- API keys are properly secured (not in plain text)
- CSP headers are configured and tested
- XSS protection implemented and tested
- Rate limiting prevents API abuse
- Security audit passes with no critical findings
- All security headers properly configured

## Priority
Critical - Security is essential for v1

## Definition of Done
- [ ] Input validation implemented across all widgets
- [ ] API key security implemented and tested
- [ ] CSP headers configured and working
- [ ] Security audit completed and passed
- [ ] Rate limiting implemented and tested
- [ ] Security documentation updated" \
"security,validation,production" \
"security" \
"critical" \
"true" \
"large"

create_issue "🚀 Optimize bundle size, implement lazy loading, and improve rendering performance" \
"## Description
Optimize application performance for production use.

## Issue Type
Task - Performance optimization for production

## Impact
**Nice to Have** - Performance improvements enhance user experience but not blocking v1

## Performance Issues Analysis
- Bundle size not optimized (no tree shaking, unused code)
- All widgets loaded eagerly (impacts initial load time)
- No performance monitoring or metrics
- CSS not optimized for production
- No caching strategies implemented
- Large JavaScript bundle affects load times

## Goals
- Faster initial page load times
- Efficient resource utilization
- Better user experience on slower connections
- Measurable performance improvements

## Performance Targets
- Bundle size reduced by 30% or more
- Initial load time under 2 seconds
- Lazy loading reduces initial bundle size
- Performance metrics show measurable improvement

## Tasks
- [ ] Analyze current bundle size and composition
- [ ] Implement lazy loading for widgets (code splitting)
- [ ] Optimize CSS and JavaScript (minification, tree shaking)
- [ ] Add performance monitoring and metrics
- [ ] Implement caching strategies for static assets
- [ ] Optimize image loading and compression
- [ ] Add performance budgets and monitoring
- [ ] Profile and optimize widget rendering

## Acceptance Criteria
- Bundle size reduced by 30% minimum
- Lazy loading working correctly for all widgets
- Performance metrics show measurable improvement
- Caching implemented and working
- Performance monitoring in place
- Load times meet target benchmarks

## Priority
High - User experience (but not blocking v1)

## Definition of Done
- [ ] Bundle analysis completed and documented
- [ ] Lazy loading implemented and tested
- [ ] Performance improvements measured and verified
- [ ] Caching strategies implemented
- [ ] Performance monitoring configured" \
"performance,optimization,ux" \
"task" \
"high" \
"false" \
"large"

create_issue "✅ Add comprehensive YAML configuration validation with helpful error messages" \
"## Description
Implement real-time YAML validation with clear error messages to help users fix configuration issues.

## Current Issues
- No real-time validation
- Generic error messages
- Silent failures possible

## Tasks
- [ ] Create JSON schema for configuration
- [ ] Implement real-time validation
- [ ] Add helpful error messages
- [ ] Create validation UI feedback
- [ ] Add configuration examples

## Acceptance Criteria
- YAML validation works in real-time
- Error messages are helpful and specific
- Users can easily fix configuration issues
- Validation covers all configuration options

## Priority
High - User experience" \
"priority:high,configuration,validation,ux"

# Testing Issues
echo -e "${BLUE}Creating Testing Issues...${NC}"

create_issue "🧪 Set up testing framework (Jest/Vitest) with proper test configuration and scripts" \
"## Description
Set up the foundation for automated testing.

## Tasks
- [ ] Choose between Jest and Vitest
- [ ] Install and configure testing framework
- [ ] Set up test scripts in package.json
- [ ] Configure test environment
- [ ] Create test utilities and helpers
- [ ] Set up coverage reporting

## Acceptance Criteria
- Testing framework is installed and configured
- Tests can be run with npm scripts
- Coverage reporting works
- Test environment is properly configured

## Dependencies
- Required for all other testing tasks

## Priority
Critical - Enables all other testing" \
"priority:critical,testing,setup,v1-blocker"

create_issue "🧪 Write unit tests for all widget classes and core functionality" \
"## Description
Create comprehensive unit tests for all widgets and core functionality.

## Tasks
- [ ] Test all widget classes
- [ ] Test configuration parsing
- [ ] Test error handling
- [ ] Test widget loading system
- [ ] Test theme system
- [ ] Test utility functions

## Acceptance Criteria
- All widgets have unit tests
- Core functionality is tested
- 80% unit test coverage achieved
- Tests run in CI pipeline

## Dependencies
- Requires testing framework setup

## Priority
Critical - Core testing requirement" \
"priority:critical,testing,unit-tests,v1-blocker"

create_issue "🧪 Create integration tests for widget loading, configuration parsing, and API interactions" \
"## Description
Test how different parts of the system work together.

## Tasks
- [ ] Test widget loading and rendering
- [ ] Test configuration parsing and validation
- [ ] Test API integrations
- [ ] Test error scenarios
- [ ] Test theme switching
- [ ] Test responsive behavior

## Acceptance Criteria
- Integration tests cover key workflows
- API integrations are tested
- Error scenarios are tested
- Tests run reliably

## Dependencies
- Requires testing framework setup

## Priority
High - System reliability" \
"priority:high,testing,integration-tests"

# Production Issues
echo -e "${BLUE}Creating Production Issues...${NC}"

create_issue "🐳 Optimize Docker images for production (smaller size, security scanning, multi-stage builds)" \
"## Description
Optimize Docker setup for production deployment.

## Tasks
- [ ] Implement multi-stage Docker builds
- [ ] Reduce image size
- [ ] Add security scanning
- [ ] Optimize layer caching
- [ ] Add health checks
- [ ] Update documentation

## Acceptance Criteria
- Docker images are optimized for production
- Security scanning passes
- Image size is minimized
- Health checks work correctly

## Priority
High - Production deployment" \
"priority:high,docker,production,security"

create_issue "🔧 Properly separate development and production environment configurations" \
"## Description
Ensure development features don't run in production and production settings are properly configured.

## Tasks
- [ ] Separate dev and prod configurations
- [ ] Disable hot reload in production
- [ ] Configure proper logging levels
- [ ] Set up environment variables
- [ ] Update build process

## Acceptance Criteria
- Development and production environments are clearly separated
- No development features in production
- Environment-specific configurations work
- Build process handles both environments

## Priority
High - Production readiness" \
"priority:high,configuration,production,environment"

# Documentation Issues
echo -e "${BLUE}Creating Documentation Issues...${NC}"

create_issue "📚 Fix documentation inconsistencies and add missing deployment guides" \
"## Description
Update documentation to match current implementation and fill gaps.

## Issues
- README mentions features not implemented
- Configuration examples may be outdated
- Missing deployment scenarios

## Tasks
- [ ] Audit all documentation
- [ ] Update README to match implementation
- [ ] Fix configuration examples
- [ ] Add missing deployment guides
- [ ] Update troubleshooting guide

## Acceptance Criteria
- All documentation is accurate
- Examples work correctly
- Deployment guides are complete
- Troubleshooting covers common issues

## Priority
Medium - User onboarding" \
"priority:medium,documentation"

create_issue "📖 Create end-user documentation and setup guides for non-technical users" \
"## Description
Create user-friendly guides for setting up and using the dashboard.

## Tasks
- [ ] Create quick start guide
- [ ] Write configuration tutorial
- [ ] Create video walkthrough
- [ ] Add troubleshooting for common issues
- [ ] Create FAQ section

## Acceptance Criteria
- Non-technical users can set up the dashboard
- Common questions are answered
- Setup process is clear and documented

## Priority
Medium - User adoption" \
"priority:medium,documentation,user-guides"

echo -e "${GREEN}All v1 launch issues created successfully!${NC}"

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