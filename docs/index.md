# Small Dev Talk Documentation

Welcome to the Small Dev Talk documentation. This directory contains guides for understanding, maintaining, and extending the Small Dev Talk codebase.

## Overview

Small Dev Talk is a static client-side site. On page load, the browser script fetches legacy page definitions and article metadata, then renders either a listing view or a single article based on the URL query string.

The project is currently in **maintenance mode**, meaning focus is on bug fixes and security updates rather than new features.

## Documentation Structure

### [Architecture](./architecture/)

Understand the system design, data flows, and core components that power Small Dev Talk.

- [System Architecture](./architecture/system.md) — Overview of modules, components, and interactions
- [Data Flow](./architecture/data-flow.md) — How articles flow through the application
- [Dependencies & Integrations](./architecture/dependencies.md) — External services and libraries

### [Guides](./guide/)

Practical guides for developers working with the codebase.

- [Developer Setup & Getting Started](./guide/getting-started.md) — Installation, configuration, and local development
- [Adding & Publishing Articles](./guide/articles.md) — How to add new articles and manage article metadata
- [Testing & Validation](./guide/testing.md) — Running tests, linting, and validation scripts
- [Deployment & Build Process](./guide/deployment.md) — Building, testing, and deploying to production

### [API Reference](./api/)

Detailed documentation for key modules and functions.

- [ArticleFiller Class](./api/article-filler.md) — Core class for article loading and page rendering
- [Sentry Integration](./api/sentry.md) — Error tracking configuration
- [Service Worker](./api/service-worker.md) — Precaching and runtime caching behavior
- [Build Tools & Scripts](./api/build-tools.md) — Tooling and npm scripts

## Key Technologies

| Technology                                                                   | Purpose                      | Version    |
| ---------------------------------------------------------------------------- | ---------------------------- | ---------- |
| [Bootstrap](https://getbootstrap.com/)                                       | UI framework (local bundle)  | Local copy |
| [jQuery](https://jquery.com/)                                                | DOM utilities (local bundle) | Local copy |
| [Showdown.js](http://showdownjs.com/)                                        | Markdown to HTML conversion  | Local copy |
| [Sentry](https://sentry.io/)                                                 | Error tracking               | v10.32.1   |
| [Service Workers / Workbox](https://developers.google.com/web/tools/workbox) | Precaching and caching       | v7.4.0     |
| [Jest](https://jestjs.io/)                                                   | Unit testing                 | v30.2.0    |
| [Cypress](https://cypress.io/)                                               | E2E testing                  | v15.10.0   |
| [ESLint](https://eslint.org/)                                                | Code linting                 | v10.0.0    |
| [Prettier](https://prettier.io/)                                             | Code formatting              | v3.8.1     |

## Quick Links

- **Repository:** [AlexJSully/Small-Dev-Talk](https://github.com/AlexJSully/Small-Dev-Talk)
- **Live Site:** [smalldevtalk.net](https://smalldevtalk.net/)
- **Original Archive:** [Small Dev Talk on Tumblr](https://smalldevtalk.tumblr.com/)
- **Issue Tracker:** [GitHub Issues](https://github.com/AlexJSully/Small-Dev-Talk/issues)

## Current Status

- **Project Status:** Maintenance Mode
- **Latest Version:** 1.3.4
- **License:** GPL-3.0
- **Automation:** Code quality and CodeQL workflows run in GitHub Actions

## Contributing

To contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md) at the repository root.
