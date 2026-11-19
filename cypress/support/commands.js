/// <reference types="cypress" />

// Custom Cypress commands and command overwrites for the end-to-end suite.
// Loaded by cypress/support/e2e.js before every spec file.
// See https://on.cypress.io/custom-commands for the command API.

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
