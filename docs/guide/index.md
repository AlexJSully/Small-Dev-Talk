# Developer Guides

This section contains practical guides for developers working with the Small Dev Talk codebase.

## Overview

The developer guides provide step-by-step instructions for common tasks, from setting up your local environment to publishing new articles and deploying to production. These guides are designed for both internal maintainers and external contributors.

## Available Guides

### [Getting Started](./getting-started.md)

Complete setup guide for local development.

**What you'll learn:**

- Installing dependencies
- Running the local development server
- Understanding the project structure
- Configuring development tools (ESLint, Prettier, Markdownlint)
- Debugging with browser DevTools
- Working with Service Workers
- Common troubleshooting steps

### [Adding & Publishing Articles](./articles.md)

Step-by-step guide for adding new articles to Small Dev Talk.

**What you'll learn:**

- Article directory structure requirements
- Creating article metadata entries
- Writing markdown content
- Adding images and media
- Updating the Service Worker cache
- Testing articles locally
- Publishing workflow

### [Testing & Validation](./testing.md)

Guide to running tests and ensuring code quality.

**What you'll learn:**

- Running Jest unit tests
- Running Cypress E2E tests
- Code linting with ESLint
- Code formatting with Prettier
- Markdown validation
- Full validation pipeline
- Debugging test failures
- Continuous Integration (CI) process

### [Deployment & Build](./deployment.md)

Build process and deployment to GitHub Pages.

**What you'll learn:**

- Building production files (CSS, JS, Service Worker)
- Understanding the deployment pipeline
- GitHub Actions workflow
- Pre-deployment checklist
- Rollback procedures
- Environment configuration
- Performance optimization

## Common Commands

```bash
# Local development
npm run start              # Start dev server on port 3000

# Testing
npm run test               # Run Jest unit tests
npm run cypress            # Open Cypress test runner
npm run e2e:headless       # Run E2E tests in CI mode

# Code Quality
npm run eslint             # Fix ESLint errors
npm run prettier           # Format all files
npm run lint:markdown      # Validate markdown files

# Build
npm run build:css          # Compile CSS
npm run build:js           # Minify JavaScript
npm run workbox            # Regenerate Service Worker cache

# Full Validation
npm run validate           # Run all checks (required before merge)
```

## Related Documentation

- [System Architecture](../architecture/system.md) — Understanding the codebase structure
- [Data Flow](../architecture/data-flow.md) — How data moves through the application
- [ArticleFiller API](../api/article-filler.md) — Core module documentation
