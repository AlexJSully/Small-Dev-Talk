# Adding & Publishing Articles

This guide explains how to add new articles to Small Dev Talk.

## Article Directory Structure

Articles are organized by author under `src/articleArchive/`, indexed by [articleData.json](../../src/articleArchive/articleData.json):

```text
src/articleArchive/
├── authorAuthorNameNoSpaces/
│   └── YYYY-MM-DD_ArticleTitle/
│       ├── ArticleTitle.md
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
```

## Step 1: Register Article Metadata

Edit [src/articleArchive/articleData.json](../../src/articleArchive/articleData.json) and add an entry. This file uses JavaScript Object Notation (JSON):

```json
{
	"NewArticleTitle": {
		"title": "Full Article Title",
		"summary": "Brief 1-2 sentence summary",
		"author": "Author Name",
		"date": "YYYY-MM-DD",
		"thumbnail": "image1.jpg",
		"thumbnailHeight": 225,
		"thumbnailWidth": 400
	}
}
```

**Field Requirements:**

- `title`: Display title used in listings and metadata updates
- `author`: Used to build the `author{AuthorNameNoSpaces}` folder
- `date`: Used to build the `YYYY-MM-DD_{ArticleKey}` folder
- `summary`: Displayed in carousel and featured lists
- `thumbnail`: Used for carousel, featured list, archive list, and social metadata images
- `thumbnailWidth` and `thumbnailHeight`: The thumbnail's size in pixels, as whole numbers. The page sets them as the `width` and `height` of the thumbnail `<img>`, so the browser reserves the space before the image loads. A Jest test in [articleData.test.js](../../src/articleArchive/articleData.test.js) fails when an entry with a `thumbnail` points at a file that does not exist, or has no size or a size that differs from that file

## Step 2: Create Article Directory

Create the directory structure using the exact naming pattern:

```bash
mkdir -p src/articleArchive/author{AuthorNameNoSpaces}/{YYYY-MM-DD}_{ArticleTitle}/
```

**Example:**

```bash
mkdir -p src/articleArchive/authorAlexanderSullivan/2013-03-26_Caravaneer2/
```

## Step 3: Create Markdown File

Create `ArticleTitle.md` in the article directory with content:

```markdown
# Article Title

Article content in markdown format.

## Section Heading

More content here with **bold** and _italic_ text.

### Subsection

![Caravaneer 2 key art: a raider in a bucket helmet shoulders a rifle beside a caravan](src\articleArchive\authorAlexanderSullivan\2013-03-26_Caravaneer2\image1.jpg =500x336)

- Bullet list item 1
- Bullet list item 2

1. Numbered item 1
2. Numbered item 2
```

**File Name:** Must match the key in `articleData.json` exactly

## Step 4: Add Images

Place all images in the article directory:

```text
src/articleArchive/authorAlexanderSullivan/2013-03-26_Caravaneer2/
├── Caravaneer2.md
├── image1.jpg
├── image2.jpg
├── image3.png
└── ...
```

**Image paths and sizes:**

Write each image path from the site root, and end it with the image's width and height in pixels: `![alt](src\articleArchive\…\image1.jpg =WIDTHxHEIGHT)`. Showdown turns the size into the `width` and `height` of the `<img>`, so the browser reserves the image's space before it loads and the text below does not jump. On macOS, `sips -g pixelWidth -g pixelHeight image1.jpg` prints the size. A YouTube thumbnail (`https://img.youtube.com/vi/VIDEO_ID/0.jpg`) is `=480x360`. The same test fails when an image in an article listed in `articleData.json` has no size, a size that differs from the file, or a path to a file that does not exist, and when an image from another site is not a YouTube thumbnail sized `=480x360`.

**Alt text:**

Every image needs alt text that says what the image shows for a reader who cannot see it, such as `![Caravaneer 2 isometric battle among desert ruins](…)`. Keep it under about 125 characters, and skip "Image of". A YouTube thumbnail inside a link is the link's only content, so its alt text names the video, such as `[![Caravaneer 2 trailer on YouTube](https://img.youtube.com/vi/VIDEO_ID/0.jpg =480x360)](https://www.youtube.com/watch?v=VIDEO_ID)`, and the link goes to the video the thumbnail shows. Alt text cannot contain `]`. A Jest test in [articleData.test.js](../../src/articleArchive/articleData.test.js) fails on an empty or placeholder alt (`image`, `image1`, `YouTube Video`), and when two image links in one article share a name.

**Caching:**

Article images and markdown are not precached. The service worker caches them at runtime as readers open the article.

## Step 5: Update Service Worker Cache

`articleData.json` is precached, so rebuild the service worker after adding the article's entry:

```bash
npm run workbox
```

This regenerates [sw.js](../../sw.js) with the new `articleData.json` revision.

## Step 6: Test Locally

Start the dev server and verify:

```bash
npm run start
```

Access `http://localhost:3000/?ArticleTitle` and verify:

- Article loads correctly
- Images display
- Metadata tags are correct (open DevTools)
- No console errors

## Step 7: Run Validation

Run the full validation suite:

```bash
npm run validate
```

This ensures:

- Code quality (ESLint)
- Formatting (Prettier)
- Tests pass
- E2E tests pass
- Markdown valid

## Publishing

Once validated locally:

1. Commit changes to a feature branch
2. Create a pull request
3. Request review
4. Merge to master
5. GitHub Actions runs quality checks (Prettier, ESLint, Jest, Cypress, markdownlint, and CodeQL); there is no build step. The site is hosted on GitHub Pages (see [CNAME](../../CNAME)) and updates when changes land on master

## Related Documentation

- [System Architecture](../architecture/system.md)
- [Getting Started Guide](./getting-started.md)
- [Testing Guide](./testing.md)
