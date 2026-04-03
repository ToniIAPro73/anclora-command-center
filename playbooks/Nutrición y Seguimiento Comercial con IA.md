---
title: Nutrición y Seguimiento Comercial con IA
type: playbook
estado: activo
tags: [playbook, nurturing, seguimiento, inmobiliario, ia]
related:
  - "[[CRM Inmobiliario con IA]]"
  - "[[Funnel de Captación Inmobiliaria con IA]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Command Center]]"
---

# Nutrición y Seguimiento Comercial con IA

## Objetivo

Automatizar el seguimiento comercial de leads inmobiliarios sin perder personalizacion ni contexto de compra.

## Cuándo usarlo

- Cuando hay leads que se enfrían por falta de seguimiento.
- Cuando el equipo no tiene una secuencia clara por temperatura.
- Cuando la personalizacion depende demasiado de la memoria del asesor.

## Segmentacion por temperatura

### Frio

Condiciones:

- no completa la calificacion
- poca urgencia
- presupuesto bajo o difuso

Objetivo:

- educar
- mantener presencia
- madurar interes

Mensajes:

- guias de mercado
- comparativas
- historias de exito
- contenido rompe-objeciones sin CTA agresiva

### Tibio

Condiciones:

- completa la calificacion
- tiene interes claro, pero sin decision inmediata
- presupuesto razonable

Objetivo:

- acortar decision
- aumentar confianza
- mover a llamada o visita

Mensajes:

- comparativas de zonas
- rentabilidad o coste total
- piezas que respondan objeciones concretas
- CTA a consulta breve o diagnostico

### Caliente

Condiciones:

- urgencia de 1 a 3 meses
- presupuesto alineado
- interes explicito por activo o zona

Objetivo:

- mover a llamada o visita en menos de una semana

Mensajes:

- CTA directas
- opciones priorizadas
- propuesta de llamada
- recordatorios de visita o disponibilidad

## Triggers

- entrada por landing o WhatsApp
- entrada por consulta detectada desde [[Inmovilla]] o señal priorizada desde [[StateFox]]
- respuesta a formulario o preguntas de calificacion
- cambio de temperatura
- clic en activo o recurso clave
- solicitud explicita de llamada o visita
- inactividad durante un periodo definido

## Secuencia operativa

1. La IA recoge urgencia, presupuesto y prioridades.
2. Se registra el lead en [[Anclora Nexus]].
3. Se activa secuencia segun temperatura.
4. Cada interaccion relevante actualiza estado, objecion y siguiente accion.
5. Cuando el lead levanta la mano, se hace handoff al asesor.

## Condiciones de salida

- agenda llamada
- agenda visita
- solicita contacto humano inmediato
- queda descalificado
- entra en pausa con fecha de reactivacion

## Traspaso a humano

El asesor debe recibir un resumen corto y accionable:

- nombre
- canal de origen
- zona o activo de interes
- presupuesto
- urgencia
- objecion principal
- siguiente accion requerida

## Mejora aplicable a Anclora

- usar contenido de [[Estrategia de Autoridad IA Inmobiliaria]] como biblioteca de nurturing
- ligar cada secuencia al embudo de [[Funnel de Captación Inmobiliaria con IA]]
- usar [[Inmovilla]] y [[StateFox]] para que los mensajes hablen de activos, zonas y comparativas reales
- usar [[Anclora Command Center]] para ver cuellos de botella por temperatura

## Estado de implementabilidad

### Ya util hoy

- escribir secuencias por temperatura
- definir triggers y salidas
- preparar contenido rompe-objeciones

### No desplegado aun

- triggers automaticos
- cambio automatico de temperatura
- mensajes automáticos salientes

### Dependencia probable

- `n8n` para orquestar secuencias y handoffs

## 🧠 Base de research

Esta capa de seguimiento se apoya en [[Operativa Inmobiliaria con IA - insights NotebookLM]] y necesita que [[Anclora Content Generator AI]] aporte contenido útil por objeción, etapa y temperatura.

## Validacion

- Cada lead tiene temperatura visible.
- Existe contenido distinto por temperatura.
- El asesor recibe contexto antes del contacto.
- El sistema sabe cuando insistir y cuando salir.

## Relacionado

- [[CRM Inmobiliario con IA]]
- [[Funnel de Captación Inmobiliaria con IA]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
- [[Anclora Content Generator AI]]
- [[Arquitectura Implementable de Automatización Anclora]]
