---
title: Anclora Cuadro de Mando Real Estate
aliases: [Cuadro de Mando Real Estate, Dashboard Cuadro de Mando]
type: resource
estado: activo
scope: dashboard-operativo
repo_local: dashboard-cuadro-de-mando
url: https://dashboard-cuadro-de-mando.vercel.app/
tags: [resource, dashboard, anclora, real-estate]
related:
  - "[[Anclora Group]]"
  - "[[Anclora Command Center]]"
  - "[[Anclora Private Estates]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Data Lab]]"
  - "[[Anclora Content Generator AI]]"
  - "[[Anclora Synergi]]"
---

# Anclora Cuadro de Mando Real Estate

Dashboard web del dataset Real Estate de Anclora, pensado como superficie operativa para leer prioridades, acciones, riesgos y dependencias entre aplicaciones del ecosistema.

## Qué es

Es la capa visual específica para el dataset de apps Real Estate. Complementa a [[Anclora Command Center]] con una lectura enfocada en decisión y priorización, no solo en navegación del sistema.

## URL

- Producción Vercel: `https://dashboard-cuadro-de-mando.vercel.app/`

## Fuente de datos

- Workbook fuente: `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`
- Pipeline de ingestión: `xlsx -> json`
- App local: `dashboard-cuadro-de-mando/`

## Fuente de verdad

La capa canonica para esta version del cuadro de mando vive en [[Indice Dashboard Real Estate]] y en `resources/dashboard-real-estate/`.

El workbook `output/spreadsheet/anclora-group-real-estate-dataset.xlsx` y `dashboard-cuadro-de-mando/src/generated/dataset.json` son artefactos derivados. No se editan a mano salvo para una investigacion puntual; se regeneran desde las notas canonicas.

## Flujo operativo de verdad

1. Editar primero las notas canonicas en `resources/dashboard-real-estate/`.
2. Regenerar el workbook con `npm run generate:workbook` desde `dashboard-cuadro-de-mando/`.
3. Sincronizar el dataset con `npm run sync:data`.
4. Validar el estado con `npm test` y `npm run build` en `dashboard-cuadro-de-mando/`.
5. Si una comparacion no cuadra, revisar las notas origen antes de tocar el workbook o el JSON generado.

## Notas de mantenimiento

- Si cambia el workbook, regenerar las notas canonicas antes de comparar resultados.
- Mantener esta nota como puntero de referencia, no como replica completa del dataset.
- Si la semantica del snapshot cambia, actualizar primero las notas de origen y despues ajustar los tests de regresion.

## Qué permite leer

- prioridad actual de cada app
- siguiente acción recomendada
- riesgos y bloqueos principales
- relaciones entre nodos del ecosistema
- trazabilidad de fuentes

## Encaje comercial

Este cuadro de mando sirve como capa de lectura para el nucleo descrito en [[MOC Real Estate Comercial]]. No sustituye a los playbooks; los hace legibles en una sola superficie cuando hay que priorizar foco, seguimiento y reporting.

- [[Prospección Avanzada con Nexus]] usa esta vista para leer prioridad territorial, dependencias y siguiente foco comercial.
- [[CRM Inmobiliario con IA]] lo aprovecha como lectura sintetica del estado del pipeline y de sus bloqueos.
- [[Reportes Automáticos para Inmobiliarias]] encuentra aqui una superficie util para direccion y coordinacion, complementaria a [[Anclora Command Center]].

## Relación con el ecosistema

- [[Anclora Private Estates]] como vertical comercial
- [[Anclora Nexus]] como núcleo operativo
- [[Anclora Data Lab]] como capa de inteligencia
- [[Anclora Content Generator AI]] como motor editorial
- [[Anclora Synergi]] como capa relacional

## Relacionado

- [[Anclora Group]]
- [[Anclora Command Center]]
- [[Anclora Private Estates]]
- [[Anclora Nexus]]
- [[Anclora Data Lab]]
- [[Anclora Content Generator AI]]
- [[Anclora Synergi]]
- [[MOC Real Estate Comercial]]
- [[Prospección Avanzada con Nexus]]
- [[CRM Inmobiliario con IA]]
- [[Reportes Automáticos para Inmobiliarias]]
