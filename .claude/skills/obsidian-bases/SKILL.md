---
name: obsidian-bases
description: Create and refine Obsidian .base files for structured note views. Use when Codex needs database-like views over notes, properties, and folders.
---

# Obsidian Bases

Use this skill when the user needs a structured view over notes rather than a prose note or raw data file.

This skill is best for creating or editing `.base` files that surface projects, people, resources, or tasks in a more queryable way.

## Workflow

1. Define the purpose of the base:
   - dashboard
   - project tracker
   - people index
   - review queue
2. Match sources to real vault structure.
3. Keep fields and filters aligned with actual note properties.
4. Prefer simple, reliable views before advanced formulas.

## Guardrails

* Do not invent many new property keys just to satisfy a base.
* Prefer consistency with the vault over maximum complexity.
* Avoid large-scope sources unless the user explicitly wants a global view.

## When to read references

* Read [references/obsidian-bases-reference.md](./references/obsidian-bases-reference.md) for the basic YAML shape and common patterns.

## Output standard

Produce a `.base` definition that is valid, focused, and easy to maintain.
