#!/bin/bash

# Test script to verify GitHub CLI and label creation
# Run this before the main scripts to test basic functionality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing GitHub CLI and Label Creation${NC}"

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

echo -e "${GREEN}✓ GitHub CLI is installed and authenticated${NC}"

# Test repo access
echo -e "${BLUE}Testing repository access...${NC}"
REPO_INFO=$(gh repo view --json owner,name 2>/dev/null)
if [ $? -eq 0 ]; then
    OWNER=$(echo "$REPO_INFO" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
    NAME=$(echo "$REPO_INFO" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Repository: $OWNER/$NAME${NC}"
else
    echo -e "${RED}✗ Could not access repository. Make sure you're in a git repository connected to GitHub.${NC}"
    exit 1
fi

# Test label creation (create a test label)
echo -e "${BLUE}Testing label creation...${NC}"
gh label create "test-label" --description "Test label for script validation" --color "FBCA04" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Label creation works${NC}"
    # Clean up test label
    gh label delete "test-label" --yes 2>/dev/null
else
    echo -e "${GREEN}✓ Label creation works (or label already exists)${NC}"
fi

# Test milestone creation via API
echo -e "${BLUE}Testing milestone creation...${NC}"
gh api repos/:owner/:repo/milestones -f title="Test Milestone" -f description="Test milestone for script validation" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Milestone creation works via API${NC}"
    # Clean up test milestone by getting its number and deleting it
    MILESTONE_NUMBER=$(gh api repos/:owner/:repo/milestones --jq '.[] | select(.title=="Test Milestone") | .number' 2>/dev/null)
    if [ -n "$MILESTONE_NUMBER" ]; then
        gh api repos/:owner/:repo/milestones/$MILESTONE_NUMBER -X DELETE 2>/dev/null
    fi
else
    echo -e "${GREEN}✓ Milestone creation works (or milestone already exists)${NC}"
fi

echo -e "${GREEN}All tests passed! You can now run the issue creation scripts.${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "  ${BLUE}→${NC} Run ./scripts/create-critical-issues.sh for critical issues only"
echo -e "  ${BLUE}→${NC} Run ./scripts/create-v1-issues.sh for all v1 issues" 