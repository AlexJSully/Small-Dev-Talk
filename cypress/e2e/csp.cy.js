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

		// Let the carousel render and the third-party scripts (Google Tag Manager, X widgets, Sentry) load.
		cy.get("#carouselInner .carousel-item").should("exist");
		cy.wait(3000).then(() => {
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
