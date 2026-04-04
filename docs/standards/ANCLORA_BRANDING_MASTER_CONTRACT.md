---
title: ANCLORA_BRANDING_MASTER_CONTRACT
type: standard
estado: activo
scope: branding
tags: [branding, standards, anclora, contract]
related:
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
  - "[[ANCLORA_BRANDING_TYPOGRAPHY]]"
  - "[[ANCLORA_BRANDING_FAVICON_SPEC]]"
  - "[[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]]"
---

# ANCLORA_BRANDING_MASTER_CONTRACT

## Objetivo

Definir el sistema de identidad visual completo del ecosistema Anclora: logos, paletas de color, tipografía, iconografía y reglas de uso. Este contrato es la referencia única para cualquier decisión de branding en cualquier aplicación del ecosistema.

## Ruta canónica

- `docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md`

## Regla de publicación

- La bóveda Obsidian mantiene la copia maestra.
- Cada aplicación debe referenciar este contrato en su propio `docs/standards/`.
- Si se modifica un token de branding a nivel ecosistema, todas las aplicaciones afectadas deben actualizarse en la misma ronda.

## Documentos que componen el sistema de branding

| Documento | Alcance |
|-----------|---------|
| `ANCLORA_BRANDING_MASTER_CONTRACT.md` | Este documento. Índice maestro y reglas globales. |
| `ANCLORA_BRANDING_ICON_SYSTEM.md` | Sistema de iconos: estructura, materialidad, colores por app. |
| `ANCLORA_BRANDING_COLOR_TOKENS.md` | Tokens CSS de color para cada app. |
| `ANCLORA_BRANDING_TYPOGRAPHY.md` | Tipografía por entidad, grupo y app. |
| `ANCLORA_BRANDING_FAVICON_SPEC.md` | Especificación de favicons y Apple Touch Icons. |

## Orden de lectura obligatorio

Al crear una app nueva:
1. [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]] para clasificar la app desde el punto de vista UX/UI.
2. [[ANCLORA_BRANDING_MASTER_CONTRACT]].
3. [[ANCLORA_BRANDING_ICON_SYSTEM]] para asignar color de ondas.
4. [[ANCLORA_BRANDING_COLOR_TOKENS]] para copiar tokens base y definir accent.
5. [[ANCLORA_BRANDING_TYPOGRAPHY]] para copiar stack tipográfico.
6. [[ANCLORA_BRANDING_FAVICON_SPEC]] para generar favicon package.
7. Registrar la nueva app en los contratos de branding que correspondan:
   - icono y hue en [[ANCLORA_BRANDING_ICON_SYSTEM]]
   - tokens y paleta en [[ANCLORA_BRANDING_COLOR_TOKENS]]
   - stack tipográfico en [[ANCLORA_BRANDING_TYPOGRAPHY]]
   - favicon package y nomenclatura en [[ANCLORA_BRANDING_FAVICON_SPEC]]

Al modificar la identidad de una app existente:
1. [[ANCLORA_BRANDING_MASTER_CONTRACT]]
2. el contrato de branding específico que aplique
3. documentar la excepción si la hay

## Clasificación de identidad

| Categoría | Apps | Borde de icono | Descripción |
|-----------|------|---------------|-------------|
| Única | `anclora-group` | Plata monocromática | Entidad matriz y lobby corporativo. Identidad exclusiva fuera de grupos de producto. |
| Interna | `anclora-advisor-ai`, `anclora-nexus`, `anclora-content-generator-ai` | Plata cromada | Herramientas operativas internas. |
| Premium | `anclora-impulso`, `anclora-talent`, `anclora-data-lab`, `anclora-synergi`, `anclora-command-center` | Cobre rosado | Productos de valor añadido. |
| Ultra Premium | `anclora-private-estates`, `anclora-private-estates-landing-page` | Oro pulido | Marca de lujo inmobiliario. |
| Portfolio | `anclora-portfolio`, `anclora-azure-bay-landing`, `anclora-playa-viva-uniestate` | Definido por proyecto | Fuera de alcance de este contrato. |

## Regla de escalera visual

```text
PLATA MONO (Group) -> PLATA + color (internas) -> COBRE (premium) -> ORO (ultra premium)
```

El borde del icono comunica la categoría. Las ondas comunican la app. El interior refuerza la personalidad cromática.

## Invariantes globales de branding

1. **Símbolo fundacional**: círculo + tres ondas horizontales. Todas las apps del ecosistema, excepto portfolio, usan este símbolo.
2. **Proporciones**: todas las variantes del icono mantienen exactamente las mismas proporciones, diámetro, separación entre ondas y forma de ondas.
3. **Fondo transparente**: todo icono se entrega en PNG con canal alfa.
4. **Tamaño canónico**: `1024x1024 px`.
5. **No se permite texto dentro del icono**.
6. **Zona de exclusión mínima**: `0.25x` diámetro del emblema en todas las direcciones.

## Criterio de cumplimiento

Una app no cumple el contrato de branding si:
- usa colores de acento que no coinciden con los tokens definidos en [[ANCLORA_BRANDING_COLOR_TOKENS]]
- usa un borde de icono que no corresponde a su grupo
- modifica las proporciones del icono fundacional
- introduce tipografía no declarada en [[ANCLORA_BRANDING_TYPOGRAPHY]]
- no incluye el favicon package completo según [[ANCLORA_BRANDING_FAVICON_SPEC]]
- define branding para una app nueva pero no lo registra en los contratos canónicos de branding
