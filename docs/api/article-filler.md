# ArticleFiller API

The public entry points for the site are Uniform Resource Locator (URL) query strings. External users should use the URL formats below rather than calling internal methods.

## URL-Based Access

- `/?ArticleTitle` loads a single article by key.
- `/?pages&archive` displays the archive view.
- `/?pages&{category}` displays a category view built from legacy page definitions.

The query string is read as decoded keys, so `/?motte%20island` and `/?motte+island` read as `motte island`. Parameters with a value, such as `fbclid=…` or `utm_source=…` added to a shared link, are left out, as are empty segments from a doubled or trailing `&`. Article keys are normalized by removing spaces and uppercasing the first letter of each segment before lookup, so `/?motte%20island` loads the article `MotteIsland`. The lookup is case-sensitive, and the rest of each segment keeps its case, so `/?ghost%20ship` looks up `GhostShip` and does not find the article `Ghostship`. A key with no article shows the "could not find that article" message.

Implementation: [src/scripts/index.js](../../src/scripts/index.js)

## Related Documentation

- [Getting Started](../guide/getting-started.md)
- [Adding & Publishing Articles](../guide/articles.md)
