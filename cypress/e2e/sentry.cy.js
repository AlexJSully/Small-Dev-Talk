const sentrySdkUrl = "https://browser.sentry-cdn.com/10.32.1/bundle.tracing.replay.min.js";

/**
 * Intercept every Sentry envelope the page sends, reply with success, and collect the request bodies.
 * @returns {string[]} The array the intercepted envelope bodies are pushed into.
 */
function captureSentryEnvelopes() {
	const envelopeBodies = [];
	cy.intercept("POST", "**/api/6600431/envelope/**", (request) => {
		envelopeBodies.push(request.body);
		request.reply({ statusCode: 200, body: "" });
	});

	return envelopeBodies;
}

/**
 * Join the text of every error and message event in the captured Sentry envelopes.
 * Breadcrumbs are ignored, because they record earlier console calls inside unrelated events.
 * @param {string[]} envelopeBodies Raw envelope request bodies.
 * @returns {string} Each event's message, or its exception values, one event per line.
 */
function sentEventText(envelopeBodies) {
	return envelopeBodies
		.flatMap((body) => String(body).split("\n"))
		.map((line) => {
			try {
				return JSON.parse(line);
			} catch {
				return null;
			}
		})
		.filter((item) => item && (item.message || item.exception))
		.map((event) =>
			event.message ? String(event.message) : event.exception.values.map((value) => value.value).join(" "),
		)
		.join("\n");
}

describe("Sentry initialization", () => {
	it("loads compatible integrations and captures errors and tracing events", () => {
		const envelopeBodies = captureSentryEnvelopes();

		cy.visit("http://localhost:3000");

		cy.window().should((win) => {
			expect(win.Sentry).to.exist;
			expect(win.Sentry.getClient()).to.exist;
			expect(win.Sentry.browserTracingIntegration).to.be.a("function");
			expect(win.Sentry.replayIntegration).to.be.a("function");
			expect(win.Sentry.getCurrentScope().getScopeData().tags["app-version"]).to.equal("1.3.4");
		});

		cy.window().then((win) => {
			win.Sentry.captureException(new Error("Sentry capture smoke test"));
			win.Sentry.startSpan({ name: "Sentry tracing smoke test", op: "test" }, () => {});
		});

		cy.wrap(null).should(() => {
			const envelopes = envelopeBodies.join("\n");
			expect(envelopes).to.contain("Sentry capture smoke test");
			expect(envelopes).to.contain('"type":"transaction"');
		});
	});

	it("reports the site's own errors and ignores third-party console output", () => {
		const envelopeBodies = captureSentryEnvelopes();

		cy.visit("http://localhost:3000/index.html?NonExistentArticle");
		cy.get("#articleBody").should("contain", "Error retrieving article.");

		cy.window().then((win) => {
			// The console output a visitor's Playwright script logged on the production site.
			win.console.error(
				"无法访问Iframe 1 的内容，可能是由于跨域限制:",
				new win.Error("Blocked a frame with origin from accessing a cross-origin frame."),
			);
			win.console.info("Iframe 3 内容已成功填充到新div中！");

			return win.Sentry.flush(10000);
		});

		cy.wrap(null).should(() => {
			const sentText = sentEventText(envelopeBodies);
			expect(sentText).to.contain("Error retrieving article.");
			expect(sentText).not.to.contain("cross-origin frame");
			expect(sentText).not.to.contain("Iframe 3");
		});
	});

	it("reports a missing SDK and continues rendering the page", () => {
		// Clear Chromium's HTTP cache so a previously loaded SDK cannot bypass the intercept.
		cy.then(() =>
			Cypress.automation("remote:debugger:protocol", {
				command: "Network.clearBrowserCache",
			}),
		);
		cy.intercept(`${sentrySdkUrl}*`, { forceNetworkError: true });
		cy.visit("http://localhost:3000", {
			onBeforeLoad(win) {
				win.__consoleErrors = [];
				const originalConsoleError = win.console.error.bind(win.console);
				win.console.error = (...args) => {
					win.__consoleErrors.push(args.join(" "));
					originalConsoleError(...args);
				};
			},
		});

		cy.get("#featuredArticles").should("be.visible");
		cy.window().should((win) => {
			expect(win.__consoleErrors.join(" ")).to.contain("Sentry initialization skipped");
		});
	});
});
