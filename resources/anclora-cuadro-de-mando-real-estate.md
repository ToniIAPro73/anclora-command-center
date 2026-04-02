---
title: Anclora Cuadro de Mando Real Estate
aliases: [Cuadro de Mando Real Estate, Dashboard Cuadro de Mando]
type: resource
status: activo
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

La capa canonica para la migracion de este workbook vive en [[Indice Dashboard Real Estate]] y en `resources/dashboard-real-estate/`.

Notas de mantenimiento:

- Si cambia el workbook, regenerar las notas canonicas antes de comparar resultados.
- Mantener esta nota como puntero de referencia, no como replica completa del dataset.

## Qué permite leer

- prioridad actual de cada app
- siguiente acción recomendada
- riesgos y bloqueos principales
- relaciones entre nodos del ecosistema
- trazabilidad de fuentes

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
