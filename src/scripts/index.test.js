global.showdown = require("./libraries/showdown/showdown.min.js");

const { ArticleFiller, escapeHtml, lazyLoadImagesAfterFirst, sanitizeHtml } = require("./index.js");

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
	enableSubmenuDismissal,
	changeCarouselSlide,
	showCarouselSlide,
	enableCarouselSwipe,
	APP_VERSION,
	redirectToCanonicalHost,
	removeLegacyServiceWorker,
	registerServiceWorker,
	init,
	start,
	watchTwitterTimeline,
} = require("./index.js");
const { version: packageVersion } = require("../../package.json");

/**
 * Record every value written to an element's `innerHTML` while `render` runs. `innerHTML +=` counts as a write.
 * @param {() => void} render The code under test.
 * @returns {Object<string, string[]>} The values written, keyed by the id of the element written to.
 */
function recordInnerHtmlWrites(render) {
	const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
	const writes = {};

	Object.defineProperty(Element.prototype, "innerHTML", {
		...descriptor,
		set(value) {
			(writes[this.id] ||= []).push(value);
			descriptor.set.call(this, value);
		},
	});

	try {
		render();
	} finally {
		Object.defineProperty(Element.prototype, "innerHTML", descriptor);
	}

	return writes;
}

afterEach(() => {
	// Empty the module's buffer of errors reported without a Sentry client, so one test's errors never reach another.
	global.Sentry = { captureException: jest.fn() };
	flushPendingSentryErrors();
	delete global.Sentry;
});

describe("reportToSentry before Sentry initializes", () => {
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
		expect(global.Sentry.captureException).toHaveBeenCalledWith(error, undefined);
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

		expect(global.Sentry.captureException).toHaveBeenCalledWith(error, undefined);
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
		expect(global.Sentry.captureException).toHaveBeenCalledWith(error, undefined);
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

	const UNKNOWN_MESSAGE = "Something went wrong while loading this page. Refresh the page or try again later.";

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

			ArticleFiller.displayError(error);

			expect(ArticleFiller.errMsg).toBe(message);
			expect(document.getElementById("articleBody").textContent).toContain(message);
			expect(document.getElementById("articleBody").innerHTML).not.toContain("503");
			expect(document.getElementById("articleBody").hasAttribute("hidden")).toBe(false);
		});
	});

	test("shows the unknown message for an error without a kind, and keeps its markup off the page", () => {
		ArticleFiller.displayError(new Error("<script>alert('xss')</script>"));

		const articleBody = document.getElementById("articleBody");
		expect(ArticleFiller.errMsg).toBe(UNKNOWN_MESSAGE);
		expect(articleBody.textContent).toContain(UNKNOWN_MESSAGE);
		expect(articleBody.innerHTML).not.toContain("alert");
		expect(articleBody.querySelector("script")).toBeNull();
	});

	test("reports the Error it is given, with its stack, rather than a new one", () => {
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		const error = new TypeError("x is not a function");

		ArticleFiller.displayError(error, { operation: "load article" });

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException.mock.calls[0][0]).toBe(error);
		expect(global.Sentry.captureException.mock.calls[0][1]).toMatchObject({
			level: "error",
			tags: { operation: "load article", kind: "unknown" },
		});
	});

	test("wraps a failure that is not an Error, and shows the unknown message", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		ArticleFiller.displayError("plain failure");

		const [reported] = global.Sentry.captureException.mock.calls[0];
		expect(reported).toBeInstanceOf(Error);
		expect(reported.message).toBe("plain failure");
		expect(ArticleFiller.errMsg).toBe(UNKNOWN_MESSAGE);
	});

	test("logs one object with the original error and its context, preferring the error's own operation and article", () => {
		const error = new LoadError("Failed to fetch article: 500 Internal Server Error", {
			kind: "http",
			operation: "retrieve article",
			url: "/src/articleArchive/a.md",
			status: 500,
			article: "TestArticle",
		});

		ArticleFiller.displayError(error, { operation: "load article", article: "OtherArticle" });

		expect(console.error).toHaveBeenCalledTimes(1);
		expect(console.error).toHaveBeenCalledWith("ArticleFiller error:", {
			message: "Failed to fetch article: 500 Internal Server Error",
			kind: "http",
			operation: "retrieve article",
			article: "TestArticle",
			url: "/src/articleArchive/a.md",
			status: 500,
			page: document.URL,
			timestamp: expect.any(String),
			error,
		});
		expect(console.error.mock.calls[0][1].error.stack).toEqual(expect.any(String));
	});

	test("fills the operation and article from the context when the error has none", () => {
		ArticleFiller.displayError(new Error("boom"), { operation: "load article", article: "TestArticle" });

		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ operation: "load article", article: "TestArticle", kind: "unknown" }),
		);
	});

	test("reports the original error to Sentry with its level, tags and extra context", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		const error = new LoadError("Article not found in article data: Nope", {
			kind: "missing",
			operation: "find article",
			article: "Nope",
		});

		ArticleFiller.displayError(error);

		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(error, {
			level: "warning",
			tags: { operation: "find article", kind: "missing" },
			extra: { article: "Nope", url: undefined, status: undefined, page: document.URL },
		});
	});

	test("logs and reports an error that passed through several handlers once", () => {
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };
		const error = new LoadError("Failed to fetch article data: Network unavailable", { kind: "network" });

		reportError(error);
		ArticleFiller.displayError(error, { operation: "initialize page" });

		expect(console.error).toHaveBeenCalledTimes(1);
		expect(global.Sentry.captureException).toHaveBeenCalledTimes(1);
		expect(ArticleFiller.errMsg).toContain("We could not reach Small Dev Talk");
	});

	test("shows the error when the Sentry SDK did not load", () => {
		expect(global.Sentry).toBeUndefined();

		ArticleFiller.displayError(new LoadError("Article not found in article data: Nope", { kind: "missing" }));

		expect(document.getElementById("articleBody").textContent).toContain("We could not find that article.");
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

		await expect(fetchResource("/a.md", "article", (response) => response.text())).resolves.toBe("# Hi");
		expect(global.fetch).toHaveBeenCalledWith("/a.md");
	});

	test("rejects with a network LoadError that keeps the original error as its cause", async () => {
		const cause = new TypeError("Failed to fetch");
		global.fetch = jest.fn().mockRejectedValue(cause);

		const error = await fetchResource("/a.json", "page data", jest.fn()).catch((e) => e);

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
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, statusText: "Service Unavailable" });

		const error = await fetchResource("/a.md", "article", readBody, { article: "TestArticle" }).catch((e) => e);

		expect(error).toMatchObject({
			kind: "http",
			status: 503,
			article: "TestArticle",
			message: "Failed to fetch article: 503 Service Unavailable",
		});
		expect(readBody).not.toHaveBeenCalled();
	});

	test("rejects with a missing LoadError carrying the status when the server answers 404", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" });

		const error = await fetchResource("/a.md", "article", jest.fn()).catch((e) => e);

		expect(error).toMatchObject({
			kind: "missing",
			status: 404,
			operation: "retrieve article",
			message: "Failed to fetch article: 404 Not Found",
		});
	});

	test("rejects with a parse LoadError when the body is not valid JSON", async () => {
		const cause = new SyntaxError("Unexpected token");
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(cause) });

		const error = await fetchResource("/a.json", "article data", (response) => response.json()).catch((e) => e);

		expect(error).toMatchObject({ kind: "parse", message: "Failed to parse article data: Unexpected token" });
		expect(error.cause).toBe(cause);
	});

	test("rejects with a network LoadError when the connection drops while the body downloads", async () => {
		// fetch resolves once the headers arrive. A body stream that errors rejects text() and json() with a TypeError.
		const cause = new TypeError("network error");
		global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.reject(cause) });

		const error = await fetchResource("/a.md", "article", (response) => response.text()).catch((e) => e);

		expect(error).toMatchObject({ kind: "network", message: "Failed to download article: network error" });
		expect(error.cause).toBe(cause);
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

	test("loads the first article image at once and every later one lazily", () => {
		ArticleFiller.articleMd = "## Title\n\n![one](one.jpg)\n\nText.\n\n![two](two.jpg)\n\n![three](three.png)";
		ArticleFiller.addToPage("TestArticle");

		const images = document.querySelectorAll("#articleBody img");
		expect(Array.from(images, (image) => image.getAttribute("src"))).toEqual(["one.jpg", "two.jpg", "three.png"]);
		expect(images[0].hasAttribute("loading")).toBe(false);
		expect(images[1].getAttribute("loading")).toBe("lazy");
		expect(images[2].getAttribute("loading")).toBe("lazy");
	});

	test("gives an article image the width and height its markdown names", () => {
		ArticleFiller.articleMd = "![one](one.jpg =500x304)\n\n![two](two.png)";
		ArticleFiller.addToPage("TestArticle");

		const [sized, unsized] = document.querySelectorAll("#articleBody img");
		expect(sized.getAttribute("src")).toBe("one.jpg");
		expect(sized.getAttribute("width")).toBe("500");
		expect(sized.getAttribute("height")).toBe("304");
		expect(unsized.hasAttribute("width")).toBe(false);
	});

	test("leaves an <img> tag shown as code as text", () => {
		ArticleFiller.articleMd = '![one](one.jpg)\n\n`<img src="two.jpg">`\n\n    <img src="three.jpg">';
		ArticleFiller.addToPage("TestArticle");

		const body = document.getElementById("articleBody");
		expect(body.querySelectorAll("img")).toHaveLength(1);
		expect(body.querySelector("code").textContent).toBe('<img src="two.jpg">');
		expect(body.querySelector("pre code").textContent).toContain('<img src="three.jpg">');
	});
});

describe("lazyLoadImagesAfterFirst", () => {
	test("adds loading=lazy to every image tag after the first, in any letter case", () => {
		expect(lazyLoadImagesAfterFirst('<p><img src="a.jpg"></p><IMG src="b.jpg"><img src="c.jpg" />')).toBe(
			'<p><img src="a.jpg"></p><IMG loading="lazy" src="b.jpg"><img loading="lazy" src="c.jpg" />',
		);
	});

	test("returns HTML with no images or one image unchanged", () => {
		expect(lazyLoadImagesAfterFirst("<p>No images</p>")).toBe("<p>No images</p>");
		expect(lazyLoadImagesAfterFirst('<img src="a.jpg">')).toBe('<img src="a.jpg">');
	});

	test("does not match a tag whose name only starts with img", () => {
		expect(lazyLoadImagesAfterFirst('<img src="a.jpg"><imgx></imgx>')).toBe('<img src="a.jpg"><imgx></imgx>');
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
            <meta name="description" content="">
            <meta property="og:title" content="">
            <meta name="twitter:title" content="">
            <meta property="og:description" content="">
            <meta name="twitter:description" content="">
            <meta property="og:image" content="">
            <meta name="twitter:image" content="">
            <script type="application/ld+json">{}</script>
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
		delete global.Sentry;
	});

	test("loads markdown and updates DOM", async () => {
		const mockMd = "# Test Article";

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(mockMd),
		});

		await ArticleFiller.grabArticle("TestArticle");

		// Wait for the fetch and DOM update
		await new Promise((r) => setTimeout(r, 0));

		expect(ArticleFiller.articleMd).toBe(mockMd);
		expect(document.getElementById("articleBody").innerHTML).toContain("Test Article");
	});

	test("shows the missing message when the article file answers 404", async () => {
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

		jest.spyOn(console, "error").mockImplementation(() => {});

		await ArticleFiller.grabArticle("MissingArticle");

		await new Promise((r) => setTimeout(r, 0));

		const html = document.getElementById("articleBody").innerHTML;
		expect(html).toContain("We could not find that article.");
		expect(html).not.toContain("404");
		expect(ArticleFiller.articleMd).toBeUndefined();
	});

	test("shows the network message, at warning level, when the connection drops during the article download", async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValue({ ok: true, text: () => Promise.reject(new TypeError("network error")) });
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
	});

	test("shows the network message and logs the article when the request does not complete", async () => {
		global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
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
	});

	test("shows a rendering failure as an unknown failure of loading the article, not a retrieval failure", async () => {
		// showdown's makeHtml calls replace() on its input, so a body that is not a string throws inside addToPage.
		global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve({}) });
		jest.spyOn(console, "error").mockImplementation(() => {});

		await ArticleFiller.grabArticle("TestArticle");

		expect(document.getElementById("articleBody").textContent).toContain(
			"Something went wrong while loading this page.",
		);
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({
				kind: "unknown",
				operation: "load article",
				article: "TestArticle",
				error: expect.any(TypeError),
			}),
		);
	});

	test("returns a promise that settles once the article is on the page", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Test Article") });

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
			.mockResolvedValue({ ok: false, status: 503, statusText: "Service Unavailable", json: jest.fn() });
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		// Sentry is a third-party SDK that sends events over the network.
		global.Sentry = { captureException: jest.fn(), getClient: () => ({}) };

		await expect(ArticleFiller.retrievePageData()).rejects.toThrow(
			"Failed to fetch page data: 503 Service Unavailable",
		);

		const expectedError = expect.objectContaining({
			message: "Failed to fetch page data: 503 Service Unavailable",
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ kind: "http", status: 503, operation: "retrieve page data" }),
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
		// Page data resolves after article data, so a view rendered as each request settles would render the article twice.
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
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ operation: "register service worker", message: securityError.message }),
		);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			securityError,
			expect.objectContaining({
				level: "error",
				tags: { operation: "register service worker", kind: "unknown" },
			}),
		);
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
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({ operation: "remove legacy service worker", message: securityError.message }),
		);
		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			securityError,
			expect.objectContaining({ tags: { operation: "remove legacy service worker", kind: "unknown" } }),
		);
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

		expect(global.Sentry.captureException).toHaveBeenCalledWith(
			cleanupError,
			expect.objectContaining({ tags: { operation: "remove legacy service worker", kind: "unknown" } }),
		);
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

	test("lets Escape close the navigation's open submenu", async () => {
		document.body.innerHTML = `
			<div id="header"><nav><ul class="pages">
				<li id="games"><a id="gamesLink" href="index.html?pages&games">Games</a><ul><li></li></ul></li>
			</ul></nav></div>
			<div id="articleBody"></div>
		`;

		await start(createLocation("https://smalldevtalk.net/index.html?TestArticle"));
		document.getElementById("gamesLink").focus();
		document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

		expect(document.getElementById("games").classList.contains("submenuDismissed")).toBe(true);
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
		global.fetch = jest.fn(() => Promise.reject(new Error("Network unavailable")));

		await start(location);

		expect(document.getElementById("articleBody").textContent).toContain("We could not reach Small Dev Talk.");
		expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
	});

	test("shows error message when retrievePageData fails", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
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

		expect(document.getElementById("articleBody").textContent).toContain("We could not reach Small Dev Talk.");
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({
				kind: "network",
				operation: "retrieve page data",
				message: expect.stringContaining("Network unavailable"),
			}),
		);
	});

	test("shows error message when retrieveArticleData fails", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
		jest.spyOn(console, "error").mockImplementation(() => {});
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

		expect(document.getElementById("articleBody").textContent).toContain("We could not reach Small Dev Talk.");
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({
				kind: "network",
				operation: "retrieve article data",
				message: expect.stringContaining("Network unavailable"),
			}),
		);
	});

	test("grabArticle handles markdown fetch failure and displays specific error", async () => {
		const location = createLocation("https://smalldevtalk.net/index.html?TestArticle");
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

			return Promise.reject(new Error("Article fetch failed"));
		});

		await start(location);
		await new Promise((resolve) => setTimeout(resolve, 0));

		// grabArticle catches its own error and shows the message for its kind
		expect(document.getElementById("articleBody").textContent).toContain("We could not reach Small Dev Talk.");
		expect(console.error).toHaveBeenCalledWith(
			"ArticleFiller error:",
			expect.objectContaining({
				kind: "network",
				operation: "retrieve article",
				article: "TestArticle",
				message: "Failed to fetch article: Article fetch failed",
			}),
		);
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
		delete document.URL;
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
		{
			name: "grabs the article named by a single param",
			url: "http://localhost/index.html?TestArticle",
			expectGrabArticle: true,
			expectCallDisplay: false,
		},
		{
			// The skip link adds #content to the URL, which a reload or a shared link keeps.
			name: "grabs the article named by a single param when the URL has a fragment",
			url: "http://localhost/index.html?TestArticle#content",
			expectGrabArticle: true,
			expectCallDisplay: false,
		},
		{
			name: "calls callDisplay for no query in a URL with a fragment",
			url: "http://localhost/index.html#content",
			expectGrabArticle: false,
			expectCallDisplay: true,
		},
	];

	testCases.forEach(({ name, url, expectGrabArticle, expectCallDisplay }) => {
		test(name, () => {
			Object.defineProperty(document, "URL", {
				value: url,
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

describe("ArticleFiller: callDisplay", () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div id="pageTitle"></div>
			<div id="carouselInner"></div>
			<div id="carouselIndicator"></div>
			<div id="featuredArticles"></div>
			<div id="displayArticles"></div>
			<div id="articleBody" hidden></div>
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
		ArticleFiller.pageData = {
			games: { carousel: ["ArticleOne"] },
			index: { carousel: ["ArticleTwo"] },
		};
	});

	afterEach(() => {
		delete document.URL;
		document.body.innerHTML = "";
		ArticleFiller.whatPageDisplay = "index";
		ArticleFiller.pageURL = undefined;
		ArticleFiller.articleData = undefined;
		ArticleFiller.pageData = undefined;
	});

	/**
	 * Run callDisplay at a URL.
	 * @param {string} url The page URL.
	 * @returns {void}
	 */
	function callDisplayAt(url) {
		Object.defineProperty(document, "URL", { value: url, configurable: true });

		ArticleFiller.callDisplay();
	}

	test.each(["http://localhost/index.html?pages&games", "http://localhost/index.html?pages&games#content"])(
		"shows the Games section's carousel for %s",
		(url) => {
			callDisplayAt(url);

			expect(document.getElementById("pageTitle").innerText).toBe("Small Dev Talk: Games");
			expect(document.getElementById("carouselInner").textContent).toContain("First Article");
			expect(document.getElementById("carouselInner").textContent).not.toContain("Second Article");
		},
	);

	test.each(["http://localhost/index.html?pages&archive", "http://localhost/index.html?pages&archive#content"])(
		"shows the archive for %s",
		(url) => {
			callDisplayAt(url);

			expect(document.querySelectorAll("#displayArticles .archive-display")).toHaveLength(2);
			expect(document.getElementById("featuredArticles").hasAttribute("hidden")).toBe(true);
			expect(document.getElementById("carouselInner").innerHTML).toBe("");
		},
	);

	test.each(["http://localhost/index.html", "http://localhost/index.html#content"])(
		"shows the home page's carousel for %s",
		(url) => {
			callDisplayAt(url);

			expect(document.getElementById("pageTitle").innerText).toBe("Small Dev Talk: Index");
			expect(document.getElementById("carouselInner").textContent).toContain("Second Article");
			expect(document.getElementById("carouselInner").textContent).not.toContain("First Article");
		},
	);
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
		expect(carouselIndicator).toContain('data-carousel-slide-to="0"');
		expect(carouselIndicator).toContain('data-carousel-slide-to="1"');
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

	test("writes the slides and the indicators once each, so earlier slides are not parsed again", () => {
		ArticleFiller.pageData.featured.carousel.push("ArticleOne");

		const writes = recordInnerHtmlWrites(() => ArticleFiller.changeCarousel());

		expect(writes.carouselInner).toHaveLength(1);
		expect(writes.carouselIndicator).toHaveLength(1);
		expect(document.querySelectorAll("#carouselInner .carousel-item")).toHaveLength(3);
		expect(document.querySelectorAll("#carouselIndicator button")).toHaveLength(3);
		expect(document.querySelectorAll("#carouselInner .carousel-item.active")).toHaveLength(1);
		expect(document.getElementById("carouselImage2").getAttribute("src")).toBe(
			"/src/articleArchive/authorJaneDoe/2024-06-01_ArticleOne/thumb1.png",
		);
	});

	test("renders each indicator as a button named after its slide, with the first one current", () => {
		ArticleFiller.changeCarousel();

		const [first, second] = document.querySelectorAll("#carouselIndicator button");
		expect(first.getAttribute("type")).toBe("button");
		expect(first.getAttribute("data-bs-target")).toBe("#featuredCarousel");
		expect(first.getAttribute("aria-label")).toBe("Show slide 1: First Article");
		expect(first.classList.contains("active")).toBe(true);
		expect(first.getAttribute("aria-current")).toBe("true");
		expect(second.getAttribute("data-carousel-slide-to")).toBe("1");
		expect(second.getAttribute("aria-label")).toBe("Show slide 2: Second Article");
		expect(second.classList.contains("active")).toBe(false);
		expect(second.hasAttribute("aria-current")).toBe(false);
	});

	test("labels each slide as a slide with its position, and announces nothing when the carousel renders", () => {
		document.body.insertAdjacentHTML("beforeend", '<p id="carouselStatus"></p>');

		ArticleFiller.changeCarousel();

		const slides = document.querySelectorAll("#carouselInner .carousel-item");
		expect(Array.from(slides, (slide) => slide.getAttribute("aria-label"))).toEqual(["1 of 2", "2 of 2"]);
		expect(slides[0].getAttribute("role")).toBe("group");
		expect(slides[0].getAttribute("aria-roledescription")).toBe("slide");
		expect(slides[0].querySelector(".carousel-caption").hasAttribute("style")).toBe(false);
		expect(document.getElementById("carouselStatus").textContent).toBe("");
	});

	test("escapes the article title in an indicator's label", () => {
		ArticleFiller.articleData.ArticleOne.title = 'Say "hi" <b>loud</b>';

		ArticleFiller.changeCarousel();

		const first = document.querySelector("#carouselIndicator button");
		expect(first.getAttribute("aria-label")).toBe('Show slide 1: Say "hi" <b>loud</b>');
		expect(first.children).toHaveLength(0);
	});

	test("replaces the slides of an earlier render", () => {
		ArticleFiller.changeCarousel();
		ArticleFiller.changeCarousel();

		expect(document.querySelectorAll("#carouselInner .carousel-item")).toHaveLength(2);
		expect(document.querySelectorAll("#carouselIndicator button")).toHaveLength(2);
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

	test("writes the list once, so earlier posts are not parsed again", () => {
		const writes = recordInnerHtmlWrites(() => ArticleFiller.ArticleFiller());

		expect(writes.displayArticles).toHaveLength(1);
		expect(document.querySelectorAll("#displayArticles > .post")).toHaveLength(2);
	});

	test("closes every div it opens", () => {
		const [markup] = recordInnerHtmlWrites(() => ArticleFiller.ArticleFiller()).displayArticles;

		expect(markup.match(/<\/div>/g)).toHaveLength(markup.match(/<div\b/g).length);
	});

	test("skips a key with no article data and keeps each post's id at its place in the list", () => {
		ArticleFiller.pageData.featured.displayArticles = ["ArticleOne", "NoSuchArticle", "ArticleTwo"];

		ArticleFiller.ArticleFiller();

		expect(Array.from(document.querySelectorAll("#displayArticles > .post"), (post) => post.id)).toEqual([
			"featuredArticle0",
			"featuredArticle2",
		]);
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
			<div id="carouselIndicator">
				<button id="dot0" data-carousel-slide-to="0" class="active" aria-current="true"></button>
				<button id="dot1" data-carousel-slide-to="1"></button>
			</div>
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

	test("shows the slide of a clicked indicator and marks the indicator current", () => {
		handleControlClick({ target: document.getElementById("dot1") });

		expect(document.getElementById("second").classList.contains("active")).toBe(true);
		expect(document.getElementById("first").classList.contains("active")).toBe(false);
		expect(document.getElementById("dot1").getAttribute("aria-current")).toBe("true");
		expect(document.getElementById("dot0").hasAttribute("aria-current")).toBe(false);
	});

	test("shows the first slide when its indicator, numbered 0, is clicked", () => {
		handleControlClick({ target: document.getElementById("dot1") });
		handleControlClick({ target: document.getElementById("dot0") });

		expect(document.getElementById("first").classList.contains("active")).toBe(true);
		expect(document.getElementById("dot0").getAttribute("aria-current")).toBe("true");
	});

	test("ignores clicks outside the controls", () => {
		handleControlClick({ target: document.getElementById("plain") });

		expect(document.getElementById("first").classList.contains("active")).toBe(true);
	});

	test("renders the error buttons without inline event handler attributes", () => {
		document.body.innerHTML = '<div id="articleBody" hidden></div>';
		jest.spyOn(console, "error").mockImplementation(() => {});

		ArticleFiller.displayError(new Error("Boom"));

		const html = document.getElementById("articleBody").innerHTML;
		expect(html).not.toMatch(/\sonclick=/i);
		expect(html).toContain('data-page-action="reload"');
		expect(html).toContain('data-page-action="home"');

		console.error.mockRestore();
	});
});

describe("carousel slide changes", () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div class="carousel-item active" id="slide0"><h3>First</h3></div>
			<div class="carousel-item" id="slide1"><h3> Second </h3></div>
			<div class="carousel-item" id="slide2"></div>
			<p id="carouselStatus"></p>
			<div id="carouselIndicator">
				<button data-carousel-slide-to="0" class="active" aria-current="true"></button>
				<button data-carousel-slide-to="1"></button>
				<button data-carousel-slide-to="2"></button>
			</div>
		`;
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	/** The id of every active slide, and the indicator index each current-indicator mark sits on. */
	const carouselState = () => ({
		activeSlides: Array.from(document.querySelectorAll(".carousel-item.active"), (slide) => slide.id),
		activeIndicators: Array.from(
			document.querySelectorAll("#carouselIndicator button.active"),
			(indicator) => indicator.dataset.carouselSlideTo,
		),
		currentIndicators: Array.from(
			document.querySelectorAll('#carouselIndicator button[aria-current="true"]'),
			(indicator) => indicator.dataset.carouselSlideTo,
		),
	});

	test("showCarouselSlide shows that slide and marks only its indicator", () => {
		showCarouselSlide(2);

		expect(carouselState()).toEqual({
			activeSlides: ["slide2"],
			activeIndicators: ["2"],
			currentIndicators: ["2"],
		});
	});

	test.each([-1, 3, Number.NaN, 1.5])("showCarouselSlide(%p) changes nothing", (index) => {
		showCarouselSlide(index);

		expect(carouselState()).toEqual({
			activeSlides: ["slide0"],
			activeIndicators: ["0"],
			currentIndicators: ["0"],
		});
	});

	test("changeCarouselSlide moves the indicator with the slide and wraps at either end", () => {
		changeCarouselSlide("next");
		expect(carouselState()).toEqual({
			activeSlides: ["slide1"],
			activeIndicators: ["1"],
			currentIndicators: ["1"],
		});

		changeCarouselSlide("prev");
		changeCarouselSlide("prev");
		expect(carouselState()).toEqual({
			activeSlides: ["slide2"],
			activeIndicators: ["2"],
			currentIndicators: ["2"],
		});

		changeCarouselSlide("next");
		expect(carouselState()).toEqual({
			activeSlides: ["slide0"],
			activeIndicators: ["0"],
			currentIndicators: ["0"],
		});
	});

	test("changeCarouselSlide shows the first slide when no slide is active", () => {
		document.getElementById("slide0").classList.remove("active");

		changeCarouselSlide("next");

		expect(carouselState()).toEqual({
			activeSlides: ["slide0"],
			activeIndicators: ["0"],
			currentIndicators: ["0"],
		});
	});
	test("announces the slide shown, with its title when it has one", () => {
		showCarouselSlide(1);
		expect(document.getElementById("carouselStatus").textContent).toBe("Slide 2 of 3: Second");

		changeCarouselSlide("next");
		expect(document.getElementById("carouselStatus").textContent).toBe("Slide 3 of 3");
	});

	/**
	 * Give `slide` one running transition whose end the test decides. jsdom has no `getAnimations`, so this stands in
	 * for the browser's transition of the slide.
	 * @param {Element} slide The slide that will move.
	 * @returns {() => Promise<void>} Ends the transition and waits for the carousel to react.
	 */
	const runningTransition = (slide) => {
		let end;
		const finished = new Promise((resolve) => {
			end = resolve;
		});

		slide.getAnimations = () => [{ finished }];

		return () => {
			end();

			return new Promise((resolve) => setTimeout(resolve, 0));
		};
	};

	test("slides the next slide in from the right, and makes it the only active slide when its transition ends", async () => {
		const endTransition = runningTransition(document.getElementById("slide1"));

		changeCarouselSlide("next");

		expect(document.getElementById("slide0").className).toBe("carousel-item active carousel-item-start");
		expect(document.getElementById("slide1").className).toBe(
			"carousel-item carousel-item-next carousel-item-start",
		);
		expect(carouselState().currentIndicators).toEqual(["1"]);

		await endTransition();

		expect(document.getElementById("slide0").className).toBe("carousel-item");
		expect(document.getElementById("slide1").className).toBe("carousel-item active");
	});

	test("slides in from the left when the previous arrow wraps from the first slide to the last", async () => {
		const endTransition = runningTransition(document.getElementById("slide2"));

		changeCarouselSlide("prev");

		expect(document.getElementById("slide0").className).toBe("carousel-item active carousel-item-end");
		expect(document.getElementById("slide2").className).toBe("carousel-item carousel-item-prev carousel-item-end");

		await endTransition();

		expect(carouselState().activeSlides).toEqual(["slide2"]);
	});

	test("ends a moving slide at once when another change comes, and counts on from it", async () => {
		const endFirst = runningTransition(document.getElementById("slide1"));
		const endSecond = runningTransition(document.getElementById("slide2"));

		changeCarouselSlide("next");
		changeCarouselSlide("next");

		expect(document.getElementById("slide0").className).toBe("carousel-item");
		expect(document.getElementById("slide1").className).toBe("carousel-item active carousel-item-start");
		expect(document.getElementById("slide2").className).toBe(
			"carousel-item carousel-item-next carousel-item-start",
		);

		await endFirst();
		expect(document.getElementById("slide2").className).toBe(
			"carousel-item carousel-item-next carousel-item-start",
		);

		await endSecond();
		expect(carouselState().activeSlides).toEqual(["slide2"]);
	});
});

describe("enableCarouselSwipe", () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<section id="featuredCarousel">
				<div class="carousel-item active" id="slide0"></div>
				<div class="carousel-item" id="slide1"></div>
				<div class="carousel-item" id="slide2"></div>
			</section>
		`;
		enableCarouselSwipe(document.getElementById("featuredCarousel"));
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	/**
	 * Dispatch a pointer event on the carousel. jsdom has no `PointerEvent`, so a plain event carries the pointer's fields.
	 * @param {string} type The event type.
	 * @param {string} pointerType `touch`, `pen` or `mouse`.
	 * @param {number} clientX The horizontal position.
	 * @param {number} [clientY] The vertical position.
	 * @returns {void}
	 */
	const pointer = (type, pointerType, clientX, clientY = 100) => {
		document
			.getElementById("featuredCarousel")
			.dispatchEvent(Object.assign(new Event(type), { pointerType, clientX, clientY }));
	};
	const activeSlide = () => document.querySelector(".carousel-item.active").id;

	test.each([
		["a touch swipe to the left shows the next slide", "touch", 200, 100, "slide1"],
		["a touch swipe to the right shows the previous slide", "touch", 400, 100, "slide2"],
		["a pen swipe to the left shows the next slide", "pen", 200, 100, "slide1"],
		["a swipe shorter than 40 pixels changes nothing", "touch", 261, 100, "slide0"],
		["a mostly vertical movement changes nothing", "touch", 240, 200, "slide0"],
		["a mouse drag changes nothing", "mouse", 100, 100, "slide0"],
	])("%s", (_name, pointerType, endX, endY, expected) => {
		pointer("pointerdown", pointerType, 300);
		pointer("pointerup", pointerType, endX, endY);

		expect(activeSlide()).toBe(expected);
	});

	test("a cancelled touch changes nothing", () => {
		pointer("pointerdown", "touch", 300);
		pointer("pointercancel", "touch", 300);
		pointer("pointerup", "touch", 100);

		expect(activeSlide()).toBe("slide0");
	});
});

describe("enableSubmenuDismissal", () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<nav>
				<ul>
					<li id="home"><a id="homeLink" href="index.html">Home</a></li>
					<li id="games">
						<a id="gamesLink" href="index.html?pages&games">Games</a>
						<ul>
							<li><a id="interviewsLink" href="index.html?pages&gameinterviews">Interviews</a></li>
						</ul>
					</li>
				</ul>
			</nav>
			<a id="outside" href="#content">Elsewhere</a>
		`;
		enableSubmenuDismissal(document.querySelector("nav"));
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	const games = () => document.getElementById("games");
	const pressKey = (key) =>
		document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

	test("Escape closes the submenu that holds keyboard focus", () => {
		document.getElementById("interviewsLink").focus();

		pressKey("Escape");

		expect(games().classList.contains("submenuDismissed")).toBe(true);
	});

	test("Escape moves focus from a submenu link to its item's link, which stays visible", () => {
		document.getElementById("interviewsLink").focus();

		pressKey("Escape");

		expect(document.activeElement.id).toBe("gamesLink");
	});

	test("Escape on a hovered submenu leaves focus where it was", () => {
		document.getElementById("outside").focus();
		games().dispatchEvent(new Event("pointerenter"));

		pressKey("Escape");

		expect(document.activeElement.id).toBe("outside");
		expect(games().classList.contains("submenuDismissed")).toBe(true);
	});

	test("Escape closes the submenu under the pointer", () => {
		games().dispatchEvent(new Event("pointerenter"));

		pressKey("Escape");

		expect(games().classList.contains("submenuDismissed")).toBe(true);
	});

	test("the submenu stays closed when focus leaves while the pointer is still over its item", () => {
		games().dispatchEvent(new Event("pointerenter"));
		document.getElementById("gamesLink").focus();
		pressKey("Escape");

		document.getElementById("outside").focus();

		expect(games().classList.contains("submenuDismissed")).toBe(true);

		games().dispatchEvent(new Event("pointerleave"));

		expect(games().classList.contains("submenuDismissed")).toBe(false);
	});

	test("the submenu stays closed when the pointer leaves while focus is still in its item", () => {
		games().dispatchEvent(new Event("pointerenter"));
		document.getElementById("gamesLink").focus();
		pressKey("Escape");

		games().dispatchEvent(new Event("pointerleave"));

		expect(games().classList.contains("submenuDismissed")).toBe(true);

		document.getElementById("outside").focus();

		expect(games().classList.contains("submenuDismissed")).toBe(false);
	});

	test("the submenu opens again once focus leaves its item", () => {
		document.getElementById("gamesLink").focus();
		pressKey("Escape");

		document.getElementById("outside").focus();

		expect(games().classList.contains("submenuDismissed")).toBe(false);
	});

	test("the submenu stays closed while focus moves within its item", () => {
		document.getElementById("gamesLink").focus();
		pressKey("Escape");

		document.getElementById("interviewsLink").focus();

		expect(games().classList.contains("submenuDismissed")).toBe(true);
	});

	test("the submenu opens again once the pointer leaves its item", () => {
		games().dispatchEvent(new Event("pointerenter"));
		pressKey("Escape");

		games().dispatchEvent(new Event("pointerleave"));

		expect(games().classList.contains("submenuDismissed")).toBe(false);
	});

	test("Escape changes nothing when no submenu is open", () => {
		document.getElementById("outside").focus();

		pressKey("Escape");

		expect(document.querySelectorAll(".submenuDismissed")).toHaveLength(0);
	});

	test("a key other than Escape leaves the submenu open", () => {
		document.getElementById("gamesLink").focus();

		pressKey("Enter");

		expect(games().classList.contains("submenuDismissed")).toBe(false);
	});

	test("an item without a submenu is never marked", () => {
		document.getElementById("homeLink").focus();

		pressKey("Escape");

		expect(document.getElementById("home").classList.contains("submenuDismissed")).toBe(false);
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

	test("leaves the fragment out of the canonical link", () => {
		updateCanonicalLink({ host: "smalldevtalk.net", href: "https://smalldevtalk.net/index.html?Oceania#content" });

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
