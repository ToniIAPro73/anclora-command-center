---
name: defuddle
description: Extract clean markdown content from web pages, removing ads, navigation, sidebars, and other clutter. Use when the user needs to convert web content to clean markdown for their notes.
---

# Defuddle Skill

Defuddle extracts clean, readable content from web pages by removing clutter like ads, navigation, sidebars, and other non-essential elements. Returns clean HTML or Markdown.

## What Defuddle Removes

- Sidebars and navigation
- Headers and footers
- Ads and social buttons
- Comments sections
- Tracking pixels
- Related articles
- Cookie banners
- Non-essential images

## Installation

```bash
# Core library
npm install defuddle

# For Node.js (choose one DOM implementation)
npm install defuddle linkedom
# or
npm install defuddle jsdom

# CLI (global install)
npm install -g defuddle-cli
```

## CLI Usage

### Basic Commands
```bash
# Parse URL and get markdown
npx defuddle parse https://example.com/article --md

# Parse URL and get HTML
npx defuddle parse https://example.com/article

# Parse local HTML file
npx defuddle parse page.html --md

# Output as JSON (includes metadata)
npx defuddle parse https://example.com/article --json

# Save to file
npx defuddle parse https://example.com/article --md -o article.md

# Custom content selector
npx defuddle parse https://example.com/article --content-selector "article.main"

# Debug mode
npx defuddle parse https://example.com/article --debug
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--md` | Output as Markdown |
| `--json` | Output as JSON with metadata |
| `--html` | Output as clean HTML |
| `-o, --output` | Save to file |
| `--content-selector` | Custom CSS selector for main content |
| `--debug` | Enable debug logging |
| `--no-remove-hidden` | Keep CSS-hidden elements |
| `--no-remove-low-score` | Keep low-scoring elements |

## JavaScript API

### Browser
```javascript
import Defuddle from 'defuddle';

// Parse current page
const result = new Defuddle(document).parse();
console.log(result.content);  // Cleaned HTML
console.log(result.title);
console.log(result.text);    // Plain text

// Parse with options
const result = new Defuddle(document, {
  markdown: true,              // Convert to Markdown
  removeExactSelectors: true,  // Remove known ad elements
  removePartialSelectors: true // Remove broader clutter
}).parse();
```

### Node.js (Linkedom - Fast)
```javascript
import { parseHTML } from 'linkedom';
import { Defuddle } from 'defuddle/node';

const html = await fetch('https://example.com/article').then(r => r.text());
const { document } = parseHTML(html);

const result = await Defuddle(document, 'https://example.com/article', {
  markdown: true
});

console.log(result.content);  // Clean Markdown
console.log(result.title);
console.log(result.author);
console.log(result.publishedDate);
```

### Node.js (JSDOM - Full DOM)
```javascript
import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle/node';

const html = await fetch('https://example.com/article').then(r => r.text());
const dom = new JSDOM(html);
const document = dom.window.document;

const result = await Defuddle(document, 'https://example.com/article', {
  markdown: true
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `markdown` | boolean | false | Convert output to Markdown |
| `debug` | boolean | false | Enable debug logging |
| `removeExactSelectors` | boolean | true | Remove known ad/clutter selectors |
| `removePartialSelectors` | boolean | true | Remove broader clutter patterns |
| `removeHiddenElements` | boolean | true | Remove CSS-hidden elements |
| `removeLowScoring` | boolean | true | Remove navigation/link lists |
| `contentSelector` | string | auto | Custom CSS selector for main content |

## Output Structure

### JSON Output
```json
{
  "content": "# Article Title\n\nClean markdown content...",
  "html": "<article>Clean HTML...</article>",
  "text": "Plain text content...",
  "title": "Article Title",
  "author": "Author Name",
  "description": "Article description/summary",
  "publishedDate": "2026-03-26",
  "modifiedDate": "2026-03-26",
  "url": "https://example.com/article",
  "domain": "example.com",
  "image": "https://example.com/og-image.jpg",
  "wordCount": 1500,
  "readingTime": 6
}
```

## Metadata Extraction

Defuddle extracts metadata from multiple sources:

- `<title>` tag
- `<meta name="author">`
- `<meta property="article:published_time">`
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- Twitter Card tags
- Schema.org JSON-LD
- `<time>` elements with datetime

## HTML Standardization

Defuddle normalizes content:

- **Headings**: Converts `<h1>`-`<h6>` properly
- **Code blocks**: Preserves `<pre><code>` with language hints
- **Footnotes**: Handles footnote references
- **Math**: Preserves MathML and LaTeX
- **Images**: Extracts `src`, `alt`, `title`
- **Links**: Converts to Markdown links
- **Tables**: Preserves table structure
- **Lists**: Handles ordered/unordered lists

## Common Use Cases

### Extract Article for Obsidian
```bash
# Extract and save to vault
npx defuddle parse https://article.url --md -o ~/vault/Articles/article-name.md

# With frontmatter for Obsidian
npx defuddle parse https://article.url --json | jq '"---\ntitle: " + .title + "\nauthor: " + .author + "\ndate: " + .publishedDate + "\nsource: " + .url + "\n---\n\n" + .content' > article.md
```

### Batch Processing
```bash
#!/bin/bash
# Process multiple URLs
urls=(
  "https://example.com/article1"
  "https://example.com/article2"
  "https://example.com/article3"
)

for url in "${urls[@]}"; do
  filename=$(echo "$url" | md5sum | cut -d' ' -f1)
  npx defuddle parse "$url" --md -o "articles/${filename}.md"
done
```

### Integration Script
```javascript
// extract-content.js
import { parseHTML } from 'linkedom';
import { Defuddle } from 'defuddle/node';
import fs from 'fs';

async function extractArticle(url) {
  const html = await fetch(url).then(r => r.text());
  const { document } = parseHTML(html);

  const result = await Defuddle(document, url, { markdown: true });

  // Format as Obsidian note
  const frontmatter = `---
title: "${result.title}"
author: "${result.author || 'Unknown'}"
date: ${result.publishedDate || new Date().toISOString().split('T')[0]}
source: "${url}"
tags: [article, web]
---

`;

  return frontmatter + result.content;
}

const url = process.argv[2];
const content = await extractArticle(url);
fs.writeFileSync('article.md', content);
```

### Use with Obsidian CLI
```bash
# Extract and create note in vault
URL="https://example.com/article"
CONTENT=$(npx defuddle parse "$URL" --json | jq -r '"---\ntitle: \"" + .title + "\"\nsource: \"" + .url + "\"\ndate: " + .publishedDate + "\n---\n\n" + .content')

obsidian create name="Web Clips/$(date +%Y-%m-%d)-article" content="$CONTENT"
```

## Content Detection

Defuddle uses multiple strategies to find main content:

1. **Semantic HTML**: `<article>`, `<main>`, `<section>`
2. **Common patterns**: `.content`, `.post`, `.article`
3. **Mobile styles**: Uses mobile CSS to identify essential content
4. **Scoring algorithm**: Ranks elements by text density, links ratio
5. **Schema.org**: Reads structured data for content location

## Customization

### Custom Content Selector
If Defuddle doesn't find the right content:

```bash
# Specify custom selector
npx defuddle parse https://site.com/article --content-selector "div.main-content"
```

```javascript
// In JavaScript
const result = await Defuddle(document, url, {
  contentSelector: 'article.post-content'
});
```

### Preserve Elements
```javascript
const result = await Defuddle(document, url, {
  removeHiddenElements: false,  // Keep hidden elements
  removeLowScoring: false       // Keep navigation-like elements
});
```

## Limitations

- **JavaScript-rendered content**: Defuddle parses static HTML. For JS-heavy sites, use a headless browser first
- **Paywalled content**: Cannot access content behind authentication
- **Dynamic sites**: Single-page apps may need special handling

## Best Practices

1. **Use `--json` for metadata**: Get author, date, and other structured data
2. **Add `--debug` for troubleshooting**: See what Defuddle is removing
3. **Custom selectors for specific sites**: Use `--content-selector` for consistent results
4. **Combine with Obsidian CLI**: Pipe extracted content directly to vault
5. **Batch processing**: Save URLs to file and process in loop
6. **Check word count**: Use JSON output to filter short/incomplete articles

## Example Output

### Input (Messy Web Page)
```html
<!DOCTYPE html>
<html>
<head><title>How to Code - Example</title></head>
<body>
  <nav>...</nav>
  <aside class="sidebar">...</aside>
  <main>
    <article>
      <h1>How to Code: A Beginner's Guide</h1>
      <p>Clean content here...</p>
    </article>
  </main>
  <footer>...</footer>
  <div class="ads">...</div>
</body>
</html>
```

### Output (Clean Markdown)
```markdown
# How to Code: A Beginner's Guide

Clean content here...

Additional paragraphs without any clutter, navigation, or ads.
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty content | Try `--content-selector` with specific element |
| Too much removed | Use `--no-remove-low-score` flag |
| Missing metadata | Check if site uses Schema.org or Open Graph |
| JavaScript content | Use headless browser (Puppeteer) before Defuddle |
| Slow performance | Use linkedom instead of jsdom |