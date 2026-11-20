/**
 * Add up the named pixel lengths of a computed style.
 * @param {CSSStyleDeclaration} style The computed style of an element.
 * @param {string[]} properties The style properties to add up, such as `paddingLeft`.
 * @returns {number} The sum in pixels.
 */
const sumOfPixels = (style, properties) => properties.reduce((sum, property) => sum + parseFloat(style[property]), 0);

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
		cy.get("#featuredCarousel").should("exist");
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

	it("should show a slide when its indicator is clicked, and move the indicator with the arrows", () => {
		cy.get("#carouselIndicator button").should("have.length.greaterThan", 2);
		cy.get("#carouselIndicator button")
			.first()
			.should("have.class", "active")
			.and("have.attr", "aria-current", "true")
			// The current indicator is a 48 pixel dash and the others 30, each in a target at least 24 pixels tall.
			.and(($button) => {
				expect($button[0].getBoundingClientRect().width).to.be.closeTo(48, 1);
				expect($button[0].getBoundingClientRect().height).to.be.at.least(24);
			});
		cy.get("#carouselIndicator button")
			.eq(1)
			.should(($button) => expect($button[0].getBoundingClientRect().width).to.be.closeTo(30, 1));

		cy.get("#carouselIndicator button").eq(1).click();
		cy.get("#carouselInner .carousel-item").eq(1).should("have.class", "active");
		cy.get("#carouselIndicator button").eq(1).should("have.attr", "aria-current", "true");
		cy.get("#carouselIndicator button").first().should("not.have.attr", "aria-current");

		cy.get(".carousel-control-next").click();
		cy.get("#carouselInner .carousel-item").eq(2).should("have.class", "active");
		cy.get("#carouselIndicator button")
			.eq(2)
			.should("have.class", "active")
			.and("have.attr", "aria-current", "true");
	});

	it("should slide between slides with a short transform transition, and announce the slide shown", () => {
		cy.get("#carouselInner .carousel-item")
			.first()
			.should("have.css", "transition-property", "transform")
			.and("have.css", "transition-duration", "0.28s");
		cy.get("#carouselStatus").should("have.attr", "role", "status").and("be.empty");

		cy.get(".carousel-control-next").click();

		cy.get("#carouselInner .carousel-item.active")
			.should("have.length", 1)
			.and("have.descendants", "#carouselImage1")
			.and("not.have.class", "carousel-item-start");
		cy.get("#carouselStatus")
			.invoke("text")
			.should("match", /^Slide 2 of 3: \S/);
	});

	it("should run the arrows as buttons, and label the carousel and each slide", () => {
		cy.get("#featuredCarousel")
			.should("match", "section")
			.and("have.attr", "aria-roledescription", "carousel")
			.and("have.attr", "aria-label", "Featured articles");
		cy.get(".carousel-control-prev, .carousel-control-next").each(($control) => {
			expect($control[0].tagName).to.equal("BUTTON");
			expect($control.attr("aria-label")).to.match(/^(Previous|Next) slide$/);
		});
		cy.get("#carouselInner .carousel-item").each(($slide, index, $slides) => {
			expect($slide.attr("aria-roledescription")).to.equal("slide");
			expect($slide.attr("aria-label")).to.equal(`${index + 1} of ${$slides.length}`);
		});
	});

	it("should show the next slide on a swipe to the left and the previous one on a swipe to the right", () => {
		cy.get("#carouselInner .carousel-item.active").should("have.descendants", "#carouselImage0");

		cy.get("#featuredCarousel")
			.trigger("pointerdown", { pointerType: "touch", clientX: 300, clientY: 100 })
			.trigger("pointerup", { pointerType: "touch", clientX: 150, clientY: 110 });
		cy.get("#carouselInner .carousel-item.active").should("have.descendants", "#carouselImage1");

		cy.get("#featuredCarousel")
			.trigger("pointerdown", { pointerType: "touch", clientX: 150, clientY: 100 })
			.trigger("pointerup", { pointerType: "touch", clientX: 300, clientY: 90 });
		cy.get("#carouselInner .carousel-item.active").should("have.descendants", "#carouselImage0");
	});

	describe("with reduced motion", () => {
		afterEach(() => {
			cy.emulateMedia("prefers-reduced-motion", "");
		});

		it("should cross-fade the slides instead of sliding them", () => {
			cy.emulateMedia("prefers-reduced-motion", "reduce");

			cy.get("#carouselInner .carousel-item")
				.first()
				.should("have.css", "transition-property", "opacity")
				.and("have.css", "transform", "none");

			cy.get(".carousel-control-next").click();

			cy.get("#carouselInner .carousel-item.active")
				.should("have.length", 1)
				.and("have.descendants", "#carouselImage1")
				.and("have.css", "opacity", "1");
		});
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

	it("should reserve each article image's space before it loads, at the image's proportions", () => {
		// Hold back every image after the first, so each is measured before it loads. The first image is not held,
		// because it loads before the page's load event, which cy.visit waits for.
		cy.intercept(/\/2013-03-22_YukiVsPanda\/image[2-7]\.jpg$/, (request) => {
			request.on("response", (response) => {
				response.setDelay(10000);
			});
		});
		// The service worker the landing page installed fetches images itself, where cy.intercept cannot hold them, so
		// remove it and keep this visit from installing it again.
		cy.clearServiceWorkers();
		cy.visit("http://localhost:3000/index.html?YukiVsPanda", {
			onBeforeLoad(win) {
				cy.stub(win.navigator.serviceWorker, "register").resolves(undefined);
			},
		});

		cy.get("#articleBody img").should("have.length.greaterThan", 2);
		cy.get("#articleBody img").each(($img, index) => {
			const image = $img[0];
			const style = getComputedStyle(image);
			// The box includes the padding and border around the image.
			const frame = sumOfPixels(style, ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]);
			const frameHeight = sumOfPixels(style, [
				"paddingTop",
				"paddingBottom",
				"borderTopWidth",
				"borderBottomWidth",
			]);
			const box = image.getBoundingClientRect();

			if (index > 0) {
				expect(image.complete, image.getAttribute("src")).to.equal(false);
			}
			expect($img.attr("width")).to.match(/^\d+$/);
			expect($img.attr("height")).to.match(/^\d+$/);
			// An image that has not loaded takes its height from the attributes alone.
			expect((box.width - frame) / (box.height - frameHeight)).to.be.closeTo(
				Number($img.attr("width")) / Number($img.attr("height")),
				0.02,
			);
		});
	});

	[
		["the home page", "http://localhost:3000/", "#displayArticles .post"],
		["an article", "http://localhost:3000/index.html?YukiVsPanda", "#articleBody img"],
	].forEach(([page, url, rendered]) => {
		it(`should not shift the layout while ${page} loads on a phone`, () => {
			cy.blockXEmbed();
			cy.viewport(412, 823);
			cy.visit(url);

			cy.get(rendered).should("exist");
			// An image or font arriving without its size reserved is what shifts the page, so wait for those in view.
			cy.get("img").should(($images) => {
				$images.toArray().forEach((image) => {
					const box = image.getBoundingClientRect();
					const inView =
						box.width > 0 && box.bottom > 0 && box.top < image.ownerDocument.defaultView.innerHeight;

					if (inView) {
						expect(image.complete, image.src).to.equal(true);
					}
				});
			});
			cy.document().its("fonts.status").should("equal", "loaded");
			// A buffered observer receives every layout shift since the page started loading.
			cy.window()
				.then(
					(win) =>
						new Cypress.Promise((resolve) => {
							let total = 0;

							new win.PerformanceObserver((list) => {
								list.getEntries().forEach((entry) => {
									total += entry.value;
								});
							}).observe({ type: "layout-shift", buffered: true });
							setTimeout(() => resolve(total), 500);
						}),
				)
				// 0.1 is the most layout shift a page can have and still be rated good.
				.should("be.at.most", 0.1);
		});
	});

	it("should give the title its size before the title image loads", () => {
		// A copy of the title whose image never arrives during the test measures the space reserved before it loads.
		cy.intercept("/pending-title.svg", (request) => {
			request.on("response", (response) => {
				response.setDelay(10000);
			});
		});

		cy.get('#header h1 img[src*="title.svg"]').then(($img) => {
			const link = $img[0].parentElement;
			const copy = link.cloneNode(true);

			copy.querySelector("img").src = "/pending-title.svg";
			// Take the real title out of the row, so the copy gets the room the title has.
			link.hidden = true;
			link.after(copy);
		});

		cy.get('#header h1 img[src$="/pending-title.svg"]').should(($img) => {
			expect($img[0].complete).to.equal(false);
			expect($img[0].getBoundingClientRect().height).to.be.closeTo(70, 1);
			expect($img[0].getBoundingClientRect().width).to.be.closeTo(359, 1);
		});
	});

	it("should show the Ghostship article with its images", () => {
		cy.visit("http://localhost:3000/index.html?Ghostship");

		cy.get("#articleBody h2").first().should("have.text", "Ghostship");
		cy.get("#articleBody img").should("have.length", 13);
		cy.get("#articleBody img")
			.first()
			.should("be.visible")
			.and(($img) => expect($img[0].naturalWidth).to.equal(500));
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
		cy.blockXEmbed();
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

	it("should reload the page from the Refresh button of the error page", () => {
		cy.visit("http://localhost:3000/index.html?NotAnArticleKey");

		cy.get("#articleBody").should("contain", "We could not find that article.");
		cy.window().then((win) => {
			win.loadedBeforeRefresh = true;
		});
		cy.get('#articleBody [data-page-action="reload"]').click();
		cy.window().should("not.have.property", "loadedBeforeRefresh");
		cy.location("search").should("equal", "?NotAnArticleKey");
	});

	it("should open an article whose link carries a tracking parameter", () => {
		cy.visit("http://localhost:3000/index.html?Ghostship&fbclid=IwAR1&utm_source=x");

		cy.get("#articleBody").should("be.visible").find("h1, h2").should("exist");
		cy.get("#featuredArticles").should("not.be.visible");
	});

	it("should open the article that a multi-word link names", () => {
		cy.visit("http://localhost:3000/index.html?motte%20island");

		cy.get("#articleBody").should("be.visible").and("contain", "Motte Island");
		cy.get("#articleBody").should("not.contain", "We could not find that article.");
		cy.title().should("equal", "Motte Island | Small Dev Talk");
	});

	it("should show the not-found message for a link that ends with &", () => {
		cy.visit("http://localhost:3000/index.html?pages&");

		cy.get("#articleBody").should("be.visible").and("contain", "We could not find that article.");
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
