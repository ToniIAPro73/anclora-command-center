---
title: ANCLORA_BRANDING_ICON_SYSTEM
type: standard
estado: activo
scope: branding
tags: [branding, standards, anclora, icon-system]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
  - "[[ANCLORA_BRANDING_FAVICON_SPEC]]"
---

# ANCLORA_BRANDING_ICON_SYSTEM

> Referencia: [[ANCLORA_BRANDING_MASTER_CONTRACT]]

## Objetivo

Definir el color, materialidad y estructura de cada icono del ecosistema Anclora. Cualquier generación o modificación de un icono debe seguir esta especificación.

## Estructura del icono

Todos los iconos comparten la misma geometría:
- **Forma**: círculo con tres ondas horizontales centradas
- **Proporciones**: borde exterior ≈ `7%` del radio, interior ≈ `93%`
- **Textura interior**: cuero fino o grano metálico sutil
- **Tamaño canónico**: `1024x1024 px`
- **Fondo**: transparente, PNG con canal alfa

## Bordes por categoría

### Group · entidad única · plata cromada monocromática

| Nivel | Hex | RGB |
|-------|-----|-----|
| Peak | `#D0D4DC` | `(208, 212, 220)` |
| Medio | `#A8AEB8` | `(168, 174, 184)` |
| Sombra | `#6E7580` | `(110, 117, 128)` |

Ondas = mismo color que el borde. Esquema monocromático.

### Internas · plata cromada

| Nivel | Hex | RGB |
|-------|-----|-----|
| Peak | `#D0D4DC` | `(208, 212, 220)` |
| Medio | `#A8AEB8` | `(168, 174, 184)` |
| Sombra | `#6E7580` | `(110, 117, 128)` |

### Premium · cobre rosado

| Nivel | Hex | RGB |
|-------|-----|-----|
| Peak | `#E0A090` | `(224, 160, 144)` |
| Medio | `#C07860` | `(192, 120, 96)` |
| Sombra | `#805040` | `(128, 80, 64)` |

### Ultra Premium · oro pulido

| Nivel | Hex | RGB |
|-------|-----|-----|
| Peak | `#F0D060` | `(240, 208, 96)` |
| Medio | `#D4AF37` | `(212, 175, 55)` |
| Sombra | `#8B7322` | `(139, 115, 34)` |

## Mapa completo de iconos

| Categoría | App | Borde | Ondas | Interior | Hue ondas |
|-----------|-----|-------|-------|----------|-----------|
| Única | `anclora-group` | Plata | `#A8AEB8` plata | `#1A1E2A` navy | `220°` |
| Interna | `anclora-advisor-ai` | Plata | `#1DAB89` teal | `#162944` navy azul | `162°` |
| Interna | `anclora-nexus` | Plata | `#D4AF37` oro | `#192350` navy índigo | `45°` |
| Interna | `anclora-content-generator-ai` | Plata | `#E06848` coral | `#1A1410` carbón cálido | `12°` |
| Premium | `anclora-impulso` | Cobre | `#FF6A00` naranja | `#1A1C2B` navy | `25°` |
| Premium | `anclora-data-lab` | Cobre | `#2DA078` esmeralda | `#12201C` navy verde | `155°` |
| Premium | `anclora-talent` | Cobre | `#4A9FD8` azul cielo | `#141E28` navy azul | `205°` |
| Premium | `anclora-synergi` | Cobre | `#8C5AB4` púrpura | `#1C162A` navy púrpura | `280°` |
| Premium | `anclora-command-center` | Cobre | `#CC4455` rojo granate | `#1A1218` carbón rojo | `355°` |
| Ultra | `anclora-private-estates` | Oro | `#D4AF37` oro | `#1A3035` teal oscuro | `45°` |

## Regla de lectura visual

| Observación | Significado |
|-------------|-------------|
| Ondas = mismo color que borde | `Group` entidad única |
| Borde plata + ondas de color | App interna |
| Borde cobre + ondas de color | App premium |
| Borde oro + ondas de color | App ultra premium |

## Separación mínima de hue entre ondas

Separación mínima recomendada: `30°`. Si es inferior, los interiores deben ser de temperatura cromática radicalmente distinta.

### Internas

| Par | Separación | Validación |
|-----|------------|------------|
| Coral `12°` ↔ Oro `45°` | `33°` | ✓ interiores: carbón cálido vs navy índigo |
| Oro `45°` ↔ Teal `162°` | `117°` | ✓ |
| Teal `162°` ↔ Coral `12°` | `210°` | ✓ |

### Premium

| Par | Separación | Validación |
|-----|------------|------------|
| Naranja `25°` ↔ Esmeralda `155°` | `130°` | ✓ |
| Esmeralda `155°` ↔ Azul cielo `205°` | `50°` | ✓ |
| Azul cielo `205°` ↔ Púrpura `280°` | `75°` | ✓ |
| Púrpura `280°` ↔ Rojo `355°` | `75°` | ✓ |
| Rojo `355°` ↔ Naranja `25°` | `30°` | ✓ interiores: carbón rojo vs navy |

## Prompts de generación AI

### Template base

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished [MATERIAL] metallic ([BORDER_HEX]) with beveled edges, inner background [INTERIOR_DESC] ([INTERIOR_HEX]) with subtle leather grain texture, waves brushed [WAVE_DESC] metal ([WAVE_HEX]) with soft highlights, black background, 3D render, no text, same proportions and wave spacing as reference
```

### Group

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished chrome silver metallic (#A8AEB8) with beveled edges, inner background dark navy (#1A1E2A) with subtle leather grain texture, waves brushed silver metal matching the border ring color, monochromatic silver scheme, black background, 3D render, no text
```

### Advisor AI

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished chrome silver metallic (#A8AEB8) with beveled edges, inner background dark navy blue (#162944) with subtle leather grain texture, waves brushed teal green metal (#1DAB89) with soft highlights, black background, 3D render, no text
```

### Nexus

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished chrome silver metallic (#A8AEB8) with beveled edges, inner background deep indigo navy (#192350) with subtle leather grain texture, waves brushed gold metal (#D4AF37) with soft highlights, black background, 3D render, no text
```

### Content Generator AI

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished chrome silver metallic (#A8AEB8) with beveled edges, inner background warm dark charcoal (#1A1410) with subtle leather grain texture, waves brushed coral orange metal (#E06848) with soft highlights, black background, 3D render, no text
```

### Impulso

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished brushed rose copper metallic (#C07860) with beveled edges, inner background dark navy (#1A1C2B) with subtle leather grain texture, waves bright orange metal (#FF6A00) with soft highlights, black background, 3D render, no text
```

### Data Lab

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished brushed rose copper metallic (#C07860) with beveled edges, inner background dark navy green (#12201C) with subtle leather grain texture, waves emerald green metal (#2DA078) with soft highlights, black background, 3D render, no text
```

### Talent

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished brushed rose copper metallic (#C07860) with beveled edges, inner background dark navy blue (#141E28) with subtle leather grain texture, waves sky blue metal (#4A9FD8) with soft highlights, black background, 3D render, no text
```

### Synergi

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished brushed rose copper metallic (#C07860) with beveled edges, inner background dark navy purple (#1C162A) with subtle leather grain texture, waves purple metal (#8C5AB4) with soft highlights, black background, 3D render, no text
```

### Command Center

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished brushed rose copper metallic (#C07860) with beveled edges, inner background dark reddish charcoal (#1A1218) with subtle leather grain texture, waves dark garnet red metal (#CC4455) with soft highlights, black background, 3D render, no text
```

### Private Estates

```text
Circular emblem, three horizontal smooth wave lines, outer ring polished gold metallic (#D4AF37) with beveled edges, inner background dark teal (#1A3035) with subtle leather grain texture, waves brushed gold metal (#D4AF37) with soft highlights, black background, 3D render, no text
```

## Proceso de alta de nueva app

1. Asignar categoría: interna, premium o ultra premium.
2. Elegir color de ondas con hue separado mínimo `30°` de las apps existentes en el mismo grupo.
3. Elegir color de interior con navy tintado por el hue de las ondas, luminosidad `4-8%`.
4. Generar icono con el prompt template adaptado.
5. Generar favicon package según [[ANCLORA_BRANDING_FAVICON_SPEC]].
6. Registrar en la tabla de este documento.
