---
name: json-canvas
description: Create and edit Obsidian .canvas files with valid nodes, edges, and group structure. Use when Codex is working on visual knowledge maps or canvas-based layouts.
---

# JSON Canvas

Use this skill when the user wants a visual canvas, map, or spatial layout in Obsidian.

Treat it as a technical implementation skill: decide the conceptual structure first, then encode it in valid `.canvas` JSON.

## Workflow

1. Identify the canvas goal:
   - mind map
   - workflow map
   - project overview
   - relationship graph
2. Choose the right node types:
   - `file` for notes
   - `text` for explanations
   - `group` for clustering
   - `link` for external resources
3. Add edges only where they clarify meaning.

## Guardrails

* Do not create overly dense canvases by default.
* Prefer file nodes when notes already exist in the vault.
* Keep coordinates and grouping readable rather than tightly packed.

## When to read references

* Read [references/json-canvas-reference.md](./references/json-canvas-reference.md) for the core schema and layout rules.

## Output standard

Produce valid `.canvas` JSON that is easy to inspect and maintain.
