/**
 * Send a mouse event to a point in the page under test through the browser's DevTools protocol. The browser treats it as
 * a real mouse, so a press focuses a link the way a visitor's click does, which a synthetic event cannot.
 * @param {string} type `mousePressed`, `mouseMoved` or `mouseReleased`.
 * @param {number} x The point's distance from the left of the page's viewport, in CSS pixels.
 * @param {number} y The point's distance from the top of the page's viewport, in CSS pixels.
 * @param {number} buttons The buttons held down once the event is handled: 1 for the left button, 0 for none.
 * @returns {Cypress.Chainable} The command chain.
 */
const dispatchMouseEvent = (type, x, y, buttons) =>
	cy.then(() => {
		// The protocol takes points in the Cypress window, which shows the page in a scaled frame.
		const frame = window.top.document.querySelector("iframe.aut-iframe");
		const frameBox = frame.getBoundingClientRect();
		const scale = frameBox.width / frame.offsetWidth;

		return Cypress.automation("remote:debugger:protocol", {
			command: "Input.dispatchMouseEvent",
			params: {
				type,
				x: frameBox.left + x * scale,
				y: frameBox.top + y * scale,
				button: "left",
				buttons,
				clickCount: 1,
			},
		});
	});

describe("Accessibility", () => {
	beforeEach(() => {
		cy.blockXEmbed();
	});

	[
		["the home page", "http://localhost:3000/", "#displayArticles .post"],
		["a section page", "http://localhost:3000/index.html?pages&games", "#carouselInner .carousel-item"],
		["the archive", "http://localhost:3000/index.html?pages&archive", "#displayArticles .archive-display"],
		["an article with a video", "http://localhost:3000/index.html?Caravaneer2", "#articleBody h2"],
		["the missing-article error", "http://localhost:3000/index.html?NotAnArticleKey", "#articleBody .btn"],
	].forEach(([page, url, rendered]) => {
		it(`has no WCAG 2.2 AA or best-practice violations on ${page}`, () => {
			cy.visit(url);
			cy.get(rendered).should("exist");

			cy.checkAccessibility();
		});
	});

	it("has no WCAG 2.2 AA or best-practice violations on the home page on a phone", () => {
		cy.viewport(412, 823);
		cy.visit("http://localhost:3000/");
		cy.get("#displayArticles .post").should("exist");

		cy.checkAccessibility();
	});

	it("marks the page header, main content and sidebar as landmarks", () => {
		cy.visit("http://localhost:3000/");

		cy.get("header").should("have.length", 1).find("nav").should("exist");
		cy.get("header h1 img").should("have.attr", "alt", "Small Dev Talk");
		cy.get("main#content").should("have.length", 1).find("#featuredArticles").should("exist");
		cy.get("aside#sidebar").should("exist").closest("main").should("not.exist");
		cy.get('[role="main"]').should("not.exist");
	});

	it("focuses a visible skip link first, which moves keyboard focus to the main content", () => {
		cy.visit("http://localhost:3000/");
		cy.get("#carouselInner .carousel-item").should("exist");

		cy.press(Cypress.Keyboard.Keys.TAB);
		cy.focused()
			.should("have.class", "skipLink")
			.and("have.attr", "href", "#content")
			.and("contain", "Skip to main content")
			.and("be.visible")
			.and("have.css", "background-color", "rgb(0, 0, 0)")
			.and("have.css", "color", "rgb(255, 255, 255)")
			.and(($link) => expect($link[0].getBoundingClientRect().height).to.be.at.least(24));

		cy.focused().click();
		cy.location("hash").should("equal", "#content");
		cy.press(Cypress.Keyboard.Keys.TAB);
		cy.focused().should(($element) => expect($element.closest("#content")).to.have.length(1));
	});

	it("opens the Games submenu on keyboard focus, unclipped, and closes it on Escape", () => {
		cy.visit("http://localhost:3000/");
		cy.contains("#header nav a", "Interviews").should("not.be.visible");

		cy.press(Cypress.Keyboard.Keys.TAB);
		cy.contains("#header nav a", "Games").focus();
		// Visibility accounts for clipping by a scrolling ancestor, so a nav bar that clips the submenu fails here.
		cy.contains("#header nav a", "Interviews").should("be.visible");

		cy.press(Cypress.Keyboard.Keys.TAB);
		cy.focused().should("contain", "Interviews");

		cy.focused().trigger("keydown", { key: "Escape" });
		cy.contains("#header nav a", "Interviews").should("not.be.visible");
		// Focus leaves the hidden link for Games, so the keyboard user can still see where they are.
		cy.focused().should("contain", "Games").and("be.visible");

		// Moving focus out of the item and back opens the submenu again.
		cy.contains("#header nav a", "Movies").focus();
		cy.contains("#header nav a", "Games").focus();
		cy.contains("#header nav a", "Small Plays").should("be.visible");
	});

	it("leaves the Games submenu closed when a mouse press, not the keyboard, focuses Games", () => {
		cy.visit("http://localhost:3000/");
		cy.get("#carouselInner .carousel-item").should("exist");

		// Chromium focuses a link on a mouse press. Releasing in the page's corner, away from every link, focuses Games
		// without opening it, which is where focus stays after a Ctrl+click opens the link in a new tab.
		cy.contains("#header nav a", "Games").then(($games) => {
			const games = $games[0].getBoundingClientRect();
			const [gamesX, gamesY] = [games.left + games.width / 2, games.top + games.height / 2];
			const [cornerX, cornerY] = [5, $games[0].ownerDocument.defaultView.innerHeight - 5];

			dispatchMouseEvent("mouseMoved", gamesX, gamesY, 0);
			dispatchMouseEvent("mousePressed", gamesX, gamesY, 1);
			dispatchMouseEvent("mouseMoved", cornerX, cornerY, 1);
			dispatchMouseEvent("mouseReleased", cornerX, cornerY, 0);
		});

		cy.focused().should("contain", "Games");
		cy.contains("#header nav a", "Interviews").should("not.be.visible");
	});

	it("opens the Games submenu directly beneath Games when the navigation bar wraps on a phone", () => {
		cy.viewport(412, 823);
		cy.visit("http://localhost:3000/");

		cy.press(Cypress.Keyboard.Keys.TAB);
		cy.contains("#header nav a", "Games").focus();
		cy.contains("#header nav a", "Interviews").should(($link) => {
			const games = $link[0].closest("ul").parentElement.getBoundingClientRect();
			const submenu = $link[0].closest("ul").getBoundingClientRect();
			const pages = $link[0].ownerDocument.querySelector("#header .pages");

			// The bar wraps at this width, so beneath the whole list is a row or more below Games.
			expect(pages.getBoundingClientRect().height).to.be.greaterThan(games.height * 1.5);
			expect(submenu.top).to.be.closeTo(games.bottom, 1);
			expect(submenu.left).to.be.closeTo(games.left, 1);
		});
	});

	it("draws the focus ring of a carousel slide link inside the slide, where the carousel does not clip it", () => {
		cy.visit("http://localhost:3000/");
		cy.get("#carouselLink0").should("exist");

		// A key press first makes the browser treat the later focus as keyboard focus, which :focus-visible matches.
		cy.press(Cypress.Keyboard.Keys.TAB);
		cy.get("#carouselLink0").focus();

		cy.get("#carouselLink0")
			.should("have.css", "outline-style", "solid")
			.and("have.css", "outline-color", "rgb(255, 255, 255)")
			.and("have.css", "outline-offset", "-6px")
			.and(($link) => {
				const ring = getComputedStyle($link[0], "::after");

				expect(ring.boxShadow).to.contain("inset");
				expect(ring.position).to.equal("absolute");
				expect(parseFloat(ring.width)).to.be.closeTo($link[0].getBoundingClientRect().width, 1);
			});
	});

	describe("in forced colors mode", () => {
		afterEach(() => {
			cy.emulateMedia("forced-colors", "");
		});

		it("keeps the carousel arrows' colors and draws the indicators in system colors", () => {
			cy.visit("http://localhost:3000/");
			cy.get("#carouselIndicator button").should("have.length.greaterThan", 1);

			cy.emulateMedia("forced-colors", "active");

			cy.get(".carousel-control-prev-icon, .carousel-control-next-icon").each(($icon) => {
				expect(getComputedStyle($icon[0]).forcedColorAdjust).to.equal("none");
			});
			cy.get("#carouselIndicator button").should(($buttons) => {
				const background = (button) => getComputedStyle(button).backgroundColor;

				expect(background($buttons[0])).not.to.equal("rgba(0, 0, 0, 0)");
				expect(background($buttons[1])).not.to.equal("rgba(0, 0, 0, 0)");
				// The current indicator is told apart by color as well as width.
				expect(background($buttons[0])).not.to.equal(background($buttons[1]));
			});
		});
	});

	[
		// 320 CSS pixels is a 1280 pixel wide window at 400% zoom, the width WCAG 1.4.10 Reflow names.
		[320, 640],
		// A 1280 pixel wide window at 200% zoom.
		[640, 400],
	].forEach(([width, height]) => {
		["http://localhost:3000/", "http://localhost:3000/index.html?Caravaneer2"].forEach((url) => {
			it(`fits ${url} in a ${width} pixel wide window without scrolling sideways`, () => {
				cy.viewport(width, height);
				cy.visit(url);
				cy.get("#displayArticles .post, #articleBody img").should("exist");

				cy.document().should((doc) => {
					expect(doc.documentElement.scrollWidth).to.be.at.most(width);
				});
			});
		});
	});
});
