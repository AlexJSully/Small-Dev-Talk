describe("Content Security Policy", () => {
	it("blocks nothing the page needs while it loads", () => {
		const violations = [];

		cy.visit("http://localhost:3000", {
			onBeforeLoad(win) {
				win.document.addEventListener("securitypolicyviolation", (event) => {
					violations.push(`${event.violatedDirective} blocked ${event.blockedURI}`);
				});
			},
		});

		// Wait for the carousel to render and for each third-party script (Sentry, Google Tag Manager, X widgets) to run.
		cy.get("#carouselInner .carousel-item").should("exist");
		cy.window().its("Sentry").should("exist");
		cy.window().its("google_tag_manager").should("exist");
		cy.get("#twitterTimeline iframe").should("exist");
		cy.then(() => {
			expect(violations, violations.join("\n")).to.be.empty;
		});
	});

	it("lets the page fetch the source map of the Sentry bundle", () => {
		const violations = [];

		cy.visit("http://localhost:3000", {
			onBeforeLoad(win) {
				win.document.addEventListener("securitypolicyviolation", (event) => {
					violations.push(`${event.violatedDirective} blocked ${event.blockedURI}`);
				});
			},
		});

		// The bundle ends with a sourceMappingURL comment, and a browser with its developer tools open fetches that map.
		cy.get('script[src^="https://browser.sentry-cdn.com/"]')
			.invoke("attr", "src")
			.then((src) => {
				cy.window().then((win) => win.fetch(`${src}.map`).then(() => {}));
			});
		cy.then(() => {
			expect(violations, violations.join("\n")).to.be.empty;
		});
	});

	it("keeps the controls that used inline handlers working", () => {
		cy.visit("http://localhost:3000");
		cy.get("#carouselInner .carousel-item.active").should("have.length", 1);
		cy.get("#carouselInner .carousel-item.active")
			.invoke("index")
			.then((before) => {
				cy.get(".carousel-control-next").click();
				cy.get("#carouselInner .carousel-item.active").invoke("index").should("not.equal", before);
			});
	});
});
