const fs = require("node:fs");
const path = require("node:path");
const { globPatterns } = require("./workbox-config.js");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
/** The `src` of every `<script>` in index.html, from this site or another. */
const scripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g), ([, src]) => src);
/** The scripts index.html loads from this site, as paths from the site root. */
const siteScripts = scripts.filter((src) => src.startsWith("./src/")).map((src) => src.slice(2));

describe("index.html scripts and the service worker precache", () => {
	test("precaches every site script the page loads", () => {
		expect(siteScripts).toContain("src/scripts/index.min.js");
		siteScripts.forEach((script) => expect(globPatterns).toContain(script));
	});

	test("loads and precaches no jQuery or Bootstrap JavaScript, from this site or another", () => {
		expect(scripts.some((src) => src.startsWith("https://"))).toBe(true);
		[...scripts, ...globPatterns].forEach((file) => {
			expect(file).not.toMatch(/jquery|bootstrap[^/]*\.js$/i);
		});
	});
});
