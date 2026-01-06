# Small Dev Talk Documentation

Welcome to the Small Dev Talk documentation. This directory contains comprehensive guides for understanding, maintaining, and extending the Small Dev Talk codebase.

## Overview

Small Dev Talk is a static web application that archives and displays interviews with indie developers, game developers, and creators across various entertainment industries. The site provides content from multiple authors spanning games, movies, technology, design, and more.

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
- [Sentry Integration](./api/sentry.md) — Error tracking and monitoring configuration
- [Service Worker](./api/service-worker.md) — Caching strategy and offline support
- [Build Tools & Scripts](./api/build-tools.md) — Configuration for tooling and automation

## Key Technologies

| Technology                                                                   | Purpose                     | Version  |
| ---------------------------------------------------------------------------- | --------------------------- | -------- |
| [Bootstrap](https://getbootstrap.com/)                                       | UI framework                | Latest   |
| [Showdown.js](http://showdownjs.com/)                                        | Markdown to HTML conversion | Latest   |
| [Sentry](https://sentry.io/)                                                 | Error tracking              | v10.32.1 |
| [Service Workers / Workbox](https://developers.google.com/web/tools/workbox) | Offline caching             | v7.4.0   |
| [Jest](https://jestjs.io/)                                                   | Unit testing                | v30.2.0  |
| [Cypress](https://cypress.io/)                                               | E2E testing                 | v15.8.1  |
| [ESLint](https://eslint.org/)                                                | Code linting                | v9.39.2  |
| [Prettier](https://prettier.io/)                                             | Code formatting             | v3.7.4   |

## Quick Links

- **Repository:** [AlexJSully/Small-Dev-Talk](https://github.com/AlexJSully/Small-Dev-Talk)
- **Live Site:** [smalldevtalk.net](https://smalldevtalk.net/)
- **Original Archive:** [Small Dev Talk on Tumblr](https://smalldevtalk.tumblr.com/)
- **Issue Tracker:** [GitHub Issues](https://github.com/AlexJSully/Small-Dev-Talk/issues)

## Current Status

- **Project Status:** Maintenance Mode
- **Latest Version:** 1.3.4
- **License:** GPL-3.0
- **Build Status:** Automated via GitHub Actions

## Contributing

To contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md) at the repository root. Focus areas for contributions include:

- Bug fixes (priority)
- Security updates (priority)
- Documentation improvements
