//= =========================== Alexander Sullivan =============================
//
// Purpose: General functions for Small Dev Talk
//
//= ============================================================================

/**
 * Convert markdown files into HTML. Article images give their size as `![alt](url =WIDTHxHEIGHT)`, which Showdown turns
 * into `width` and `height` attributes, so the browser reserves each image's space before it loads.
 */
const converter = new showdown.Converter({ parseImgDimensions: true });

/** Host that serves the site. GitHub Pages answers every request on `www.` + this host with a 301 to it. */
const CANONICAL_HOST = "smalldevtalk.net";

/**
 * Escape HTML special characters to prevent XSS injection.
 * @param {*} unsafe The value to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(unsafe) {
	if (unsafe == null) {
		return "";
	}
	return String(unsafe)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Sanitize an HTML string by removing dangerous elements, event handlers,
 * and dangerous URL schemes. Uses the browser's HTML parser via a
 * (inert) <template> element, so parsing never executes scripts.
 * @param {*} unsafe The HTML string to sanitize.
 * @returns {string} The sanitized HTML string.
 */
function sanitizeHtml(unsafe) {
	if (unsafe == null) {
		return "";
	}

	const template = document.createElement("template");
	template.innerHTML = String(unsafe);

	const root = template.content;

	// Remove dangerous elements entirely.
	const dangerousTags = [
		"script",
		"iframe",
		"object",
		"embed",
		"link",
		"style",
		"meta",
		"base",
		"animate",
		"set",
		"animatemotion",
		"animatetransform",
	];
	root.querySelectorAll(dangerousTags.join(",")).forEach((element) => {
		element.remove();
	});

	// Remove event handlers and dangerous URL schemes from every element.
	root.querySelectorAll("*").forEach((element) => {
		Array.from(element.attributes).forEach((attribute) => {
			const name = attribute.name.toLowerCase();

			if (name.startsWith("on") || isDangerousUrl(name, attribute.value)) {
				element.removeAttribute(attribute.name);
			}
		});
	});

	return template.innerHTML;
}

/** Attributes whose value the browser loads or navigates to as a URL. */
const URL_ATTRIBUTES = ["href", "src", "action", "formaction", "poster", "xlink:href"];

/**
 * Tell whether an attribute holds a URL with a scheme that runs script or embeds a document: `javascript:`,
 * `vbscript:`, or `data:` anywhere except an image in `src`.
 * @param {string} name The attribute name, in lower case.
 * @param {string} value The attribute value.
 * @returns {boolean} True when the attribute must be removed.
 */
function isDangerousUrl(name, value) {
	if (!URL_ATTRIBUTES.includes(name)) {
		return false;
	}

	// Browsers strip embedded tabs/newlines from URLs, so remove them
	// before checking the scheme to prevent encoded-whitespace bypasses.
	const normalizedValue = value
		.trim()
		.toLowerCase()
		.replace(/[\t\n\r]/g, "");

	return (
		normalizedValue.startsWith("javascript:") ||
		normalizedValue.startsWith("vbscript:") ||
		(normalizedValue.startsWith("data:") && !(name === "src" && normalizedValue.startsWith("data:image/")))
	);
}

/**
 * Return a value as an Error, wrapping one that is not an Error in a new Error with its text as the message.
 * @param {*} value The thrown or reported value.
 * @returns {Error} The value itself, or a new Error.
 */
function toError(value) {
	return value instanceof Error ? value : new Error(String(value));
}

/** Most errors kept while waiting for Sentry to initialize. */
const MAX_PENDING_SENTRY_ERRORS = 20;

/** Errors reported before `Sentry.init()` ran, kept with their capture context for `flushPendingSentryErrors()`. */
const pendingSentryErrors = [];

/**
 * Tell whether the Sentry SDK has loaded and `Sentry.init()` has created its client.
 * @returns {boolean} True when `Sentry.captureException()` delivers an event.
 */
function sentryHasClient() {
	return (
		typeof Sentry !== "undefined" &&
		typeof Sentry.captureException === "function" &&
		typeof Sentry.getClient === "function" &&
		Boolean(Sentry.getClient())
	);
}

/**
 * Send an error to Sentry. `index.min.js` runs before the deferred Sentry SDK has executed and run `Sentry.init()`,
 * and the SDK drops an error captured without a client, so an error reported until then waits for
 * `flushPendingSentryErrors()`. It stays in the buffer when the SDK never loads.
 * @param {Error|string} error The error, or a message to wrap in an Error.
 * @param {object} [captureContext] Sentry scope data for this event: `level`, `tags` and `extra`.
 * @returns {void}
 */
function reportToSentry(error, captureContext) {
	const reported = toError(error);

	if (sentryHasClient()) {
		Sentry.captureException(reported, captureContext);
	} else if (pendingSentryErrors.length < MAX_PENDING_SENTRY_ERRORS) {
		pendingSentryErrors.push({ error: reported, captureContext });
	}
}

/**
 * Send the errors that `reportToSentry()` kept while Sentry was not initialized. `initializeSentry()` calls this right
 * after `Sentry.init()`.
 * @returns {void}
 */
function flushPendingSentryErrors() {
	if (typeof Sentry === "undefined" || typeof Sentry.captureException !== "function") {
		return;
	}

	pendingSentryErrors
		.splice(0)
		.forEach(({ error, captureContext }) => Sentry.captureException(error, captureContext));
}

/**
 * A failure to load or show page content. `kind` says what failed, so the page can tell the visitor what to do and
 * Sentry can group and rank the event.
 */
class LoadError extends Error {
	/**
	 * @param {string} message What failed, for developers.
	 * @param {object} [details] Where and why it failed.
	 * @param {"network"|"http"|"parse"|"missing"} [details.kind] The failure type: the request or the download of its
	 * body did not complete, the server answered with an error status other than 404, the content could not be parsed,
	 * or the content does not exist.
	 * @param {string} [details.operation] What the page was doing, for example "retrieve article data".
	 * @param {string} [details.url] The requested URL.
	 * @param {number} [details.status] The HTTP status code of a `http` failure.
	 * @param {string} [details.article] The key of the article being loaded.
	 * @param {*} [details.cause] The error that this one wraps.
	 */
	constructor(message, { kind, operation, url, status, article, cause } = {}) {
		super(message, { cause });
		this.name = "LoadError";
		/** @type {"network"|"http"|"parse"|"missing"|undefined} What failed. */
		this.kind = kind;
		/** @type {string|undefined} What the page was doing when it failed. */
		this.operation = operation;
		/** @type {string|undefined} The requested URL. */
		this.url = url;
		/** @type {number|undefined} The HTTP status code of the response. */
		this.status = status;
		/** @type {string|undefined} The key of the article being loaded. */
		this.article = article;
	}
}

/**
 * What a visitor sees for each failure kind, and the Sentry level of the event. A failed connection and a mistyped
 * article link are not faults of the site, so they report as warnings.
 */
const ERROR_DETAILS = {
	network: {
		level: "warning",
		message: "We could not reach Small Dev Talk. Check your internet connection, then refresh the page.",
	},
	http: {
		level: "error",
		message: "Small Dev Talk could not load this content right now. Please try again in a few minutes.",
	},
	parse: {
		level: "error",
		message:
			"This content could not be displayed. Refresh the page, and if the problem continues, report it on the project's GitHub issues.",
	},
	missing: {
		level: "warning",
		message: "We could not find that article. Check the link, or go back to the home page.",
	},
	unknown: {
		level: "error",
		message: "Something went wrong while loading this page. Refresh the page or try again later.",
	},
};

/**
 * Look up the visitor message and Sentry level of a failure kind.
 * @param {string} [kind] A `LoadError` kind.
 * @returns {{level: string, message: string}} The details of the kind, or of an unknown failure.
 */
function errorDetailsFor(kind) {
	return ERROR_DETAILS[kind] || ERROR_DETAILS.unknown;
}

/**
 * Fetch a resource and read its body, naming the kind of failure when it does not work. A 404 is a `missing` failure.
 * @param {string} url The URL to request.
 * @param {string} resource What is requested, for example "article data". The operation is "retrieve" and this name.
 * @param {(response: Response) => Promise<*>} readBody Reads the body, for example `(response) => response.json()`.
 * @param {object} [details] More context for a failure.
 * @param {string} [details.article] The key of the article being loaded.
 * @returns {Promise<*>} Resolves with what `readBody` returns; rejects with a `LoadError`.
 */
async function fetchResource(url, resource, readBody, { article } = {}) {
	const operation = `retrieve ${resource}`;
	let response;

	try {
		response = await fetch(url);
	} catch (cause) {
		throw new LoadError(`Failed to fetch ${resource}: ${cause?.message}`, {
			kind: "network",
			operation,
			url,
			article,
			cause,
		});
	}

	if (!response.ok) {
		throw new LoadError(`Failed to fetch ${resource}: ${response.status} ${response.statusText}`, {
			kind: response.status === 404 ? "missing" : "http",
			operation,
			url,
			status: response.status,
			article,
		});
	}

	try {
		return await readBody(response);
	} catch (cause) {
		// `fetch` resolves once the headers arrive, so a connection lost while the body downloads rejects here too.
		// Only a SyntaxError from `response.json()` means the content itself is unreadable.
		const isParseFailure = cause instanceof SyntaxError;

		throw new LoadError(`Failed to ${isParseFailure ? "parse" : "download"} ${resource}: ${cause?.message}`, {
			kind: isParseFailure ? "parse" : "network",
			operation,
			url,
			article,
			cause,
		});
	}
}

/** Errors already logged and reported, so one failure that passes through several handlers is reported once. */
const reportedErrors = new WeakSet();

/**
 * Log an error with its context and report it to Sentry, once per error object.
 * @param {*} error The failure. A value that is not an Error is wrapped in one.
 * @param {object} [context] Where the failure happened. The error's own operation and article win over these.
 * @param {string} [context.operation] What the page was doing.
 * @param {string} [context.article] The key of the article being loaded.
 * @returns {Error} The error that was logged and reported.
 */
function reportError(error, context = {}) {
	const reported = toError(error);

	if (reportedErrors.has(reported)) {
		return reported;
	}
	reportedErrors.add(reported);

	const kind = reported.kind || "unknown";
	const operation = reported.operation || context.operation || "unknown operation";
	const article = reported.article || context.article;
	const page = typeof document === "undefined" ? undefined : document.URL;
	const { url, status } = reported;

	console.error("ArticleFiller error:", {
		message: reported.message,
		kind,
		operation,
		article,
		url,
		status,
		page,
		timestamp: new Date().toISOString(),
		error: reported,
	});
	reportToSentry(reported, {
		level: errorDetailsFor(kind).level,
		tags: { operation, kind },
		extra: { article, url, status, page },
	});

	return reported;
}

/**
 * Return the folder of an article in the archive, relative to the site root, which holds its markdown and images.
 * @param {string} key The key of the article in articleData.json.
 * @param {{author: string, date: string}} article The article's data from articleData.json.
 * @returns {string} The folder path, such as `src/articleArchive/authorJaneDoe/2024-06-01_ArticleOne`.
 */
function articleFolderPath(key, article) {
	return `src/articleArchive/author${article.author.replace(/\s/g, "")}/${article.date}_${key}`;
}

/**
 * Build the `width` and `height` attributes of an article thumbnail, so the browser reserves its space before it loads.
 * @param {{thumbnailWidth?: number, thumbnailHeight?: number}} [article] The article's data from articleData.json.
 * @returns {string} The attributes with a leading space, or an empty string when either size is missing or not a
 * positive whole number.
 */
function imageSizeAttributes(article) {
	const width = Number(article?.thumbnailWidth);
	const height = Number(article?.thumbnailHeight);

	if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
		return "";
	}

	return ` width="${width}" height="${height}"`;
}

/**
 * Mark every image of an article after the first with `loading="lazy"`, so images below the fold download only as the
 * visitor scrolls toward them. The first image is usually the article's header and in view, so it loads at once.
 * @param {string} html The HTML that Showdown made from the article. Showdown escapes `<` inside code, so only real
 * `<img>` tags match.
 * @returns {string} The HTML with the attribute added.
 */
function lazyLoadImagesAfterFirst(html) {
	let imageCount = 0;

	return html.replace(/<img\b/gi, (tag) => {
		imageCount += 1;

		return imageCount === 1 ? tag : `${tag} loading="lazy"`;
	});
}

/**
 * Return a word with its first letter in upper case.
 * @param {string} word The word.
 * @returns {string} The capitalized word. An empty string stays empty.
 */
function capitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Read which view a page URL asks for. The query string names an article (`?Key`), a section (`?pages&games`) or the
 * archive (`?pages&archive`), and a URL with no query shows the home page's `index` section. The keys are decoded,
 * so `?ghost%20ship` reads as `ghost ship`, and an article name is title-cased word by word and joined, so it names
 * the key `GhostShip`. Only parameters without a value count, so one that another site adds to a shared link, such
 * as `fbclid=…` or `utm_source=…`, does not change the view, and an empty segment from a doubled or trailing `&` is
 * left out. The fragment is left out too: the skip link adds `#content`, which a reload or a shared link keeps.
 * @param {string} url The page URL.
 * @returns {{view: "article", key: string} | {view: "section", section: string} | {view: "archive"}} The view.
 */
function resolveView(url) {
	const keys = Array.from(new URL(url).searchParams)
		.filter(([key, value]) => key && !value)
		.map(([key]) => key);

	if (keys.length === 1) {
		return { view: "article", key: keys[0].split(" ").map(capitalize).join("") };
	}

	const section = keys.length === 0 ? "index" : keys[1];

	return section === "archive" ? { view: "archive" } : { view: "section", section };
}

/**
 * Show or hide the element with an id, when the page has it.
 * @param {string} id The element's id.
 * @param {boolean} hidden True to hide the element.
 * @returns {void}
 */
function setHidden(id, hidden) {
	const element = document.getElementById(id);

	if (element) {
		element.hidden = hidden;
	}
}

/**
 * Return the link to an article's page, escaped for an HTML attribute.
 * @param {string} key The key of the article in articleData.json.
 * @returns {string} The escaped link, such as `index.html?ArticleOne`.
 */
function articleHref(key) {
	return `index.html?${escapeHtml(key)}`;
}

/**
 * Return the path of an article's thumbnail from the site root.
 * @param {string} key The key of the article in articleData.json.
 * @param {{author: string, date: string, thumbnail: string}} article The article's data from articleData.json.
 * @returns {string} The path, such as `/src/articleArchive/authorJaneDoe/2024-06-01_ArticleOne/thumb.png`.
 */
function thumbnailPath(key, article) {
	return `/${articleFolderPath(key, article)}/${article.thumbnail}`;
}

/**
 * Build the `src`, `width` and `height` attributes of an article thumbnail.
 * @param {string} key The key of the article in articleData.json.
 * @param {object} article The article's data from articleData.json.
 * @returns {string} The attributes, with `width` and `height` only when both sizes are positive whole numbers.
 */
function thumbnailAttributes(key, article) {
	return `src="${escapeHtml(thumbnailPath(key, article))}"${imageSizeAttributes(article)}`;
}

/**
 * Build the button that shows one carousel slide. Bootstrap's stylesheet draws `.carousel-indicators [data-bs-target]`
 * as a dash, and `handleControlClick()` runs it.
 * @param {{title: string}} article The article's data from articleData.json.
 * @param {number} index The position of the slide, counted from 0. The first indicator is the current one.
 * @returns {string} The button markup.
 */
function carouselIndicatorMarkup(article, index) {
	return `
		<button
			type="button"
			data-bs-target="#featuredCarousel"
			data-carousel-slide-to="${index}"
			aria-label="Show slide ${index + 1}: ${escapeHtml(article.title)}"
			${index === 0 ? `class="active" aria-current="true"` : ""}
		></button>
	`;
}

/**
 * Build one carousel slide: the article's thumbnail with its title and summary as the caption, linked to the article.
 * The first slide is the page's largest image, so it loads at once and at high priority; the others load lazily.
 * @param {string} key The key of the article in articleData.json.
 * @param {object} article The article's data from articleData.json.
 * @param {number} index The position of the slide, counted from 0. The first slide is the active one.
 * @param {number} count The number of slides.
 * @returns {string} The slide markup.
 */
function carouselSlideMarkup(key, article, index, count) {
	return `
		<div
			class="carousel-item ${index === 0 ? "active" : ""}"
			role="group"
			aria-roledescription="slide"
			aria-label="${index + 1} of ${count}"
		>
			<a
				id="carouselLink${index}"
				href="${articleHref(key)}"
			>
				<img
					id="carouselImage${index}"
					${thumbnailAttributes(key, article)}
					class="d-block w-100"
					${index === 0 ? `loading="eager" fetchpriority="high"` : `loading="lazy"`}
					alt=""
				>
				<div class="carousel-caption">
					<h3 class="h5" id="carouselHeader${index}">${escapeHtml(article.title)}</h3>
					<p id="carouselParagraph${index}">${escapeHtml(article.summary)}</p>
				</div>
			</a>
		</div>
	`;
}

/**
 * Build one post of the featured list: the article's thumbnail, title, summary and date, each linked to the article.
 * @param {string} key The key of the article in articleData.json.
 * @param {object} article The article's data from articleData.json.
 * @param {number} position The position of the article in the section's list, used in the post's id.
 * @returns {string} The post markup.
 */
function featuredPostMarkup(key, article, position) {
	const href = articleHref(key);
	const articleTitle = escapeHtml(article.title);

	return `
		<div class="post row" id="featuredArticle${position}">
			<div class="col-md-4" style="margin-top: 0.5rem;">
				<a
					href="${href}"
					aria-label="Redirect to ${articleTitle}"
				>
					<img
						${thumbnailAttributes(key, article)}
						class="img-fluid"
						loading="lazy"
						alt="Thumbnail for ${articleTitle}"
					>
				</a>
			</div>
			<div class="col-md-8" style="margin-top: 0.5rem;">
				<h2>
					<a href="${href}">
						${articleTitle}
					</a>
				</h2>
			</div>
			<div class="col-12" style="margin-top: 0.5rem;">
				<p>
					${escapeHtml(article.summary)}
					<a href="${href}">
						Read More<span class="visually-hidden"> about ${articleTitle}</span>
					</a>
				</p>
			</div>
			<div class="col-12">
				<p class="details">
					<a href="${href}">
						${escapeHtml(article.date)}<span class="visually-hidden"> ${articleTitle}</span>
					</a>
				</p>
			</div>
		</div>
	`;
}

/**
 * Tell whether an article has the data its archive entry shows: a title, an author, a date and a thumbnail.
 * @param {object} [article] The article's data from articleData.json.
 * @returns {boolean} True when the article can be listed in the archive.
 */
function isListableInArchive(article) {
	return Boolean(article?.title && article.author && article.date && article.thumbnail);
}

/**
 * Build one archive entry: the article's title over its thumbnail, linked to the article.
 * @param {string} key The key of the article in articleData.json.
 * @param {object} article The article's data from articleData.json.
 * @returns {string} The entry markup.
 */
function archiveItemMarkup(key, article) {
	const title = escapeHtml(article.title);

	return `
		<div class="col-sm archive-display">
			<a
				class="archive-link"
				href="${articleHref(key)}"
			>
				<p class="archive-title">${title}</p>
				<img ${thumbnailAttributes(key, article)} alt="${title}'s thumbnail" loading="lazy">
			</a>
		</div>
	`;
}

/**
 * Build the error panel: the message for the visitor, with buttons to reload the page and to go to the home page.
 * `handleControlClick()` runs the buttons.
 * @param {string} message The message for the visitor.
 * @returns {string} The panel markup.
 */
function errorMarkup(message) {
	return `
		<div style="width:100%; display:flex; justify-content:center; margin-top:2.5rem;">
			<div style="text-align:center;">
				<div style="font-size:2.5rem; font-weight:700; color:#dc3545; letter-spacing:1px;">
					Error
				</div>

				<div style="font-size:1.25rem; color:#333; margin:1rem 0 2rem 0;">
					${escapeHtml(message)}
				</div>

				<div style="display:flex; gap:1rem; justify-content:center;">
					<button class="btn btn-warning" style="font-size:1rem;" data-page-action="reload">
						Refresh
					</button>

					<button class="btn btn-primary" style="font-size:1rem;" data-page-action="home">
						Home
					</button>
				</div>
			</div>
		</div>
	`;
}

/**
 * Fetch and parse a JSON file of the site, and log and report a failure before rejecting with it.
 * @param {string} url The URL of the file.
 * @param {string} resource What is requested, for example "article data".
 * @returns {Promise<*>} Resolves with the parsed JSON; rejects with the `LoadError` that was reported.
 */
function loadJson(url, resource) {
	return fetchResource(url, resource, (response) => response.json()).catch((error) => {
		reportError(error);
		throw error;
	});
}

/**
 * Update the page's title, description and image, in its meta tags and structured data, to an article's.
 * @param {Object} articleData The article's data.
 * @param {String} [articleData.title] Article's title.
 * @param {String} [articleData.summary] Article's summary.
 * @param {String} [articleData.thumbnail] The filename of the thumbnail/resoc image of the article.
 * @param {String} [articleData.author] Author of the article.
 * @param {String} [articleData.date] Date the article was published (YYYY-MM-DD).
 * @param {String} articleKey Article in-code name (key name in articleData.json).
 * @returns {void}
 */
function updateMetaData(articleData, articleKey) {
	const { title, summary, thumbnail, author, date } = articleData;
	const hasThumbnail = Boolean(thumbnail && author && date && articleKey);
	const structuredDataElement = document.querySelector("script[type='application/ld+json']");
	const structuredData = structuredDataElement?.textContent
		? JSON.parse(structuredDataElement.textContent)
		: undefined;
	// Each value replaces the content of its meta tags, and the structured data field when the page has one.
	const updates = [
		{
			value: title && `${title} | Small Dev Talk`,
			selectors: ["meta[property='og:title']", "meta[name='twitter:title']"],
			structuredDataKey: "name",
		},
		{
			value: summary && `${summary} | Small Dev Talk`,
			selectors: [
				"meta[name='description']",
				"meta[property='og:description']",
				"meta[name='twitter:description']",
			],
			structuredDataKey: "description",
		},
		{
			value: hasThumbnail ? `https://${CANONICAL_HOST}${thumbnailPath(articleKey, articleData)}` : undefined,
			selectors: ["meta[property='og:image']", "meta[name='twitter:image']"],
			structuredDataKey: "image",
		},
	];

	if (title) {
		document.title = `${title} | Small Dev Talk`;
	}

	updates
		.filter(({ value }) => value)
		.forEach(({ value, selectors, structuredDataKey }) => {
			selectors.forEach((selector) => document.querySelector(selector).setAttribute("content", value));

			if (structuredData?.[structuredDataKey]) {
				structuredData[structuredDataKey] = value;
			}
		});

	if (structuredData) {
		structuredDataElement.textContent = JSON.stringify(structuredData);
	}
}

/**
 * Convert an article's markdown into HTML and put it in `#articleBody`.
 * @param {string} markdown The article's markdown.
 * @param {string} articleKey The key of the article, named in the error when the conversion fails.
 * @returns {void}
 */
function renderArticle(markdown, articleKey) {
	const article = sanitizeHtml(lazyLoadImagesAfterFirst(converter.makeHtml(markdown)));

	// Check if the converted article is empty when the original content is not
	if (article.trim().length < 1 && markdown.trim().length > 0) {
		ArticleFiller.displayError(
			new LoadError("Article content could not be converted to HTML.", {
				kind: "parse",
				operation: "render article",
				article: articleKey,
			}),
		);

		return;
	}

	const articleBody = document.getElementById("articleBody");

	if (articleBody) {
		articleBody.innerHTML = article;
	}
}

/**
 * Show one article in place of the section: update the page's metadata, then fetch the article's markdown and render
 * it. A key with no article data shows the not-found error at once.
 * @param {string} articleKey The key of the article in articleData.json.
 * @param {object} articleData All articles' data, from articleData.json.
 * @returns {Promise<void>|undefined} Resolves once the article is on the page or its load error is shown, and never
 * rejects. Undefined when the key has no article data.
 */
function showArticle(articleKey, articleData) {
	setHidden("featuredArticles", true);
	setHidden("displayArticles", true);
	setHidden("articleBody", false);

	// The key comes from the URL, so an inherited name such as `__proto__` must not count as an article.
	const article = Object.hasOwn(articleData, articleKey) ? articleData[articleKey] : undefined;

	if (!article) {
		ArticleFiller.displayError(
			new LoadError(`Article not found in article data: ${articleKey}`, {
				kind: "missing",
				operation: "find article",
				article: articleKey,
			}),
		);

		return undefined;
	}

	updateMetaData(article, articleKey);

	const url = `/${articleFolderPath(articleKey, article)}/${articleKey}.md`;

	return fetchResource(url, "article", (response) => response.text(), { article: articleKey })
		.then((markdown) => renderArticle(markdown, articleKey))
		.catch((error) => {
			ArticleFiller.displayError(error, { operation: "load article", article: articleKey });
		});
}

/**
 * Show the archive: every article that has a title, an author, a date and a thumbnail, in place of the carousel.
 * @param {object} articleData All articles' data, from articleData.json.
 * @returns {void}
 */
function showArchive(articleData) {
	setHidden("featuredArticles", true);
	setHidden("articleBody", false);

	const entries = Object.entries(articleData)
		.filter(([, article]) => isListableInArchive(article))
		.map(([key, article]) => archiveItemMarkup(key, article));

	if (entries.length > 0) {
		document.getElementById("displayArticles").innerHTML =
			`<div class="container-fluid"><div class="row">${entries.join("")}</div></div>`;
	}
}

/**
 * Fill the carousel with articles. A key with no article data is left out, so the slides are numbered without a gap.
 * Nothing changes when there is no list or the page has no carousel.
 * @param {string[]|undefined} keys The article keys, in order.
 * @param {object} articleData All articles' data, from articleData.json.
 * @returns {void}
 */
function renderCarousel(keys, articleData) {
	const carouselInner = document.getElementById("carouselInner");

	if (!keys || !carouselInner) {
		return;
	}

	const shownKeys = keys.filter((key) => articleData[key]);
	const carouselIndicator = document.getElementById("carouselIndicator");

	// Build every slide first and write each container once: `innerHTML +=` re-parses all earlier slides.
	if (carouselIndicator) {
		carouselIndicator.innerHTML = shownKeys
			.map((key, index) => carouselIndicatorMarkup(articleData[key], index))
			.join("");
	}
	carouselInner.innerHTML = shownKeys
		.map((key, index) => carouselSlideMarkup(key, articleData[key], index, shownKeys.length))
		.join("");
}

/**
 * Fill the featured list with articles. A key with no article data is left out, and each post keeps its position in
 * the list as its id. Nothing changes when there is no list.
 * @param {string[]|undefined} keys The article keys, in order.
 * @param {object} articleData All articles' data, from articleData.json.
 * @returns {void}
 */
function renderFeaturedList(keys, articleData) {
	if (!keys) {
		return;
	}

	// Build every post first and write the list once: `innerHTML +=` re-parses all earlier posts.
	document.getElementById("displayArticles").innerHTML = keys
		.map((key, position) => (articleData[key] ? featuredPostMarkup(key, articleData[key], position) : ""))
		.join("");
}

/**
 * Show a section: title the page after it, and fill the carousel and the featured list with the articles that
 * legacyPagesDisplay.json lists for it.
 * @param {string} section The section, for example "index" or "games".
 * @param {{articleData: object, pageData: object}} data The site data from `ArticleFiller.loadData()`.
 * @returns {void}
 */
function showSection(section, { articleData, pageData }) {
	const pageTitle = document.getElementById("pageTitle");

	if (pageTitle) {
		pageTitle.innerText = `Small Dev Talk: ${capitalize(section)}`;
	}

	renderCarousel(pageData[section]?.carousel, articleData);
	renderFeaturedList(pageData[section]?.displayArticles, articleData);
}

/** How each view from `resolveView()` is shown, by its `view`. */
const VIEW_RENDERERS = {
	article: ({ key }, { articleData }) => showArticle(key, articleData),
	archive: (_view, { articleData }) => showArchive(articleData),
	section: ({ section }, data) => showSection(section, data),
};

/** Load the site's data and show its articles, sections and errors on the page. */
class ArticleFiller {
	/**
	 * Fetch the article data and the page data together. Each request logs and reports its own failure.
	 * @returns {Promise<{articleData: object, pageData: object}>} Resolves with articleData.json and
	 * legacyPagesDisplay.json once both load; rejects with the error of the first request that fails.
	 */
	static loadData() {
		return Promise.all([
			loadJson("/src/legacyPages/legacyPagesDisplay.json", "page data"),
			loadJson("/src/articleArchive/articleData.json", "article data"),
		]).then(([pageData, articleData]) => ({ articleData, pageData }));
	}

	/**
	 * Show a view on the page.
	 * @param {{view: "article", key: string} | {view: "section", section: string} | {view: "archive"}} view The view,
	 * from `resolveView()`.
	 * @param {{articleData: object, pageData: object}} data The site data from `ArticleFiller.loadData()`.
	 * @returns {Promise<void>|undefined} For an article, resolves once it is on the page or its load error is shown, and
	 * never rejects. Undefined for the other views, which render at once.
	 */
	static showView(view, data) {
		return VIEW_RENDERERS[view.view](view, data);
	}

	/**
	 * Show the visitor the message for the failure's kind, and log and report the failure with its context for
	 * developers unless it was already reported.
	 * @param {*} error The failure. Its `kind`, when it is a `LoadError`, picks the message.
	 * @param {object} [context] Where the failure happened. The error's own operation and article win over these.
	 * @param {string} [context.operation] What the page was doing, for example "load article".
	 * @param {string} [context.article] The key of the article being loaded.
	 * @return {void} Does not return a value but updates the article content.
	 */
	static displayError(error, context = {}) {
		reportError(error, context);

		const articleBody = document.getElementById("articleBody");

		if (articleBody) {
			articleBody.hidden = false;
			articleBody.innerHTML = errorMarkup(errorDetailsFor(error?.kind).message);
		}
	}
}

/**
 * Fetch page and article metadata, then render the view the page URL asks for once both requests succeed. An article
 * view's own request is not awaited: it shows its own error when it fails.
 * @returns {Promise<void>} Resolves after the view starts to render. Rejects with the error of a failed request, which
 * that request has already logged and reported.
 */
function init() {
	return ArticleFiller.loadData().then((data) => {
		ArticleFiller.showView(resolveView(document.URL), data);
	});
}

/** Scope path of the service worker that earlier releases registered from `/src/serviceWorker/sw.js`. */
const LEGACY_SERVICE_WORKER_SCOPE_PATH = "/src/serviceWorker/";

/**
 * Send a page running on the `www.` host to the same path, query and hash on the canonical host.
 * On the `www.` host every same-origin request is redirected cross-origin, so data fetches and
 * service worker registration fail there.
 * @param {Location} location The page location.
 * @returns {boolean} True when navigation to the canonical host was started.
 */
function redirectToCanonicalHost(location) {
	if (location.hostname !== `www.${CANONICAL_HOST}`) {
		return false;
	}

	location.replace(`https://${CANONICAL_HOST}${location.pathname}${location.search}${location.hash}`);

	return true;
}

/**
 * Tell whether the browser exposes a service worker API method. Reading `navigator.serviceWorker` can throw a
 * SecurityError, so callers run this inside their `try`.
 * @param {"getRegistrations"|"register"} method The `ServiceWorkerContainer` method.
 * @returns {boolean} True when the method can be called.
 */
function serviceWorkerSupports(method) {
	return (
		typeof navigator !== "undefined" &&
		Boolean(navigator.serviceWorker) &&
		typeof navigator.serviceWorker[method] === "function"
	);
}

/**
 * Unregister the service worker registered from `/src/serviceWorker/sw.js` and delete its precache.
 * Its scope covered no page, so it never served its cache and never updates on its own.
 * @returns {Promise<void>} Resolves once cleanup finishes; failures are logged and reported.
 */
async function removeLegacyServiceWorker() {
	try {
		if (!serviceWorkerSupports("getRegistrations")) {
			return;
		}

		const registrations = await navigator.serviceWorker.getRegistrations();
		const legacyRegistrations = registrations.filter(
			(registration) => new URL(registration.scope).pathname === LEGACY_SERVICE_WORKER_SCOPE_PATH,
		);

		await Promise.all(
			legacyRegistrations.map(async (registration) => {
				await registration.unregister();

				if (typeof caches !== "undefined") {
					await caches.delete(`workbox-precache-v2-${registration.scope}`);
				}
			}),
		);
	} catch (e) {
		reportError(e, { operation: "remove legacy service worker" });
	}
}

/**
 * Register the service worker if the browser supports it.
 * The page does not wait for the worker to take control: `clientsClaim` lets it control the page once it activates,
 * and the images and articles requested after that go through its runtime caches.
 * @returns {Promise<ServiceWorkerRegistration|null>} Registration or null on failure/unsupported.
 */
async function registerServiceWorker() {
	try {
		if (!serviceWorkerSupports("register")) {
			return null;
		}

		await removeLegacyServiceWorker();

		return await navigator.serviceWorker.register("./sw.js");
	} catch (e) {
		reportError(e, { operation: "register service worker" });

		return null;
	}
}

/**
 * Replace the sidebar's "Follow @SmallDevTalk on X" link with the X timeline once X serves the timeline.
 * `syndication.twitter.com` rate-limits embedded timeline requests per IP with no documented limit and answers
 * with 429. `widgets.js` still inserts its `iframe` then, but leaves it `visibility: hidden` at 0 by 0 pixels, and
 * it fires no `rendered` or `loaded` event, so a visible, sized `iframe` is the only sign of a successful load.
 * Until then the link stays and the timeline stays hidden. The function never throws, and it does not report
 * a failed embed to Sentry.
 * @returns {void}
 */
function watchTwitterTimeline() {
	try {
		const container = document.getElementById("twitterTimeline");

		if (!container) {
			return;
		}

		const showTimeline = () => {
			const frame = container.querySelector("iframe");

			if (!frame || getComputedStyle(frame).visibility === "hidden" || frame.offsetHeight === 0) {
				return false;
			}

			container.classList.remove("twitterTimelinePending");
			container.removeAttribute("inert");
			document.querySelectorAll(".twitterFallback").forEach((fallback) => {
				fallback.hidden = true;
			});

			return true;
		};

		if (showTimeline() || typeof MutationObserver === "undefined") {
			return;
		}

		const observer = new MutationObserver(() => {
			if (showTimeline()) {
				observer.disconnect();
			}
		});

		observer.observe(container, { attributes: true, childList: true, subtree: true });
	} catch (e) {
		console.error("Twitter timeline setup failed:", e && e.message ? e.message : e);
	}
}

/** Version of the site. When updating the package version number in package.json, update this one as well. */
const APP_VERSION = "1.3.5";

/** Where Sentry sends the events of the site. */
const SENTRY_DSN = "https://c74a8d7e001f45c8bb4ebfa5a1e92664@o1185775.ingest.us.sentry.io/6600431";

/** Container that Google Tag Manager loads. */
const GOOGLE_TAG_MANAGER_ID = "GTM-5H259MB";

/**
 * Start Sentry. The deferred Sentry SDK script in `index.html` has run by the time the document finishes loading, so
 * the SDK is available then. When the SDK or a required integration is missing, the function logs that and returns.
 * @returns {void}
 */
function initializeSentry() {
	if (
		typeof Sentry === "undefined" ||
		typeof Sentry.init !== "function" ||
		typeof Sentry.browserTracingIntegration !== "function" ||
		typeof Sentry.replayIntegration !== "function" ||
		typeof Sentry.getCurrentScope !== "function"
	) {
		console.error("Sentry initialization skipped: the SDK or a required integration failed to load.");

		return;
	}

	Sentry.init({
		dsn: SENTRY_DSN,
		release: `small-dev-talk@${APP_VERSION}`,

		// The site reports its own errors through reportError. No console integration is installed, so console
		// output from extensions or injected automation scripts is not reported.
		integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

		enableLogs: true,

		tracesSampleRate: 1.0,

		// Capture Replay for 10% of all sessions, plus for 100% of sessions with an error.
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
	});

	Sentry.getCurrentScope().setTag("app-version", APP_VERSION);

	// reportToSentry can run before this point, and the SDK drops errors captured before init.
	flushPendingSentryErrors();
}

/**
 * Load Google Tag Manager.
 * @returns {void}
 */
function loadGoogleTagManager() {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

	const script = document.createElement("script");

	script.async = true;
	// Without CORS, the browser reports an error thrown by this script as "Script error." with no details.
	script.crossOrigin = "anonymous";
	script.src = `https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_MANAGER_ID}`;
	document.head.appendChild(script);
}

/**
 * Point the canonical link at the URL being viewed when the page is served from the canonical host. The fragment is left
 * out, since it does not change the page shown: the skip link adds `#content`, which a reload or a shared link keeps.
 * @param {Location} location The page location.
 * @returns {void}
 */
function updateCanonicalLink(location) {
	if (location.host !== CANONICAL_HOST) {
		return;
	}

	const canonicalLink = document.querySelector('link[rel="canonical"]');

	if (canonicalLink) {
		const canonicalURL = new URL(location.href);

		canonicalURL.hash = "";
		canonicalLink.setAttribute("href", canonicalURL.href);
	}
}

/** What each error button does, by its `data-page-action`. */
const PAGE_ACTIONS = new Map([
	["reload", () => window.location.reload()],
	[
		"home",
		() => {
			window.location.href = "index.html";
		},
	],
]);

/**
 * Handle clicks on the carousel arrows, the carousel indicators and the error buttons. The page's Content Security
 * Policy blocks inline `onclick` attributes, so one delegated listener on the document runs these controls.
 * @param {MouseEvent} event The click event.
 * @returns {void}
 */
function handleControlClick(event) {
	const target = event.target instanceof Element ? event.target : null;
	const control = target
		? target.closest("[data-carousel-step], [data-carousel-slide-to], [data-page-action]")
		: null;

	if (!control) {
		return;
	}

	if (control.dataset.carouselStep) {
		changeCarouselSlide(control.dataset.carouselStep);
	} else if (control.dataset.carouselSlideTo !== undefined) {
		showCarouselSlide(Number(control.dataset.carouselSlideTo));
	} else {
		PAGE_ACTIONS.get(control.dataset.pageAction)?.();
	}
}

/**
 * Let Escape close the navigation's open submenus. The stylesheet opens a submenu while its item is hovered or holds
 * keyboard focus, and that menu covers the title below, so WCAG 2.2 success criterion 1.4.13 requires a way to close it
 * without moving the pointer or focus. Escape marks each open item `submenuDismissed`, which the stylesheet keeps
 * closed. The item's pointerleave and focusout listeners remove the mark once neither the pointer nor focus is on it, so
 * the menu does not reappear under the pointer.
 * @param {Element} nav The navigation element.
 * @returns {void}
 */
function enableSubmenuDismissal(nav) {
	const menus = Array.from(nav.querySelectorAll("li"), (item) => ({
		item,
		link: item.querySelector(":scope > a"),
		submenu: item.querySelector(":scope > ul"),
	})).filter(({ submenu }) => submenu);
	const hovered = new Set();

	menus.forEach(({ item }) => {
		const reopen = () => item.classList.remove("submenuDismissed");

		item.addEventListener("pointerenter", () => hovered.add(item));
		item.addEventListener("pointerleave", () => {
			hovered.delete(item);

			if (!item.contains(document.activeElement)) {
				reopen();
			}
		});
		item.addEventListener("focusout", (event) => {
			if (!item.contains(event.relatedTarget) && !hovered.has(item)) {
				reopen();
			}
		});
	});

	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") {
			return;
		}

		menus
			.filter(({ item }) => hovered.has(item) || item.contains(document.activeElement))
			.forEach(({ item, link, submenu }) => {
				// Closing the submenu hides a link inside it, so focus moves to the item's own link (WCAG 2.4.7).
				if (submenu.contains(document.activeElement)) {
					link.focus();
				}

				item.classList.add("submenuDismissed");
			});
	});
}

/**
 * Move the page to the canonical host when needed, otherwise render the view and then register the service worker.
 * Rendering does not wait for the worker, so a first visit is not delayed by its installation.
 * @param {Location} location The page location.
 * @returns {Promise<void>} Resolves once the service worker registration settles after the view renders, or at once
 * when the page is redirected.
 */
async function start(location) {
	if (redirectToCanonicalHost(location)) {
		return;
	}

	document.addEventListener("click", handleControlClick);

	const nav = document.querySelector("#header nav");

	if (nav) {
		enableSubmenuDismissal(nav);
	}

	const carousel = document.getElementById("featuredCarousel");

	if (carousel) {
		enableCarouselSwipe(carousel);
	}

	try {
		await init();
	} catch (error) {
		ArticleFiller.displayError(error, { operation: "initialize page" });
	}

	watchTwitterTimeline();

	await registerServiceWorker();
}

/**
 * Load Google Tag Manager, point the canonical link at the viewed URL, and start Sentry once its SDK has loaded.
 * The Sentry SDK script is deferred after this script, so it has not run yet. It has by `DOMContentLoaded`, which
 * the browser fires after every deferred script.
 * @returns {void}
 */
function startThirdParties() {
	loadGoogleTagManager();
	updateCanonicalLink(window.location);

	if (document.readyState === "complete") {
		initializeSentry();
	} else {
		document.addEventListener("DOMContentLoaded", initializeSentry);
	}
}

// Start once the HTML is parsed, so slow third-party scripts and images do not delay the data requests.
// The module check keeps Jest, which loads this file as a module, from starting the page.
if (typeof module === "undefined") {
	startThirdParties();

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => start(window.location));
	} else {
		start(window.location);
	}
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		ArticleFiller,
		resolveView,
		escapeHtml,
		lazyLoadImagesAfterFirst,
		sanitizeHtml,
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
	};
}

// ----- Functions related to changing carousel -----

/** The slide change in progress: a function that ends it at once, or null when no slide is moving. */
let finishCarouselTransition = null;

/** The horizontal distance, in pixels, that a touch must travel across the carousel to count as a swipe. */
const CAROUSEL_SWIPE_DISTANCE = 40;

/**
 * Return the carousel's slides in page order.
 * @returns {Element[]} The `.carousel-item` elements.
 */
function carouselSlides() {
	return Array.from(document.getElementsByClassName("carousel-item"));
}

/**
 * Mark the indicator of the slide at `index` as the current one, and every other indicator as not current.
 * @param {number} index The position of the slide, counted from 0.
 * @returns {void}
 */
function markCarouselIndicator(index) {
	document.querySelectorAll("#carouselIndicator [data-carousel-slide-to]").forEach((indicator) => {
		const isCurrent = Number(indicator.dataset.carouselSlideTo) === index;

		indicator.classList.toggle("active", isCurrent);

		if (isCurrent) {
			indicator.setAttribute("aria-current", "true");
		} else {
			indicator.removeAttribute("aria-current");
		}
	});
}

/**
 * Tell screen reader users which slide is now shown, through the carousel's polite status region.
 * @param {Element} slide The slide being shown.
 * @param {number} index The position of the slide, counted from 0.
 * @param {number} count The number of slides.
 * @returns {void}
 */
function announceCarouselSlide(slide, index, count) {
	const status = document.getElementById("carouselStatus");

	if (!status) {
		return;
	}

	const title = slide.querySelector("h3")?.textContent.trim();

	status.textContent = `Slide ${index + 1} of ${count}${title ? `: ${title}` : ""}`;
}

/**
 * Slide `incoming` in and `outgoing` out with the slide classes of Bootstrap's carousel stylesheet. The stylesheet moves
 * them with a `transform` transition, and src/style.css shortens it and swaps it for a cross-fade under reduced motion.
 * The change ends when the transition does, or at once when nothing animates.
 * @param {Element} outgoing The slide shown now.
 * @param {Element} incoming The slide to show.
 * @param {"next" | "prev"} direction `next` slides the new slide in from the right, `prev` from the left.
 * @returns {void}
 */
function slideCarousel(outgoing, incoming, direction) {
	const order = direction === "next" ? "carousel-item-next" : "carousel-item-prev";
	const side = direction === "next" ? "carousel-item-start" : "carousel-item-end";

	incoming.classList.add(order);
	// Reading the layout places the incoming slide at its side before it starts to move.
	void incoming.offsetWidth;
	outgoing.classList.add(side);
	incoming.classList.add(side);

	const finish = () => {
		if (finishCarouselTransition !== finish) {
			return;
		}

		finishCarouselTransition = null;
		incoming.classList.remove(order, side);
		incoming.classList.add("active");
		outgoing.classList.remove("active", side);
	};

	finishCarouselTransition = finish;

	const animations = typeof incoming.getAnimations === "function" ? incoming.getAnimations() : [];

	if (animations.length === 0) {
		finish();

		return;
	}

	Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
}

/**
 * Show the carousel slide at `index`, mark its indicator as the current one, and announce it. A slide still moving
 * from an earlier change ends first, so a quick run of clicks builds on the slide last chosen. An index with no slide,
 * or the slide already shown, changes nothing.
 * @param {number} index The position of the slide, counted from 0.
 * @param {"next" | "prev"} [direction] The side the slide enters from. Defaults to `next` for a slide later in the list
 * and `prev` for an earlier one.
 * @returns {void}
 */
function showCarouselSlide(index, direction) {
	finishCarouselTransition?.();

	const slides = carouselSlides();
	const current = slides.find((slide) => slide.classList.contains("active"));
	const target = Number.isInteger(index) ? slides[index] : undefined;

	if (!target || target === current) {
		return;
	}

	markCarouselIndicator(index);
	announceCarouselSlide(target, index, slides.length);

	if (!current) {
		target.classList.add("active");

		return;
	}

	slideCarousel(current, target, direction ?? (index > slides.indexOf(current) ? "next" : "prev"));
}

/**
 * Changes the active slide in a carousel based on the given direction, wrapping from the last slide to the first and
 * back.
 * @param {string} direction The direction in which to change the active slide.
 * @returns {void}
 */
function changeCarouselSlide(direction) {
	// A slide still moving ends first, so the next one is counted from the slide last chosen
	finishCarouselTransition?.();

	/** Elements with the class "carousel-item" */
	const carouselItems = carouselSlides();

	// If there are no carousel items, return without doing anything
	if (!carouselItems.length) {
		return;
	}

	/** Index of the slide with the active class, or -1 when no slide is active */
	const activeIndex = carouselItems.findIndex((item) => item.classList.contains("active"));

	// If there is no active slide, show the first carousel item and return
	if (activeIndex < 0) {
		showCarouselSlide(0);

		return;
	}

	/** The index of the next slide based on the direction and the current active slide */
	const nextIndex =
		direction === "next"
			? (activeIndex + 1) % carouselItems.length
			: (activeIndex - 1 + carouselItems.length) % carouselItems.length;

	// Slide in from the side the arrow points to, also when wrapping round the ends
	showCarouselSlide(nextIndex, direction === "next" ? "next" : "prev");
}

/**
 * Change the carousel slide when a touch or a pen swipes across it: a swipe to the left shows the next slide and a
 * swipe to the right the previous one. A mostly vertical movement is left to scroll the page, and a mouse is left to
 * the arrows, so a drag to select text does not change the slide.
 * @param {Element} carousel The carousel element.
 * @returns {void}
 */
function enableCarouselSwipe(carousel) {
	let start = null;

	carousel.addEventListener("pointerdown", (event) => {
		start = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
	});
	carousel.addEventListener("pointercancel", () => {
		start = null;
	});
	carousel.addEventListener("pointerup", (event) => {
		if (!start) {
			return;
		}

		const distanceX = event.clientX - start.x;
		const distanceY = event.clientY - start.y;

		start = null;

		if (Math.abs(distanceX) >= CAROUSEL_SWIPE_DISTANCE && Math.abs(distanceX) > Math.abs(distanceY)) {
			changeCarouselSlide(distanceX < 0 ? "next" : "prev");
		}
	});
}
