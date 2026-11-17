describe("Landing Page", () => {
	beforeEach(() => {
		// Visit the landing page (adjust port if needed)
		cy.visit("http://localhost:3000");
	});

	it("should render page", () => {
		// Featured Articles section
		cy.get("#featuredArticles").should("exist").and("be.visible");
		cy.get("#featuredArticles h2.title").should("contain", "Featured Articles");

		// Carousel and indicators
		cy.get("#carouselExampleIndicators").should("exist");
		cy.get("#carouselInner").should("exist");
		cy.get("#carouselIndicator").should("exist");

		// Display Articles section should have content (not be empty)
		cy.get("#displayArticles")
			.should("exist")
			.and(($el) => {
				expect($el.text().trim().length).to.be.greaterThan(0);
			});

		// SVG Title image
		cy.get('img[src*="title.svg"]').should("exist").and("be.visible");

		// Article body exists (may be hidden initially)
		cy.get("#articleBody").should("exist");
	});

	it("should show a follow link, not an empty box, when X does not serve the timeline", () => {
		// X rate-limits embedded timelines per IP with a 429, so block the embed to reproduce that failure.
		cy.intercept("https://platform.twitter.com/**", { statusCode: 429, body: "" });
		cy.intercept("https://syndication.twitter.com/**", { statusCode: 429, body: "" });
		cy.visit("http://localhost:3000");

		cy.get(".twitterFallback").should("be.visible");
		cy.get(".twitterFallback a")
			.should("have.attr", "href", "https://twitter.com/SmallDevTalk")
			.and("contain", "Follow @SmallDevTalk on X")
			.and("have.css", "color", "rgb(13, 110, 253)")
			.and("have.css", "text-decoration-line", "none");

		// The timeline stays hidden and takes no room, and the link stays after the page has settled.
		cy.get("#twitterTimeline").should("have.class", "twitterTimelinePending").and("not.be.visible");
		cy.wait(2000);
		cy.get(".twitterFallback").should("be.visible");
	});

	it("should show error when article is missing", () => {
		// Simulate navigating to a missing article
		cy.visit("http://localhost:3000/index.html?NonExistentArticle", {
			onBeforeLoad(win) {
				// Simulate service worker registration throwing a disallowed redirect error
				Object.defineProperty(win.navigator, "serviceWorker", {
					value: {
						register: () => Promise.reject(new Error("disallowed redirect")),
					},
					writable: true,
				});
			},
		});

		cy.get("#articleBody").should("contain", "Error retrieving article");
		cy.get("#articleBody").should("be.visible");
	});
});
