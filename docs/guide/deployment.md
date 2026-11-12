# Deployment & Build

This guide documents the build-related scripts present in the repository.

## Build Scripts

The repository does not define an `npm run build` script. The only build-like step defined is service worker generation.

### Regenerate the Service Worker

```bash
npm run workbox
```

This command runs Workbox to generate `sw.js` at the repository root using the configuration in `workbox-config.js`. Run it after changing any precached file, such as `index.html`, `index.min.js` or `articleData.json`; the JavaScript quality workflow fails when the committed `sw.js` is out of date.

Implementation: [package.json](../../package.json), [workbox-config.js](../../workbox-config.js), [sw.js](../../sw.js)

## Related Documentation

- [Getting Started Guide](./getting-started.md)
- [Service Worker](../api/service-worker.md)
