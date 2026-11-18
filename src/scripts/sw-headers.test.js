/** @jest-environment node */

const fs = require("fs");
const path = require("path");

const { CONTENT_SECURITY_POLICY, SECURITY_HEADERS, withSecurityHeaders, handleFetch } = require("./sw-headers.js");

/**
 * Read a Content-Security-Policy directive list into a map of directive name to sources.
 * @param {string} policy The policy text.
 * @returns {Map<string, string>} Directive name to its source list.
 */
function parsePolicy(policy) {
	return new Map(
		policy
			.split(";")
			.map((directive) => directive.trim())
			.filter(Boolean)
			.map((directive) => {
				const [name, ...sources] = directive.split(/\s+/);

				return [name, sources.join(" ")];
			}),
	);
}

/**
 * Build a same-origin-like HTML response. `new Response` has type "default", so the type is overridden.
 * @param {string} contentType The Content-Type header value.
 * @returns {Response} A response whose type is "basic".
 */
function basicResponse(contentType) {
	const response = new Response("<!doctype html><title>x</title>", {
		status: 200,
		statusText: "OK",
		headers: { "Content-Type": contentType },
	});
	Object.defineProperty(response, "type", { value: "basic" });

	return response;
}

describe("withSecurityHeaders", () => {
	test("adds every security header and keeps the body, status and original headers", async () => {
		const result = withSecurityHeaders(basicResponse("text/html; charset=utf-8"));

		Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
			expect(result.headers.get(name)).toBe(value);
		});
		expect(result.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
		expect(result.status).toBe(200);
		expect(await result.text()).toBe("<!doctype html><title>x</title>");
	});

	test("returns non-HTML responses unchanged", () => {
		const response = basicResponse("application/json");

		expect(withSecurityHeaders(response)).toBe(response);
	});

	test("returns responses that are not basic unchanged", () => {
		const response = new Response("", { headers: { "Content-Type": "text/html" } });
		Object.defineProperty(response, "type", { value: "opaqueredirect" });

		expect(withSecurityHeaders(response)).toBe(response);
	});

	test("sets the headers that stop MIME sniffing and cross-site framing", () => {
		expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
		expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("SAMEORIGIN");
		expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'self'");
		expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-eval'");
	});
});

describe("handleFetch", () => {
	const workerOrigin = "https://smalldevtalk.net";
	const originalFetch = global.fetch;

	/**
	 * Build a fetch event stand-in whose `respondWith` and `stopImmediatePropagation` are Jest mocks.
	 * @param {string} url The requested URL.
	 * @param {string} mode The request mode.
	 * @returns {object} The event.
	 */
	function createFetchEvent(url, mode) {
		return { request: { url, mode }, respondWith: jest.fn(), stopImmediatePropagation: jest.fn() };
	}

	beforeEach(() => {
		// The network is the boundary: the worker's own fetch to the origin cannot run in a Jest test.
		global.fetch = jest.fn(() => Promise.resolve(basicResponse("text/html")));
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	test("answers a same-origin navigation with the security headers and stops the other listeners", async () => {
		const event = createFetchEvent(`${workerOrigin}/other.html`, "navigate");

		handleFetch(event, workerOrigin);

		expect(event.respondWith).toHaveBeenCalledTimes(1);
		expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);

		const response = await event.respondWith.mock.calls[0][0];

		expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
	});

	test("leaves a request that is not a navigation to the other listeners", () => {
		const event = createFetchEvent(`${workerOrigin}/src/style.min.css`, "no-cors");

		handleFetch(event, workerOrigin);

		expect(event.respondWith).not.toHaveBeenCalled();
		expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
	});

	test("leaves a navigation to another origin to the other listeners", () => {
		const event = createFetchEvent("https://example.com/", "navigate");

		handleFetch(event, workerOrigin);

		expect(event.respondWith).not.toHaveBeenCalled();
		expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
	});
});

describe("Content-Security-Policy in index.html", () => {
	const html = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
	const metaPolicy = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]*)"/)?.[1];

	test("exists", () => {
		expect(metaPolicy).toBeTruthy();
	});

	test("matches the header policy, which only adds frame-ancestors", () => {
		const header = parsePolicy(CONTENT_SECURITY_POLICY);
		const meta = parsePolicy(metaPolicy);

		header.delete("frame-ancestors");

		expect(meta).toEqual(header);
	});

	test("lets the page fetch the source map of the Sentry bundle, which the browser requests from the CDN", () => {
		expect(parsePolicy(metaPolicy).get("connect-src")).toContain("https://browser.sentry-cdn.com");
		expect(parsePolicy(CONTENT_SECURITY_POLICY).get("connect-src")).toContain("https://browser.sentry-cdn.com");
	});

	test("does not allow inline or eval scripts", () => {
		const scriptSrc = parsePolicy(metaPolicy).get("script-src");

		expect(scriptSrc).not.toContain("'unsafe-inline'");
		expect(scriptSrc).not.toContain("'unsafe-eval'");
	});
});
