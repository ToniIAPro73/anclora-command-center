---
title: Arquitectura Implementable de Automatización Anclora
type: system
status: active
tags: [sistema, automatizacion, anclora, n8n, crm]
related:
  - "[[Anclora Nexus]]"
  - "[[CRM Inmobiliario con IA]]"
  - "[[Nutrición y Seguimiento Comercial con IA]]"
  - "[[Reportes Automáticos para Inmobiliarias]]"
  - "[[Prospección Avanzada con Nexus]]"
  - "[[Anclora Command Center]]"
---

# Arquitectura Implementable de Automatización Anclora

## Resumen

Esta nota separa tres capas que no deben confundirse:

- benchmark externo: ideas utiles observadas en NotebookLM y en el material de Francisco Igual
- arquitectura objetivo: como deberia funcionar el sistema ideal de Anclora
- implementacion real: que puede hacerse hoy con el stack disponible y que depende de incorporar `n8n`

## Principio rector

No copiar stacks ajenos. Extraer principios, validar compatibilidad y solo despues diseñar implementacion.

## Stack actual de Anclora

### Ya presente

- [[Inmovilla]] como fuente operativa de mercado y captacion
- [[StateFox]] como capa de señal territorial y lectura de zonas
- [[Anclora Nexus]] como nucleo conceptual de pipeline, priorizacion y memoria comercial
- [[Coda]] como superficie operativa de lectura y seguimiento
- [[Slack]] como coordinacion y alertas

### Aun no implementado

- automatizaciones reales entre herramientas
- scoring automatico persistente
- handoff automatico entre IA y asesor
- reporting automatico programado

### Pieza propuesta

- `n8n` como orquestador de automatizacion

## Arquitectura objetivo

1. Entrada desde [[Inmovilla]], formularios, contenido o WhatsApp.
2. Enriquecimiento y clasificacion con IA.
3. Orquestacion en `n8n`.
4. Estado y pipeline en [[Anclora Nexus]].
5. Vista operativa en [[Coda]].
6. Alertas y handoff en [[Slack]].
7. Reporting para operacion y direccion.

## Que es implementable hoy

### Sin n8n

- definir estructura de pipeline
- definir campos minimos por lead
- diseñar scoring conceptual
- preparar plantillas de nurturing
- preparar formatos de reportes
- usar [[Anclora Command Center]] como capa ejecutiva manual

### Con n8n

- captura automatica de leads
- clasificacion por temperatura
- handoff automatico al asesor
- alertas a [[Slack]]
- resumenes para [[Coda]]
- reportes periodicos

## Qué no debe afirmarse todavía

- que [[Anclora Nexus]] ya funciona como CRM real
- que existe automatizacion activa entre [[Inmovilla]], [[StateFox]], [[Coda]] y [[Slack]]
- que el nurturing o los reportes estan desplegados

## Decisión recomendada

Usar el material de NotebookLM como benchmark y diseño de referencia, pero modelar la primera implementacion real de Anclora sobre `n8n + [[Anclora Nexus]] + [[Coda]] + [[Slack]]`.

## Próximo paso

Diseñar un primer flujo implementable de extremo a extremo:

`lead entra -> n8n clasifica -> Nexus registra -> Slack alerta -> Coda muestra`

## Relacionado

- [[CRM Inmobiliario con IA]]
- [[Nutrición y Seguimiento Comercial con IA]]
- [[Reportes Automáticos para Inmobiliarias]]
- [[Prospección Avanzada con Nexus]]
- [[Anclora Command Center]]
