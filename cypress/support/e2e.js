// Support file loaded automatically before every end-to-end spec.
// Global configuration and any behaviour that modifies Cypress belongs here.
// The supportFile configuration option controls whether this file is loaded.

import "./commands";

// Test isolation does not remove service workers. A worker left by an earlier test would serve
// index.html from its precache, bypassing the Cypress proxy that instruments the page under test.
// The spec frame runs on the Cypress origin, not the app origin, so the cleanup clears the app origin's service
// workers and caches through the browser's DevTools protocol, and finishes before the test visits the page.
beforeEach(() => {
	cy.then(() =>
		Cypress.automation("remote:debugger:protocol", {
			command: "Storage.clearDataForOrigin",
			params: { origin: "http://localhost:3000", storageTypes: "service_workers,cache_storage" },
		}),
	);
});
