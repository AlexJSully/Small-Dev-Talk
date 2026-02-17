# Deployment & Build

This guide documents the build-related scripts present in the repository.

## Build Scripts

The repository does not define an `npm run build` script. The only build-like step defined is service worker generation.

### Regenerate the Service Worker

```bash
npm run workbox
```

This command runs Workbox to generate `src/serviceWorker/sw.js` using the configuration in `workbox-config.js`.

Implementation: [package.json](../../package.json), [workbox-config.js](../../workbox-config.js), [src/serviceWorker/sw.js](../../src/serviceWorker/sw.js)

## Related Documentation

- [Getting Started Guide](./getting-started.md)
- [Service Worker](../api/service-worker.md)
