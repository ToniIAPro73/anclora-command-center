# Obsidian Markdown Reference

## Core rules
* Use `[[wikilinks]]` for internal notes.
* Quote wikilinks inside YAML values when needed.
* Prefer minimal frontmatter.
* Add callouts only when they improve scanning.
* Use tags sparingly and intentionally.

## Common patterns

### Wikilink
```md
[[Nombre de nota]]
[[Nombre de nota|Texto visible]]
[[Nombre de nota#Encabezado]]
```

### Frontmatter
```yaml
---
title: Mi nota
tags: [research]
related:
  - "[[Otra nota]]"
---
```

### Callout
```md
> [!note] Titulo
> Contenido relevante
```

### Task
```md
- [ ] Siguiente accion
```
