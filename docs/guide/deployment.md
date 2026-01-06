# Deployment & Build

This guide explains the Small Dev Talk build process and deployment strategy.

Small Dev Talk is a static site deployed on GitHub Pages.

## GitHub Pages Deployment

When PR is merged to `master`:

1. GitHub Actions automatically:
    - Runs `npm run validate`
    - Runs `npm run build`
    - Deploys to `gh-pages` branch
    - Updates live site at [Small Dev Talk](https://smalldevtalk.net/)
