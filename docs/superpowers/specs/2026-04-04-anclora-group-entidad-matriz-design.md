---
title: anclora-group como Entidad Matriz
type: spec
estado: activo
tags: [spec, anclora-group, governance, branding]
related:
  - "[[Anclora Group]]"
  - "[[APPLICATION_FAMILY_MAP]]"
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[Alta de Nueva Aplicación Anclora]]"
---

# anclora-group como Entidad Matriz

## Objetivo

Regularizar `anclora-group` como si su alta se hubiera hecho correctamente desde el principio. Eso implica tres capas coordinadas:

1. corregir la gobernanza de la bóveda para que `anclora-group` deje de tratarse como app `Internal`
2. rehacer su documentación canónica como entidad matriz del ecosistema
3. adaptar el repo real `anclora-group` para que cumpla los contratos nuevos de branding ya definidos en la bóveda

Esta fase no diseña activos gráficos nuevos. El logo, la paleta final y el favicon package definitivos los aportará el usuario. La responsabilidad de esta fase es dejar la app y la documentación listas para integrarlos correctamente y, donde ya exista suficiente información contractual, adaptar la implementación.

## Contexto

Hasta ahora, la gobernanza histórica del sistema arrastraba una clasificación impropia:

- `anclora-group` aparecía como app `Internal`
- parte de la documentación la trataba como portal/app equivalente al resto
- el nuevo sistema de branding ya lo distingue como caso único: `Entidad Matriz`

La decisión validada para esta fase es:

- `anclora-group` **mantiene contratos UX/UI universales**
- `anclora-group` **no pertenece** a `Internal`, `Premium`, `Ultra Premium` ni `Portfolio`
- `anclora-group` pasa a una categoría formal nueva: **Entidad Matriz**
- su diferenciación principal se gobierna por la capa `ANCLORA_BRANDING_*`

## Resultado esperado

Al finalizar esta fase:

- la bóveda describe `anclora-group` como **Entidad Matriz**
- la nota [Anclora Group](c:/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora/resources/anclora-group.md) queda reescrita como nota canónica de alta correcta
- la gobernanza deja de mezclar entidad corporativa y familia de app interna
- el repo `anclora-group` queda adaptado a los nuevos requisitos de branding en todo lo que no dependa de activos gráficos aún no entregados
- los huecos que dependan de assets finales del usuario quedan identificados de forma explícita

## Decisiones de diseño

### 1. Nueva categoría formal: Entidad Matriz

La gobernanza incorporará `Entidad Matriz` como categoría explícita. Esta categoría:

- sí usa contratos universales:
  - `UI_MOTION_CONTRACT.md`
  - `MODAL_CONTRACT.md`
  - `LOCALIZATION_CONTRACT.md`
- no usa contrato de familia UX/UI adicional por ahora
- sí usa branding propio y exclusivo según:
  - `ANCLORA_BRANDING_MASTER_CONTRACT.md`
  - `ANCLORA_BRANDING_ICON_SYSTEM.md`
  - `ANCLORA_BRANDING_COLOR_TOKENS.md`
  - `ANCLORA_BRANDING_TYPOGRAPHY.md`
  - `ANCLORA_BRANDING_FAVICON_SPEC.md`

### 2. Reescritura canónica de la nota Anclora Group

La nota `resources/anclora-group.md` se tratará como si hubiera sido creada correctamente desde el inicio del sistema. Debe dejar claros:

- rol de `anclora-group` como empresa matriz
- rol de `anclora-group` como portal corporativo del ecosistema
- clasificación UX/UI: `Entidad Matriz`
- clasificación de branding: `Única`
- repo, superficie, relaciones, contratos aplicables y branding aplicable

La nota no debe presentar a `anclora-group` como una app interna más. Debe presentarlo como el nodo corporativo superior del ecosistema.

### 3. Adaptación real del repo

La implementación en el repo `anclora-group` tendrá como objetivo cumplir la nueva base contractual de branding usando lo ya documentado.

El trabajo incluye:

- revisar tipografía actual y migrarla si contradice `ANCLORA_BRANDING_TYPOGRAPHY.md`
- revisar tokens y variables de color y alinearlos con `ANCLORA_BRANDING_COLOR_TOKENS.md`
- revisar naming y estructura de brand assets
- revisar referencias de favicon/icon
- revisar cualquier incoherencia visible entre marca actual y contrato

No incluye:

- inventar o diseñar un logo nuevo
- inventar una paleta final distinta de la ya documentada
- generar manualmente el paquete definitivo de favicons si el usuario aún no lo ha creado

Si faltan archivos finales del usuario, se dejará la integración preparada y documentada.

## Documentos a actualizar en la bóveda

Mínimo:

- `docs/governance/APPLICATION_FAMILY_MAP.md`
- `docs/governance/CONTRACT_HIERARCHY.md`
- `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- `resources/anclora-group.md`

Probablemente también:

- `resources/anclora-group-chatgpt-project/*` donde todavía se arrastre una lectura antigua
- otros recursos o MOCs donde `anclora-group` esté descrito como app interna

## Verificación requerida

La fase se considerará correcta solo si se verifican dos cosas:

### Gobernanza y documentación

- `anclora-group` ya no aparece como `Internal`
- `Entidad Matriz` aparece como categoría explícita y coherente
- la nota `Anclora Group` queda consistente con la nueva gobernanza

### Repo real

- el repo `anclora-group` usa la tipografía correcta o queda preparado para ello
- los colores y tokens de marca se ajustan al contrato o quedan alineados a la nueva estructura
- las referencias de icono/favicon siguen una estructura compatible con la spec
- cualquier incumplimiento residual queda documentado como dependencia de assets finales del usuario

## Riesgos

- mezclar branding contractual con decisiones todavía pendientes de assets reales
- corregir documentación sin validar el repo real
- reescribir `Anclora Group` sin dejar clara la diferencia entre empresa matriz y app portal

## Fuera de alcance

Esta fase no aborda todavía:

- `anclora-advisor-ai`
- `anclora-nexus`
- `anclora-content-generator-ai`
- `anclora-command-center`
- el resto de apps del ecosistema

La fase se centra únicamente en `anclora-group` como primer caso de regularización retroactiva.
