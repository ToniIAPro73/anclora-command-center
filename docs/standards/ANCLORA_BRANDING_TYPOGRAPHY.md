---
title: ANCLORA_BRANDING_TYPOGRAPHY
type: standard
estado: activo
scope: branding
tags: [branding, standards, anclora, typography]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
---

# ANCLORA_BRANDING_TYPOGRAPHY

> Referencia: [[ANCLORA_BRANDING_MASTER_CONTRACT]]

## Objetivo

Definir los stacks tipográficos por categoría de aplicación. La tipografía es un diferenciador de grupo y debe mantenerse consistente dentro de cada categoría.

## Stacks por categoría

### Group · entidad única

| Rol | Fuente | Peso | Fallback |
|-----|--------|------|----------|
| Body / UI | Georgia | `400` | `serif` |
| Labels / Caps | Georgia | `700` | `serif` |

Justificación: `anclora-group` usa serif para diferenciarse de las apps operativas. Transmite institucionalidad y autoridad corporativa.

### Internas

| Rol | Fuente | Peso | Fallback | Variable CSS |
|-----|--------|------|----------|-------------|
| Display / H1-H2 | Inter | `600-700` | `system-ui, sans-serif` | `--font-sans` |
| Body / UI | Inter | `400-500` | `system-ui, sans-serif` | `--font-sans` |
| Monospace | JetBrains Mono | `400` | `monospace` | `--font-mono` |

Justificación: Inter es adecuada para interfaces operativas densas. Ya está en uso en Nexus y reduce la carga de fuentes.

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Premium

| Rol | Fuente | Peso | Fallback | Variable CSS |
|-----|--------|------|----------|-------------|
| Display / H1-H2 | DM Sans | `600-700` | `system-ui, sans-serif` | `--font-sans` |
| Body / UI | DM Sans | `400-500` | `system-ui, sans-serif` | `--font-sans` |
| Monospace | JetBrains Mono | `400` | `monospace` | `--font-mono` |

Justificación: DM Sans aporta un carácter más redondo y accesible, adecuado para productos orientados a usuario final.

```css
--font-sans: 'DM Sans', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Ultra Premium

| Rol | Fuente | Peso | Fallback | Variable CSS |
|-----|--------|------|----------|-------------|
| Display / H1-H2 | Playfair Display | `500-600` | `Georgia, serif` | `--font-display` |
| Body / UI | Inter | `400` | `system-ui, sans-serif` | `--font-sans` |

Justificación: Playfair Display aporta la elegancia editorial que requiere el lujo inmobiliario. El cuerpo mantiene claridad con Inter.

```css
--font-display: 'Playfair Display', Georgia, serif;
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
```

## Reglas de uso

1. No mezclar stacks entre grupos.
2. Los pesos son estrictos: display `600-700`, body `400-500`.
3. `letter-spacing`: `0.05em` para body, `0.12em` para labels uppercase, `0.02em` para headings.
4. Tamaño mínimo de body: `14px` en desktop, `16px` en móvil.
5. `line-height`: `1.5` para body, `1.2` para headings, `1.0` para labels uppercase.

## Migración requerida

| App | Estado actual | Acción |
|-----|--------------|--------|
| `anclora-group` | Georgia ✓ | Sin cambios |
| `anclora-advisor-ai` | Sin fuente declarada | Añadir Inter |
| `anclora-nexus` | Inter + Playfair Display | Eliminar Playfair, mantener Inter |
| `anclora-content-generator-ai` | DM Sans + Bricolage Grotesque | Migrar a Inter |
| Apps premium | Varias o sin definir | Adoptar DM Sans |
| `anclora-private-estates` | Por confirmar | Adoptar Playfair + Inter |
