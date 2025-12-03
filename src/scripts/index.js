//= =========================== Alexander Sullivan =============================
//
// Purpose: General functions for Small Dev Talk
//
//= ============================================================================

/**
 * Convert markdown files into HTML
 */

const converter = new showdown.Converter();
/**
 * Create and fill the page with the desired article
 */
class ArticleFiller {
	constructor() {
		this.articleData;
		this.articleMd;
		this.article;
		this.pageData;
		this.pageURL;
		this.callPageDisplay = true;
		this.whatPageDisplay = "index";
	}

	/**
	 * Display and logs error messages
	 * @param {string} msg The error message to display
	 * @return {void} Does not return a value but updates the article content
	 */
	static displayError(msg) {
		ArticleFiller.errMsg = msg?.trim();
		if (ArticleFiller.errMsg?.length < 1) {
			ArticleFiller.errMsg = "Unknown error";
		}

		// Log the error
		console.error(ArticleFiller.errMsg);

		// Display the error with Bootstrap styling
		ArticleFiller.article = `
			<div style="width:100%; display:flex; justify-content:center; margin-top:2.5rem;">
				<div style="text-align:center;">
					<div style="font-size:2.5rem; font-weight:700; color:#dc3545; letter-spacing:1px;">
						Error
					</div>

					<div style="font-size:1.25rem; color:#333; margin:1rem 0 2rem 0;">
						${ArticleFiller.errMsg}
					</div>

					<div style="display:flex; gap:1rem; justify-content:center;">
						<button class="btn btn-warning" style="font-size:1rem;" onclick="window.location.reload();">
							Refresh
						</button>

						<button class="btn btn-primary" style="font-size:1rem;" onclick="window.location.href='index.html';">
							Home
						</button>
					</div>
				</div>
			</div>
		`;

		if (document?.getElementById("articleBody")) {
			document.getElementById("articleBody").innerHTML = ArticleFiller.article;
		}
	}

	/** Retrieve all article information */
	static retrieveArticleData() {
		const articleDataUrl = "/src/articleArchive/articleData.json";

		fetch(articleDataUrl)
			.then((response) => response.json())
			.then((articleData) => {
				ArticleFiller.articleData = articleData;
				ArticleFiller.callArticle();
			})
			.catch((error) => {
				console.error("Error retrieving article data:", error);
			});
	}

	/** Call desired article as denoted by index.html?ArticleTitle */
	static callArticle() {
		const docURL = document.URL;
		const [, query] = docURL.split("?"); // Using destructuring to get the query string

		if (!query) {
			ArticleFiller.callDisplay();
			return;
		}

		const [articleTitle] = query.split("&"); // Using destructuring to get the article title
		const isSingleArticle = query.split("&").length === 1;

		if (isSingleArticle) {
			ArticleFiller.grabArticle(articleTitle);

			// Caching frequently used DOM elements
			const featuredArticles = document.getElementById("featuredArticles");
			const displayArticles = document.getElementById("displayArticles");
			const articleBody = document.getElementById("articleBody");

			if (featuredArticles) {
				featuredArticles.setAttribute("hidden", true);
			}
			if (displayArticles) {
				displayArticles.setAttribute("hidden", true);
			}
			if (articleBody) {
				articleBody.removeAttribute("hidden");
			}
		} else {
			ArticleFiller.callDisplay();
		}
	}

	/**
	 * Grab article markdown file
	 * @param {String} articleName Name of article
	 */
	static grabArticle(articleName) {
		// Change article name to fit format
		const tempName = articleName.split(" ");
		articleName = "";
		for (const name of tempName) {
			const change = name[0].toUpperCase() + name.slice(1);
			articleName += change;
		}

		if (ArticleFiller.articleData && articleName) {
			const articleData = ArticleFiller.articleData[articleName];
			if (articleData) {
				this.updateMetaData(articleData, articleName);

				// Create URL
				const authorFolder = `author${articleData.author.replace(/\s/g, "")}`;
				const articleFolder = `${articleData.date}_${articleName}`;
				const url = `/src/articleArchive/${authorFolder}/${articleFolder}/${articleName}.md`;

				// Call article
				fetch(url)
					.then((response) => {
						if (!response.ok) {
							throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
						}
						return response.text();
					})
					.then((articleMd) => {
						ArticleFiller.articleMd = articleMd;
						ArticleFiller.addToPage();
					})
					.catch((error) => {
						ArticleFiller.displayError(
							`Could not retrieve article. Please check the article name or try again later. (${error.message})`,
						);
					});
			} else {
				ArticleFiller.displayError("Error retrieving article.");
			}
		}
	}

	/**
	 * Dynamically update the article's meta-data based on article content
	 * @param {Object} articleData The article's data
	 * @param {String} [articleData.title] Article's title
	 * @param {String} [articleData.summary] Article's summary
	 * @param {String} [articleData.thumbnail] The filename of the thumbnail/resoc image of the article
	 * @param {String} [articleData.author] Author of the article
	 * @param {String} [articleData.date] Date the article was published (YYYY-MM-DD)
	 * @param {String} articleKey Article in-code name (key name in articleData.json)
	 * @example <caption>Use this function to dynamically update the article's meta-data based on article content. Each individual's content of articleData is optional</caption>
	 * updateMetaData({"author": "Alexander Sullivan","date": "2013-03-26","summary": "The great sequel to Caravaneer is coming soon and I got the chance to talk with the developer, Dmitry Zheltobriukhov from GamesOfHonor.com for their upcoming game Caravaneer 2!","thumbnail": "image1.jpg","title": "Caravaneer 2"}, 'Caravaneer2');
	 * // returns null (does not return anything but updates the meta-data accordingly)
	 */
	static updateMetaData(articleData, articleKey) {
		// If article data object is not empty
		if (Object.keys(articleData)?.length > 0) {
			/** Structured data */
			let structuredData = document?.querySelector("script[type='application/ld+json']")?.textContent;
			// Convert structured data into a usable JSON object
			if (structuredData) {
				structuredData = JSON.parse(structuredData);
			} else {
				structuredData = undefined;
			}

			// Update title
			if (articleData?.title) {
				/** Title of article */
				const title = `${articleData.title} | Small Dev Talk`;
				// Document
				document.title = title;

				// og & twitter
				document.querySelector("meta[property='og:title']").setAttribute("content", title);
				document.querySelector("meta[property='twitter:title']").setAttribute("content", title);

				// Update structured data
				if (structuredData?.name) {
					structuredData.name = title;
				}
			}

			// Update description
			if (articleData?.summary) {
				/** Summary/description of the article */
				const description = `${articleData.summary} | Small Dev Talk`;

				// Document
				document.querySelector("meta[name='description']").setAttribute("content", description);

				// og & twitter
				document.querySelector("meta[property='og:description']").setAttribute("content", description);
				document.querySelector("meta[property='twitter:description']").setAttribute("content", description);

				// Update structured data
				if (structuredData?.description) {
					structuredData.description = description;
				}
			}

			// Update image
			if (articleData?.thumbnail && articleData?.author && articleData?.date && articleKey) {
				/** Image URL */
				const imgURL = `https://smalldevtalk.net/src/articleArchive/author${articleData.author
					.split(" ")
					.join("")}/${articleData.date}_${articleKey}/${articleData.thumbnail}`;

				// og & twitter
				document.querySelector("meta[property='og:image']").setAttribute("content", imgURL);
				document.querySelector("meta[property='twitter:image']").setAttribute("content", imgURL);

				// Update structured data
				if (structuredData?.image) {
					structuredData.image = imgURL;
				}
			}

			// Update structured data
			if (structuredData) {
				document.querySelector("script[type='application/ld+json']").textContent =
					JSON.stringify(structuredData);
			}
		}
	}

	/** Convert article into HTML and add to page */
	static addToPage() {
		// Add article:
		ArticleFiller.article = converter.makeHtml(ArticleFiller.articleMd);

		// Check if the converted article is empty when the original content is not
		if (ArticleFiller?.article?.trim()?.length < 1 && ArticleFiller?.articleMd?.trim()?.length > 0) {
			ArticleFiller.displayError("Article content could not be converted to HTML.");
			return;
		}

		if (document?.getElementById("articleBody")) {
			document.getElementById("articleBody").innerHTML = ArticleFiller.article;
		}
	}

	// Functions related to changing the featured article

	/** Retrieve page information of all possible pages */
	static retrievePageData() {
		const xhr = new XMLHttpRequest();
		const url = "/src/legacyPages/legacyPagesDisplay.json";

		xhr.responseType = "json";
		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				ArticleFiller.pageData = xhr.response;

				ArticleFiller.callArticle();
			}
		};

		xhr.open("GET", url);
		xhr.send();
	}

	/**
	 * Call the appropriate page
	 */
	static callDisplay() {
		let useURL = [];
		const docURL = document.URL;
		const sep = docURL.split("?");
		if (sep.length > 1) {
			useURL = sep[1].split("&");

			ArticleFiller.whatPageDisplay = useURL[1];
		} else {
			useURL = [];
			ArticleFiller.whatPageDisplay = "index";
		}
		ArticleFiller.pageURL = useURL;

		if (ArticleFiller.pageURL.length === 1) {
			ArticleFiller.callPageDisplay = false;
		} else {
			ArticleFiller.callPageDisplay = true;

			if (ArticleFiller.whatPageDisplay === "archive") {
				ArticleFiller.displayArchive();
			} else {
				ArticleFiller.changeCarousel();
			}
		}
	}

	/**
	 * Display archive of articles
	 */
	static displayArchive() {
		// Reset page
		if (document.getElementById("featuredArticles")) {
			document.getElementById("featuredArticles").setAttribute("hidden", true);
		}
		if (document.getElementById("articleBody")) {
			document.getElementById("articleBody").removeAttribute("hidden");
		}

		/** String form of the articles to display */
		let archiveDisplay = "";
		/** All article's data */
		const { articleData } = ArticleFiller;

		if (articleData) {
			for (const [key, value] of Object.entries(articleData)) {
				if (value && value.title && value.author && value.date && value.thumbnail) {
					// Create bootstrap container
					if (archiveDisplay.trim().length < 1) {
						archiveDisplay += `
						<div class="container-fluid">
						<div class="row">
					`;
					}

					/** Article's thumbnail URL */
					const imgURL = `src/articleArchive/author${value.author.split(" ").join("")}/${value.date}_${key}/${
						value.thumbnail
					}`;

					archiveDisplay += `
					<div class="col-sm archive-display">
						<a
							class="archive-link"
							href="${document.location.origin}/index.html?${key}"
							aria-label="Redirect to ${value.title}"
						>
							<p class="archive-title">${value.title}</p>
							<img src=${imgURL} alt="${value.title}'s thumbnail" loading="lazy">
						</a>
					</div>
				`;
				}
			}
		}

		// If things to add, add it
		if (archiveDisplay.trim().length > 0) {
			archiveDisplay += "</div></div>";

			document.getElementById("displayArticles").innerHTML += archiveDisplay;
		}
	}

	/**
	 * Change what articles are displayed in the carousel
	 */
	static changeCarousel() {
		// Change title:
		const docTitle =
			ArticleFiller.whatPageDisplay[0].toUpperCase() +
			ArticleFiller.whatPageDisplay.substring(1, ArticleFiller.whatPageDisplay.length);

		if (document.getElementById("pageTitle")) {
			document.getElementById("pageTitle").innerText = `Small Dev Talk: ${docTitle}`;
		}

		if (
			ArticleFiller &&
			ArticleFiller.pageData &&
			ArticleFiller.articleData &&
			ArticleFiller.pageData[ArticleFiller.whatPageDisplay] &&
			ArticleFiller.pageData[ArticleFiller.whatPageDisplay].carousel &&
			document.getElementById("carouselInner")
		) {
			const carouselList = ArticleFiller.pageData[ArticleFiller.whatPageDisplay].carousel;
			// Reset carousel
			if (document.getElementById("carouselIndicator")) {
				document.getElementById("carouselIndicator").innerHTML = "";
			}
			document.getElementById("carouselInner").innerHTML = "";
			// Fill carousel
			for (let c = 0; c < carouselList.length; c += 1) {
				// Create URL
				const authorFolder = `author${ArticleFiller.articleData[carouselList[c]].author.split(" ").join("")}`;
				const articleFolder = `${ArticleFiller.articleData[carouselList[c]].date}_${carouselList[c]}`;
				const articleThumbnail = ArticleFiller.articleData[carouselList[c]].thumbnail;
				const articleTitle = ArticleFiller.articleData[carouselList[c]].title;
				const articleSummary = ArticleFiller.articleData[carouselList[c]].summary;
				const url = `/src/articleArchive/${authorFolder}/${articleFolder}/${articleThumbnail}`;

				// Change indicators
				let appendStr = `
					<li
						data-target="#carouselExampleIndicators"
						data-slide-to="${c}"
						${c === 0 ? `class="active"` : ""}
					></li>
				`;
				if (document.getElementById("carouselIndicator")) {
					document.getElementById("carouselIndicator").innerHTML += appendStr;
				}

				// Change content
				appendStr = `
					<div class="carousel-item ${c === 0 ? "active" : ""}">
						<a
							id="carouselLink${c}"
							href="index.html?${carouselList[c]}"
							aria-label="Redirect to ${articleTitle}"
						>
							<img
								id="carouselImage${c}"
								src="${url}"
								class="d-block w-100"
								style="width:100%; max-height: 400px !important;"
								loading="lazy"
								alt="Carousel image for ${articleTitle}"
							>
							<div
								class="carousel-caption d-md-block"
								style="text-shadow: 0 0 3px #000000;"
							>
								<h5 id="carouselHeader${c}">${articleTitle}</h5>
								<p id="carouselParagraph${c}">${articleSummary}</p>
							</div>
						</a>
					</div>
				`;

				document.getElementById("carouselInner").innerHTML += appendStr;
			}
		}

		ArticleFiller.ArticleFiller();
	}

	/**
	 * Change list of featured articles
	 */
	static ArticleFiller() {
		if (
			ArticleFiller &&
			ArticleFiller.pageData &&
			ArticleFiller.articleData &&
			ArticleFiller.pageData[ArticleFiller.whatPageDisplay] &&
			ArticleFiller.pageData[ArticleFiller.whatPageDisplay].displayArticles
		) {
			const displayList = ArticleFiller.pageData[ArticleFiller.whatPageDisplay].displayArticles;
			// Reset featured articles
			document.getElementById("displayArticles").innerHTML = "";
			// Fill featured articles
			if (displayList && displayList.length > 0) {
				for (const d in displayList) {
					if (ArticleFiller.articleData[displayList[d]]) {
						// Create URL
						const authorFolder = `author${ArticleFiller.articleData[displayList[d]].author
							.split(" ")
							.join("")}`;
						const articleFolder = `${ArticleFiller.articleData[displayList[d]].date}_${displayList[d]}`;
						const articleThumbnail = ArticleFiller.articleData[displayList[d]].thumbnail;
						const articleTitle = ArticleFiller.articleData[displayList[d]].title;
						const articleSummary = ArticleFiller.articleData[displayList[d]].summary;
						const articleDate = ArticleFiller.articleData[displayList[d]].date;
						const url = `/src/articleArchive/${authorFolder}/${articleFolder}/${articleThumbnail}`;

						// Change indicators
						const appendStr = `
							<div class="post row" id="featuredArticle${d}">
								<div class="col-md-4" style="margin-top: 0.5rem;">
									<a
										href="index.html?${displayList[d]}"
										aria-label="Redirect to ${articleTitle}"
									>
										<img
											src="${url}"
											class="img-fluid"
											loading="lazy"
											alt="Thumbnail for ${articleTitle}"
										>
									</a>
								</div>
								<div class="col-md-8" style="margin-top: 0.5rem;">
									<h2>
										<a
											href="index.html?${displayList[d]}"
											aria-label="Redirect to ${articleTitle}"
										>
											${articleTitle}
										</a>
									</h2>
								</div>
								<div class="col-12" style="margin-top: 0.5rem;">
									<p>
										${articleSummary}
										<a
											href="index.html?${displayList[d]}"
											aria-label="Read more of ${articleTitle}"
										>
											Read More
										</a>
									</p>
								</div>
								<div class="col-12">
									<p class="details">
										<a
											href="index.html?${displayList[d]}"
											aria-label="Redirect to ${articleTitle}"
										>
											${articleDate}
										</a>
									</p>
								</div>
								</div>
							</div>
						`;

						document.getElementById("displayArticles").innerHTML += appendStr;
					}
				}
			}
		}
	}
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = { ArticleFiller };
}

function init() {
	// Init data
	ArticleFiller.retrievePageData();
	ArticleFiller.retrieveArticleData();
}

async function registerServiceWorker() {
	if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
		try {
			const reg = await navigator.serviceWorker.register("./src/serviceWorker/sw.js");
			return reg;
		} catch (e) {
			console.error("ServiceWorker registration failed:", e && e.message ? e.message : e);
			return null;
		}
	}
	return null;
}

window.onload = async function () {
	await registerServiceWorker();
	init();
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = { ArticleFiller, registerServiceWorker };
}

// Functions related to changing carousel
/**
 * Changes the active slide in a carousel based on the given direction.
 * @param {string} direction The direction in which to change the active slide.
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
function changeCarouselSlide(direction) {
	/** Define the name of the class that represents the active slide */
	const activeClass = "active";
	/** Elements with the class "carousel-item" */
	const carouselItems = document.getElementsByClassName("carousel-item");

	// If there are no carousel items, return without doing anything
	if (!carouselItems || !carouselItems.length) {
		return;
	}

	/** Currently active slide by searching through the carousel items for the one with the active class */
	const activeItem = Array.from(carouselItems).find((item) => item.classList.contains(activeClass));

	// If there is no active slide, add the active class to the first carousel item and return
	if (!activeItem) {
		carouselItems[0].classList.add(activeClass);
		return;
	}

	/** The index of the next slide based on the direction and the current active slide */
	const nextIndex =
		direction === "next"
			? (Array.from(carouselItems).indexOf(activeItem) + 1) % carouselItems.length
			: (Array.from(carouselItems).indexOf(activeItem) - 1 + carouselItems.length) % carouselItems.length;

	// Remove the active class from the current active slide and add it to the next slide
	activeItem.classList.remove(activeClass);
	carouselItems[nextIndex].classList.add(activeClass);
}
