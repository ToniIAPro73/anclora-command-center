---
name: obsidian-note-crafter
description: Create or refactor durable Obsidian notes with good titles, properties, links, and sections. Use when Codex needs to draft project notes, evergreen notes, area notes, summaries, or templates that should fit a well-linked Obsidian vault.
---

# Obsidian Note Crafter

Use this skill when the note should become a stable part of the vault rather than a temporary capture.

Aim for notes that are easy to scan, easy to rename, and easy to connect. Prefer one clear idea per note unless the user explicitly wants a dashboard or project brief.

## Workflow

1. Pick the note type:
   - `02 Proyectos` for work with an outcome and moving parts
   - `03 Areas` for ongoing responsibilities
   - `04 Recursos` for reusable knowledge
2. Shape the note:
   - Use a title that still makes sense out of context
   - Start with a 1-3 sentence summary
   - Add only the properties that improve filtering or maintenance
3. Link with intent:
   - Prefer links to notes that already exist
   - Create placeholder links only when they represent a real next concept
   - Use aliases if the user naturally refers to the idea in multiple ways
4. Close the loop:
   - Add `## Relacionado`
   - Add `## Próxima acción` for project notes when appropriate

## Default property patterns

Project note:

```yaml
---
tipo: proyecto
estado: activo
creado: 2026-03-26
---
```

Reference note:

```yaml
---
tipo: recurso
fuente:
creado: 2026-03-26
---
```

## When to read references

- Read [references/note-schemas.md](./references/note-schemas.md) when choosing sections or property patterns for a note.

## Output standard

Write markdown that respects Obsidian links and can live in the vault without further cleanup.
