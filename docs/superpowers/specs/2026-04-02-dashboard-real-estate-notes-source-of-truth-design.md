---
title: Diseño - Dashboard Real Estate con notas canónicas como fuente de verdad
date: 2026-04-02
status: proposed
topic: dashboard-real-estate
related:
  - "[[Anclora Cuadro de Mando Real Estate]]"
  - "[[Anclora Group]]"
  - "[[Anclora Private Estates]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Data Lab]]"
  - "[[Anclora Content Generator AI]]"
  - "[[Anclora Synergi]]"
---

# Diseño - Dashboard Real Estate con notas canónicas como fuente de verdad

## Resumen

El dashboard `dashboard-cuadro-de-mando/` dejará de depender del Excel como documento editable manualmente. La fuente de verdad pasará a ser una capa nueva de notas canónicas, estructuradas y mínimas dentro de la bóveda. A partir de esas notas se generarán dos artefactos derivados:

1. el workbook `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`
2. el JSON `dashboard-cuadro-de-mando/src/generated/dataset.json`

La narrativa y el contexto seguirán viviendo en las notas actuales de `proyectos/`, `research/`, `resources/` y `sistemas/`, pero el dashboard y el Excel solo leerán la capa canónica diseñada para ese fin.

## Problema actual

El sistema actual usa este flujo:

`notas narrativas -> Excel curado manualmente -> dataset.json -> dashboard`

Esto introduce tres problemas:

- el Excel actúa como fuente de verdad de facto, aunque debería ser un artefacto derivado
- las notas existentes contienen contexto valioso, pero no una estructura suficientemente estable para regenerar las cuatro hojas del workbook con fiabilidad
- no existe un mecanismo seguro para que cambios en la bóveda actualicen automáticamente el dashboard sin riesgo de divergencia

## Objetivo

Diseñar una capa de datos en Obsidian que permita regenerar de forma fiable estas hojas:

- `apps_master`
- `interacciones`
- `campos_analiticos`
- `fuentes`

Y habilitar este flujo futuro:

`notas canónicas -> workbook generado -> dataset.json -> dashboard`

## Decisión principal

Se adopta un modelo de notas canónicas dedicadas al dashboard en lugar de inferencia desde notas narrativas o sobrecarga de frontmatter en notas ya existentes.

### Razón

Las notas narrativas están optimizadas para comprensión humana, no para extracción tabular estable. Forzar en ellas toda la estructura analítica degradaría su legibilidad y seguiría dejando demasiadas inferencias implícitas.

La nueva capa canónica separa con claridad:

- conocimiento narrativo y contexto en las notas existentes
- datos operativos estructurados para generación del dashboard

## Alcance de la V1

La primera implementación cubrirá:

- plantillas de notas canónicas para apps, interacciones, campos y fuentes
- creación de las notas iniciales necesarias para representar el dataset actual
- script generador `notas -> xlsx`
- adaptación del flujo actual para que `sync-dataset.mjs` siga generando `dataset.json` a partir del workbook ya regenerado
- actualización automática en desarrollo cuando cambien las notas canónicas

La V1 no cubrirá:

- inferencia automática desde texto libre
- edición bidireccional Excel -> notas
- refresco en producción sin nuevo build
- ampliación a otros dashboards fuera del scope Real Estate

## Estructura propuesta en la bóveda

La capa canónica vivirá en `resources/` porque funcionará como referencia estable y operativa.

```text
resources/
  dashboard-real-estate/
    indice-dashboard-real-estate.md
    apps/
      ape-anclora-private-estates.md
      adl-anclora-data-lab.md
      acg-anclora-content-generator-ai.md
      anx-anclora-nexus.md
      asy-anclora-synergi.md
    interacciones/
      adl-a-acg-insight-to-content.md
      ...
    campos/
      app-id.md
      app-name.md
      ...
    fuentes/
      ape-proyectos-anclora-private-estates.md
      ...
```

## Modelo de datos

### 1. Notas de app

Cada nota de `apps/` representará una fila de `apps_master`.

Propiedades mínimas requeridas:

- `app_id`
- `app_name`
- `scope_status`
- `ecosystem_role`
- `app_type`
- `maturity_status`
- `validation_status`
- `ecosystem_layer`
- `real_estate_focus`
- `primary_users`
- `primary_goal`
- `business_value`
- `main_inputs`
- `main_outputs`
- `upstream_dependencies`
- `downstream_dependencies`
- `key_workflows`
- `documented_state`
- `state_summary`
- `main_risks`
- `next_focus`
- `territory_focus`
- `repo_url`
- `primary_note`
- `supporting_notes`
- `source_confidence`

Reglas:

- `upstream_dependencies`, `downstream_dependencies`, `key_workflows` y `supporting_notes` se mantendrán como listas en frontmatter y se serializarán al formato esperado por el workbook
- el cuerpo de la nota tendrá un resumen corto, enlaces relevantes y una justificación humana del estado actual
- `primary_note` apuntará a la nota principal narrativa del nodo

### 2. Notas de interacción

Cada nota de `interacciones/` representará una fila de `interacciones`.

Propiedades mínimas:

- `source_app`
- `target_app`
- `interaction_type`
- `what_flows`
- `business_reason`

Reglas:

- `source_app` y `target_app` deberán referenciar `app_id`, no nombres libres
- el cuerpo explicará en lenguaje natural la relación y enlazará las apps implicadas con `[[wikilinks]]`

### 3. Notas de campo analítico

Cada nota de `campos/` representará una fila de `campos_analiticos`.

Propiedades mínimas:

- `field_name`
- `data_type`
- `definition`
- `reading_rule`

Reglas:

- esta colección define el contrato analítico del dashboard
- cualquier nuevo campo deberá añadirse aquí antes de aparecer en el workbook

### 4. Notas de fuente

Cada nota de `fuentes/` representará una fila de `fuentes`.

Propiedades mínimas:

- `app_name`
- `source_note`
- `source_type`
- `evidence_summary`

Reglas:

- `source_note` será una ruta relativa estable dentro de la bóveda
- `app_name` deberá corresponder a una app canónica existente
- el cuerpo resumirá por qué esa fuente respalda el estado o la lectura de la app

## Índice del sistema

`indice-dashboard-real-estate.md` servirá como mapa operativo del modelo y deberá incluir:

- propósito de la capa canónica
- reglas de edición
- checklist de cobertura
- enlaces a las carpetas y a las apps canónicas
- enlace al recurso [[Anclora Cuadro de Mando Real Estate]]

## Pipeline técnico propuesto

### Estado final deseado

1. el usuario edita una nota canónica
2. un script de generación recorre `resources/dashboard-real-estate/`
3. se construye el workbook `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`
4. `dashboard-cuadro-de-mando/scripts/sync-dataset.mjs` transforma ese workbook en `dataset.json`
5. Vite recarga la app en desarrollo

### Decisión de compatibilidad

En la V1 se conserva `dashboard-cuadro-de-mando/scripts/sync-dataset.mjs` como consumidor del workbook. Esto reduce riesgo y evita cambiar a la vez el modelo del dashboard y su lógica derivada.

La nueva pieza será un generador previo de workbook. El orden será:

`notas canónicas -> generate-workbook -> sync-dataset -> vite`

## Automatización

### Desarrollo local

Se añadirá un watcher que observe cambios en:

- `resources/dashboard-real-estate/apps/`
- `resources/dashboard-real-estate/interacciones/`
- `resources/dashboard-real-estate/campos/`
- `resources/dashboard-real-estate/fuentes/`
- `resources/dashboard-real-estate/indice-dashboard-real-estate.md`

Cuando detecte cambios válidos:

- regenerará el workbook
- regenerará `dataset.json`
- dejará que Vite refresque la UI

### Producción

La producción seguirá siendo build-based. No se implementará en esta fase una actualización runtime del dashboard ya desplegado.

## Estrategia de migración inicial

La migración inicial partirá del workbook actual y de las notas existentes.

Pasos:

1. crear plantillas canónicas
2. crear las cinco notas de app del dataset actual
3. crear notas de interacción a partir de la hoja `interacciones`
4. crear notas de campo a partir de `campos_analiticos`
5. crear notas de fuente a partir de `fuentes`
6. generar un workbook nuevo desde las notas
7. comparar workbook generado y workbook actual
8. usar ese workbook para regenerar `dataset.json`

## Validación

La validación de la V1 deberá comprobar:

- que el número de filas por hoja coincide con el dataset actual
- que las columnas generadas son exactamente las esperadas
- que `dashboard-cuadro-de-mando/test/sync-dataset.test.mjs` sigue pasando
- que cambios en una nota canónica actualizan el workbook y el JSON
- que un dato obligatorio ausente produce un error claro y bloquea la generación

## Manejo de errores

El generador debe fallar con mensajes explícitos cuando ocurra cualquiera de estos casos:

- falta una propiedad obligatoria en una nota
- hay dos apps con el mismo `app_id`
- una interacción apunta a una app inexistente
- una fuente apunta a una ruta inexistente
- una lista tiene un tipo no serializable

## Riesgos y mitigaciones

### Riesgo 1. Duplicación entre capa canónica y notas narrativas

Mitigación:

- mantener el dato analítico solo en la capa canónica
- mantener en notas narrativas el contexto, razonamiento y evolución
- enlazar explícitamente entre ambas capas

### Riesgo 2. Sobrecarga de mantenimiento

Mitigación:

- plantillas mínimas
- nombres y rutas predecibles
- validación automática

### Riesgo 3. Divergencia con el workbook actual

Mitigación:

- migración inicial basada en el workbook actual
- test de equivalencia estructural

## Enfoques descartados

### Reutilizar solo notas existentes con frontmatter ampliado

Descartado porque mezcla datos estructurados de máquina con notas destinadas a lectura humana y mantenimiento editorial.

### Inferir el dataset desde texto libre

Descartado porque no ofrece fiabilidad suficiente para un cuadro de mando que debe regenerarse sin ambigüedad.

## Plan de implementación esperado

La siguiente fase debe detallar:

- plantillas y convención de nombres
- formato exacto de frontmatter por tipo de nota
- script generador del workbook
- integración con scripts de `dashboard-cuadro-de-mando`
- estrategia de tests y watchers

## Criterio de éxito

El diseño se considerará correctamente implementado cuando:

- editar una nota canónica cambie el workbook derivado sin edición manual del Excel
- el dashboard local refleje el cambio tras la regeneración automática
- el Excel deje de ser la fuente de verdad y pase a ser un artefacto generado
