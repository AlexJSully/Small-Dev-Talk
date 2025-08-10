global.showdown = require("./libraries/showdown/showdown.min.js");

const { ArticleFiller } = require("./index.js");

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
	});

	test("loads markdown and updates DOM", async () => {
		const mockMd = "# Test Article";
		global.fetch = jest.fn().mockResolvedValue({
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
		// Spy on ArticleFiller.ArticleFiller to avoid side effects
		jest.spyOn(ArticleFiller, "ArticleFiller").mockImplementation(() => {});
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
