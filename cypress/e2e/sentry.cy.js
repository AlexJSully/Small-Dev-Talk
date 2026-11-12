const sentrySdkUrl = "https://browser.sentry-cdn.com/10.32.1/bundle.tracing.replay.min.js";
const sentryCaptureConsoleUrl = "https://browser.sentry-cdn.com/10.32.1/captureconsole.min.js";

/**
 * Collect the text of every error and message event in the captured Sentry envelopes.
 * Breadcrumbs are ignored, because they record earlier console calls inside unrelated events.
 * @param {string[]} envelopeBodies Raw envelope request bodies.
 * @returns {string[]} Each event's message, or its exception values joined by a space.
 */
function sentEventTexts(envelopeBodies) {
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
		);
}

describe("Sentry initialization", () => {
	it("loads compatible integrations and captures errors and tracing events", () => {
		const envelopeBodies = [];
		cy.intercept("POST", "**/api/6600431/envelope/**", (request) => {
			envelopeBodies.push(request.body);
			request.reply({ statusCode: 200, body: "" });
		}).as("sentryEnvelope");

		cy.visit("http://localhost:3000");

		cy.window().should((win) => {
			expect(win.Sentry).to.exist;
			expect(win.Sentry.getClient()).to.exist;
			expect(win.Sentry.browserTracingIntegration).to.be.a("function");
			expect(win.Sentry.replayIntegration).to.be.a("function");
			expect(win.Sentry.captureConsoleIntegration).to.be.a("function");
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

	it("drops console output from Playwright-injected scripts and keeps the site's console errors", () => {
		const envelopeBodies = [];
		cy.intercept("POST", "**/api/6600431/envelope/**", (request) => {
			envelopeBodies.push(request.body);
			request.reply({ statusCode: 200, body: "" });
		});

		cy.visit("http://localhost:3000");
		cy.window().should((win) => {
			expect(win.Sentry.getClient()).to.exist;
		});

		cy.window().then((win) => {
			// Mirrors the production event: Playwright's page.evaluate ran a script that read a cross-origin iframe.
			const automationError = new win.Error(
				"Failed to read a named property 'document' from 'Window': Blocked a frame with origin \"https://smalldevtalk.net\" from accessing a cross-origin frame.",
			);
			automationError.name = "SecurityError";
			automationError.stack = [
				`SecurityError: ${automationError.message}`,
				"    at NodeList.forEach (<anonymous>)",
				"    at eval (eval at evaluate (:291:30), <anonymous>:5:9)",
				"    at eval (<anonymous>)",
				"    at UtilityScript.evaluate (<anonymous>:291:30)",
				"    at UtilityScript.<anonymous> (<anonymous>:1:44)",
			].join("\n");

			win.console.error("无法访问Iframe 1 的内容，可能是由于跨域限制:", automationError);
			win.console.info("Iframe 3 内容已成功填充到新div中！");
			win.console.error("Sentry console capture control");
			win.console.error("Error retrieving article data:", new win.Error("Sentry console exception control"));

			return win.Sentry.flush(10000);
		});

		cy.wrap(null).should(() => {
			const texts = sentEventTexts(envelopeBodies);
			expect(texts.join("\n")).to.contain("Sentry console capture control");
			expect(texts.join("\n")).to.contain("Sentry console exception control");
			expect(texts.filter((text) => text.includes("cross-origin frame"))).to.be.empty;
			expect(texts.filter((text) => text.includes("Iframe 3"))).to.be.empty;
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
		cy.intercept(`${sentryCaptureConsoleUrl}*`, { forceNetworkError: true });
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
