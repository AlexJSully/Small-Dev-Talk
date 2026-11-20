# Getting Started Guide

Welcome to the Small Dev Talk development environment. This guide covers installation, configuration, and running the project locally.

## Prerequisites

Install Node.js 24 and the npm version bundled with it. Continuous integration pins Node.js 24 for both the JavaScript and markdown quality workflows ([code-qa-js.yaml](../../.github/workflows/code-qa-js.yaml), [code-qa-md.yaml](../../.github/workflows/code-qa-md.yaml)), so matching it locally keeps local results and pipeline results aligned.

Dependency installation reads [.npmrc](../../.npmrc), which sets `min-release-age` to 14 so that a package version must be at least 14 days old before it is installed. The setting exists to reduce exposure to npm supply-chain attacks. Expect a freshly published release to be unavailable until it reaches that age.

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

- Starts a Hypertext Transfer Protocol (HTTP) server on `http://localhost:3000`
- Serves all files from the project root

**Access:** Open `http://localhost:3000` in your browser

### Runtime Initialization

- `start()` runs when the deferred `index.min.js` executes, after the HTML is parsed (or on `DOMContentLoaded` when the script runs while the document is still loading), so slow third-party scripts do not delay the data requests
- `index.html` preloads `articleData.json` and `legacyPagesDisplay.json`, so the requests start while the HTML is parsed
- `ArticleFiller.loadData()` fetches the legacy page definitions and the article metadata together
- `init()` calls `ArticleFiller.showView()` with the view `resolveView()` reads from the URL, once both requests succeed
- `registerServiceWorker()` runs after the page renders, so the worker's installation never delays the first render

Implementation: [src/scripts/index.js](../../src/scripts/index.js)

### Third-Party Scripts

- The Sentry Software Development Kit (SDK) script is loaded in `index.html` and initialized by `initializeSentry()` in `src/scripts/index.js`
- The Google Tag Manager loader is `loadGoogleTagManager()` in `src/scripts/index.js`; the container sends the Google Analytics 4 events
- The Sentry, Showdown and site scripts load with `defer`, and Sentry initializes on `DOMContentLoaded`
- The Google Tag Manager loader and the X `widgets.js` script load with `crossorigin="anonymous"`, so an error they throw reports its message and stack instead of `Script error.`
- The sidebar shows a "Follow @SmallDevTalk on X" link by default, with the X timeline loaded hidden and inert beneath it. X rate-limits embedded timeline requests to `syndication.twitter.com` per IP address and answers with HTTP 429, and `widgets.js` still inserts its `iframe` then, but leaves it `visibility: hidden` at 0 pixels high and fires no `rendered` or `loaded` event. `watchTwitterTimeline()` watches the timeline container, and once the `iframe` is visible with a height, it hides the link, removes the inert state, and reveals the timeline. When X never serves the timeline, the link stays. It does not report the failure to Sentry.

Implementation: [index.html](../../index.html), [src/scripts/index.js](../../src/scripts/index.js)

## Project Structure

Key directories for development:

```text
Small-Dev-Talk/
├── src/                          # Source files
│   ├── scripts/
│   │   ├── index.js             # Main application logic (ArticleFiller class)
│   │   ├── index.test.js        # Unit tests for index.js
│   │   ├── sw-headers.js        # Security headers added by the service worker
│   │   ├── sw-headers.test.js   # Unit tests for sw-headers.js
│   │   └── libraries/           # Third-party libraries
│   ├── articleArchive/
│   │   ├── articleData.json     # Article metadata registry
│   │   ├── articleData.test.js  # Checks of the archive's markdown, images and sizes
│   │   ├── authorAlexanderSullivan/
│   │   ├── authorJeffCen/
│   │   └── authorNeilRampone/
│   ├── style.css                # Main stylesheet
│   └── icon/                    # App icons and manifest
├── docs/                        # Documentation (this directory)
├── cypress/                     # E2E tests
├── index.html                   # Main HTML file
├── sw.js                        # Generated service worker (npm run workbox)
├── package.json                 # Project metadata & dependencies
├── eslint.config.js             # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .markdownlint.json           # Markdown linter rule settings
├── .markdownlint-cli2.jsonc     # Markdown linter file selection
├── workbox-config.js            # Service worker precaching configuration
└── workbox-config.test.js       # Checks that the precache covers the page's scripts
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

Files: [.markdownlint.json](../../.markdownlint.json) and [.markdownlint-cli2.jsonc](../../.markdownlint-cli2.jsonc)

Ensures markdown files follow consistent formatting standards. The rule settings live in `.markdownlint.json`; the set of files to lint, and the paths to ignore, live in `.markdownlint-cli2.jsonc`. Because the linter reads the glob patterns from configuration, the commands below take no arguments.

```bash
npm run lint:markdown        # Lint with auto-fix
npm run lint:markdown:check  # Check without fixing
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
                            # - minify
                            # - workbox
                            # - jest
                            # - e2e tests
                            # - markdownlint
```

### Rebuilding Service Worker

```bash
npm run workbox             # Generate precaching manifest for service worker
```

This command regenerates `sw.js` at the repository root with the current precache manifest.

## Environment Variables

Small Dev Talk does not reference environment variables in runtime scripts. Configuration is done through:

- [index.html](../../index.html) - Sentry SDK script, meta tags, Content Security Policy
- [workbox-config.js](../../workbox-config.js) - Precaching configuration

## Related Documentation

- [System Architecture](../architecture/system.md)
- [Testing & Validation](./testing.md)
