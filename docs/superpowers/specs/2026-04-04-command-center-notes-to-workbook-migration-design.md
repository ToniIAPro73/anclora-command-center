---
title: Diseño de migración final del pipeline notas a workbook para Command Center
status: proposed
related:
  - "[[Anclora Command Center]]"
  - "[[Anclora Cuadro de Mando Real Estate]]"
  - "[[Anclora Group]]"
---

# Diseño de migración final del pipeline notas a workbook para Command Center

## Objetivo

Completar la migración pendiente para que `anclora-command-center` pueda ejecutar por sí sola el flujo completo:

1. `notas canónicas -> workbook`
2. `workbook -> dataset.json`
3. `dataset.json -> vista /real-estate`

La meta es eliminar la dependencia operativa restante de `dashboard-cuadro-de-mando/` sin cambiar el contrato del dataset ni romper el flujo actual basado en `resources/dashboard-real-estate/`.

## Estado actual

Hoy `dashboard/` ya contiene:

- la app unificada
- la vista `real-estate`
- el script `sync-real-estate-dataset.mjs`

Pero el paso previo, `notas -> workbook`, sigue viviendo únicamente en `dashboard-cuadro-de-mando/`:

- `scripts/generate-workbook-from-notes.mjs`
- `scripts/watch-notes-and-sync.mjs`
- `scripts/lib/read-dashboard-notes.mjs`
- `scripts/lib/dashboard-note-schema.mjs`
- sus tests

Eso hace que `dashboard-cuadro-de-mando/` ya no sea necesaria como UI, pero sí como tooling.

## Decisión

Se moverá el tooling restante a `dashboard/` con un enfoque de traslación controlada:

- misma fuente de verdad en `resources/dashboard-real-estate/`
- mismo workbook de salida en `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`
- mismo contrato de hojas
- mismos tests funcionales adaptados a la nueva ubicación

No se reescribe el modelo. Se traslada la responsabilidad.

## Alcance

Incluido:

- mover a `dashboard/scripts/` la lectura y validación de notas
- mover a `dashboard/scripts/` la generación del workbook
- mover a `dashboard/scripts/` el watcher de regeneración
- adaptar el código a `exceljs` donde corresponda
- trasladar o recrear los tests mínimos necesarios
- actualizar `dashboard/package.json` y `dashboard/README.md`

No incluido:

- borrar `dashboard-cuadro-de-mando/` en esta misma fase
- cambiar la estructura de `resources/dashboard-real-estate/`
- rediseñar el dataset derivado

## Arquitectura propuesta

### Ubicación final

El pipeline quedará dentro de `dashboard/`:

- `dashboard/scripts/generate-workbook-from-notes.mjs`
- `dashboard/scripts/watch-notes-and-sync.mjs`
- `dashboard/scripts/lib/read-dashboard-notes.mjs`
- `dashboard/scripts/lib/dashboard-note-schema.mjs`

### Flujo final

1. leer notas canónicas de `resources/dashboard-real-estate/`
2. validarlas contra el esquema esperado
3. escribir `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`
4. ejecutar `sync-real-estate-dataset.mjs`
5. producir `dashboard/src/generated/dataset.json`
6. consumirlo desde `anclora-command-center`

### Scripts esperados

`dashboard/package.json` debe exponer:

- `generate:workbook`
- `sync:real-estate`
- `sync:notes`
- `watch:notes`

`sync:notes` debe ser el wrapper corto para ejecutar una regeneración completa desde notas.

## Decisiones de implementación

### Reutilización del código

Se prioriza mover casi literalmente el código actual para reducir riesgo. Solo se ajustará:

- resolución de rutas
- imports relativos
- uso de `exceljs` en la generación del workbook si el script actual dependiera todavía de `xlsx`

### Validación

La migración se considera completa cuando se demuestren estos tres hechos:

1. los tests del pipeline pasan desde `dashboard/`
2. `npm run build` en `dashboard/` sigue pasando
3. un cambio real en una nota canónica puede regenerar workbook, dataset y reflejarse en la vista `real-estate`

## Riesgos

- mover el watcher puede romper rutas relativas si no se ajusta bien `dashboardRoot`
- la migración puede dejar duplicado temporalmente el mismo tooling en dos carpetas
- si el workbook cambia de forma no intencional, podría romper la UI analítica aun cuando el build pase

## Mitigaciones

- conservar el contrato actual del workbook
- mantener tests de lectura, generación y watcher
- validar con una prueba manual controlada de cambio de nota

## Resultado esperado

Al finalizar:

- `anclora-command-center` será autosuficiente para todo el pipeline real estate
- `dashboard-cuadro-de-mando/` dejará de tener responsabilidad operativa real
- la carpeta legacy quedará preparada para retirada posterior
