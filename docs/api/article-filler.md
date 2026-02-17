# ArticleFiller API

The public entry points for the site are Uniform Resource Locator (URL) query strings. External users should use the URL formats below rather than calling internal methods.

## URL-Based Access

- `/?ArticleTitle` loads a single article by key.
- `/?pages&archive` displays the archive view.
- `/?pages&{category}` displays a category view built from legacy page definitions.

Article keys are normalized by removing spaces and uppercasing the first letter of each segment before lookup.

Implementation: [src/scripts/index.js](../../src/scripts/index.js)

## Related Documentation

- [Getting Started](../guide/getting-started.md)
- [Adding & Publishing Articles](../guide/articles.md)
