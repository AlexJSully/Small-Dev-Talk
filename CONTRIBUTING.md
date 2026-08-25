# Contributing

We are open to any contributions at any time. When contributing, we ask you to please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Pull Request Process

1. Run `npm run validate` before opening the pull request. It runs Prettier, ESLint, the Jest unit tests, the Cypress end-to-end tests, and markdownlint in sequence, which is the same ground the pipeline covers. See [Testing & Validation](docs/guide/testing.md).
2. Update the documentation that your change affects, which means [README.md](README.md) for anything a visitor or operator would notice and the relevant guide under [docs/](docs/index.md) for anything a contributor would.
3. Record the change in [CHANGELOG.md](CHANGELOG.md) under the version the pull request would release. The format is [Keep a Changelog](http://keepachangelog.com/) and the versioning scheme is [SemVer](http://semver.org/).
4. When raising the version, update it in [package.json](package.json) and in the Sentry `release` value in [index.html](index.html), which the inline comment beside it also asks for. The same file sets an `app-version` tag through `Sentry.configureScope`, a function the Sentry JavaScript SDK removed in version 8 while the page loads version 10, so that tag needs the call migrated to `Sentry.getCurrentScope()` before it is worth maintaining.
5. Wait for the pull request checks to pass. [code-qa-js.yaml](.github/workflows/code-qa-js.yaml) covers the JavaScript quality gates, [code-qa-md.yaml](.github/workflows/code-qa-md.yaml) covers markdown, and [codeql-analysis.yaml](.github/workflows/codeql-analysis.yaml) runs CodeQL analysis.
6. You may merge the pull request once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

There is no build step in this repository. The one generated artifact is the service worker, regenerated with `npm run workbox` after adding or renaming assets that need precaching.

## Code of Conduct

This project follows the Contributor Covenant. The full text, including the reporting process and the enforcement guidelines, is in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
