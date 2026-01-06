# Adding & Publishing Articles

This guide explains how to add new articles to Small Dev Talk.

## Article Directory Structure

Articles are organized by author in the [articleArchive](../../src/articleArchive/) directory:

```text
src/articleArchive/
├── authorName/
│   └── YYYY-MM-DD_ArticleTitle/
│       ├── ArticleTitle.md
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
```

## Step 1: Register Article Metadata

Edit [src/articleArchive/articleData.json](../../src/articleArchive/articleData.json) and add:

```json
{
	"NewArticleTitle": {
		"title": "Full Article Title",
		"summary": "Brief 1-2 sentence summary",
		"author": "Author Name",
		"date": "YYYY-MM-DD",
		"thumbnail": "image1.jpg"
	}
}
```

**Field Requirements:**

- `title`: Display title (required)
- `author`: Must match author folder name (required)
- `date`: Publication date in YYYY-MM-DD format (required)
- `summary`: Brief description (optional)
- `thumbnail`: Filename of cover image (optional)

## Step 2: Create Article Directory

Create the directory structure using the exact naming pattern:

```bash
mkdir -p src/articleArchive/author{AuthorFirstNameLastName}/{YYYY-MM-DD}_{ArticleTitle}/
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

![Image Alt Text](image1.jpg)

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

**Supported Formats:**

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

## Step 5: Update Service Worker Cache

Rebuild the service worker to include new assets:

```bash
npm run workbox
```

This regenerates [src/serviceWorker/sw.js](../../src/serviceWorker/sw.js) with new article assets.

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
5. GitHub Actions automatically builds and deploys

---

See also:

- [System Architecture](../architecture/system.md)
- [Getting Started Guide](./getting-started.md)
- [Testing Guide](./testing.md)
