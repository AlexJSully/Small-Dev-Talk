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

	it("lets a new release of the worker take over an open page, so a returning visitor gets the new policy", () => {
		cy.visit(`${origin}/index.html`);
		cy.window().its("navigator.serviceWorker.controller").should("not.be.null");

		// A changed sw.js is how the browser learns of a new release, including a changed Content-Security-Policy.
		cy.intercept("GET", "/sw.js", (request) => {
			request.continue((response) => {
				response.body = `${response.body}\n// next release`;
			});
		});

		cy.window().then((win) => {
			const controllerChanged = new Promise((resolve) => {
				win.navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
			});

			return win.navigator.serviceWorker
				.getRegistration()
				.then((registration) => registration.update())
				.then(() => controllerChanged);
		});

		cy.window()
			.then((win) => win.navigator.serviceWorker.getRegistration())
			.then((registration) => {
				expect(registration.waiting).to.be.null;
				expect(registration.active).not.to.be.null;
			});
	});

	it("adds the Permissions-Policy header to a page it answers", () => {
		cy.visit(`${origin}/index.html`);
		cy.window().its("navigator.serviceWorker.controller").should("not.be.null");

		// The first visit came from the network, which sends no Permissions-Policy header, so the camera is allowed.
		cy.document().then((doc) => {
			expect((doc.permissionsPolicy || doc.featurePolicy).allowsFeature("camera")).to.equal(true);
		});

		// The worker answers this navigation. The browser reports the header it received through
		// document.permissionsPolicy, and `camera=()` and `microphone=()` turn those features off.
		cy.visit(`${origin}/index.html?pages&games`);
		cy.window().its("navigator.serviceWorker.controller").should("not.be.null");
		cy.document().then((doc) => {
			const policy = doc.permissionsPolicy || doc.featurePolicy;

			expect(policy.allowsFeature("camera")).to.equal(false);
			expect(policy.allowsFeature("microphone")).to.equal(false);
		});
	});
});
