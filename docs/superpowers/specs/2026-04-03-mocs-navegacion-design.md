---
title: Diseño de MOCs de navegación para la bóveda
status: proposed
related:
  - "[[MOC de Negocio]]"
  - "[[Anclora Group]]"
  - "[[Anclora Command Center]]"
  - "[[Mapa del Sistema de Agentes]]"
---

# Diseño de MOCs de navegación para la bóveda

## Objetivo

Crear tres notas MOC nuevas en `resources/` para mejorar navegación, recuperación y lectura del grafo sin duplicar los hubs ya existentes.

## Alcance

Se crearán tres MOCs ligeros:

1. `MOC Real Estate Comercial`
2. `MOC Stack Operativo Anclora`
3. `MOC Toni - Marca Personal y Autoridad`

No se reorganizan carpetas, no se renombran notas y no se alteran flujos existentes fuera de los enlaces que sean necesarios desde los nuevos MOCs.

## Principios de diseño

- Cada MOC debe responder a una intención de navegación real.
- No debe duplicar a [[MOC de Negocio]], sino complementarlo.
- Debe enlazar sobre todo a notas canónicas ya existentes.
- Debe actuar como hub legible, no como lista exhaustiva de todo el vault.

## Estructura propuesta

### 1. MOC Real Estate Comercial

Propósito:
Servir como entrada a captación, funnel, CRM, nurturing, reporting, autoridad, vertical premium y cuadro de mando.

Secciones:
- Qué cubre este mapa
- Núcleo comercial
- Captación y autoridad
- Operación y seguimiento
- Vertical premium y activos
- Relacionado

Notas esperadas:
- [[Anclora Private Estates]]
- [[Anclora Private Estates Landing Page]]
- [[Anclora Command Center]]
- [[Anclora Cuadro de Mando Real Estate]]
- [[Prospección Avanzada con Nexus]]
- [[Estrategia de Autoridad IA Inmobiliaria]]
- [[Funnel de Captación Inmobiliaria con IA]]
- [[CRM Inmobiliario con IA]]
- [[Nutrición y Seguimiento Comercial con IA]]
- [[Reportes Automáticos para Inmobiliarias]]
- [[Captación Inmobiliaria con IA - insights NotebookLM]]
- [[Operativa Inmobiliaria con IA - insights NotebookLM]]

### 2. MOC Stack Operativo Anclora

Propósito:
Servir como mapa del stack de aplicaciones y herramientas que convierten señal en operación.

Secciones:
- Qué cubre este mapa
- Núcleo de aplicaciones
- Fuentes y señales
- Coordinación y superficies
- Sistemas y flujos que lo explican
- Relacionado

Notas esperadas:
- [[Anclora Group]]
- [[Anclora Nexus]]
- [[Anclora Synergi]]
- [[Anclora Data Lab]]
- [[Anclora Content Generator AI]]
- [[Coda]]
- [[Slack]]
- [[Inmovilla]]
- [[StateFox]]
- [[Flujo Comercial Inteligente Anclora]]
- [[Arquitectura de Integración Anclora]]
- [[Arquitectura Implementable de Automatización Anclora]]

### 3. MOC Toni - Marca Personal y Autoridad

Propósito:
Servir como entrada a propuesta de valor, identidad profesional, activos de credibilidad, ICP y memoria relacional clave.

Secciones:
- Qué cubre este mapa
- Identidad y posicionamiento
- Propuesta de valor y mensajes
- Pruebas de autoridad
- Personas y contexto relacional
- Relacionado

Notas esperadas:
- [[personas/Toni|Toni]]
- [[Propuesta de Valor de Toni - Real Estate + IA]]
- [[Bio y Pitch de Toni - Real Estate + IA]]
- [[Pruebas de Autoridad y Casos Reales]]
- [[Portfolio técnico y casos demostrables de Toni]]
- [[ICP Comprador Premium SW Mallorca]]
- [[Mapa de Stakeholders de Anclora Group]]
- [[Plan Maestro de Marca Personal e Ingesta Comercial]]
- [[Estrategia de Autoridad IA Inmobiliaria]]

## Ubicación

Los tres MOCs vivirán en `resources/` porque son notas de navegación estables, no capturas ni proyectos temporales.

## Riesgos

- Duplicar demasiado a [[MOC de Negocio]].
- Crear mapas demasiado largos que vuelvan a convertirse en ruido.
- Introducir enlaces triviales sin intención de uso.

## Criterio de calidad

- Cada MOC debe poder usarse como punto de entrada en menos de 30 segundos.
- Debe tener una jerarquía clara de secciones.
- Debe enlazar a hubs y notas canónicas, no a placeholders.
- Debe ayudar a que el grafo muestre constelaciones más legibles.
