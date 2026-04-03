---
title: Flujo Implementable - Alerta y Seguimiento Comercial
type: implementation-plan
estado: activo
scope: alertas-y-follow-up
priority: alta
tags: [automatizacion, nexus, seguimiento, alertas, n8n, comercial]
related:
  - "[[Especificación n8n - Inbound Lead Intake to Nexus]]"
  - "[[Flujo Implementable - Inbound a Nexus]]"
  - "[[Primeros 3 Flujos de Automatización Anclora]]"
  - "[[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Command Center]]"
---

# Flujo Implementable - Alerta y Seguimiento Comercial

## Objetivo

Convertir el intake inbound ya validado en una acción comercial visible y difícil de perder.

La lógica de este flujo no busca automatizar la relación humana. Busca asegurar que:

- un lead `hot` no quede olvidado
- un lead `warm` no quede sin siguiente paso
- el sistema deje rastro claro del seguimiento esperado

## Qué problema resuelve

La V1 actual ya clasifica y registra leads en [[Anclora Nexus]], pero todavía no garantiza una respuesta operativa inmediata.

Sin este segundo flujo pueden ocurrir tres fugas:

- lead `hot` capturado pero sin aviso visible
- lead `warm` registrado pero sin tarea concreta
- falta de trazabilidad entre entrada, prioridad y acción realizada

## Resultado esperado

Cada lead capturado desde el workflow inbound debe terminar, además, con:

- una alerta operativa si el lead es `hot` o `warm`
- una recomendación de seguimiento visible
- una marca temporal para medir tiempo de respuesta
- una cola o superficie clara en [[Anclora Command Center]]

## Alcance de la V1

Esta primera versión debería cubrir solo lo que más retorno aporta:

- `hot` -> alerta prioritaria
- `warm` -> alerta operativa estándar
- `cold` -> sin alerta inmediata, solo registro
- `manual_review` -> alerta de revisión

No debería cubrir todavía:

- secuencias automáticas de nurturing
- autoenvío de emails o WhatsApps
- escalado complejo por equipos o roles

## Disparador

El trigger correcto para este flujo es la salida del workflow:

- [[Especificación n8n - Inbound Lead Intake to Nexus]]

El evento relevante aparece cuando el payload final ya incluye:

- `lead_temperature`
- `next_action`
- `nexus_lead_id`
- `origin_asset`
- `territory`

## Decisiones automáticas

## Caso 1. Lead `hot`

Condición:

- `lead_temperature = hot`

Acción automática:

- generar alerta prioritaria
- incluir `lead_id`, nombre, canal y asset de origen
- registrar SLA sugerido: `contacto en menos de 24h`

Salida esperada:

- `alert_level = high`
- `follow_up_mode = human_priority`
- `sla = 24h`

## Caso 2. Lead `warm`

Condición:

- `lead_temperature = warm`

Acción automática:

- generar alerta operativa estándar
- sugerir envío o revisión del siguiente activo útil
- dejar visible la acción `send_zone_readout` o equivalente

Salida esperada:

- `alert_level = medium`
- `follow_up_mode = guided_human`
- `sla = 48h`

## Caso 3. Lead `manual_review`

Condición:

- `lead_temperature = manual_review`

Acción automática:

- marcar revisión pendiente
- alertar de falta de datos o ambigüedad

Salida esperada:

- `alert_level = review`
- `follow_up_mode = manual_validation`

## Caso 4. Lead `cold`

Condición:

- `lead_temperature = cold`

Acción automática:

- no lanzar alerta prioritaria
- registrar para reporting y nurturing futuro

Salida esperada:

- `alert_level = low`
- `follow_up_mode = passive`

## Dónde debe aparecer la alerta

La jerarquía recomendada es esta:

1. capa operativa inmediata
2. capa de control ejecutivo

### Capa operativa inmediata

La salida más simple y útil para la V1 es una alerta directa en uno de estos destinos:

- email transaccional
- Slack
- registro visible en una vista operativa intermedia

### Capa de control ejecutivo

Después, ese mismo evento debería resumirse en [[Anclora Command Center]] como:

- lead nuevo de alta prioridad
- lead sin tocar dentro de SLA
- distribución por asset y canal

## Arquitectura recomendada

## Opción preferida para la V1

Usar `n8n` como orquestador ligero del aviso, manteniendo a [[Anclora Nexus]] como fuente de verdad.

Secuencia:

1. inbound validado entra en `Nexus`
2. `n8n` recibe o continúa con payload final
3. evalúa `lead_temperature`
4. dispara alerta según reglas
5. deja evento listo para reporting

## Por qué esta opción tiene sentido

- no mete más lógica comercial dentro de `Nexus` de la necesaria
- evita depender todavía de automatizaciones complejas
- da retorno rápido con poco presupuesto
- mantiene el cerebro comercial en [[Anclora Nexus]]

## Canales de alerta recomendados

## V1

Elegir solo uno:

- Slack, si quieres velocidad y visibilidad inmediata
- email, si prefieres simplicidad y cero dependencia extra

## V2

Añadir:

- bloque en [[Anclora Command Center]]
- aviso de SLA vencido
- resumen diario por temperatura y canal

## Payload mínimo para la alerta

```json
{
  "nexus_lead_id": "uuid-real",
  "full_name": "Toni Test",
  "intent": "buyer",
  "lead_temperature": "hot",
  "next_action": "priority_call_24h",
  "source_channel": "website",
  "origin_asset": "private-estates-contact-form",
  "territory": "SW Mallorca",
  "received_at": "2026-03-28T01:43:16.000Z"
}
```

## Plantilla recomendada de alerta

```text
Nuevo lead {{lead_temperature}} en Nexus

Nombre: {{full_name}}
Intent: {{intent}}
Canal: {{source_channel}}
Asset: {{origin_asset}}
Zona: {{territory}}
Siguiente acción: {{next_action}}
Lead ID: {{nexus_lead_id}}
```

## Métricas de éxito

La V1 de este flujo debería medirse con muy pocas métricas:

- tiempo desde captura hasta alerta
- porcentaje de leads `hot` contactados dentro de 24h
- porcentaje de leads `warm` con acción dentro de 48h
- leads sin tocar por temperatura

## Implementación mínima recomendada

La siguiente versión útil de este flujo debería tener solo estos nodos o pasos:

1. entrada desde workflow inbound ya validado
2. decisión por `lead_temperature`
3. composición de mensaje
4. envío de alerta
5. log de evento para reporting

## Siguiente paso recomendado

Elegir primero el canal de alerta de la V1:

- `Slack` si la prioridad es velocidad
- `email` si la prioridad es simplicidad

La recomendación más sensata ahora mismo, con tu contexto y presupuesto, es:

- empezar por `email`
- y llevar después el resumen a [[Anclora Command Center]]

## Relacionado

- [[Especificación n8n - Inbound Lead Intake to Nexus]]
- [[Flujo Implementable - Inbound a Nexus]]
- [[Primeros 3 Flujos de Automatización Anclora]]
- [[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
