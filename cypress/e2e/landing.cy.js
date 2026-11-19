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

	it("should switch carousel slides with the next and previous controls", () => {
		cy.get("#carouselInner .carousel-item").should("have.length.greaterThan", 1);
		cy.get("#carouselInner .carousel-item.active")
			.should("have.length", 1)
			.and("have.descendants", "#carouselImage0");

		cy.get(".carousel-control-next").click();
		cy.get("#carouselInner .carousel-item.active")
			.should("have.length", 1)
			.and("have.descendants", "#carouselImage1");

		cy.get(".carousel-control-prev").click();
		cy.get("#carouselInner .carousel-item.active")
			.should("have.length", 1)
			.and("have.descendants", "#carouselImage0");
	});

	it("should load the first carousel image at once and at high priority", () => {
		cy.get("#carouselImage0")
			.should("have.attr", "loading", "eager")
			.and("have.attr", "fetchpriority", "high")
			.and("have.attr", "width")
			.and("match", /^\d+$/);
	});

	it("should load no jQuery or Bootstrap JavaScript, which the site does not call", () => {
		cy.get("#carouselInner .carousel-item").should("have.length.greaterThan", 1);
		cy.get('script[src*="jquery"], script[src*="bootstrap"]').should("not.exist");
		cy.window().should("not.have.property", "jQuery");
		cy.window().should("not.have.property", "bootstrap");
	});

	it("should load an article's first image at once and the later ones lazily", () => {
		cy.visit("http://localhost:3000/index.html?YukiVsPanda");

		cy.get("#articleBody img").should("have.length.greaterThan", 2);
		cy.get("#articleBody img").each(($img, index) => {
			expect($img.attr("loading")).to.equal(index === 0 ? undefined : "lazy");
		});
	});

	it("should keep the proportions of archive thumbnails", () => {
		cy.visit("http://localhost:3000/index.html?pages&archive");

		cy.get("#displayArticles .archive-display img").should("have.length.greaterThan", 10);
		cy.get("#displayArticles .archive-display img[width][height]").each(($img) => {
			// A thumbnail narrower than its own size must scale its height with its width.
			const attributeRatio = Number($img.attr("width")) / Number($img.attr("height"));

			expect($img[0].getBoundingClientRect().width / $img[0].getBoundingClientRect().height).to.be.closeTo(
				attributeRatio,
				0.05,
			);
		});
	});

	it("should show a follow link, not an empty box, when X does not serve the timeline", () => {
		// X rate-limits embedded timelines per IP with a 429, so block the embed to reproduce that failure.
		cy.intercept("https://platform.twitter.com/**", { statusCode: 429, body: "" });
		cy.intercept("https://syndication.twitter.com/**", { statusCode: 429, body: "" });
		cy.visit("http://localhost:3000");

		cy.get(".twitterFallback").should("be.visible");
		cy.get(".twitterFallback a")
			.should("have.attr", "href", "https://x.com/SmallDevTalk")
			.and("contain", "Follow @SmallDevTalk on X")
			.and("have.css", "color", "rgb(13, 110, 253)")
			.and("have.css", "text-decoration-line", "none");

		// The timeline stays hidden and takes no room, and the link stays after the page has settled.
		cy.get("#twitterTimeline").should("have.class", "twitterTimelinePending").and("have.attr", "inert");
		cy.get("#twitterTimeline").should("not.be.visible");
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

		cy.get("#articleBody").should("contain", "We could not find that article.");
		cy.get("#articleBody").should("be.visible");
	});

	it("should send the Home button of the error page to the home page", () => {
		cy.visit("http://localhost:3000/index.html?NotAnArticleKey");

		cy.get("#articleBody").should("contain", "We could not find that article.");
		cy.get('#articleBody [data-page-action="home"]').click();
		cy.location("search").should("equal", "");
	});

	it("should have a document head the W3C validator accepts", () => {
		cy.get("head meta[charset]").should("have.attr", "charset", "UTF-8");
		cy.get("head meta[http-equiv]")
			.should("have.length", 1)
			.and("have.attr", "http-equiv", "Content-Security-Policy");
		cy.get("[itemprop]").should("not.exist");
		cy.get("[onclick], [onClick]").should("not.exist");
		cy.get("script:not([src]):not([type])").should("not.exist");
		cy.get('img[src*="title.svg"]').should("not.have.attr", "loading", "auto");
	});

	it("should keep the navigation links white on the black navigation bar", () => {
		cy.get("#header .pages > li > a").first().should("have.css", "color", "rgb(255, 255, 255)");
		cy.get("#header nav").should("have.css", "background-color", "rgb(0, 0, 0)");
		// A light background on the list would put the white links on a background with a contrast ratio below 2:1.
		cy.get("#header nav ul.pages")
			.should("have.css", "background-image", "none")
			.and("have.css", "background-color", "rgba(0, 0, 0, 0)");
	});

	it("should update the article metadata, including the Twitter card tags, when an article opens", () => {
		cy.visit("http://localhost:3000/index.html?Oceania");

		cy.get("#articleBody").should("not.have.attr", "hidden");
		cy.get("#articleBody").should("not.be.empty");
		cy.title().should("contain", "| Small Dev Talk");
		["title", "description", "image"].forEach((name) => {
			cy.get(`meta[name="twitter:${name}"]`).should("have.attr", "content").and("not.be.empty");
		});
		cy.get('meta[name="twitter:title"]').should("have.attr", "content").and("contain", "| Small Dev Talk");
	});
});
