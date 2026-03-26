---
name: obsidian-capture-flow
description: Capture rough inputs into an Obsidian vault without losing context. Use when Codex needs to turn chats, ideas, links, meeting notes, or clipped material into inbox notes, daily notes, or clean first-draft markdown for Obsidian.
---

# Obsidian Capture Flow

Use this skill when the user has raw material and wants it stored in the vault fast, cleanly, and in a way that is easy to refine later.

Keep capture lightweight. Prefer a short note with clear provenance, a few properties, and 1-3 deliberate links over an over-designed note that slows intake.

## Workflow

1. Decide the destination:
   - `00 Inbox` for unprocessed captures
   - `01 Diario` for day-bound notes, logs, and quick reflections
   - `04 Recursos` for stable reference material that is already useful as-is
2. Preserve source context:
   - Keep the original URL, date, speaker, or source note
   - Label inferred content as interpretation, not fact
3. Normalize the note:
   - Add a clear title
   - Add a small property block only when it helps retrieval
   - End with `## Siguientes pasos` if the note is not yet complete
4. Add links:
   - Link to one current project, area, or concept if known
   - Avoid tag spam and avoid creating many empty placeholder notes

## Default property pattern

Use only the fields that add value:

```yaml
---
tipo: captura
estado: borrador
fuente:
creado: 2026-03-26
---
```

## When to read references

- Read [references/capture-patterns.md](./references/capture-patterns.md) when choosing between inbox, daily notes, and resource notes.

## Output standard

Produce markdown that can be pasted directly into the vault. If the user did not ask for a final location, choose the safest lightweight destination and state the assumption.
