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
			"https://raw.githubusercontent.com/ASully/Small-Dev-Talk/master/src/articleArchive/articleData.json";

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
		for (let i = 0; i < tempName.length; i++) {
			const change = tempName[i][0].toUpperCase() + tempName[i].substr(1, tempName[i].length);
			articleName += change;
		}

		if (articleFiller.articleData[articleName] != undefined) {
			// Change title:
			const articleTitle = articleFiller.articleData[articleName].title;
			document.getElementById("pageTitle").innerText = "Small Dev Talk: " + articleTitle;

			// Create URL
			const authorFolder = "author" + articleFiller.articleData[articleName].author.split(" ").join("");
			const articleFolder = articleFiller.articleData[articleName].date + "_" + articleName;

			// Call article
			const xhr = new XMLHttpRequest();
			const url =
				"https://raw.githubusercontent.com/ASully/Small-Dev-Talk/master/src/articleArchive/" +
				authorFolder +
				"/" +
				articleFolder +
				"/" +
				articleName +
				".md";

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
			"https://raw.githubusercontent.com/ASully/Small-Dev-Talk/master/src/legacyPages/legacyPagesDisplay.json";

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
		let useURL;
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
		document.getElementById("featuredArticles").setAttribute("hidden", true);
		document.getElementById("articleBody").removeAttribute("hidden");

		/** String form of the articles to display */
		let archiveDisplay = "";
		/** All article's data */
		const articleData = articleFiller.articleData;

		for (const [key, value] of Object.entries(articleData)) {
			if (value.title && value.author && value.date && value.thumbnail) {
				// Create bootstrap container
				if (archiveDisplay.trim().length < 1) {
					archiveDisplay += '<div class="container-fluid">';
					archiveDisplay += '<div class="row">';
				}

				// Bootstrap column
				archiveDisplay += '<div class="col-sm archive-display">';

				// Link to article
				archiveDisplay += `<a class="archive-link" href="${document.location.origin}/index.html?${key}">`;

				// article title
				archiveDisplay += `<p class="archive-title">${value.title}</p>`;

				/** Article's thumbnail URL */
				const imgURL = `src/articleArchive/author${value.author.split(" ").join("")}/${value.date}_${key}/${
					value.thumbnail
				}`;
				// Article's thumbnail
				archiveDisplay += `<img src=${imgURL}>`;

				// Close HTML tags
				archiveDisplay += "</a>";
				archiveDisplay += "</div>";
			}
		}

		// If things to add, add it
		if (archiveDisplay.trim().length > 0) {
			archiveDisplay += "</div>";
			archiveDisplay += "</div>";

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
			changeFeaturedArticles.whatPageDisplay.substr(1, changeFeaturedArticles.whatPageDisplay.length);
		document.getElementById("pageTitle").innerText = "Small Dev Talk: " + docTitle;

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
				const authorFolder = "author" + articleFiller.articleData[carouselList[c]].author.split(" ").join("");
				const articleFolder = articleFiller.articleData[carouselList[c]].date + "_" + carouselList[c];
				const articleThumbnail = articleFiller.articleData[carouselList[c]].thumbnail;
				const articleTitle = articleFiller.articleData[carouselList[c]].title;
				const articleSummary = articleFiller.articleData[carouselList[c]].summary;
				const url =
					"https://raw.githubusercontent.com/ASully/Small-Dev-Talk/master/src/articleArchive/" +
					authorFolder +
					"/" +
					articleFolder +
					"/" +
					articleThumbnail;

				// Change indicators
				let appendStr = "";
				appendStr += '<li data-target="#carouselExampleIndicators" data-slide-to="' + c + '"';
				if (c === 0) {
					appendStr += ' class="active"';
				}
				appendStr += "></li>";
				document.getElementById("carouselIndicator").innerHTML += appendStr;

				// Change content
				appendStr = "";
				appendStr += '<div class="carousel-item';
				if (c === 0) {
					appendStr += " active";
				}
				appendStr += '">';
				appendStr += '<a id="carouselLink' + c + '" href="index.html?' + carouselList[c] + '">';
				appendStr +=
					'<img id="carouselImage' +
					c +
					'"src="' +
					url +
					'" class="d-block w-100" style="width:100%; height: 400px !important;" loading="lazy">';
				appendStr += '<div class="carousel-caption d-none d-md-block" style="text-shadow: 0 0 3px #000000;">';
				appendStr += '<h5 id="carouselHeader' + c + '">' + articleTitle + "</h5>";
				appendStr += '<p id="carouselParagraph' + c + '">' + articleSummary + "</p>";
				appendStr += "</div>";
				appendStr += "</a>";
				appendStr += "</div>";
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
			for (const d in displayList) {
				// Create URL
				const authorFolder = "author" + articleFiller.articleData[displayList[d]].author.split(" ").join("");
				const articleFolder = articleFiller.articleData[displayList[d]].date + "_" + displayList[d];
				const articleThumbnail = articleFiller.articleData[displayList[d]].thumbnail;
				const articleTitle = articleFiller.articleData[displayList[d]].title;
				const articleSummary = articleFiller.articleData[displayList[d]].summary;
				const articleDate = articleFiller.articleData[displayList[d]].date;
				const url =
					"https://raw.githubusercontent.com/ASully/Small-Dev-Talk/master/src/articleArchive/" +
					authorFolder +
					"/" +
					articleFolder +
					"/" +
					articleThumbnail;

				// Change indicators
				let appendStr = "";
				appendStr += '<div class="post" id="featuredArticle' + d + '">';
				appendStr += '<div class="l">';
				appendStr += '<a href="index.html?' + displayList[d] + '">';
				appendStr += '<img src="' + url + '" width="134" loading="lazy">';
				appendStr += "</a>";
				appendStr += "</div>";
				appendStr += '<div class="r">';
				appendStr += "<h2>";
				appendStr += '<a href="index.html?' + displayList[d] + '">' + articleTitle + "</a>";
				appendStr += "</h2>";
				appendStr += "<p>" + articleSummary;
				appendStr += '<a href="index.html?' + displayList[d] + '"> Read More</a>';
				appendStr += "</p>";
				appendStr +=
					'<p class="details"><a href="index.html?' + displayList[d] + '">' + articleDate + "</a></p>";
				appendStr += "</div>";
				appendStr += "</div>";

				document.getElementById("displayArticles").innerHTML += appendStr;
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
