---
title: Diseño de unificación de Command Center y Cuadro de Mando
status: proposed
related:
  - "[[Anclora Command Center]]"
  - "[[Anclora Cuadro de Mando Real Estate]]"
  - "[[Anclora Group]]"
  - "[[Anclora Private Estates]]"
---

# Diseño de unificación de Command Center y Cuadro de Mando

## Objetivo

Unificar las aplicaciones `Boveda-Anclora/dashboard` y `Boveda-Anclora/dashboard-cuadro-de-mando` en una sola app premium, manteniendo dos vistas internas con responsabilidades claras:

1. `Resumen Ejecutivo`
2. `Real Estate Intelligence`

La meta es eliminar duplicación de producto, branding, deploy y mantenimiento sin perder la separación funcional entre lectura ejecutiva del ecosistema y priorización analítica del vertical inmobiliario.

## Contexto actual

Hoy existen dos dashboards React/Vite dentro de la bóveda:

- `dashboard/` actúa como superficie ejecutiva conectada a `[[Anclora Command Center]]` y a notas canónicas del sistema.
- `dashboard-cuadro-de-mando/` actúa como superficie analítica alimentada por `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`.

Aunque sus fuentes no son idénticas, ambas apps:

- viven dentro del mismo workspace
- comparten branding premium similar
- sirven a la misma operación
- muestran prioridades, contexto y decisiones

El resultado es una fragmentación innecesaria del producto.

## Decisión

Se adopta una arquitectura de app única:

- `dashboard/` pasa a ser la app principal y única
- `dashboard-cuadro-de-mando/` deja de ser una app separada y se convierte en un módulo interno
- el producto conserva la marca `Anclora Command Center`
- `Cuadro de Mando Real Estate` pasa a ser una vista o módulo, no una app distinta

## Alcance

Incluido:

- integrar la UI de `dashboard-cuadro-de-mando` dentro de `dashboard/`
- crear navegación interna entre vistas
- mantener separados los dos pipelines de datos
- soportar build, dev y deploy desde una sola app
- conservar la lectura premium y la coherencia de contratos

No incluido:

- rediseñar desde cero los componentes visuales de ambas superficies
- fusionar los dos modelos de datos en un único JSON
- reescribir el workbook inmobiliario
- eliminar el repo/carpeta antigua en la primera fase sin validar paridad funcional

## Principios de diseño

- Una sola app, varios módulos.
- Una sola shell premium compartida.
- Dos modelos mentales claramente diferenciados.
- Dos fuentes de datos separadas mientras sirvan a necesidades distintas.
- La navegación debe hacer evidente qué se está viendo y para qué sirve.

## Arquitectura propuesta

### Shell común

`dashboard/` tendrá una shell única compartida:

- topbar premium
- branding unificado
- controles de tema
- controles de idioma donde aplique
- navegación entre vistas

La shell debe pertenecer a `Anclora Command Center`, no al vertical inmobiliario.

### Vistas internas

#### 1. Resumen Ejecutivo

Equivale al `dashboard/` actual.

Responsabilidad:

- responder qué está pasando en el ecosistema
- mostrar foco operativo, partners, stack, proyectos, actividad y acciones rápidas

Fuente:

- `vault-data.json`

Pregunta que responde:

- “¿Cómo está hoy Anclora y qué tengo que mirar primero?”

#### 2. Real Estate Intelligence

Absorbe la funcionalidad de `dashboard-cuadro-de-mando/`.

Responsabilidad:

- mostrar ranking de prioridades
- exponer tarjetas operativas
- enseñar dependencias críticas
- permitir leer el estado del vertical inmobiliario como sistema de decisión

Fuente:

- `dataset.json`

Pregunta que responde:

- “¿Qué app, capa o riesgo del vertical inmobiliario requiere prioridad ahora y por qué?”

## Modelo de datos

No se fusionan todavía los pipelines.

Se mantendrán dos generadores separados:

- `sync-vault-data.mjs` para la vista ejecutiva
- un script equivalente a `sync-dataset.mjs` para la vista analítica

Ambos generarán archivos en `dashboard/src/generated/`.

Razonamiento:

- el dashboard ejecutivo nace de notas canónicas y frontmatter
- el dashboard analítico nace de un dataset estructurado con ranking, dependencias y señales

Forzar una fusión temprana de ambos modelos añadiría complejidad y riesgo sin retorno claro.

## Estructura de carpetas propuesta

La app resultante debería evolucionar hacia algo como:

- `dashboard/src/shell/`
- `dashboard/src/modules/executive/`
- `dashboard/src/modules/real-estate/`
- `dashboard/src/generated/vault-data.json`
- `dashboard/src/generated/dataset.json`
- `dashboard/scripts/sync-vault-data.mjs`
- `dashboard/scripts/sync-real-estate-dataset.mjs`

Objetivo de esta estructura:

- separar shell y módulos
- evitar que `App.tsx` concentre toda la lógica
- hacer visible la frontera entre vista ejecutiva y vista analítica

## Navegación propuesta

La app debe tener dos rutas o estados de navegación explícitos:

- `/` o `/executive`
- `/real-estate`

La navegación puede resolverse con router ligero o con estado interno si se quiere minimizar complejidad inicial. La preferencia es usar routing explícito para que cada vista sea enlazable, verificable y más fácil de mantener.

Etiquetas recomendadas en UI:

- `Resumen Ejecutivo`
- `Real Estate Intelligence`

La vista inmobiliaria puede mantener como subtítulo `Cuadro de Mando Real Estate`, pero ya no debe presentarse como producto distinto.

## Branding y posicionamiento

Producto:

- `Anclora Command Center`

Módulos:

- `Executive Summary`
- `Real Estate Intelligence`

Regla:

- una sola identidad de producto
- varios contextos de lectura

No debe haber dos logos o dos nombres de app que sugieran dos productos independientes si la experiencia ya vive dentro de la misma shell.

## Estrategia de migración

### Fase 1

- mover el pipeline de dataset a `dashboard/`
- hacer que `dashboard/` pueda generar `vault-data.json` y `dataset.json`
- verificar que build y dev siguen funcionando

### Fase 2

- mover la UI de `dashboard-cuadro-de-mando` como módulo interno
- crear navegación entre vistas
- mantener paridad funcional con el tablero actual

### Fase 3

- refinar shell común, naming y consistencia visual
- eliminar duplicación de componentes, estilos y assets
- documentar la nueva arquitectura

### Fase 4

- retirar `dashboard-cuadro-de-mando/` solo después de validar equivalencia funcional
- actualizar referencias de la bóveda, gobernanza y documentación

## Riesgos

- mezclar demasiado pronto dos modelos de datos distintos
- perder claridad entre lectura ejecutiva y lectura analítica
- introducir una shell común demasiado rígida que empeore una de las vistas
- retirar la app secundaria antes de comprobar paridad real

## Criterio de éxito

- existe una sola app desplegable para control operativo
- la vista ejecutiva mantiene toda la funcionalidad actual
- la vista inmobiliaria mantiene la lectura analítica actual
- la navegación deja claro el propósito de cada vista
- se reduce duplicación de branding, build, deploy y mantenimiento

## Criterio de retirada de la app secundaria

`dashboard-cuadro-de-mando/` solo podrá retirarse cuando:

1. su pipeline de dataset viva ya en `dashboard/`
2. su UI esté migrada con paridad funcional suficiente
3. exista una ruta estable equivalente dentro de la app principal
4. la documentación y la gobernanza estén actualizadas

Hasta entonces, la carpeta secundaria puede convivir temporalmente como referencia de migración, pero ya no como destino arquitectónico final.
