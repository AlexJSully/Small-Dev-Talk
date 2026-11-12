const origin = "http://localhost:3000";

describe("Service worker", () => {
	it("controls the page once registered", () => {
		cy.visit(`${origin}/index.html`);

		cy.window()
			.then((win) => win.navigator.serviceWorker.ready)
			.its("scope")
			.should("equal", `${origin}/`);

		cy.reload();

		cy.window().its("navigator.serviceWorker.controller").should("not.be.null");
	});

	it("precaches the app shell and no article content", () => {
		cy.visit(`${origin}/index.html`);

		cy.window()
			.then((win) =>
				win.navigator.serviceWorker.ready.then(() => win.caches.open(`workbox-precache-v2-${origin}/`)),
			)
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
