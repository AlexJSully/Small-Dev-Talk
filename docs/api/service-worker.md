# Service Worker

This document describes service worker registration and caching rules.

## Registration

`registerServiceWorker()` in `src/scripts/index.js` registers the service worker at `./sw.js` when `navigator.serviceWorker` is available. The worker sits at the site root, so its scope is `/` and it controls `index.html`.

Before registering, `removeLegacyServiceWorker()` unregisters the worker that earlier releases registered from `/src/serviceWorker/sw.js` and deletes its `workbox-precache-v2-<scope>` cache. That worker's scope was `/src/serviceWorker/`, which covers no page, so it never served its cache and never updates on its own. When `navigator.serviceWorker` or `getRegistrations` is unavailable, or when browser security policy blocks access, cleanup exits without throwing.

`start()` calls `registerServiceWorker()` after the view renders, and nothing waits for the worker to install. On a first visit the generated worker claims the page as soon as it activates, so the images and articles requested after that go through the runtime caches. Images the page requested before the worker took control are not in the `images` cache, so they are available offline from the second page view on.

`start()` skips registration when the page runs on `www.smalldevtalk.net`, because it first moves the page to `smalldevtalk.net`. On the `www.` host GitHub Pages redirects every request, and browsers reject a service worker script behind a redirect.

Implementation: [src/scripts/index.js](../../src/scripts/index.js)

## Security Headers

GitHub Pages cannot send custom response headers, so [src/scripts/sw-headers.js](../../src/scripts/sw-headers.js) adds them. `workbox-config.js` loads it into `sw.js` with `importScripts`, and the browser checks it for changes whenever it checks `sw.js`.

For a same-origin navigation, `handleFetch()` answers `/` and `/index.html` from the precache and every other page from the network, then adds these headers to the HTML response: `Content-Security-Policy` (the policy in `index.html` plus `frame-ancestors 'self'`), `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` and `X-Frame-Options`. It then calls `stopImmediatePropagation()`, so the Workbox listener registered after it does not call `respondWith` a second time on the same event. Responses that are not same-origin HTML pass through unchanged.

The headers reach returning visitors only, because the first visit is served by the network before the worker exists. The worker sets no `Strict-Transport-Security` header, which browsers honour only on a response from the network.

Implementation: [src/scripts/sw-headers.js](../../src/scripts/sw-headers.js), [workbox-config.js](../../workbox-config.js)

## Precaching and Runtime Caching

Workbox generates `sw.js` and its `workbox-<hash>.js` runtime at the repository root from `workbox-config.js`:

- Precaches the app shell only: `index.html`, the minified site script and stylesheet, the jQuery, Bootstrap and Showdown files `index.html` loads, `articleData.json`, `legacyPagesDisplay.json`, the title and background images, and the favicons and web manifest
- Matches precached URLs with every query parameter removed, so `index.html?ArticleKey` is served from the precached `index.html`
- Claims open pages when the worker activates (`clientsClaim`), so a first visit is controlled without a reload
- Activates a new release as soon as it installs (`skipWaiting`), instead of waiting until every tab of the site is closed, which a reload does not do
- Applies a CacheFirst strategy to PNG, JPEG, GIF, WebP, ICO and SVG image requests (`images` cache, at most 100 entries, purged on a storage quota error)
- Applies a NetworkFirst strategy to article markdown under `/src/articleArchive/` (`articles` cache, at most 50 entries), so online readers get the current text and articles already read work offline

Precached files are served from the cache until `sw.js` is regenerated, so a change to any of them needs a new `sw.js`. A returning visitor's browser installs the new worker on its next visit, while that visit is still served by the previous one, so the changed files, and a changed Content-Security-Policy in `index.html` or `sw-headers.js`, appear on the visit after that.

Implementation: [workbox-config.js](../../workbox-config.js), [sw.js](../../sw.js)

## Regeneration

Run `npm run workbox` to regenerate the service worker after changing a precached file. `npm run validate` runs it after `npm run minify`, and the JavaScript quality workflow fails when the committed `sw.js` differs from a fresh `npm run workbox` run.

Implementation: [package.json](../../package.json), [.github/workflows/code-qa-js.yaml](../../.github/workflows/code-qa-js.yaml)

## Related Documentation

- [System Architecture](../architecture/system.md)
