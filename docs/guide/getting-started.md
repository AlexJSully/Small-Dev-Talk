# Getting Started Guide

Welcome to the Small Dev Talk development environment. This guide covers installation, configuration, and running the project locally.

## System Requirements

- **Node.js:** v20.19.0+ (required by the ESLint toolchain)
Implementation: [package-lock.json](../../package-lock.json), [package.json](../../package.json)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AlexJSully/Small-Dev-Talk.git
cd Small-Dev-Talk
```

### 2. Install Dependencies

```bash
npm install
```

This installs all devDependencies from [package.json](../../package.json), including:

- Testing frameworks (Jest, Cypress)
- Code quality tools (ESLint, Prettier, Markdownlint)
- Build tools (Workbox, http-server)

## Local Development

### Start the Development Server

```bash
npm run start
```

**What it does:**

- Starts an HTTP server on `http://localhost:3000`
- Serves all files from the project root

**Access:** Open `http://localhost:3000` in your browser

### Runtime Initialization

- `window.onload` calls `registerServiceWorker()` and then initializes data loading
- `retrievePageData()` fetches legacy page definitions
- `retrieveArticleData()` fetches article metadata and triggers rendering

### Third-Party Scripts

- Sentry is initialized in `index.html`
- Google Analytics and Google Tag Manager scripts are loaded in `index.html`
Implementation: [index.html](../../index.html)

## Project Structure

Key directories for development:

```text
Small-Dev-Talk/
├── src/                          # Source files
│   ├── scripts/
│   │   ├── index.js             # Main application logic (ArticleFiller class)
│   │   ├── index.test.js        # Unit tests for index.js
│   │   └── libraries/           # Third-party libraries
│   ├── articleArchive/
│   │   ├── articleData.json     # Article metadata registry
│   │   ├── authorAlexanderSullivan/
│   │   ├── authorJeffCen/
│   │   └── authorNeilRampone/
│   ├── serviceWorker/           # Service worker configuration
│   ├── style.css                # Main stylesheet
│   └── icon/                    # App icons and manifest
├── docs/                        # Documentation (this directory)
├── cypress/                     # E2E tests
├── index.html                   # Main HTML file
├── package.json                 # Project metadata & dependencies
├── eslint.config.js             # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .markdownlint.json           # Markdown linter configuration
└── workbox-config.js            # Service worker precaching configuration
```

See [System Architecture](../architecture/system.md) for detailed information about each component.

## Configuration Files

### ESLint Configuration

File: [eslint.config.js](../../eslint.config.js)

Enforces code quality and style consistency across JavaScript files.

```bash
npm run eslint              # Run with auto-fix
npm run eslint:check        # Check without fixing
```

### Prettier Configuration

File: [.prettierrc](../../.prettierrc)

Formats code consistently across the project.

```bash
npm run prettier            # Format all files
npm run prettier:check      # Check formatting
```

### Markdown Linting

File: [.markdownlint.json](../../.markdownlint.json)

Ensures markdown files follow consistent formatting standards.

```bash
npm run lint:markdown       # Lint all markdown files
```

## Common Development Tasks

### Adding an Article

See [Adding & Publishing Articles](./articles.md) for detailed instructions.

### Running Tests

```bash
npm run test                # Run all Jest unit tests
npm run test:verbose        # Run with verbose output
npm run cypress             # Open Cypress E2E test runner
npm run e2e:headless        # Run E2E tests in headless mode
```

### Code Quality Checks

```bash
npm run validate            # Run full validation pipeline:
                            # - prettier
                            # - eslint
                            # - jest
                            # - e2e tests
                            # - markdownlint
```

### Rebuilding Service Worker

```bash
npm run workbox             # Generate precaching manifest for service worker
```

This command regenerates `src/serviceWorker/sw.js` with the current precache manifest.

## Environment Variables

Small Dev Talk does not reference environment variables in runtime scripts. Configuration is done through:

- [index.html](../../index.html) — Sentry and analytics configuration, meta tags, security policies
- [workbox-config.js](../../workbox-config.js) — Precaching configuration
