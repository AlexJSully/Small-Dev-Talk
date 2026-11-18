global.showdown = require("./libraries/showdown/showdown.min.js");

const { ArticleFiller, escapeHtml, sanitizeHtml } = require("./index.js");

const {
	reportToSentry,
	reportError,
	LoadError,
	fetchResource,
	flushPendingSentryErrors,
	initializeSentry,
	loadGoogleTagManager,
	updateCanonicalLink,
	startThirdParties,
	handleControlClick,
	APP_VERSION,
	redirectToCanonicalHost,
	removeLegacyServiceWorker,
	registerServiceWorker,
	init,
	start,
	watchTwitterTimeline,
} = require("./index.js");
const { version: packageVersion } = require("../../package.json");

describe("reportToSentry before Sentry initializes", () => {
	afterEach(() => {
		// Empty the module's buffer so one test's errors never reach another.
		global.Sentry = { captureException: jest.fn() };
		flushPendingSentryErrors();
		delete global.Sentry;
	});

	test("keeps an error until the SDK has a client, then flushPendingSentryErrors sends it once", () => {
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: jest.fn(() => undefined) };
		const error = new Error("failed before init");

		reportToSentry(error);

		expect(global.Sentry.captureException).not.toHaveBeenCalled();

		global.Sentry.getClient.mockReturnValue({});
		flushPendingSentryErrors();
		flushPendingSentryErrors();

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(error);
	});

	test("wraps a message in an Error before keeping it", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => undefined };

		reportToSentry("plain message");
		global.Sentry.getClient = () => ({});
		flushPendingSentryErrors();

		expect(global.Sentry.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(global.Sentry.captureException.mock.calls[0][0].message).toBe("plain message");
	});

	test("sends an error at once when the SDK already has a client", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		const error = new Error("after init");

		reportToSentry(error);

		expect(global.Sentry.captureException).toHaveBeenCalledWith(error);
	});

	test("passes the capture context to Sentry, at once or after the buffer is flushed", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => undefined };
		const error = new Error("with context");
		const captureContext = { level: "warning", tags: { operation: "find article" } };

		reportToSentry(error, captureContext);
		global.Sentry.getClient = () => ({});
		flushPendingSentryErrors();
		reportToSentry(error, captureContext);

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(2);
		expect(global.Sentry.captureException).toHaveBeenNthCalledWith(1, error, captureContext);
		expect(global.Sentry.captureException).toHaveBeenNthCalledWith(2, error, captureContext);
	});

	test("keeps at most 20 errors", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => undefined };

		for (let i = 0; i < 25; i += 1) {
			reportToSentry(new Error(`error ${i}`));
		}
		global.Sentry.getClient = () => ({});
		flushPendingSentryErrors();

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(20);
	});

	test("keeps an error reported before the SDK script has run, and sends it once the SDK has a client", () => {
		expect(global.Sentry).toBeUndefined();
		const error = new Error("reported before the SDK loaded");

		expect(() => {
			reportToSentry(error);
			flushPendingSentryErrors();
		}).not.toThrow();

		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		flushPendingSentryErrors();

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(error);
	});
});

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

	const DEFAULT_MESSAGE = "Something went wrong while loading this page. Refresh the page or try again later.";

	test("shows the message it is given, sets errMsg, and reveals articleBody", () => {
		ArticleFiller.displayError("Something went wrong!");

		expect(ArticleFiller.errMsg).toBe("Something went wrong!");
		expect(document.getElementById("articleBody").innerHTML).toContain("Something went wrong!");
		expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
	});

	[
		["an empty string", ""],
		["whitespace", "   "],
		["undefined", undefined],
		["null", null],
		["an Error", new Error("not a string")],
	].forEach(([name, input]) => {
		test(`shows a helpful message, not a blank or "Unknown error", when given ${name}`, () => {
			expect(() => ArticleFiller.displayError(input)).not.toThrow();

			expect(ArticleFiller.errMsg).toBe(DEFAULT_MESSAGE);
			expect(document.getElementById("articleBody").innerHTML).toContain(DEFAULT_MESSAGE);
			expect(document.getElementById("articleBody").innerHTML).not.toContain("Unknown error");
		});
	});

	[
		["network", "We could not reach Small Dev Talk. Check your internet connection, then refresh the page."],
		["http", "Small Dev Talk could not load this content right now. Please try again in a few minutes."],
		[
			"parse",
			"This content could not be displayed. Refresh the page, and if the problem continues, report it on the project's GitHub issues.",
		],
		["missing", "We could not find that article. Check the link, or go back to the home page."],
	].forEach(([kind, message]) => {
		test(`shows the ${kind} message, and keeps the technical detail of the error off the page`, () => {
			const error = new LoadError("Failed to fetch article: 503 Service Unavailable", { kind });

			ArticleFiller.displayError(undefined, { error });

			expect(ArticleFiller.errMsg).toBe(message);
			expect(document.getElementById("articleBody").textContent).toContain(message);
			expect(document.getElementById("articleBody").innerHTML).not.toContain("503");
		});
	});

	test("logs one object with the original error, its operation, the article and the page", () => {
		const error = new LoadError("Failed to fetch article: 404 Not Found", {
			kind: "http",
			operation: "retrieve article",
			url: "/src/articleArchive/a.md",
			status: 404,
		});

		ArticleFiller.displayError(undefined, { error, operation: "load article", article: "TestArticle" });

		expect(console.error).toHaveBeenCalledTimes(1);
		expect(console.error).toHaveBeenCalledWith("ArticleFiller error:", {
			message: "Failed to fetch article: 404 Not Found",
			kind: "http",
			operation: "retrieve article",
			article: "TestArticle",
			url: "/src/articleArchive/a.md",
			status: 404,
			page: document.URL,
			timestamp: expect.any(String),
			error,
		});
		expect(console.error.mock.calls[0][1].error.stack).toEqual(expect.any(String));
	});

	test("reports the original error to Sentry with its level, tags and extra context", () => {
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		const error = new LoadError("Article not found in article data: Nope", {
			kind: "missing",
			operation: "find article",
			article: "Nope",
		});

		ArticleFiller.displayError(undefined, { error });

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(error, {
			level: "warning",
			tags: { operation: "find article", kind: "missing" },
			extra: { article: "Nope", url: undefined, status: undefined, page: document.URL },
		});
	});

	test("reports a failure that is not a warning at error level", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		ArticleFiller.displayError(undefined, {
			error: new TypeError("x is not a function"),
			operation: "load article",
		});

		expect(global.Sentry.captureException.mock.calls[0][1]).toMatchObject({
			level: "error",
			tags: { operation: "load article", kind: "unknown" },
		});
	});

	test("makes an Error from the message when no error is given, and reports it", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		ArticleFiller.displayError("Error retrieving article.", { operation: "load article" });

		const [reported] = global.Sentry.captureException.mock.calls[0];
		expect(reported).toBeInstanceOf(Error);
		expect(reported.message).toBe("Error retrieving article.");
	});

	test("logs and reports an error that passed through several handlers once", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		const error = new LoadError("Failed to fetch article data: Network unavailable", { kind: "network" });

		reportError(error);
		ArticleFiller.displayError(undefined, { error, operation: "initialize page" });

		expect(console.error).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(ArticleFiller.errMsg).toContain("We could not reach Small Dev Talk");
	});

	test("escapes HTML in error message to prevent XSS", () => {
		ArticleFiller.displayError("<script>alert('xss')</script>");
		const html = document.getElementById("articleBody").innerHTML;
		expect(html).toContain("&lt;script&gt;alert('xss')&lt;/script&gt;");
		expect(html).not.toContain("<script>");
		expect(document.getElementById("articleBody").querySelector("script")).toBeNull();
		expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
	});

	test("shows the error when the Sentry SDK did not load", () => {
		expect(global.Sentry).toBeUndefined();

		ArticleFiller.displayError("Error retrieving article.");

		expect(document.getElementById("articleBody").innerHTML).toContain("Error retrieving article.");
		expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
	});
});

describe("fetchResource", () => {
	afterEach(() => {
		jest.restoreAllMocks();
		delete global.fetch;
	});

	test("resolves with the body that readBody returns", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") });

		await expect(fetchResource("/a.md", "retrieve article", (response) => response.text())).resolves.toBe("# Hi");
		expect(global.fetch).toHaveBeenCalledWith("/a.md");
	});

	test("rejects with a network LoadError that keeps the original error as its cause", async () => {
		const cause = new TypeError("Failed to fetch");
		global.fetch = jest.fn().mockRejectedValue(cause);

		const error = await fetchResource("/a.json", "retrieve page data", jest.fn()).catch((e) => e);

		expect(error).toBeInstanceOf(LoadError);
		expect(error).toMatchObject({
			kind: "network",
			operation: "retrieve page data",
			url: "/a.json",
			message: "Failed to fetch page data: Failed to fetch",
		});
		expect(error.cause).toBe(cause);
	});

	test("rejects with an http LoadError carrying the status, without reading the body", async () => {
		const readBody = jest.fn();
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" });

		const error = await fetchResource("/a.md", "retrieve article", readBody, { article: "TestArticle" }).catch(
			(e) => e,
		);

		expect(error).toMatchObject({
			kind: "http",
			status: 404,
			article: "TestArticle",
			message: "Failed to fetch article: 404 Not Found",
		});
		expect(readBody).not.toHaveBeenCalled();
	});

	test("rejects with a parse LoadError when the body is not valid JSON", async () => {
		const cause = new SyntaxError("Unexpected token");
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(cause) });

		const error = await fetchResource("/a.json", "retrieve article data", (response) => response.json()).catch(
			(e) => e,
		);

		expect(error).toMatchObject({ kind: "parse", message: "Failed to parse article data: Unexpected token" });
		expect(error.cause).toBe(cause);
	});

	[
		["response.text()", (response) => response.text()],
		["response.json()", (response) => response.json()],
	].forEach(([name, readBody]) => {
		test(`rejects with a network LoadError when the connection drops while ${name} downloads the body`, async () => {
			// fetch resolves once the headers arrive. A body stream that errors rejects text() and json() with a TypeError.
			const cause = new TypeError("network error");
			global.fetch = jest.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.reject(cause),
				json: () => Promise.reject(cause),
			});

			const error = await fetchResource("/a.md", "retrieve article", readBody).catch((e) => e);

			expect(error).toMatchObject({ kind: "network", message: "Failed to download article: network error" });
			expect(error.cause).toBe(cause);
		});
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

describe("ArticleFiller: addToPage with content that sanitizes to nothing", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("shows the parse message and logs the article name", () => {
		document.body.innerHTML = '<div id="articleBody" hidden></div>';
		jest.spyOn(console, "error").mockImplementation(() => {});
		ArticleFiller.articleMd = "<script>alert(1)</script>";

		ArticleFiller.addToPage("TestArticle");

		expect(document.getElementById("articleBody").textContent).toContain("This content could not be displayed.");
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ kind: "parse", operation: "render article", article: "TestArticle" }),
		);
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
		jest.spyOn(console, "error").mockImplementation(() => {});

		await ArticleFiller.grabArticle("MissingArticle");

		await new Promise((r) => setTimeout(r, 0));

		const html = document.getElementById("articleBody").innerHTML;
		expect(html).toContain("Small Dev Talk could not load this content right now.");
		expect(html).not.toContain("404");
		expect(ArticleFiller.articleMd).toBeUndefined();
	});

	test("shows the network message, at warning level, when the connection drops during the article download", async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValue({ ok: true, text: () => Promise.reject(new TypeError("network error")) });
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		await ArticleFiller.grabArticle("TestArticle");

		const html = document.getElementById("articleBody").textContent;
		expect(html).toContain("We could not reach Small Dev Talk.");
		expect(html).not.toContain("This content could not be displayed.");
		expect(global.Sentry.captureException.mock.calls[0][1]).toMatchObject({
			level: "warning",
			tags: { operation: "retrieve article", kind: "network" },
		});
		delete global.Sentry;
	});

	test("shows the network message and logs the article when the request does not complete", async () => {
		global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		await ArticleFiller.grabArticle("TestArticle");

		expect(document.getElementById("articleBody").innerHTML).toContain("We could not reach Small Dev Talk.");
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ kind: "network", operation: "retrieve article", article: "TestArticle" }),
		);
	});

	test("shows the missing message, at warning level, for an article that is not in the article data", async () => {
		jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		ArticleFiller.grabArticle("NoSuchArticle");

		expect(document.getElementById("articleBody").innerHTML).toContain("We could not find that article.");
		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			expect.objectContaining({ message: "Article not found in article data: NoSuchArticle" }),
			{
				level: "warning",
				tags: { operation: "find article", kind: "missing" },
				extra: expect.objectContaining({ article: "NoSuchArticle" }),
			},
		);
		delete global.Sentry;
	});

	test("does not show a rendering failure as a retrieval failure", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Test Article") });
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});
		jest.spyOn(ArticleFiller, "addToPage").mockImplementation(() => {
			throw new TypeError("converter failed");
		});
		jest.spyOn(console, "error").mockImplementation(() => {});

		await ArticleFiller.grabArticle("TestArticle");

		const html = document.getElementById("articleBody").innerHTML;
		expect(html).toContain("Something went wrong while loading this page.");
		expect(html).not.toContain("Could not retrieve article");
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ message: "converter failed", operation: "load article" }),
		);
	});

	test("returns a promise that settles once the article is on the page", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Test Article") });
		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});

		await ArticleFiller.grabArticle("TestArticle");

		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});

	test("normalizes a multi-word article name by title-casing each word", async () => {
		const mockMd = "# Ghost Ship";
		ArticleFiller.articleData = {
			GhostShip: {
				title: "Ghost Ship",
				summary: "A summary.",
				thumbnail: "thumb.png",
				author: "Jane Doe",
				date: "2024-06-01",
			},
		};

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(mockMd),
		});

		jest.spyOn(ArticleFiller, "updateMetaData").mockImplementation(() => {});

		await ArticleFiller.grabArticle("ghost ship");

		await new Promise((r) => setTimeout(r, 0));

		expect(global.fetch).toHaveBeenCalledWith(
			"/src/articleArchive/authorJaneDoe/2024-06-01_GhostShip/GhostShip.md",
		);
		expect(ArticleFiller.articleMd).toBe(mockMd);
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

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({
				kind: "network",
				operation: "retrieve article data",
				url: "/src/articleArchive/articleData.json",
				error: expect.objectContaining({ cause: error }),
			}),
		);
		expect(ArticleFiller.articleData).toBeUndefined();
	});

	test("reports the failure to Sentry as a warning with its operation, and re-throws when the fetch fails", async () => {
		const error = new Error("Network unavailable");
		global.fetch = jest.fn().mockRejectedValue(error);
		jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		await expect(ArticleFiller.retrieveArticleData()).rejects.toThrow("Network unavailable");

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			expect.objectContaining({ cause: error }),
			expect.objectContaining({
				level: "warning",
				tags: { operation: "retrieve article data", kind: "network" },
			}),
		);
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
			"ArticleFiller error:",
			expect.objectContaining({
				kind: "http",
				status: 500,
				message: "Failed to fetch article data: 500 Internal Server Error",
			}),
		);
		expect(ArticleFiller.articleData).toBeUndefined();
	});

	test("logs JSON parsing failures and re-throws without processing article data", async () => {
		const error = new SyntaxError("Unexpected token");
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(error) });
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		await expect(ArticleFiller.retrieveArticleData()).rejects.toThrow("Unexpected token");

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ kind: "parse", error: expect.objectContaining({ cause: error }) }),
		);
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
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		await expect(ArticleFiller.retrievePageData()).rejects.toThrow("Failed to fetch page data: 404 Not Found");

		const expectedError = expect.objectContaining({ message: "Failed to fetch page data: 404 Not Found" });
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ kind: "http", status: 404, operation: "retrieve page data" }),
		);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			expectedError,
			expect.objectContaining({ level: "error", tags: { operation: "retrieve page data", kind: "http" } }),
		);
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
			<meta name="twitter:title" content="">
			<meta property="og:description" content="">
			<meta name="twitter:description" content="">
			<meta property="og:image" content="">
			<meta name="twitter:image" content="">
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

	test("moves a www page with index.html and no query to the canonical host", () => {
		const location = createLocation("https://www.smalldevtalk.net/index.html");

		expect(redirectToCanonicalHost(location)).toBe(true);
		expect(location.replace).toHaveBeenCalledWith("https://smalldevtalk.net/index.html");
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

	test("registerServiceWorker returns null cleanly when register is not supported", async () => {
		global.navigator = { serviceWorker: {} };
		jest.spyOn(console, "error").mockImplementation(() => {});

		const res = await registerServiceWorker();

		expect(res).toBeNull();
		expect(console.error).not.toHaveBeenCalled();
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

	test("registerServiceWorker handles SecurityError from disallowed redirect and reports to Sentry", async () => {
		const securityError = new Error(
			"Failed to register a ServiceWorker for scope ('https://www.smalldevtalk.net/src/serviceWorker/') with script ('https://www.smalldevtalk.net/src/serviceWorker/sw.js'): The script resource is behind a redirect, which is disallowed.",
		);
		securityError.name = "SecurityError";
		securityError.code = 18;

		global.navigator = {
			serviceWorker: {
				getRegistrations: jest.fn().mockResolvedValue([]),
				register: jest.fn().mockRejectedValue(securityError),
			},
		};
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		jest.spyOn(console, "error").mockImplementation(() => {});

		const res = await registerServiceWorker();

		expect(res).toBeNull();
		expect(console.error).toHaveBeenCalledWith("ServiceWorker registration failed:", securityError.message);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(securityError);
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

	test("removeLegacyServiceWorker unregisters legacy worker with www origin scope", async () => {
		const legacyWww = createRegistration("https://www.smalldevtalk.net/src/serviceWorker/");
		global.navigator = {
			serviceWorker: { getRegistrations: jest.fn().mockResolvedValue([legacyWww]) },
		};
		global.caches = { delete: jest.fn().mockResolvedValue(true) };

		await removeLegacyServiceWorker();

		expect(legacyWww.unregister).toHaveBeenCalledTimes(1);
		expect(global.caches.delete).toHaveBeenCalledWith(
			"workbox-precache-v2-https://www.smalldevtalk.net/src/serviceWorker/",
		);
	});

	test("removeLegacyServiceWorker exits cleanly when getRegistrations is not supported", async () => {
		global.navigator = { serviceWorker: {} };
		jest.spyOn(console, "error").mockImplementation(() => {});

		await expect(removeLegacyServiceWorker()).resolves.toBeUndefined();
		expect(console.error).not.toHaveBeenCalled();
	});

	test("removeLegacyServiceWorker catches SecurityError when accessing navigator.serviceWorker and does not throw", async () => {
		const securityError = new Error("Access to service worker is denied by browser policy");
		securityError.name = "SecurityError";

		global.navigator = {};
		Object.defineProperty(global.navigator, "serviceWorker", {
			get() {
				throw securityError;
			},
		});
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		jest.spyOn(console, "error").mockImplementation(() => {});

		await expect(removeLegacyServiceWorker()).resolves.toBeUndefined();
		expect(console.error).toHaveBeenCalledWith("Legacy ServiceWorker cleanup failed:", securityError.message);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(securityError);
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
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
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

	test("renders the view before it registers the worker, so a slow install never delays the page", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		let articleBodyWhenRegistering;
		global.navigator.serviceWorker.register = jest.fn(() => {
			articleBodyWhenRegistering = document.getElementById("articleBody").innerHTML;

			return Promise.resolve(createRegistration("http://localhost/"));
		});

		await start(location);

		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
		expect(articleBodyWhenRegistering).toContain("Test Article");
	});

	test("still registers the worker after the view fails to render", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(ArticleFiller, "displayError").mockImplementation(() => {});
		global.fetch = jest.fn(() => Promise.reject(new Error("Network unavailable")));

		await start(location);

		expect(ArticleFiller.displayError).toHaveBeenCalled();
		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
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

		expect(ArticleFiller.displayError).toHaveBeenCalledWith(undefined, {
			error: expect.objectContaining({
				kind: "network",
				message: expect.stringContaining("Network unavailable"),
			}),
			operation: "initialize page",
		});
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

		expect(ArticleFiller.displayError).toHaveBeenCalledWith(undefined, {
			error: expect.objectContaining({
				kind: "network",
				message: expect.stringContaining("Network unavailable"),
			}),
			operation: "initialize page",
		});
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
		expect(ArticleFiller.displayError).toHaveBeenCalledWith(undefined, {
			error: expect.objectContaining({
				kind: "network",
				message: "Failed to fetch article: Article fetch failed",
			}),
			operation: "load article",
			article: "TestArticle",
		});
	});

	test("reports a failed data request to Sentry once, not once per handler it passes through", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		global.fetch = jest.fn((url) => {
			if (url === "/src/articleArchive/articleData.json") {
				return Promise.reject(new TypeError("Failed to fetch"));
			}

			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});

		await start(location);

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(console.error).toHaveBeenCalledTimes(1);
		expect(document.getElementById("articleBody").textContent).toContain("We could not reach Small Dev Talk.");
		delete global.Sentry;
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

	test("service worker access SecurityError does not block rendering", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		const securityError = new Error("Access to service worker is denied by browser policy");
		securityError.name = "SecurityError";

		global.navigator = {};
		Object.defineProperty(global.navigator, "serviceWorker", {
			get() {
				throw securityError;
			},
		});
		jest.spyOn(console, "error").mockImplementation(() => {});
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

		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});
});

describe("ArticleFiller: updateMetaData", () => {
	beforeEach(() => {
		document.body.innerHTML = `
            <title></title>
            <meta name="description" content="">
            <meta property="og:title" content="">
            <meta name="twitter:title" content="">
            <meta property="og:description" content="">
            <meta name="twitter:description" content="">
            <meta property="og:image" content="">
            <meta name="twitter:image" content="">
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
		expect(document.querySelector("meta[name='twitter:title']").content).toBe("Meta Title | Small Dev Talk");
		expect(document.querySelector("meta[property='og:description']").content).toBe("Meta Summary | Small Dev Talk");
		expect(document.querySelector("meta[name='twitter:description']").content).toBe(
			"Meta Summary | Small Dev Talk",
		);
		expect(document.querySelector("meta[property='og:image']").content).toContain("meta.png");
		expect(document.querySelector("meta[name='twitter:image']").content).toContain("meta.png");
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

	test("gives archive thumbnails their width and height when articleData has them", () => {
		ArticleFiller.articleData.ArticleOne.thumbnailWidth = 400;
		ArticleFiller.articleData.ArticleOne.thumbnailHeight = 225;

		ArticleFiller.displayArchive();

		const images = document.querySelectorAll("#displayArticles img");
		expect(images[0].getAttribute("width")).toBe("400");
		expect(images[0].getAttribute("height")).toBe("225");
		expect(images[1].hasAttribute("width")).toBe(false);
		expect(images[1].hasAttribute("height")).toBe(false);
	});

	test("archive links take their accessible name from the visible title", () => {
		ArticleFiller.displayArchive();

		const link = document.querySelector("#displayArticles .archive-link");
		expect(link.hasAttribute("aria-label")).toBe(false);
		expect(link.textContent).toContain("First Article");
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

	test("loads the first slide's image at once and at high priority, and the others lazily", () => {
		ArticleFiller.changeCarousel();

		const [first, second] = document.querySelectorAll("#carouselInner img");
		expect(first.getAttribute("loading")).toBe("eager");
		expect(first.getAttribute("fetchpriority")).toBe("high");
		expect(second.getAttribute("loading")).toBe("lazy");
		expect(second.hasAttribute("fetchpriority")).toBe(false);
	});

	test("gives each slide image its width and height when articleData has them", () => {
		ArticleFiller.articleData.ArticleOne.thumbnailWidth = 400;
		ArticleFiller.articleData.ArticleOne.thumbnailHeight = 225;

		ArticleFiller.changeCarousel();

		const [first, second] = document.querySelectorAll("#carouselInner img");
		expect(first.getAttribute("width")).toBe("400");
		expect(first.getAttribute("height")).toBe("225");
		expect(second.hasAttribute("width")).toBe(false);
		expect(second.hasAttribute("height")).toBe(false);
	});

	test("ignores a size that is not a positive whole number", () => {
		ArticleFiller.articleData.ArticleOne.thumbnailWidth = 0;
		ArticleFiller.articleData.ArticleOne.thumbnailHeight = 225;
		ArticleFiller.articleData.ArticleTwo.thumbnailWidth = "wide";
		ArticleFiller.articleData.ArticleTwo.thumbnailHeight = 10.5;

		ArticleFiller.changeCarousel();

		document.querySelectorAll("#carouselInner img").forEach((image) => {
			expect(image.hasAttribute("width")).toBe(false);
			expect(image.hasAttribute("height")).toBe(false);
		});
	});

	test("names each slide through its caption, with a level-three heading and no label that differs from it", () => {
		ArticleFiller.changeCarousel();

		const link = document.getElementById("carouselLink0");
		const heading = document.getElementById("carouselHeader0");
		expect(link.hasAttribute("aria-label")).toBe(false);
		expect(link.querySelector("img").getAttribute("alt")).toBe("");
		expect(heading.tagName).toBe("H3");
		expect(heading.textContent).toBe("First Article");
	});
});

describe("ArticleFiller: featured article links", () => {
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
		ArticleFiller.pageData = { featured: { displayArticles: ["ArticleOne", "ArticleTwo"] } };
		ArticleFiller.articleData = {
			ArticleOne: {
				title: "First Article",
				summary: "Summary 1",
				thumbnail: "thumb1.png",
				thumbnailWidth: 400,
				thumbnailHeight: 225,
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
		ArticleFiller.ArticleFiller();
	});

	test("gives each thumbnail its width and height when articleData has them", () => {
		const [first, second] = document.querySelectorAll("#displayArticles img");

		expect(first.getAttribute("width")).toBe("400");
		expect(first.getAttribute("height")).toBe("225");
		expect(second.hasAttribute("width")).toBe(false);
	});

	test("links with visible text take their accessible name from that text", () => {
		const links = Array.from(document.querySelectorAll("#featuredArticle0 a")).filter((link) =>
			link.textContent.trim(),
		);

		expect(links).toHaveLength(3);
		links.forEach((link) => expect(link.hasAttribute("aria-label")).toBe(false));
	});

	test("the Read More link names its article for screen readers", () => {
		const readMore = document.querySelector("#featuredArticle0 p:not(.details) a");

		expect(readMore.textContent.replace(/\s+/g, " ").trim()).toBe("Read More about First Article");
		expect(readMore.querySelector(".visually-hidden").textContent).toBe(" about First Article");
	});

	test("the date link names its article for screen readers", () => {
		const dateLink = document.querySelector("#featuredArticle0 .details a");

		expect(dateLink.textContent.replace(/\s+/g, " ").trim()).toBe("2024-06-01 First Article");
	});

	test("the image-only thumbnail link keeps its label", () => {
		const thumbnailLink = document.querySelector("#featuredArticle0 .col-md-4 a");

		expect(thumbnailLink.getAttribute("aria-label")).toBe("Redirect to First Article");
	});
});

describe("articleData.json", () => {
	const fs = require("fs");
	const path = require("path");
	const archiveDir = path.join(__dirname, "..", "articleArchive");
	const entries = Object.entries(JSON.parse(fs.readFileSync(path.join(archiveDir, "articleData.json"), "utf8")));
	const withThumbnail = entries.filter(([, article]) => article.thumbnail);

	test.each(withThumbnail)("%s has a thumbnail file in its article folder", (key, article) => {
		const folder = `${article.date}_${key}`;
		const thumbnail = path.join(
			archiveDir,
			`author${article.author.replace(/\s/g, "")}`,
			folder,
			article.thumbnail,
		);

		expect(fs.existsSync(thumbnail)).toBe(true);
	});

	test.each(withThumbnail)("%s has a thumbnail width and height", (key, article) => {
		expect(Number.isInteger(article.thumbnailWidth) && article.thumbnailWidth > 0).toBe(true);
		expect(Number.isInteger(article.thumbnailHeight) && article.thumbnailHeight > 0).toBe(true);
	});
});

describe("watchTwitterTimeline", () => {
	/** The state `widgets.js` leaves a timeline in when X answers 429: an `iframe` that is hidden and 0 pixels high. */
	const insertHiddenFrame = () => {
		const frame = document.createElement("iframe");
		frame.style.visibility = "hidden";
		frame.style.height = "0px";
		Object.defineProperty(frame, "offsetHeight", { configurable: true, value: 0 });
		document.querySelector("#twitterTimeline .twitter-timeline").appendChild(frame);

		return frame;
	};

	/** The state `widgets.js` leaves a timeline in when X serves it: a visible `iframe` with a height. */
	const showFrame = (frame) => {
		Object.defineProperty(frame, "offsetHeight", { configurable: true, value: 400 });
		frame.style.visibility = "visible";
		frame.style.height = "400px";
	};

	/** Let queued `MutationObserver` callbacks run. */
	const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

	beforeEach(() => {
		document.body.innerHTML = `
			<div class="box">
				<p class="twitterFallback"><a href="https://twitter.com/SmallDevTalk">Follow @SmallDevTalk on X</a></p>
				<div id="twitterTimeline" class="twitterTimelinePending" inert>
					<div class="twitter-timeline"></div>
				</div>
			</div>
		`;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		delete global.Sentry;
	});

	test("keeps the follow link and the pending timeline before widgets.js inserts an iframe", async () => {
		watchTwitterTimeline();
		await flushMutations();

		expect(document.querySelector(".twitterFallback").hidden).toBe(false);
		expect(document.getElementById("twitterTimeline").classList.contains("twitterTimelinePending")).toBe(true);
		expect(document.getElementById("twitterTimeline").hasAttribute("inert")).toBe(true);
	});

	test("keeps the follow link when X answers 429 and leaves the iframe hidden", async () => {
		watchTwitterTimeline();
		insertHiddenFrame();
		await flushMutations();

		expect(document.querySelector(".twitterFallback").hidden).toBe(false);
		expect(document.getElementById("twitterTimeline").classList.contains("twitterTimelinePending")).toBe(true);
		expect(document.getElementById("twitterTimeline").hasAttribute("inert")).toBe(true);
	});

	test("swaps the follow link for the timeline once the iframe becomes visible and sized", async () => {
		watchTwitterTimeline();
		const frame = insertHiddenFrame();
		await flushMutations();

		showFrame(frame);
		await flushMutations();

		expect(document.querySelector(".twitterFallback").hidden).toBe(true);
		expect(document.getElementById("twitterTimeline").classList.contains("twitterTimelinePending")).toBe(false);
		expect(document.getElementById("twitterTimeline").hasAttribute("inert")).toBe(false);
	});

	test("swaps at once when the iframe is already visible and sized", () => {
		const frame = insertHiddenFrame();
		showFrame(frame);

		watchTwitterTimeline();

		expect(document.querySelector(".twitterFallback").hidden).toBe(true);
		expect(document.getElementById("twitterTimeline").classList.contains("twitterTimelinePending")).toBe(false);
		expect(document.getElementById("twitterTimeline").hasAttribute("inert")).toBe(false);
	});

	test("stops observing after the swap, so a later hidden iframe does not bring the link back", async () => {
		watchTwitterTimeline();
		const frame = insertHiddenFrame();
		showFrame(frame);
		await flushMutations();

		Object.defineProperty(frame, "offsetHeight", { configurable: true, value: 0 });
		frame.style.visibility = "hidden";
		await flushMutations();

		expect(document.querySelector(".twitterFallback").hidden).toBe(true);
		expect(document.getElementById("twitterTimeline").classList.contains("twitterTimelinePending")).toBe(false);
		expect(document.getElementById("twitterTimeline").hasAttribute("inert")).toBe(false);
	});

	test("does nothing when the sidebar has no timeline container", () => {
		document.body.innerHTML = "";

		expect(() => watchTwitterTimeline()).not.toThrow();
	});

	test("leaves the follow link in place when MutationObserver is unavailable", () => {
		const original = global.MutationObserver;
		delete global.MutationObserver;

		try {
			expect(() => watchTwitterTimeline()).not.toThrow();
			expect(document.querySelector(".twitterFallback").hidden).toBe(false);
		} finally {
			global.MutationObserver = original;
		}
	});

	test("does not report the failed embed to Sentry or log an error", async () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		jest.spyOn(console, "error").mockImplementation(() => {});

		watchTwitterTimeline();
		insertHiddenFrame();
		await flushMutations();

		expect(global.Sentry.captureException).not.toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
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

describe("handleControlClick", () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div class="carousel-item active" id="first"></div>
			<div class="carousel-item" id="second"></div>
			<a id="next" data-carousel-step="next"><span id="nextIcon"></span></a>
			<a id="prev" data-carousel-step="prev"></a>
			<p id="plain">text</p>
		`;
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	test("moves the carousel forward when a next arrow or a child of it is clicked", () => {
		handleControlClick({ target: document.getElementById("nextIcon") });

		expect(document.getElementById("first").classList.contains("active")).toBe(false);
		expect(document.getElementById("second").classList.contains("active")).toBe(true);
	});

	test("moves the carousel back when a previous arrow is clicked", () => {
		handleControlClick({ target: document.getElementById("prev") });

		expect(document.getElementById("first").classList.contains("active")).toBe(false);
		expect(document.getElementById("second").classList.contains("active")).toBe(true);
	});

	test("ignores clicks outside the controls", () => {
		handleControlClick({ target: document.getElementById("plain") });

		expect(document.getElementById("first").classList.contains("active")).toBe(true);
	});

	test("renders the error buttons without inline event handler attributes", () => {
		document.body.innerHTML = '<div id="articleBody" hidden></div>';
		jest.spyOn(console, "error").mockImplementation(() => {});

		ArticleFiller.displayError("Boom");

		const html = document.getElementById("articleBody").innerHTML;
		expect(html).not.toMatch(/\sonclick=/i);
		expect(html).toContain('data-page-action="reload"');
		expect(html).toContain('data-page-action="home"');

		console.error.mockRestore();
	});
});

describe("initializeSentry", () => {
	afterEach(() => {
		delete global.Sentry;
	});

	/**
	 * Build a stand-in for the Sentry SDK, which sends events over the network, so its calls can be read.
	 * @returns {object} An SDK object whose functions are Jest mocks.
	 */
	function createSentrySdk() {
		const scope = { setTag: jest.fn() };

		return {
			init: jest.fn(),
			browserTracingIntegration: jest.fn(() => "tracing"),
			replayIntegration: jest.fn(() => "replay"),
			getCurrentScope: jest.fn(() => scope),
			captureException: jest.fn(),
			scope,
		};
	}

	test("reports the version in package.json", () => {
		expect(APP_VERSION).toBe(packageVersion);
	});

	test("starts Sentry with the release, both integrations and the app version tag", () => {
		global.Sentry = createSentrySdk();

		initializeSentry();

		expect(global.Sentry.init).toHaveBeenCalledWith(
			expect.objectContaining({
				release: `small-dev-talk@${APP_VERSION}`,
				integrations: ["tracing", "replay"],
				replaysOnErrorSampleRate: 1.0,
			}),
		);
		expect(global.Sentry.scope.setTag).toHaveBeenCalledWith("app-version", APP_VERSION);
	});

	test("sends the errors that were reported before Sentry started", () => {
		reportToSentry(new Error("reported before init"));
		global.Sentry = createSentrySdk();

		initializeSentry();

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException.mock.calls[0][0].message).toBe("reported before init");
	});

	test("logs and does not start when the SDK did not load", () => {
		const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

		initializeSentry();

		expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("Sentry initialization skipped"));
		consoleError.mockRestore();
	});

	test("does not start when a required integration is missing", () => {
		global.Sentry = createSentrySdk();
		delete global.Sentry.replayIntegration;
		const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

		initializeSentry();

		expect(global.Sentry.init).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});
});

describe("loadGoogleTagManager", () => {
	afterEach(() => {
		document.head.innerHTML = "";
		delete window.dataLayer;
	});

	test("adds an async script for the container with CORS enabled and starts the data layer", () => {
		loadGoogleTagManager();

		const script = document.head.querySelector("script");

		expect(script.src).toBe("https://www.googletagmanager.com/gtm.js?id=GTM-5H259MB");
		expect(script.async).toBe(true);
		expect(script.crossOrigin).toBe("anonymous");
		expect(window.dataLayer).toEqual([expect.objectContaining({ event: "gtm.js" })]);
	});

	test("keeps the events that are already in the data layer", () => {
		window.dataLayer = [{ event: "earlier" }];

		loadGoogleTagManager();

		expect(window.dataLayer.map((entry) => entry.event)).toEqual(["earlier", "gtm.js"]);
	});
});

describe("updateCanonicalLink", () => {
	beforeEach(() => {
		document.head.innerHTML = '<link rel="canonical" href="https://smalldevtalk.net/">';
	});

	afterEach(() => {
		document.head.innerHTML = "";
	});

	test("points the canonical link at the viewed URL on the canonical host", () => {
		updateCanonicalLink({ host: "smalldevtalk.net", href: "https://smalldevtalk.net/index.html?Oceania" });

		expect(document.querySelector('link[rel="canonical"]').getAttribute("href")).toBe(
			"https://smalldevtalk.net/index.html?Oceania",
		);
	});

	test("leaves the canonical link alone on any other host", () => {
		updateCanonicalLink({ host: "localhost:3000", href: "http://localhost:3000/index.html?Oceania" });

		expect(document.querySelector('link[rel="canonical"]').getAttribute("href")).toBe("https://smalldevtalk.net/");
	});

	test("does nothing when the page has no canonical link", () => {
		document.head.innerHTML = "";

		expect(() =>
			updateCanonicalLink({ host: "smalldevtalk.net", href: "https://smalldevtalk.net/" }),
		).not.toThrow();
	});
});

describe("startThirdParties", () => {
	/**
	 * Build a stand-in for the Sentry SDK, which sends events over the network, so whether it started can be read.
	 * @returns {object} An SDK object whose functions are Jest mocks.
	 */
	function createSentrySdk() {
		return {
			init: jest.fn(),
			browserTracingIntegration: jest.fn(),
			replayIntegration: jest.fn(),
			getCurrentScope: jest.fn(() => ({ setTag: jest.fn() })),
			captureException: jest.fn(),
		};
	}

	/**
	 * Make `document.readyState` report a value, which jsdom does not let a test assign.
	 * @param {string} state The ready state to report.
	 * @returns {void}
	 */
	function setReadyState(state) {
		jest.spyOn(document, "readyState", "get").mockReturnValue(state);
	}

	afterEach(() => {
		jest.restoreAllMocks();
		document.head.innerHTML = "";
		delete window.dataLayer;
		delete global.Sentry;
	});

	test("loads Google Tag Manager and starts Sentry at once when the document has finished loading", () => {
		global.Sentry = createSentrySdk();
		setReadyState("complete");

		startThirdParties();

		expect(document.head.querySelector('script[src*="googletagmanager.com/gtm.js"]')).not.toBeNull();
		expect(global.Sentry.init).toHaveBeenCalledTimes(1);
	});

	test("waits for DOMContentLoaded before starting Sentry while the document is loading", () => {
		global.Sentry = createSentrySdk();
		setReadyState("loading");
		const addEventListener = jest.spyOn(document, "addEventListener");

		startThirdParties();

		expect(addEventListener).toHaveBeenCalledWith("DOMContentLoaded", initializeSentry);
		expect(global.Sentry.init).not.toHaveBeenCalled();
		expect(document.head.querySelector('script[src*="googletagmanager.com/gtm.js"]')).not.toBeNull();
	});
});
