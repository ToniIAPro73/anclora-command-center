---
title: Especificación n8n - Alerta por Email para Leads
type: implementation-spec
estado: activo
scope: n8n-email-alerts
priority: alta
tags: [n8n, email, alertas, leads, nexus, automatizacion]
related:
  - "[[Flujo Implementable - Alerta y Seguimiento Comercial]]"
  - "[[Especificación n8n - Inbound Lead Intake to Nexus]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Command Center]]"
---

# Especificación n8n - Alerta por Email para Leads

## Resumen

Esta nota define la V1 del workflow de alerta por email para leads capturados en el ecosistema de Anclora.

La función de este flujo es simple:

- recibir un payload ya clasificado
- decidir si merece alerta
- enviar un email operativo si el lead es `hot`, `warm` o `manual_review`

## Objetivo

Tener una salida barata y fiable que convierta la captura técnica en acción comercial visible.

## Nombre recomendado del workflow

`Anclora - Lead Alert Email`

## Diseño del flujo

`webhook -> prepare alert email -> send email`

## Nodo 1. Alert Webhook

Tipo:

- `n8n-nodes-base.webhook`

Configuración recomendada:

- método: `POST`
- path: `anclora-lead-alert-email`
- response mode: `onReceived`

## Nodo 2. Prepare Alert Email

Tipo:

- `n8n-nodes-base.code`

Responsabilidades:

- leer el payload final del lead
- filtrar `cold`
- construir asunto
- construir versión `text`
- construir versión `html`
- devolver campos listos para el nodo de email

## Nodo 3. Send Alert Email

Tipo:

- `n8n-nodes-base.emailSend`

Responsabilidades:

- usar credenciales SMTP
- enviar correo operativo
- mantener un formato simple y legible

## Regla de envío

Se envía email si:

- `lead_temperature = hot`
- `lead_temperature = warm`
- `lead_temperature = manual_review`

No se envía en:

- `lead_temperature = cold`

## Payload mínimo esperado

```json
{
  "full_name": "Toni Test",
  "email": "toni@example.com",
  "phone": "+34600111222",
  "intent": "buyer",
  "lead_temperature": "hot",
  "next_action": "priority_call_24h",
  "source_channel": "website",
  "origin_asset": "private-estates-contact-form",
  "territory": "SW Mallorca",
  "nexus_lead_id": "62f76092-9687-4282-82ba-3206145b9ffe",
  "received_at": "2026-03-28T01:43:16.000Z"
}
```

## Integración recomendada con el workflow inbound

La opción más limpia para la V1 es que el workflow:

- [[Especificación n8n - Inbound Lead Intake to Nexus]]

llame al endpoint:

- `POST /webhook/anclora-lead-alert-email`

justo después de tener:

- `nexus_status`
- `nexus_lead_id`
- `lead_temperature`
- `next_action`

## Configuración que tendrás que cambiar

Antes de usarlo, edita en el nodo `Send Alert Email`:

- `fromEmail`
- `toEmail`
- credenciales SMTP

Valores placeholder actuales:

- `Anclora Alerts <alerts@anclora.local>`
- `antonio.ballesterosa@example.com`

## Resultado esperado

Un email operativo con:

- prioridad
- nombre
- canal
- asset de origen
- zona
- siguiente acción
- `lead_id`
- datos de contacto

## Siguiente paso recomendado

Cuando este workflow esté validado, la siguiente iteración buena sería:

- reflejar esa misma alerta en [[Anclora Command Center]]
- añadir medición de SLA vencido

## Relacionado

- [[Flujo Implementable - Alerta y Seguimiento Comercial]]
- [[Especificación n8n - Inbound Lead Intake to Nexus]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
