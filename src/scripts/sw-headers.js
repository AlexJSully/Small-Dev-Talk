/**
 * Adds security headers to the page's own navigation responses.
 *
 * GitHub Pages sends no custom response headers, so this service worker adds them when it answers a navigation. It
 * covers returning visitors only: the first visit is served by the network before the worker exists. HSTS cannot be
 * added here, because browsers only honour it on a response that came from the network.
 *
 * `workbox-config.js` loads this file into `sw.js` with `importScripts`. It also loads as a CommonJS module in Jest.
 */

/**
 * The same policy as the Content-Security-Policy `meta` tag in `index.html`, plus `frame-ancestors`, which browsers only
 * honour as a header. `sw-headers.test.js` fails when the two drift apart.
 */
const CONTENT_SECURITY_POLICY =
	"default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://browser.sentry-cdn.com https://platform.twitter.com; style-src 'self' 'unsafe-inline' https://platform.twitter.com https://*.twimg.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://syndication.twitter.com https://cdn.syndication.twimg.com; frame-src https://www.googletagmanager.com https://platform.twitter.com https://syndication.twitter.com; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';";

/** Headers added to every page response. `SAMEORIGIN` and `'self'` keep Cypress, which frames the page, working. */
const SECURITY_HEADERS = {
	"Content-Security-Policy": CONTENT_SECURITY_POLICY,
	"Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "SAMEORIGIN",
};

/**
 * Copy an HTML response with the security headers added.
 * Responses that are not same-origin HTML (redirects, errors from the network layer) pass through unchanged,
 * because the browser does not let a worker rebuild an opaque response.
 * @param {Response} response The page response from the precache or the network.
 * @returns {Response} The response with the security headers, or the original response.
 */
function withSecurityHeaders(response) {
	const contentType = response.headers.get("Content-Type") || "";

	if (response.type !== "basic" || !contentType.includes("text/html")) {
		return response;
	}

	const headers = new Headers(response.headers);

	Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
		headers.set(name, value);
	});

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Answer a navigation to the home page from the precache when it is there, otherwise from the network.
 * Pages are addressed as `index.html?ArticleKey`, so the lookup ignores the query string, like `workbox-config.js`.
 * @param {Request} request The navigation request.
 * @returns {Promise<Response>} The page response with the security headers.
 */
async function respondToNavigation(request) {
	const { pathname } = new URL(request.url);
	const precached =
		pathname === "/" || pathname === "/index.html"
			? await caches.match("/index.html", { ignoreSearch: true })
			: undefined;

	return withSecurityHeaders(precached || (await fetch(request)));
}

/**
 * Answer a same-origin navigation with the security headers and stop the event from reaching the listeners registered
 * after this one. Workbox registers a listener that answers the precached `index.html` too, and a second
 * `respondWith` call on one event throws an `InvalidStateError`.
 * @param {FetchEvent} event The fetch event.
 * @param {string} workerOrigin The origin the worker runs on.
 * @returns {void}
 */
function handleFetch(event, workerOrigin) {
	const { request } = event;

	if (request.mode !== "navigate" || new URL(request.url).origin !== workerOrigin) {
		return;
	}

	event.respondWith(respondToNavigation(request));
	event.stopImmediatePropagation();
}

if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
	self.addEventListener("fetch", (event) => handleFetch(event, self.location.origin));
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = { CONTENT_SECURITY_POLICY, SECURITY_HEADERS, withSecurityHeaders, handleFetch };
}
