# Service Worker

This document describes service worker registration and caching rules.

## Registration

`registerServiceWorker()` in `src/scripts/index.js` registers the service worker at `./sw.js` when `navigator.serviceWorker` is available. The worker sits at the site root, so its scope is `/` and it controls `index.html`.

Before registering, `removeLegacyServiceWorker()` unregisters the worker that earlier releases registered from `/src/serviceWorker/sw.js` and deletes its `workbox-precache-v2-<scope>` cache. That worker's scope was `/src/serviceWorker/`, which covers no page, so it never served its cache and never updates on its own.

After registering, `registerServiceWorker()` waits up to 3 seconds for the `controllerchange` event when a worker is installing or waiting and the page has no controller. On a first visit the generated worker claims the page as soon as it activates, so the article and images fetched next go through the runtime caches. The wait ends at once when the page is already controlled, and registration still succeeds after the timeout if the worker never takes control.

`start()` skips registration when the page runs on `www.smalldevtalk.net`, because it first moves the page to `smalldevtalk.net`. On the `www.` host GitHub Pages redirects every request, and browsers reject a service worker script behind a redirect.

Implementation: [src/scripts/index.js](../../src/scripts/index.js)

## Precaching and Runtime Caching

Workbox generates `sw.js` and its `workbox-<hash>.js` runtime at the repository root from `workbox-config.js`:

- Precaches the app shell only: `index.html`, the minified site script and stylesheet, the jQuery, Bootstrap and Showdown files `index.html` loads, `articleData.json`, `legacyPagesDisplay.json`, the title and background images, and the favicons and web manifest
- Matches precached URLs with every query parameter removed, so `index.html?ArticleKey` is served from the precached `index.html`
- Claims open pages when the worker activates (`clientsClaim`), so a first visit is controlled without a reload
- Applies a CacheFirst strategy to PNG, JPEG, GIF, WebP, ICO and SVG image requests (`images` cache, at most 100 entries, purged on a storage quota error)
- Applies a NetworkFirst strategy to article markdown under `/src/articleArchive/` (`articles` cache, at most 50 entries), so online readers get the current text and articles already read work offline

Precached files are served from the cache until `sw.js` is regenerated, so a change to any of them needs a new `sw.js`.

Implementation: [workbox-config.js](../../workbox-config.js), [sw.js](../../sw.js)

## Regeneration

Run `npm run workbox` to regenerate the service worker after changing a precached file. `npm run validate` runs it after `npm run minify`, and the JavaScript quality workflow fails when the committed `sw.js` differs from a fresh `npm run workbox` run.

Implementation: [package.json](../../package.json), [.github/workflows/code-qa-js.yaml](../../.github/workflows/code-qa-js.yaml)

## Related Documentation

- [System Architecture](../architecture/system.md)
