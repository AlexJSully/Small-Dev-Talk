global.showdown = require("./libraries/showdown/showdown.min.js");

const { ArticleFiller, escapeHtml, sanitizeHtml } = require("./index.js");

const {
	redirectToCanonicalHost,
	removeLegacyServiceWorker,
	registerServiceWorker,
	init,
	start,
} = require("./index.js");

window.onload = null;

describe("ArticleFiller: displayError", () => {
	beforeEach(() => {
		// articleBody starts with hidden attribute in production HTML (index.html)
		document.body.innerHTML = `
            <div id="articleBody" hidden></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
		ArticleFiller.errMsg = "";
		ArticleFiller.article = "";
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		delete global.Sentry;
	});

	const testCases = [
		{
			name: "sets errMsg, logs error, and updates articleBody",
			input: "Something went wrong!",
			expectedErr: "Something went wrong!",
		},
		{
			name: "handles empty error message",
			input: "",
			expectedErr: "Unknown error",
		},
	];

	testCases.forEach(({ name, input, expectedErr }) => {
		test(name, () => {
			ArticleFiller.displayError(input);

			if (expectedErr) {
				expect(ArticleFiller.errMsg).toBe(expectedErr);
				expect(console.error).toHaveBeenCalledWith(expectedErr);
			} else {
				expect(ArticleFiller.errMsg).toBe(input);
				expect(console.error).toHaveBeenCalledWith(input);
			}

			expect(document.getElementById("articleBody").innerHTML).toContain(expectedErr);
			expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
		});
	});

	test("escapes HTML in error message to prevent XSS", () => {
		ArticleFiller.displayError("<script>alert('xss')</script>");
		const html = document.getElementById("articleBody").innerHTML;
		expect(html).toContain("&lt;script&gt;alert('xss')&lt;/script&gt;");
		expect(html).not.toContain("<script>");
		expect(document.getElementById("articleBody").querySelector("script")).toBeNull();
		expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
	});

	test("reports the error message to Sentry as an Error", () => {
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn() };

		ArticleFiller.displayError("Error retrieving article.");

		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			expect.objectContaining({ message: "Error retrieving article." }),
		);
		expect(global.Sentry.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
	});

	test("shows the error when the Sentry SDK did not load", () => {
		expect(global.Sentry).toBeUndefined();

		ArticleFiller.displayError("Error retrieving article.");

		expect(document.getElementById("articleBody").innerHTML).toContain("Error retrieving article.");
		expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
	});
});

describe("ArticleFiller: addToPage", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <div id="articleBody"></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
	});

	const testCases = [
		{
			name: "renders markdown heading",
			input: "# Hello World",
			expected: '<h1 id="helloworld">Hello World</h1>',
		},
		{
			name: "renders markdown paragraph",
			input: "This is a test.",
			expected: "<p>This is a test.</p>",
		},
		{
			name: "empty markdown produces empty output",
			input: "",
			expected: "",
		},
	];

	testCases.forEach(({ name, input, expected }) => {
		test(name, () => {
			ArticleFiller.articleMd = input;
			ArticleFiller.addToPage();
			const html = document.getElementById("articleBody").innerHTML;
			expect(html.replace(/\s+/g, "")).toContain(expected.replace(/\s+/g, ""));
		});
	});
});

describe("ArticleFiller: grabArticle", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <div id="articleBody"></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
		ArticleFiller.articleMd = undefined;
		// Reset static properties
		ArticleFiller.articleData = {
			TestArticle: {
				title: "Test Article",
				summary: "A summary.",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
	});

	afterEach(() => {
		jest.restoreAllMocks();
		delete global.fetch;
	});

	test("loads markdown and updates DOM", async () => {
		const mockMd = "# Test Article";

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(mockMd),
		});

		// updateMetaData is called inside grabArticle, so mock it to avoid DOM errors
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});
		await ArticleFiller.grabArticle("TestArticle");

		// Wait for the fetch and DOM update
		await new Promise((r) => setTimeout(r, 0));

		expect(ArticleFiller.articleMd).toBe(mockMd);
		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});

	test("shows error when fetch fails (non-OK response)", async () => {
		ArticleFiller.articleData = {
			MissingArticle: {
				title: "Missing Article",
				summary: "A summary.",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};

		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 404,
			statusText: "Not Found",
			text: () => Promise.resolve(""),
		});

		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});

		await ArticleFiller.grabArticle("MissingArticle");

		await new Promise((r) => setTimeout(r, 0));

		expect(document.getElementById("articleBody").innerHTML).toContain(
			"Could not retrieve article. Please check the article name or try again later. (Failed to fetch article: 404 Not Found)",
		);
		expect(ArticleFiller.articleMd).toBeUndefined();
	});
});

describe("ArticleFiller: retrieveArticleData", () => {
	beforeEach(() => {
		ArticleFiller.articleData = undefined;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		delete global.fetch;
		delete document.URL;
		delete global.Sentry;
	});

	test("fetches and stores article data without rendering", async () => {
		const articleData = { TestArticle: { title: "Test Article" } };
		const fetchSpy = (global.fetch = jest
			.fn()
			.mockResolvedValue({ ok: true, json: () => Promise.resolve(articleData) }));

		await ArticleFiller.retrieveArticleData();

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledWith("/src/articleArchive/articleData.json");
		expect(ArticleFiller.articleData).toEqual(articleData);
	});

	test("logs network failures and re-throws the error", async () => {
		const error = new Error("Network unavailable");
		global.fetch = jest.fn().mockRejectedValue(error);
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		await expect(ArticleFiller.retrieveArticleData()).rejects.toThrow("Network unavailable");

		expect(consoleErrorSpy).toHaveBeenCalledWith("Error retrieving article data:", error);
		expect(ArticleFiller.articleData).toBeUndefined();
	});

	test("reports the original error to Sentry and re-throws when the fetch fails", async () => {
		const error = new Error("Network unavailable");
		global.fetch = jest.fn().mockRejectedValue(error);
		jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn() };

		await expect(ArticleFiller.retrieveArticleData()).rejects.toThrow("Network unavailable");

		expect(global.Sentry.captureException).toHaveBeenCalledWith(error);
	});

	test("logs non-OK responses and re-throws without parsing or processing article data", async () => {
		const response = { ok: false, status: 500, statusText: "Internal Server Error", json: jest.fn() };
		global.fetch = jest.fn().mockResolvedValue(response);
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		await expect(ArticleFiller.retrieveArticleData()).rejects.toThrow(
			"Failed to fetch article data: 500 Internal Server Error",
		);

		expect(response.json).not.toHaveBeenCalled();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error retrieving article data:",
			expect.objectContaining({ message: "Failed to fetch article data: 500 Internal Server Error" }),
		);
		expect(ArticleFiller.articleData).toBeUndefined();
	});

	test("logs JSON parsing failures and re-throws without processing article data", async () => {
		const error = new SyntaxError("Unexpected token");
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(error) });
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		await expect(ArticleFiller.retrieveArticleData()).rejects.toThrow("Unexpected token");

		expect(consoleErrorSpy).toHaveBeenCalledWith("Error retrieving article data:", error);
		expect(ArticleFiller.articleData).toBeUndefined();
	});
});

describe("ArticleFiller: retrievePageData", () => {
	beforeEach(() => {
		ArticleFiller.pageData = undefined;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		delete global.fetch;
		delete global.Sentry;
	});

	test("fetches and stores page data", async () => {
		const pageData = { index: { carousel: [], displayArticles: [] } };
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(pageData) });

		await ArticleFiller.retrievePageData();

		expect(global.fetch).toHaveBeenCalledWith("/src/legacyPages/legacyPagesDisplay.json");
		expect(ArticleFiller.pageData).toEqual(pageData);
	});

	test("logs and reports non-OK responses and re-throws without storing page data", async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValue({ ok: false, status: 404, statusText: "Not Found", json: jest.fn() });
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn() };

		await expect(ArticleFiller.retrievePageData()).rejects.toThrow("Failed to fetch page data: 404 Not Found");

		const expectedError = expect.objectContaining({ message: "Failed to fetch page data: 404 Not Found" });
		expect(consoleErrorSpy).toHaveBeenCalledWith("Error retrieving page data:", expectedError);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(expectedError);
		expect(ArticleFiller.pageData).toBeUndefined();
	});
});

describe("init", () => {
	afterEach(() => {
		jest.restoreAllMocks();
		delete global.fetch;
		delete document.URL;
		ArticleFiller.articleData = undefined;
		ArticleFiller.pageData = undefined;
	});

	test("renders the requested article once after both data requests settle", async () => {
		const articleData = {
			TestArticle: {
				title: "Test Article",
				summary: "A summary.",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		const markdownUrl = "/src/articleArchive/authorJaneDoe/2024-06-01_TestArticle/TestArticle.md";
		document.body.innerHTML = `
			<div id="articleBody"></div>
			<meta name="description" content="">
			<meta property="og:title" content="">
			<meta property="twitter:title" content="">
			<meta property="og:description" content="">
			<meta property="twitter:description" content="">
			<meta property="og:image" content="">
			<meta property="twitter:image" content="">
			<script type="application/ld+json">{}</script>
		`;
		Object.defineProperty(document, "URL", {
			value: "http://localhost/index.html?TestArticle",
			configurable: true,
		});
		// Page data resolves after article data, the order in which each loader used to render on its own.
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return new Promise((resolve) => {
					setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 0);
				});
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.resolve({ ok: true, json: () => Promise.resolve(articleData) });
			}

			return Promise.resolve({ ok: true, text: () => Promise.resolve("# Test Article") });
		});

		await init();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(global.fetch.mock.calls.filter(([url]) => url === markdownUrl)).toHaveLength(1);
		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});

	test("rejects when page data request fails", async () => {
		const articleData = { TestArticle: { title: "Test Article", author: "Jane Doe", date: "2024-06-01" } };
		Object.defineProperty(document, "URL", {
			value: "http://localhost/index.html?TestArticle",
			configurable: true,
		});
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return Promise.reject(new Error("Network unavailable"));
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.resolve({ ok: true, json: () => Promise.resolve(articleData) });
			}

			return Promise.resolve({ ok: true, text: () => Promise.resolve("# Test Article") });
		});

		await expect(init()).rejects.toThrow("Network unavailable");
	});
});

/**
 * Build a stand-in for `window.location`, which jsdom does not let a test navigate.
 * @param {string} href The page URL.
 * @returns {{hostname: string, pathname: string, search: string, hash: string, replace: jest.Mock}} The location.
 */
function createLocation(href) {
	const { hostname, pathname, search, hash } = new URL(href);

	return { hostname, pathname, search, hash, replace: jest.fn() };
}

/**
 * Build a stand-in service worker registration.
 * @param {string} scope The registration scope URL.
 * @returns {{scope: string, unregister: jest.Mock}} The registration.
 */
function createRegistration(scope) {
	return { scope, unregister: jest.fn().mockResolvedValue(true) };
}

describe("redirectToCanonicalHost", () => {
	test("moves a www page to the same path, query and hash on the canonical host", () => {
		const location = createLocation("https://www.smalldevtalk.net/index.html?Caravaneer2#top");

		expect(redirectToCanonicalHost(location)).toBe(true);
		expect(location.replace).toHaveBeenCalledWith("https://smalldevtalk.net/index.html?Caravaneer2#top");
	});

	test("moves an http www page to https on the canonical host", () => {
		const location = createLocation("http://www.smalldevtalk.net/");

		expect(redirectToCanonicalHost(location)).toBe(true);
		expect(location.replace).toHaveBeenCalledWith("https://smalldevtalk.net/");
	});

	test.each(["https://smalldevtalk.net/index.html?Caravaneer2", "http://localhost:3000/index.html"])(
		"leaves %s where it is",
		(href) => {
			const location = createLocation(href);

			expect(redirectToCanonicalHost(location)).toBe(false);
			expect(location.replace).not.toHaveBeenCalled();
		},
	);
});

describe("ServiceWorker registration", () => {
	afterEach(() => {
		jest.restoreAllMocks();
		delete global.navigator;
		delete global.caches;
		delete global.Sentry;
	});

	test("registerServiceWorker returns null when navigator.serviceWorker not present", async () => {
		global.navigator = {};
		const res = await registerServiceWorker();
		expect(res).toBeNull();
	});

	test("registerServiceWorker registers the root worker so its scope covers the page", async () => {
		const registration = createRegistration("http://localhost/");
		global.navigator = {
			serviceWorker: {
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockResolvedValue(registration),
			},
		};

		const res = await registerServiceWorker();

		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
		expect(res).toBe(registration);
	});

	test("registerServiceWorker handles registration failure gracefully", async () => {
		global.navigator = {
			serviceWorker: {
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockRejectedValue(new Error("disallowed redirect")),
			},
		};

		jest.spyOn(console, "error").mockImplementation(() => {});

		const res = await registerServiceWorker();
		expect(res).toBeNull();
		expect(console.error).toHaveBeenCalled();
	});

	test("removeLegacyServiceWorker unregisters only the /src/serviceWorker/ worker and deletes only its precache", async () => {
		const legacy = createRegistration("https://smalldevtalk.net/src/serviceWorker/");
		const current = createRegistration("https://smalldevtalk.net/");
		global.navigator = {
			serviceWorker: { getRegistrations: jest.fn().mockResolvedValue([legacy, current]) },
		};
		global.caches = { delete: jest.fn().mockResolvedValue(true) };

		await removeLegacyServiceWorker();

		expect(legacy.unregister).toHaveBeenCalledTimes(1);
		expect(current.unregister).not.toHaveBeenCalled();
		expect(global.caches.delete).toHaveBeenCalledTimes(1);
		expect(global.caches.delete).toHaveBeenCalledWith(
			"workbox-precache-v2-https://smalldevtalk.net/src/serviceWorker/",
		);
	});

	test("registerServiceWorker waits for the installing worker to take control of the page", async () => {
		const listeners = {};
		const registration = { ...createRegistration("http://localhost/"), installing: {} };
		global.navigator = {
			serviceWorker: {
				controller: null,
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockResolvedValue(registration),
				addEventListener: jest.fn((name, listener) => {
					listeners[name] = listener;
				}),
				removeEventListener: jest.fn(),
			},
		};
		let settled = false;

		const pending = registerServiceWorker().then(() => {
			settled = true;
		});
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(settled).toBe(false);

		listeners.controllerchange();
		await pending;

		expect(settled).toBe(true);
		expect(global.navigator.serviceWorker.removeEventListener).toHaveBeenCalledWith(
			"controllerchange",
			listeners.controllerchange,
		);
	});

	test("registerServiceWorker does not wait when the page already has a controller", async () => {
		const registration = { ...createRegistration("http://localhost/"), waiting: {} };
		global.navigator = {
			serviceWorker: {
				controller: {},
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockResolvedValue(registration),
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
			},
		};

		await expect(registerServiceWorker()).resolves.toBe(registration);
		expect(global.navigator.serviceWorker.addEventListener).not.toHaveBeenCalled();
	});

	test("registerServiceWorker stops waiting after the timeout when the worker never takes control", async () => {
		jest.useFakeTimers();
		const registration = { ...createRegistration("http://localhost/"), installing: {} };
		global.navigator = {
			serviceWorker: {
				controller: null,
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockResolvedValue(registration),
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
			},
		};

		try {
			const pending = registerServiceWorker();

			await jest.advanceTimersByTimeAsync(3000);

			await expect(pending).resolves.toBe(registration);
		} finally {
			jest.useRealTimers();
		}
	});

	test("a failed legacy cleanup is reported to Sentry and the root worker still registers", async () => {
		const cleanupError = new Error("getRegistrations failed");
		global.navigator = {
			serviceWorker: {
				getRegistrations: jest.fn().mockRejectedValue(cleanupError),
				register: jest.fn().mockResolvedValue(createRegistration("http://localhost/")),
			},
		};
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn() };
		jest.spyOn(console, "error").mockImplementation(() => {});

		await registerServiceWorker();

		expect(global.Sentry.captureException).toHaveBeenCalledWith(cleanupError);
		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
	});
});

describe("start", () => {
	beforeEach(() => {
		document.body.innerHTML = `<div id="articleBody"></div>`;
		Object.defineProperty(document, "URL", {
			value: "http://localhost/index.html?TestArticle",
			configurable: true,
		});
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});
		global.navigator = {
			serviceWorker: {
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockResolvedValue(createRegistration("http://localhost/")),
			},
		};
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							TestArticle: { title: "Test Article", author: "Jane Doe", date: "2024-06-01" },
						}),
				});
			}

			return Promise.resolve({ ok: true, text: () => Promise.resolve("# Test Article") });
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		delete global.fetch;
		delete global.navigator;
		delete document.URL;
		ArticleFiller.articleData = undefined;
		ArticleFiller.pageData = undefined;
	});

	test("on the www host, redirects before registering the worker or fetching any data", async () => {
		const location = createLocation("https://www.smalldevtalk.net/index.html?TestArticle");

		await start(location);

		expect(location.replace).toHaveBeenCalledWith("https://smalldevtalk.net/index.html?TestArticle");
		expect(global.navigator.serviceWorker.register).not.toHaveBeenCalled();
		expect(global.fetch).not.toHaveBeenCalled();
		expect(document.getElementById("articleBody").innerHTML).toBe("");
	});

	test("on the canonical host, registers the root worker and renders the requested article", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");

		await start(location);
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(location.replace).not.toHaveBeenCalled();
		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});

	test("shows error message when retrievePageData fails", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(ArticleFiller, "displayError").mockImplementation(() => {});
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return Promise.reject(new Error("Network unavailable"));
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							TestArticle: { title: "Test Article", author: "Jane Doe", date: "2024-06-01" },
						}),
				});
			}

			return Promise.resolve({ ok: true, text: () => Promise.resolve("# Test Article") });
		});

		await start(location);

		expect(ArticleFiller.displayError).toHaveBeenCalledWith(
			"Failed to load page. Please refresh or try again later.",
		);
	});

	test("shows error message when retrieveArticleData fails", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(ArticleFiller, "displayError").mockImplementation(() => {});
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.reject(new Error("Network unavailable"));
			}

			return Promise.resolve({ ok: true, text: () => Promise.resolve("# Test Article") });
		});

		await start(location);

		expect(ArticleFiller.displayError).toHaveBeenCalledWith(
			"Failed to load page. Please refresh or try again later.",
		);
	});

	test("grabArticle handles markdown fetch failure and displays specific error", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(ArticleFiller, "displayError").mockImplementation(() => {});
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							TestArticle: { title: "Test Article", author: "Jane Doe", date: "2024-06-01" },
						}),
				});
			}

			return Promise.reject(new Error("Article fetch failed"));
		});

		await start(location);
		await new Promise((resolve) => setTimeout(resolve, 0));

		// grabArticle catches its own error and displays a specific message
		expect(ArticleFiller.displayError).toHaveBeenCalledWith(
			expect.stringContaining("Could not retrieve article. Please check the article name or try again later."),
		);
	});

	test("service worker registration failure does not block rendering", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		global.navigator = {
			serviceWorker: {
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockRejectedValue(new Error("disallowed redirect")),
			},
		};
		global.fetch = jest.fn((url) => {
			if (url === "/src/legacyPages/legacyPagesDisplay.json") {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
			}
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							TestArticle: { title: "Test Article", author: "Jane Doe", date: "2024-06-01" },
						}),
				});
			}

			return Promise.resolve({ ok: true, text: () => Promise.resolve("# Test Article") });
		});

		await start(location);
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});
});

describe("ArticleFiller: updateMetaData", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <title></title>
            <meta name="description" content="">
            <meta property="og:title" content="">
            <meta property="twitter:title" content="">
            <meta property="og:description" content="">
            <meta property="twitter:description" content="">
            <meta property="og:image" content="">
            <meta property="twitter:image" content="">
            <script type="application/ld+json">{}</script>
        `;
	});

	test("updates title and meta tags", () => {
		const articleData = {
			title: "Meta Title",
			summary: "Meta Summary",
			thumbnail: "meta.png",
			author: "Meta Author",
			date: "2024-06-01",
		};
		const articleKey = "MetaArticle";

		ArticleFiller.updateMetaData(articleData, articleKey);

		expect(document.title).toBe("Meta Title | Small Dev Talk");
		expect(document.querySelector("meta[name='description']").content).toBe("Meta Summary | Small Dev Talk");
		expect(document.querySelector("meta[property='og:title']").content).toBe("Meta Title | Small Dev Talk");
		expect(document.querySelector("meta[property='twitter:title']").content).toBe("Meta Title | Small Dev Talk");
		expect(document.querySelector("meta[property='og:description']").content).toBe("Meta Summary | Small Dev Talk");
		expect(document.querySelector("meta[property='twitter:description']").content).toBe(
			"Meta Summary | Small Dev Talk",
		);
		expect(document.querySelector("meta[property='og:image']").content).toContain("meta.png");
		expect(document.querySelector("meta[property='twitter:image']").content).toContain("meta.png");
	});
});

describe("ArticleFiller: callArticle", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <div id="articleBody"></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
		ArticleFiller.articleData = {
			TestArticle: {
				title: "Test Article",
				summary: "A summary.",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const testCases = [
		{
			name: "calls callDisplay for no query in URL",
			url: "http://localhost/index.html",
			expectGrabArticle: false,
			expectCallDisplay: true,
		},
		{
			name: "calls callDisplay for multiple params in URL",
			url: "http://localhost/index.html?TestArticle&archive",
			expectGrabArticle: false,
			expectCallDisplay: true,
		},
	];

	testCases.forEach(({ name, url, expectGrabArticle, expectCallDisplay }) => {
		test(name, () => {
			Object.defineProperty(window, "URL", {
				value: url,
				writable: true,
				configurable: true,
			});
			const grabSpy = jest.spyOn(ArticleFiller, "grabArticle").mockImplementation(() => {});
			const callDisplaySpy = jest.spyOn(ArticleFiller, "callDisplay").mockImplementation(() => {});

			ArticleFiller.callArticle();

			if (expectGrabArticle) {
				expect(grabSpy).toHaveBeenCalledWith("TestArticle");
			} else {
				expect(grabSpy).not.toHaveBeenCalled();
			}
			if (expectCallDisplay) {
				expect(callDisplaySpy).toHaveBeenCalled();
			} else {
				expect(callDisplaySpy).not.toHaveBeenCalled();
			}
		});
	});
});

describe("ArticleFiller: displayArchive", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <div id="articleBody"></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
		ArticleFiller.articleData = {
			ArticleOne: {
				title: "First Article",
				summary: "Summary 1",
				thumbnail: "thumb1.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
			ArticleTwo: {
				title: "Second Article",
				summary: "Summary 2",
				thumbnail: "thumb2.png",
				author: "John Smith",
				date: "2024-06-02",
			},
		};
	});

	test("renders archive articles in displayArticles", () => {
		ArticleFiller.displayArchive();
		const html = document.getElementById("displayArticles").innerHTML;
		expect(html).toContain("First Article");
		expect(html).toContain("Second Article");
		expect(html).toContain("archive-link");
		expect(html).toContain("thumb1.png");
		expect(html).toContain("thumb2.png");
	});

	test("renders each archive article once when called twice", () => {
		ArticleFiller.displayArchive();
		ArticleFiller.displayArchive();

		expect(document.querySelectorAll("#displayArticles .archive-display")).toHaveLength(2);
	});
});

describe("ArticleFiller: changeCarousel", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <div id="articleBody"></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
		ArticleFiller.whatPageDisplay = "featured";
		ArticleFiller.pageData = {
			featured: {
				carousel: ["ArticleOne", "ArticleTwo"],
			},
		};
		ArticleFiller.articleData = {
			ArticleOne: {
				title: "First Article",
				summary: "Summary 1",
				thumbnail: "thumb1.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
			ArticleTwo: {
				title: "Second Article",
				summary: "Summary 2",
				thumbnail: "thumb2.png",
				author: "John Smith",
				date: "2024-06-02",
			},
		};
	});

	test("renders carousel items and indicators", () => {
		ArticleFiller.changeCarousel();
		const carouselInner = document.getElementById("carouselInner").innerHTML;
		const carouselIndicator = document.getElementById("carouselIndicator").innerHTML;
		const pageTitle = document.getElementById("pageTitle").innerText;

		expect(carouselInner).toContain("carousel-item");
		expect(carouselInner).toContain("First Article");
		expect(carouselInner).toContain("Second Article");
		expect(carouselInner).toContain("thumb1.png");
		expect(carouselInner).toContain("thumb2.png");
		expect(carouselIndicator).toContain('data-slide-to="0"');
		expect(carouselIndicator).toContain('data-slide-to="1"');
		expect(pageTitle).toContain("Small Dev Talk: Featured");
	});
});

describe("escapeHtml", () => {
	test("escapes HTML special characters", () => {
		expect(escapeHtml(`<script>alert('x')</script>`)).toBe("&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;");
		expect(escapeHtml(`a"b&c`)).toBe("a&quot;b&amp;c");
		expect(escapeHtml(null)).toBe("");
		expect(escapeHtml(undefined)).toBe("");
		expect(escapeHtml(123)).toBe("123");
	});

	test("is exposed via ArticleFiller.escapeHtml", () => {
		expect(ArticleFiller.escapeHtml(`<b>`)).toBe("&lt;b&gt;");
	});
});

describe("ArticleFiller: XSS sanitization", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <div id="articleBody"></div>
            <div id="displayArticles"></div>
            <div id="featuredArticles"></div>
            <div id="carouselInner"></div>
            <div id="carouselIndicator"></div>
            <div id="pageTitle"></div>
        `;
	});

	test("displayArchive escapes malicious titles in text content", () => {
		ArticleFiller.articleData = {
			ArticleOne: {
				title: `<b>evil</b>`,
				summary: "Summary",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.displayArchive();
		const html = document.getElementById("displayArticles").innerHTML;
		expect(html).toContain("&lt;b&gt;evil&lt;/b&gt;");
	});

	test("displayArchive prevents attribute breakout", () => {
		ArticleFiller.articleData = {
			ArticleOne: {
				title: `" onclick="alert(1)`,
				summary: "Summary",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.displayArchive();
		const html = document.getElementById("displayArticles").innerHTML;
		expect(html).not.toContain('onclick="alert(1)"');
	});

	test("displayArchive properly quotes and escapes thumbnail src", () => {
		ArticleFiller.articleData = {
			ArticleOne: {
				title: "Safe Title",
				summary: "Summary",
				thumbnail: `evil.png" onload="alert(1)`,
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.displayArchive();
		const html = document.getElementById("displayArticles").innerHTML;
		expect(html).not.toContain('onload="alert(1)"');
		expect(html).toContain(
			'src="src/articleArchive/authorJaneDoe/2024-06-01_ArticleOne/evil.png&quot; onload=&quot;alert(1)"',
		);
	});

	test("changeCarousel escapes malicious titles in text content", () => {
		ArticleFiller.whatPageDisplay = "featured";
		ArticleFiller.pageData = { featured: { carousel: ["ArticleOne"] } };
		ArticleFiller.articleData = {
			ArticleOne: {
				title: `<b>evil</b>`,
				summary: `<i>x</i>`,
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.changeCarousel();
		const html = document.getElementById("carouselInner").innerHTML;
		expect(html).toContain("&lt;b&gt;evil&lt;/b&gt;");
		expect(html).toContain("&lt;i&gt;x&lt;/i&gt;");
	});

	test("changeCarousel prevents attribute breakout", () => {
		ArticleFiller.whatPageDisplay = "featured";
		ArticleFiller.pageData = { featured: { carousel: ["ArticleOne"] } };
		ArticleFiller.articleData = {
			ArticleOne: {
				title: `" onclick="alert(1)`,
				summary: "Summary",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.changeCarousel();
		const html = document.getElementById("carouselInner").innerHTML;
		expect(html).not.toContain('onclick="alert(1)"');
	});

	test("ArticleFiller (featured) escapes malicious titles in text content", () => {
		ArticleFiller.whatPageDisplay = "featured";
		ArticleFiller.pageData = { featured: { displayArticles: ["ArticleOne"] } };
		ArticleFiller.articleData = {
			ArticleOne: {
				title: `<script>alert(3)</script>`,
				summary: `<script>alert(4)</script>`,
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.ArticleFiller();
		const html = document.getElementById("displayArticles").innerHTML;
		expect(html).toContain("&lt;script&gt;alert(3)&lt;/script&gt;");
	});

	test("ArticleFiller (featured) prevents attribute breakout", () => {
		ArticleFiller.whatPageDisplay = "featured";
		ArticleFiller.pageData = { featured: { displayArticles: ["ArticleOne"] } };
		ArticleFiller.articleData = {
			ArticleOne: {
				title: `" onclick="alert(1)`,
				summary: "Summary",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};
		ArticleFiller.ArticleFiller();
		const html = document.getElementById("displayArticles").innerHTML;
		expect(html).not.toContain('onclick="alert(1)"');
	});
});

describe("sanitizeHtml", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	test("removes script tags", () => {
		const html = sanitizeHtml("<p>ok</p><script>alert(1)</script>");
		expect(html).toContain("<p>ok</p>");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("alert(1)");
	});

	test("removes event handler attributes", () => {
		const html = sanitizeHtml('<img src="x.png" onerror="alert(1)">');
		expect(html).not.toContain("onerror");
		expect(html).not.toContain("alert(1)");
	});

	test("removes dangerous URL schemes", () => {
		expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
		expect(sanitizeHtml('<a href="vbscript:msgbox(1)">x</a>')).not.toContain("vbscript:");
		expect(sanitizeHtml('<a href="data:text/html;base64,AAAA">x</a>')).not.toContain("data:");
	});

	test("preserves safe HTML", () => {
		const html = sanitizeHtml('<h1>Title</h1><a href="https://example.com">link</a><img src="img.png" alt="a">');
		expect(html).toContain("<h1>Title</h1>");
		expect(html).toContain('href="https://example.com"');
		expect(html).toContain('src="img.png"');
	});

	test("preserves data:image on src", () => {
		const html = sanitizeHtml('<img src="data:image/png;base64,AAAA">');
		expect(html).toContain("data:image/png;base64,AAAA");
	});

	test("handles null/undefined/empty", () => {
		expect(sanitizeHtml(null)).toBe("");
		expect(sanitizeHtml(undefined)).toBe("");
		expect(sanitizeHtml("")).toBe("");
	});

	test("is exposed via ArticleFiller.sanitizeHtml", () => {
		expect(ArticleFiller.sanitizeHtml("<script>x</script>")).not.toContain("<script");
	});

	test("removes SVG animation elements that mutate URLs", () => {
		const html = sanitizeHtml(
			'<svg><a href="#"><animate attributeName="href" values="javascript:alert(1)"/><text x="20" y="20">click</text></a></svg>',
		);
		expect(html).not.toContain("<animate");
		expect(html).not.toContain("javascript:");
	});

	test("blocks encoded whitespace bypasses in URL schemes", () => {
		expect(sanitizeHtml('<a href="java&#9;script:alert(1)">click</a>')).not.toContain("javascript:");
		expect(sanitizeHtml('<a href="java&#10;script:alert(1)">click</a>')).not.toContain("javascript:");
		expect(sanitizeHtml('<a href="java&#13;script:alert(1)">click</a>')).not.toContain("javascript:");
	});
});

describe("ArticleFiller: addToPage XSS", () => {
	beforeEach(() => {
		document.body.innerHTML = `<div id="articleBody"></div>`;
	});

	test("sanitizes script tags in markdown output", () => {
		ArticleFiller.articleMd = "# Hello <script>alert(1)</script>";
		ArticleFiller.addToPage();
		const html = document.getElementById("articleBody").innerHTML;
		expect(html).toContain("<h1");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("alert(1)");
	});

	test("sanitizes dangerous attributes in markdown output", () => {
		ArticleFiller.articleMd = '<img src="img.png" onerror="alert(1)">';
		ArticleFiller.addToPage();
		const html = document.getElementById("articleBody").innerHTML;
		expect(html).not.toContain("onerror");
	});
});
