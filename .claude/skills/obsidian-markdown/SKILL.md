---
name: obsidian-markdown
description: Write and edit Obsidian markdown with correct wikilinks, frontmatter, callouts, and note structure. Use when Codex is modifying .md files inside the vault.
---

# Obsidian Markdown

Use this skill when the task involves writing or refactoring markdown that should live comfortably inside an Obsidian vault.

Treat this as a support skill: it handles syntax and formatting, while higher-level note design should usually come from `obsidian-capture-flow`, `obsidian-note-crafter`, or `obsidian-vault-gardener`.

## Workflow

1. Confirm the note's role:
   - capture
   - durable note
   - maintenance edit
2. Apply Obsidian-native formatting:
   - internal links with `[[wikilinks]]`
   - minimal useful frontmatter
   - sections that are easy to scan
3. Preserve vault quality:
   - avoid noisy placeholder links
   - avoid markdown links for internal notes
   - keep tags and properties intentional

## Guardrails

* Do not assume `related` in frontmatter is enough; add body links when relationships matter.
* Do not overuse callouts, aliases, or tags.
* Prefer readability over metadata bloat.

## When to read references

* Read [references/obsidian-markdown-reference.md](./references/obsidian-markdown-reference.md) for syntax patterns and examples.

## Output standard

Produce markdown that can be saved directly in the vault without cleanup.
