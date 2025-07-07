# Development Workflow Guide

## 🎯 From Issue to Production: The Complete Workflow

This guide covers the professional development workflow for the Slate Dashboard project, from picking up a GitHub issue to deploying to production.

## 📋 Phase 1: Issue Selection and Planning

### View Available Issues
```bash
# List all issues
gh issue list

# Filter by labels
gh issue list --label "priority:critical"
gh issue list --label "v1-blocker"
gh issue list --label "testing"

# View specific issue
gh issue view 6
```

### Assign Yourself to an Issue
```bash
# Assign yourself to issue #6
gh issue edit 6 --add-assignee @me

# Add comments to issues
gh issue comment 6 --body "Starting work on this issue. Will focus on Jest setup first."
```

## 🌿 Phase 2: Branch Creation and Development

### Create Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/testing-framework-setup

# Or for specific issue
git checkout -b feature/issue-6-testing-strategy
```

### Development Best Practices
1. **Small, focused commits** with clear messages
2. **Frequent commits** to track progress
3. **Reference the issue** in commit messages

```bash
# Example commit messages
git commit -m "feat: add Jest testing framework configuration

- Install Jest and testing dependencies
- Create jest.config.js with proper settings
- Add test scripts to package.json
- Addresses #6"

git commit -m "test: add initial widget unit tests

- Create test structure for clock widget
- Add mock data for testing
- Implement basic rendering tests
- Part of #6"
```

## 🔄 Phase 3: Pull Request (PR) Creation

### Push Branch and Create PR
```bash
# Push feature branch
git push origin feature/testing-framework-setup

# Create PR via GitHub CLI
gh pr create \
  --title "🧪 Implement comprehensive testing strategy" \
  --body "Resolves #6

## Changes Made
- ✅ Added Jest testing framework
- ✅ Created test configuration
- ✅ Implemented widget unit tests
- ✅ Added CI test running

## Testing
- [x] All existing functionality still works
- [x] New tests pass locally
- [x] No linting errors

## Deployment Impact
- No breaking changes
- Adds dev dependencies only
- Ready for production use" \
  --assignee @me \
  --label "testing,priority:critical"
```

### Link PR to Issue
GitHub automatically links PRs when you use:
- `Resolves #6` or `Closes #6` in PR description
- `Fixes #6` in commit messages

## 🔍 Phase 4: Code Review Process

### Review Your Own Code
```bash
# View the PR diff
gh pr diff

# Check PR status
gh pr status

# View PR in browser
gh pr view --web
```

### Request Reviews (if working with team)
```bash
# Request specific reviewers
gh pr edit --add-reviewer username1,username2
```

## ✅ Phase 5: Merge and Deployment

### Merge PR
```bash
# Merge when approved
gh pr merge --merge  # or --squash or --rebase

# Delete feature branch
git branch -d feature/testing-framework-setup
git push origin --delete feature/testing-framework-setup
```

### Close Issue
```bash
# Close the issue (often automatic when PR merges)
gh issue close 6 --comment "Completed! Testing framework is now set up and ready for use."
```

## 🚀 Phase 6: Deployment Strategies

### Development Deployment
```bash
# Local development
npm run dev

# Development Docker
docker-compose up
```

### Production Deployment

#### Option 1: Traditional Server Deployment
```bash
# Build production version
npm run build

# Deploy to server
scp -r dist/* user@server:/var/www/slate/
```

#### Option 2: Docker Production
```bash
# Build production image
docker build -t slate-dashboard:v1.0.0 .

# Run production container
docker run -p 80:80 slate-dashboard:v1.0.0
```

#### Option 3: Tailscale Deployment (Your Setup)
```bash
# Build and deploy to Tailscale network
npm run build
# Copy to your tailscale-slate directory
# Start Tailscale service
```

## 🔄 Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions Setup
Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run test
    - run: npm run build
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: echo "Deploy to your server here"
```

## 📊 Issue Tracking and Project Management

### GitHub Projects Integration
```bash
# List projects
gh project list

# Add issue to project
gh project item-add PROJECT_ID --url https://github.com/pwelty/slate/issues/6
```

### Issue States and Workflow
1. **Open** → Issue created, needs work
2. **In Progress** → Someone is working on it
3. **In Review** → PR created, under review
4. **Testing** → Changes deployed to staging
5. **Closed** → Completed and deployed

## 🎯 Practical Example: Let's Work on Issue #6

### Step-by-Step Walkthrough

1. **Pick the issue**: Testing Strategy (#6)
2. **Create branch**: `feature/testing-framework-setup`
3. **Develop**: Add Jest, write tests
4. **Commit**: Small, focused commits
5. **PR**: Create with proper description
6. **Review**: Check your work
7. **Merge**: Deploy to main
8. **Deploy**: Push to production

### Commands for Issue #6
```bash
# 1. Assign yourself and start work
gh issue edit 6 --add-assignee @me
git checkout -b feature/testing-framework-setup

# 2. Install testing dependencies
npm install --save-dev jest jsdom @testing-library/jest-dom

# 3. Create test configuration
# (Create jest.config.js, add test scripts, etc.)

# 4. Commit and push
git add .
git commit -m "feat: add Jest testing framework configuration

- Install Jest and testing dependencies  
- Create jest.config.js with proper settings
- Add test scripts to package.json
- Addresses #6"

git push origin feature/testing-framework-setup

# 5. Create PR
gh pr create \
  --title "🧪 Implement comprehensive testing strategy" \
  --body "Resolves #6..." \
  --assignee @me

# 6. After review, merge
gh pr merge --squash
```

## 🌟 Best Practices for Solo Development

Even when working alone, follow these practices:

1. **Always use branches** for features
2. **Write clear commit messages** 
3. **Create PRs** even for your own work (helps with history)
4. **Test before merging** 
5. **Deploy systematically** 
6. **Document your process**

## 🚀 Next Steps

1. **Pick your first issue** (I recommend #6 - Testing Strategy)
2. **Set up your development environment**
3. **Create your first feature branch**
4. **Start the development cycle**

Ready to dive in? Let's start with issue #6 and set up your testing framework! 