const origin = "http://localhost:3000";

describe("Service worker", () => {
	it("registers at the site root, controls the page and precaches only the app shell", () => {
		cy.visit(`${origin}/index.html`);

		cy.window()
			.then((win) => win.navigator.serviceWorker.ready)
			.its("scope")
			.should("equal", `${origin}/`);

		// The worker claims the page when it first activates, so the page is controlled without a reload. A reload would
		// be served from the precached index.html, which bypasses the Cypress proxy that instruments the page.
		cy.window().its("navigator.serviceWorker.controller").should("not.be.null");

		cy.window()
			.then((win) => win.caches.open(`workbox-precache-v2-${origin}/`))
			.then((cache) => cache.keys())
			.then((requests) => {
				const paths = requests.map((request) => new URL(request.url).pathname);

				expect(paths).to.include("/index.html");
				expect(paths).to.include("/src/articleArchive/articleData.json");
				expect(paths).to.include("/src/scripts/index.min.js");
				expect(paths.length).to.be.lessThan(20);
				expect(paths.filter((path) => /\/src\/articleArchive\/author/.test(path))).to.be.empty;
			});
	});
});
