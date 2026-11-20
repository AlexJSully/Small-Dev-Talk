const sentrySdkUrl = "https://browser.sentry-cdn.com/11.12.0/bundle.tracing.replay.min.js";

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
 * Parse the error and message events out of the captured Sentry envelopes.
 * @param {string[]} envelopeBodies Raw envelope request bodies.
 * @returns {object[]} Each event that has a message or an exception.
 */
function sentEvents(envelopeBodies) {
	return envelopeBodies
		.flatMap((body) => String(body).split("\n"))
		.map((line) => {
			try {
				return JSON.parse(line);
			} catch {
				return null;
			}
		})
		.filter((item) => item && (item.message || item.exception));
}

/**
 * Join the text of every error and message event in the captured Sentry envelopes.
 * Breadcrumbs are ignored, because they record earlier console calls inside unrelated events.
 * @param {string[]} envelopeBodies Raw envelope request bodies.
 * @returns {string} Each event's message, or its exception values, one event per line.
 */
function sentEventText(envelopeBodies) {
	return sentEvents(envelopeBodies)
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
			expect(win.Sentry.getCurrentScope().getScopeData().tags["app-version"]).to.equal("1.3.5");
		});

		cy.window().then((win) => {
			win.Sentry.captureException(new Error("Sentry capture smoke test"));
			win.Sentry.startSpan({ name: "Sentry tracing smoke test", op: "test" }, () => {});
		});

		cy.wrap(null).should(() => {
			const envelopes = envelopeBodies.join("\n");
			expect(envelopes).to.contain("Sentry capture smoke test");
			expect(envelopes).to.contain("Sentry tracing smoke test");
		});
	});

	it("reports the site's own errors and ignores third-party console output", () => {
		const envelopeBodies = captureSentryEnvelopes();

		cy.visit("http://localhost:3000/index.html?NonExistentArticle");
		cy.get("#articleBody").should("contain", "We could not find that article.");

		cy.window().then((win) => {
			// The console output a visitor's Playwright script logged on the production site.
			win.console.error(
				"无法访问Iframe 1 的内容，可能是由于跨域限制:",
				new win.Error("Blocked a frame with origin from accessing a cross-origin frame."),
			);
			win.console.info("Iframe 3 内容已成功填充到新div中！");

			// The console output that visitors' scripts overriding setTimeout and setInterval logged on the production site.
			// The blocked timers were the Sentry tracing timeouts and the Google tag's daily interval.
			win.console.log("Detected and blocked setTimeout with timeout:", 15000);
			win.console.log("Detected and blocked setTimeout with timeout:", 30000);
			win.console.log("Detected and blocked setInterval with interval:", 86400000);
			win.console.log("重写的 setInterval 被调用");

			// The console output the embedded X timeline logs on the production site.
			win.console.info(
				"%c[Update] There have been recent updates to Embedded X Timelines and supported parameters.%c\n\t•For more information on what has changed visit: https://twittercommunity.com/t/embedded-timelines-update-parameters-support/177112\n\t•Please submit feedback or report any bugs: https://twittercommunity.com/c/publisher/websites/",
				"font-weight:bold;color:#006FD6",
				"color:#006FD6",
			);

			return win.Sentry.flush(10000);
		});

		cy.wrap(null).should(() => {
			const sentText = sentEventText(envelopeBodies);
			// The event itself carries the failure kind and operation as tags, and a warning level. Its console breadcrumb
			// holds the same values, so the raw envelope text cannot show that the tags were set.
			const notFoundEvent = sentEvents(envelopeBodies).find((event) =>
				event.exception?.values?.some(
					(value) => value.value === "Article not found in article data: NonExistentArticle",
				),
			);
			expect(notFoundEvent, "the not-found event").to.exist;
			expect(notFoundEvent.level).to.equal("warning");
			expect(notFoundEvent.tags).to.include({ operation: "find article", kind: "missing" });
			expect(sentText).not.to.contain("cross-origin frame");
			expect(sentText).not.to.contain("Iframe 3");
			expect(sentText).not.to.contain("Detected and blocked");
			expect(sentText).not.to.contain("重写的 setInterval");
			expect(sentText).not.to.contain("Embedded X Timelines");
		});
	});

	it("loads third-party scripts with CORS so their errors report a message and stack, not 'Script error.'", () => {
		cy.visit("http://localhost:3000");

		// Browsers hide the message and stack of an error thrown by a cross-origin script loaded without CORS.
		// The gtm.js script is created at runtime by the Google Tag Manager loader, so its property must reach the attribute.
		[
			'script[src^="https://www.googletagmanager.com/gtm.js"]',
			'script[src="https://platform.twitter.com/widgets.js"]',
		].forEach((selector) => {
			cy.get(selector).should("have.attr", "crossorigin", "anonymous");
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
