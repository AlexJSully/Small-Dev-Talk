// Support file loaded automatically before every end-to-end spec.
// Global configuration and any behaviour that modifies Cypress belongs here.
// The supportFile configuration option controls whether this file is loaded.

import "./commands";

// Test isolation does not remove service workers. A worker left by an earlier test would serve
// index.html from its precache, bypassing the Cypress proxy that instruments the page under test.
beforeEach(() => {
	cy.wrap(
		window.navigator.serviceWorker
			.getRegistrations()
			.then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
		{ log: false },
	);
});
