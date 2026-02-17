# Testing & Validation

This guide covers running tests and validating code quality in Small Dev Talk.

## Test Types

Small Dev Talk uses four types of automated testing:

1. **Unit Tests (Jest)** — Test individual functions and modules
2. **E2E Tests (Cypress)** — Test complete user workflows
3. **Linting** — Verify code quality and style
4. **Markdown Validation** — Ensure documentation quality

## Unit Testing with Jest

Jest tests are in [src/scripts/index.test.js](../../src/scripts/index.test.js).

**Run all tests:**

```bash
npm run test
```

**Run with verbose output:**

```bash
npm run test:verbose
```

**Run specific test file:**

```bash
npm run test -- src/scripts/index.test.js
```

## End-to-End Testing with Cypress

Cypress tests are in [cypress/e2e/](../../cypress/e2e/).

**Open Cypress Test Runner:**

```bash
npm run cypress
```

**Run E2E tests headless (CI mode):**

```bash
npm run e2e:headless
```

This starts the dev server, waits for it, then runs tests.

## Code Quality

### ESLint (JavaScript Linting)

Check and auto-fix code quality issues:

```bash
npm run eslint              # Auto-fix
npm run eslint:check        # Check only
```

**Configuration:** [eslint.config.js](../../eslint.config.js)

### Prettier (Code Formatting)

Format all code consistently:

```bash
npm run prettier            # Format all files
npm run prettier:check      # Check only
```

**Configuration:** [.prettierrc](../../.prettierrc)

### Markdownlint (Markdown Validation)

Lint all markdown files:

```bash
npm run lint:markdown
```

**Configuration:** [.markdownlint.json](../../.markdownlint.json)

## Full Validation Pipeline

Run all quality checks together:

```bash
npm run validate
```

This runs:

1. Prettier formatting
2. ESLint code quality
3. Jest unit tests
4. Cypress E2E tests
5. Markdownlint validation

## Continuous Integration

GitHub Actions workflows in this repository:

- Run Prettier, ESLint, Jest, and Cypress on pushes and pull requests
- Run Markdownlint on markdown-only changes
- Run CodeQL analysis on pushes and pull requests

## Related Documentation

- [Developer Setup & Getting Started](./getting-started.md)
