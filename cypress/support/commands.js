/// <reference types="cypress" />

// Custom Cypress commands and command overwrites for the end-to-end suite.
// Loaded by cypress/support/e2e.js before every spec file.
// See https://on.cypress.io/custom-commands for the command API.

/** The axe-core rule tags checked: WCAG 2.0, 2.1 and 2.2 levels A and AA, and axe's best practices. */
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/**
 * Runs axe-core on the page under test and fails with each violation's rule, impact and elements. Results axe cannot
 * decide, such as text contrast over a photo, are logged for a manual check. The page's Content Security Policy blocks
 * `eval` and inline scripts, so axe is served from the page's own origin and loaded with a script element.
 */
Cypress.Commands.add("checkAccessibility", () => {
	cy.readFile("node_modules/axe-core/axe.min.js").then((source) => {
		cy.intercept("GET", "/__axe-core.js", {
			body: source,
			headers: { "content-type": "application/javascript" },
		});
	});
	cy.document().then(
		(doc) =>
			new Cypress.Promise((resolve, reject) => {
				const script = doc.createElement("script");

				script.src = "/__axe-core.js";
				script.onload = resolve;
				script.onerror = () => reject(new Error("axe-core did not load"));
				doc.head.appendChild(script);
			}),
	);
	cy.window()
		.then({ timeout: 30000 }, (win) => win.axe.run(win.document, { runOnly: { type: "tag", values: AXE_TAGS } }))
		.then(({ violations, incomplete }) => {
			incomplete.forEach((result) => {
				cy.log(`axe needs review: ${result.id}, ${result.nodes.length} element(s)`);
			});

			const summary = violations
				.map(
					(violation) =>
						`${violation.id} (${violation.impact}): ${violation.help}: ${violation.nodes
							.map((node) => node.target.join(" "))
							.join(", ")}`,
				)
				.join("\n");

			expect(violations, summary).to.have.length(0);
		});
});

/**
 * Blocks the X timeline embed with the 429 that X answers when it rate-limits embedded timelines per IP, since X serves
 * or rate-limits the timeline from run to run.
 */
Cypress.Commands.add("blockXEmbed", () => {
	cy.intercept("https://platform.twitter.com/**", { statusCode: 429, body: "" });
	cy.intercept("https://syndication.twitter.com/**", { statusCode: 429, body: "" });
});

/**
 * Emulates a CSS media feature, such as `forced-colors` or `prefers-reduced-motion`, through the browser's DevTools
 * protocol.
 * @param {string} name The media feature.
 * @param {string} value The value to emulate, or an empty string to clear the emulation.
 */
Cypress.Commands.add("emulateMedia", (name, value) =>
	cy.then(() =>
		Cypress.automation("remote:debugger:protocol", {
			command: "Emulation.setEmulatedMedia",
			params: { features: [{ name, value }] },
		}),
	),
);

/**
 * Removes the site's service workers and Cache Storage. The spec frame runs on the Cypress origin, not the app
 * origin, so this goes through the browser's DevTools protocol.
 */
Cypress.Commands.add("clearServiceWorkers", () =>
	cy.then(() =>
		Cypress.automation("remote:debugger:protocol", {
			command: "Storage.clearDataForOrigin",
			params: { origin: "http://localhost:3000", storageTypes: "service_workers,cache_storage" },
		}),
	),
);
