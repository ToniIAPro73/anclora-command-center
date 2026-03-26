---
name: obsidian-markdown
description: Create and edit Obsidian Flavored Markdown files with proper wikilinks, embeds, callouts, properties/frontmatter, and tags. Use this skill when working with .md files in an Obsidian vault.
---

# Obsidian Flavored Markdown Skill

You are working with Obsidian, a knowledge base application. This skill teaches you how to properly format Obsidian-specific markdown syntax.

## Wikilinks (Internal Links)

Obsidian uses wikilinks instead of standard markdown links for internal references.

### Basic Wikilinks
- `[[Note Name]]` - Link to a note
- `[[Note Name|Display Text]]` - Link with custom display text
- `[[Note Name#Heading]]` - Link to a specific heading within a note
- `[[Note Name#^block-id]]` - Link to a specific block using its block ID
- `[[##search term]]` - Search all headings containing the term
- `[[^^search term]]` - Search all blocks containing the term

### Embeds (Transclusions)
Prefix wikilinks with `!` to embed content:
- `![[Note Name]]` - Embed entire note
- `![[Note Name#Heading]]` - Embed specific heading
- `![[Note Name#^block-id]]` - Embed specific block
- `![[image.png]]` - Embed an image
- `![[image.png|300]]` - Embed image with specified width (in pixels)
- `![[video.mp4]]` - Embed video file
- `![[audio.mp3]]` - Embed audio file

### Block IDs
To create a linkable block, add a block ID:
```markdown
This is a paragraph or list item. ^block-id
```

## YAML Frontmatter (Properties)

Obsidian uses YAML frontmatter at the start of files for metadata. Properties are displayed in the sidebar.

### Property Types
| Type | YAML Syntax | Example |
|------|-------------|---------|
| Text | `key: value` | `title: My Note Title` |
| Number | `key: number` | `rating: 4.5` |
| Checkbox | `key: boolean` | `completed: true` |
| Date | `key: YYYY-MM-DD` | `date: 2026-01-15` |
| DateTime | `key: YYYY-MM-DDTHH:mm:ss` | `due: 2026-01-15T14:30:00` |
| List | `key: [items]` or YAML list | `tags: [one, two]` |
| Links | `key: "[[link]]"` | `related: "[[Other Note]]"` |

### Standard Frontmatter Example
```yaml
---
title: Note Title
date: 2026-03-26
tags: [project, active, important]
aliases: [Alternative Name, Another Name]
cssclasses: [custom-style, dark-mode]
author: "[[John Doe]]"
status: in-progress
related:
  - "[[Project Overview]]"
  - "[[Meeting Notes]]"
---
```

### Important Notes on Properties
- **Wikilinks in frontmatter MUST be quoted**: `related: "[[Note]]"`
- **Tags can use two formats**: `tags: [tag1, tag2]` OR inline `#tag` in body
- **Aliases** allow the note to be found by alternative names

## Callouts (Admonitions)

Callouts are styled blocks for highlighting information:

### Basic Callout
```markdown
> [!note] Title
> Content goes here.
```

### Callout Types
- `[!note]` - Default note
- `[!info]` - Information
- `[!tip]` - Helpful tip
- `[!success]` / `[!check]` - Success/completed
- `[!warning]` / `[!caution]` - Warning
- `[!danger]` / `[!error]` - Error/danger
- `[!bug]` - Bug warning
- `[!example]` - Example
- `[!quote]` - Quote
- `[!abstract]` / `[!summary]` - Summary
- `[!todo]` - Todo items
- `[!question]` / `[!help]` / `[!faq]` - Question/FAQ
- `[!failure]` / `[!fail]` / `[!missing]` - Failure
- `[!example]` - Example

### Foldable Callouts
Add `+` or `-` after the type:
```markdown
> [!note]+ Click to expand
> Hidden content revealed on click.

> [!note]- Click to collapse
> Content starts hidden.
```

### Nested Callouts
```markdown
> [!note] Outer callout
> > [!tip] Nested callout
> > Content in nested callout.
```

## Tags

Two ways to add tags:
1. **In frontmatter**: `tags: [tag1, tag2, tag3]`
2. **Inline in body**: `#tag1 #tag2`

Tag naming rules:
- Can contain letters, numbers, underscores, hyphens
- Can be nested: `#project/active`, `#project/completed`
- Cannot contain spaces (use hyphens instead)

## Footnotes

```markdown
Here is some text[^1].

[^1]: This is the footnote content.

Or use inline footnotes:
Here is text with an inline footnote^[This footnote appears inline].
```

## Comments

Comments are not rendered in reading view:
```markdown
%%This is a comment and won't be displayed%%
```

## Code Blocks with Syntax Highlighting

```markdown
\`\`\`language
code here
\`\`\`

# Examples:
\`\`\`javascript
console.log("Hello");
\`\`\`

\`\`\`python
print("Hello")
\`\`\`
```

## Task Lists

```markdown
- [ ] Incomplete task
- [x] Completed task
- [ ] Another task with due date 📅 2026-03-26
- [ ] Task with priority ⏫ (high) / 🔼 (medium) / ⏬ (low)
- [ ] Task with recurrence 🔁 daily
- [ ] Task with dependencies ⛓️ [[Other Task]]
```

## Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

# Alignment with colons:
| Left | Center | Right |
|:-----|:------:|------:|
| Left | Center | Right |
```

## Best Practices

1. **Prefer wikilinks over markdown links** for internal references - they enable backlinks and graph view
2. **Use frontmatter properties** for structured metadata
3. **Use callouts** to highlight important information
4. **Use block IDs sparingly** - only when you need to link to specific blocks
5. **Quote wikilinks in frontmatter** to avoid YAML parsing errors
6. **Keep frontmatter minimal** - only include properties that add value
7. **Use aliases** for notes with long names or common misspellings

## Example Complete Note

```markdown
---
title: Project Planning Guide
date: 2026-03-26
tags: [project, planning, guide]
aliases: [Planning Guide, Project Guide]
status: active
related:
  - "[[Project Overview]]"
  - "[[Timeline]]"
---

# Project Planning Guide

## Overview

This guide covers project planning best practices.

> [!tip] Quick Start
> Start with the [[Project Overview]] for a high-level view.

## Key Phases

1. **Discovery** - Define requirements
2. **Planning** - Create timeline
3. **Execution** - Implement
4. **Review** - Evaluate

> [!warning] Common Pitfalls
> - Skipping the discovery phase
> - Unrealistic timelines
> - Scope creep

## Resources

- [[Project Template]]
- [[Meeting Notes]]
- [[Stakeholder Map]]

## Tasks

- [ ] Review project scope
- [ ] Schedule kickoff meeting
- [ ] Create project charter

%%
Private notes that won't render in reading view
%%
```