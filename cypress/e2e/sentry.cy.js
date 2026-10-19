const sentrySdkUrl = "https://browser.sentry-cdn.com/10.32.1/bundle.tracing.replay.min.js";
const sentryCaptureConsoleUrl = "https://browser.sentry-cdn.com/10.32.1/captureconsole.min.js";

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
