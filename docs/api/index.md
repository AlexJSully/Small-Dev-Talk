# API Reference

This section provides detailed API documentation for the core modules and integrations in Small Dev Talk.

## Overview

The API reference documents the internal structure, method signatures, and usage patterns for the key components that power Small Dev Talk. Each document includes practical examples, parameter descriptions, and integration guidelines.

## Available Documentation

### [ArticleFiller Class](./article-filler.md)

The core module responsible for managing article data, rendering content, and handling navigation.

**Key Topics:**

- State management and class properties
- Article metadata retrieval
- Dynamic content loading and rendering
- Markdown to HTML conversion
- Error handling and user feedback
- URL parameter parsing and routing

**Use this when:** You need to understand how articles are loaded, rendered, or displayed on the site.

## Quick Reference

### ArticleFiller Core Methods

```javascript
ArticleFiller.retrieveArticleData(); // Fetch article metadata
ArticleFiller.callArticle(); // Route to appropriate display
ArticleFiller.grabArticle(articleName); // Load specific article
ArticleFiller.updateMetaData(data, key); // Update page metadata
ArticleFiller.displayError(msg); // Show error to user
```

## Related Documentation

- [System Architecture](../architecture/system.md) — High-level system design
- [Data Flow](../architecture/data-flow.md) — How data moves through the application
- [Getting Started Guide](../guide/getting-started.md) — Local development setup
