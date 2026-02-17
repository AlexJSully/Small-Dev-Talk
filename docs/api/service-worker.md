# Service Worker

This document describes service worker registration and caching rules.

## Registration

`registerServiceWorker()` in `src/scripts/index.js` registers the service worker at `./src/serviceWorker/sw.js` when `navigator.serviceWorker` is available.

Implementation: [src/scripts/index.js](../../src/scripts/index.js)

## Precaching and Runtime Caching

Workbox generates `src/serviceWorker/sw.js` from `workbox-config.js`:

- Precaches files under `./src` that match the configured glob patterns
- Excludes `index.html`, `workbox-config.js`, `package.json`, `package-lock.json`, and `node_modules/**/*`
- Applies a CacheFirst strategy for image requests with a maximum of 10 cached entries

Implementation: [workbox-config.js](../../workbox-config.js), [src/serviceWorker/sw.js](../../src/serviceWorker/sw.js)

## Regeneration

Run `npm run workbox` to regenerate the service worker.

Implementation: [package.json](../../package.json)

## Related Documentation

- [System Architecture](../architecture/system.md)
