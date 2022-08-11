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
	}

	/**
	 * Retrieve all article information
	 */
	retrieveArticleData() {
		const xhr = new XMLHttpRequest();
		const url =
			"https://raw.githubusercontent.com/AlexJSully/Small-Dev-Talk/master/src/articleArchive/articleData.json";

		xhr.responseType = "json";
		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				articleFiller.articleData = xhr.response;

				articleFiller.callArticle();
			}
		};

		xhr.open("GET", url);
		xhr.send();
	}

	/**
	 * Call desired article as denoted by index.html?ArticleTitle
	 */
	callArticle() {
		const docURL = document.URL;
		const findArticle = docURL.split("?");
		if (findArticle.length === 2) {
			const sep = findArticle[1].split("&");
			if (sep.length === 1) {
				articleFiller.grabArticle(sep[0]);

				// Reset page
				document.getElementById("featuredArticles").setAttribute("hidden", true);
				document.getElementById("displayArticles").setAttribute("hidden", true);
				document.getElementById("articleBody").removeAttribute("hidden");
			} else {
				changeFeaturedArticles.callDisplay();
			}
		} else {
			changeFeaturedArticles.callDisplay();
		}
	}

	/**
	 * Grab article markdown file
	 * @param {String} articleName Name of article
	 */
	grabArticle(articleName) {
		// Change article name to fit format
		const tempName = articleName.split(" ");
		articleName = "";
		for (const name of tempName) {
			const change = name[0].toUpperCase() + name.substring(1, name.length);
			articleName += change;
		}

		if (articleFiller.articleData[articleName]) {
			this.updateMetaData(articleFiller.articleData[articleName], articleName);

			// Create URL
			const authorFolder = `author${articleFiller.articleData[articleName].author.split(" ").join("")}`;
			const articleFolder = `${articleFiller.articleData[articleName].date}_${articleName}`;

			// Call article
			const xhr = new XMLHttpRequest();
			const url = `https://raw.githubusercontent.com/AlexJSully/Small-Dev-Talk/master/src/articleArchive/${authorFolder}/${articleFolder}/${articleName}.md`;

			xhr.responseType = "text";
			xhr.onreadystatechange = () => {
				if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					articleFiller.articleMd = xhr.response;

					articleFiller.addToPage();
				}
			};

			xhr.open("GET", url);
			xhr.send();
		} else {
			articleFiller.articleMd = "Error retrieving article";

			articleFiller.addToPage();
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
	updateMetaData(articleData, articleKey) {
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

	/**
	 * Convert article into HTML and add to page
	 */
	addToPage() {
		// Add article:
		articleFiller.article = converter.makeHtml(articleFiller.articleMd);
		document.getElementById("articleBody").innerHTML = articleFiller.article;
	}
}
/**
 * Create and fill the page with the desired article
 */
const articleFiller = new ArticleFiller();

/**
 * Change which page (non-article) is displayed
 */
class ChangeFeaturedArticles {
	constructor() {
		this.pageData;
		this.pageURL;
		this.callPageDisplay = true;
		this.whatPageDisplay = "index";
	}

	/**
	 * Retrieve page information of all possible pages
	 */
	retrievePageData() {
		const xhr = new XMLHttpRequest();
		const url =
			"https://raw.githubusercontent.com/AlexJSully/Small-Dev-Talk/master/src/legacyPages/legacyPagesDisplay.json";

		xhr.responseType = "json";
		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				changeFeaturedArticles.pageData = xhr.response;
			}
		};

		xhr.open("GET", url);
		xhr.send();
	}

	/**
	 * Call the appropriate page
	 */
	callDisplay() {
		let useURL = [];
		const docURL = document.URL;
		const sep = docURL.split("?");
		if (sep.length > 1) {
			useURL = sep[1].split("&");
			changeFeaturedArticles.whatPageDisplay = useURL[1];
		} else {
			useURL = [];
			changeFeaturedArticles.whatPageDisplay = "index";
		}
		changeFeaturedArticles.pageURL = useURL;

		if (changeFeaturedArticles.pageURL.length === 1) {
			changeFeaturedArticles.callPageDisplay = false;
		} else {
			changeFeaturedArticles.callPageDisplay = true;

			if (changeFeaturedArticles.whatPageDisplay === "archive") {
				changeFeaturedArticles.displayArchive();
			} else {
				changeFeaturedArticles.changeCarousel();
			}
		}
	}

	/**
	 * Display archive of articles
	 */
	displayArchive() {
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
		const articleData = articleFiller.articleData;

		for (const [key, value] of Object.entries(articleData)) {
			if (value.title && value.author && value.date && value.thumbnail) {
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
							<img src=${imgURL} alt="${value.title}'s thumbnail">
						</a>
					</div>
				`;
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
	changeCarousel() {
		// Change title:
		const docTitle =
			changeFeaturedArticles.whatPageDisplay[0].toUpperCase() +
			changeFeaturedArticles.whatPageDisplay.substring(1, changeFeaturedArticles.whatPageDisplay.length);
		document.getElementById("pageTitle").innerText = `Small Dev Talk: ${docTitle}`;

		if (
			changeFeaturedArticles &&
			changeFeaturedArticles.pageData &&
			changeFeaturedArticles.pageData[changeFeaturedArticles.whatPageDisplay] &&
			changeFeaturedArticles.pageData[changeFeaturedArticles.whatPageDisplay].carousel
		) {
			const carouselList = changeFeaturedArticles.pageData[changeFeaturedArticles.whatPageDisplay].carousel;
			// Reset carousel
			document.getElementById("carouselIndicator").innerHTML = "";
			document.getElementById("carouselInner").innerHTML = "";
			// Fill carousel
			for (let c = 0; c < carouselList.length; c++) {
				// Create URL
				const authorFolder = `author${articleFiller.articleData[carouselList[c]].author.split(" ").join("")}`;
				const articleFolder = `${articleFiller.articleData[carouselList[c]].date}_${carouselList[c]}`;
				const articleThumbnail = articleFiller.articleData[carouselList[c]].thumbnail;
				const articleTitle = articleFiller.articleData[carouselList[c]].title;
				const articleSummary = articleFiller.articleData[carouselList[c]].summary;
				const url = `https://raw.githubusercontent.com/AlexJSully/Small-Dev-Talk/master/src/articleArchive/${authorFolder}/${articleFolder}/${articleThumbnail}`;

				// Change indicators
				let appendStr = `
					<li data-target="#carouselExampleIndicators" data-slide-to="${c}" ${c === 0 ? `class="active"` : ""}></li>
				`;
				document.getElementById("carouselIndicator").innerHTML += appendStr;

				// Change content
				appendStr = `
					<div class="carousel-item ${c === 0 ? "active" : ""}>
						<a
							id="carouselLink${c}"
							href="index.html?${carouselList[c]}"
							aria-label="Redirect to ${articleTitle}"
						>
							<img
								id="carouselImage${c}"
								src="${url}"
								class="d-block w-100"
								style="width:100%; height: 400px !important;"
								loading="lazy"
								alt="Carousel image for ${articleTitle}"
							>
							<div
								class="carousel-caption d-none d-md-block"
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

		changeFeaturedArticles.changeFeaturedArticles();
	}

	/**
	 * Change list of featured articles
	 */
	changeFeaturedArticles() {
		if (
			changeFeaturedArticles &&
			changeFeaturedArticles.pageData &&
			changeFeaturedArticles.pageData[changeFeaturedArticles.whatPageDisplay] &&
			changeFeaturedArticles.pageData[changeFeaturedArticles.whatPageDisplay].displayArticles
		) {
			const displayList = changeFeaturedArticles.pageData[changeFeaturedArticles.whatPageDisplay].displayArticles;
			// Reset featured articles
			document.getElementById("displayArticles").innerHTML = "";
			// Fill featured articles
			if (displayList && displayList.length > 0) {
				for (const d in displayList) {
					// Create URL
					const authorFolder = `author${articleFiller.articleData[displayList[d]].author
						.split(" ")
						.join("")}`;
					const articleFolder = `${articleFiller.articleData[displayList[d]].date}_${displayList[d]}`;
					const articleThumbnail = articleFiller.articleData[displayList[d]].thumbnail;
					const articleTitle = articleFiller.articleData[displayList[d]].title;
					const articleSummary = articleFiller.articleData[displayList[d]].summary;
					const articleDate = articleFiller.articleData[displayList[d]].date;
					const url = `https://raw.githubusercontent.com/AlexJSully/Small-Dev-Talk/master/src/articleArchive/${authorFolder}/${articleFolder}/${articleThumbnail}`;

					// Change indicators
					const appendStr = `
					<div class="post" id="featuredArticle${d}">
						<div class="l">
							<a
								href="index.html?${displayList[d]}"
								aria-label="Redirect to ${articleTitle}"
							>
								<img
									src="${url}"
									width="134"
									loading="lazy"
									alt="Thumbnail for ${articleTitle}"
								>
							</a>
						</div>
						<div class="r">
							<h2>
								<a
									href="index.html?${displayList[d]}"
									aria-label="Redirect to ${articleTitle}"
								>
									${articleTitle}
								</a>
							</h2>
							<p>
								${articleSummary}
								<a
									href="index.html?${displayList[d]}"
									aria-label="Read more of ${articleTitle}"
								>
									Read More
								</a>
							</p>
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
				`;

					document.getElementById("displayArticles").innerHTML += appendStr;
				}
			}
		}
	}
}
/**
 * Change which page (non-article) is displayed
 */
const changeFeaturedArticles = new ChangeFeaturedArticles();

function init() {
	// Init data
	changeFeaturedArticles.retrievePageData();
	articleFiller.retrieveArticleData();
}
init();
