---
title: Especificación n8n - Inbound Lead Intake to Nexus
type: implementation-spec
status: activo
scope: n8n-inbound-lead-intake
priority: alta
tags: [n8n, nexus, inbound, automatizacion, leads, webhook]
related:
  - "[[Flujo Implementable - Inbound a Nexus]]"
  - "[[Primeros 3 Flujos de Automatización Anclora]]"
  - "[[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Command Center]]"
---

# Especificación n8n - Inbound Lead Intake to Nexus

## Resumen

Esta nota define la versión canónica del workflow de `n8n` para capturar leads inbound de Anclora, normalizarlos, clasificarlos y enviarlos al endpoint público de [[Anclora Nexus]].

El flujo validado queda así: `webhook -> normalización -> clasificación -> POST a Nexus -> respuesta final`.

## Objetivo

Tener un workflow útil que:

- acepte leads desde un formulario o CTA
- normalice campos mínimos
- clasifique `hot`, `warm`, `cold` o `manual_review`
- devuelva una siguiente acción sugerida
- persista el lead contra [[Anclora Nexus]]
- devuelva el resultado final de `Nexus`

## Nombre recomendado del workflow

`Anclora - Inbound Lead Intake to Nexus`

## Diseño del flujo

## Nodo 1. Inbound Webhook

Tipo:

- `n8n-nodes-base.webhook`

Configuración recomendada:

- método: `POST`
- path: `anclora-inbound-nexus`
- response mode: `responseNode`

## Nodo 2. Normalize and Classify Lead

Tipo:

- `n8n-nodes-base.code`

Modo:

- `runOnceForAllItems`

Responsabilidades:

- leer `body` y `query`
- mapear nombre, email, teléfono y WhatsApp
- inferir `intent`
- asignar `source_type` y `source_platform`
- detectar temperatura inicial
- proponer `next_action`

## Nodo 3. Send to Nexus Public CTA

Tipo:

- `n8n-nodes-base.httpRequest`

Configuración recomendada:

- método `POST`
- URL `https://anclora-nexus.onrender.com/api/public/cta/lead`
- `Ignore SSL Issues` activado en local si `n8n` lo exige

## Nodo 4. Compose Final Response

Tipo:

- `n8n-nodes-base.code`

Responsabilidad:

- combinar la clasificación local con la respuesta de `Nexus`

## Nodo 5. Respond to Webhook

Tipo:

- `n8n-nodes-base.respondToWebhook`

Configuración recomendada:

- responder con `firstIncomingItem`
- código HTTP `200`

## Lógica de clasificación

## Manual review

Se marca `manual_review` si ocurre alguna de estas condiciones:

- no hay email, teléfono ni WhatsApp
- la intención no se puede inferir con seguridad

Respuesta:

- `lead_temperature = manual_review`
- `next_action = manual_review_required`

## Hot

Se marca `hot` si hay una señal fuerte de contacto o avance:

- petición de llamada
- petición de visita
- reserva de reunión
- texto con intención inmediata
- lenguaje de urgencia como:
  - `hablar esta semana`
  - `esta semana`
  - `cuanto antes`
  - `urgente`

Respuesta:

- `lead_temperature = hot`
- `next_action = priority_call_24h`

## Warm

Se marca `warm` si no es `hot`, pero hay contexto suficiente:

- notas o mensaje útil
- presupuesto
- horizonte temporal
- territorio claro
- CTA o asset de origen identificado

Respuesta:

- `lead_temperature = warm`
- `next_action = send_zone_readout`

## Cold

Si no cae en ninguno de los casos anteriores:

- `lead_temperature = cold`
- `next_action = send_lead_magnet`

## Payload mínimo esperado

```json
{
  "full_name": "Nombre Apellido",
  "email": "lead@example.com",
  "phone": "+34...",
  "intent": "buyer",
  "source_type": "web_inbound",
  "source_platform": "web",
  "territory": "SW Mallorca",
  "origin_asset": "cta-private-estates-diagnostico",
  "notes": "Busca vivienda para uso propio"
}
```

## Payload de salida esperado

```json
{
  "status": "captured",
  "nexus_ready": true,
  "received_at": "2026-03-28T00:00:00.000Z",
  "full_name": "Nombre Apellido",
  "email": "lead@example.com",
  "phone": "+34...",
  "whatsapp": "+34...",
  "intent": "buyer",
  "source_type": "web_inbound",
  "source_platform": "web",
  "territory": "SW Mallorca",
  "origin_asset": "cta-private-estates-diagnostico",
  "notes": "Busca vivienda para uso propio",
  "budget": null,
  "horizon": null,
  "language": "es",
  "lead_temperature": "warm",
  "next_action": "send_zone_readout",
  "review_required": false
}
```

## Código recomendado del nodo `Normalize and Classify Lead`

```javascript
const input = $input.first();
const payload = input.json.body ?? {};
const query = input.json.query ?? {};

const fullName = payload.full_name ?? payload.fullName ?? payload.name ?? payload.nombre ?? '';
const email = payload.email ?? query.email ?? '';
const phone = payload.phone ?? payload.telefono ?? payload.mobile ?? '';
const whatsapp = payload.whatsapp ?? payload.whatsApp ?? phone ?? '';
const intentRaw = String(payload.intent ?? payload.lead_type ?? payload.type ?? '').toLowerCase().trim();
const sourceType = String(payload.source_type ?? 'web_inbound').toLowerCase().trim();
const sourcePlatform = String(payload.source_platform ?? payload.platform ?? 'web').toLowerCase().trim();
const territory = payload.territory ?? payload.zone ?? payload.area ?? 'SW Mallorca';
const originAsset = payload.origin_asset ?? payload.cta ?? payload.asset ?? query.cta ?? 'unknown';
const notes = payload.notes ?? payload.message ?? payload.context ?? '';
const budget = payload.budget ?? null;
const horizon = payload.horizon ?? payload.timeframe ?? null;
const language = payload.language ?? payload.idioma ?? 'es';

let intent = 'unknown';
if (['buyer', 'comprador', 'purchase'].includes(intentRaw)) intent = 'buyer';
if (['seller', 'vendedor', 'sale'].includes(intentRaw)) intent = 'seller';
if (['partner', 'colaborador', 'referral'].includes(intentRaw)) intent = 'partner';

const hasContact = Boolean(email || phone || whatsapp);
const textBlob = [notes, payload.request, payload.goal, payload.interest].filter(Boolean).join(' ').toLowerCase();
const hotSignals =
  Boolean(payload.request_call || payload.request_visit || payload.book_meeting || payload.priority_contact) ||
  /(llamada|call|visita|visit|meeting|reunion|reunión|shortlist|tour|hablar esta semana|this week|esta semana|cuanto antes|cuánto antes|asap|urgente|priority)/i.test(textBlob);
const warmSignals = Boolean(notes || budget || horizon || territory || originAsset !== 'unknown');

let leadTemperature = 'cold';
let nextAction = 'send_lead_magnet';
let reviewRequired = false;

if (!hasContact || intent === 'unknown') {
  leadTemperature = 'manual_review';
  nextAction = 'manual_review_required';
  reviewRequired = true;
} else if (hotSignals) {
  leadTemperature = 'hot';
  nextAction = 'priority_call_24h';
} else if (warmSignals) {
  leadTemperature = 'warm';
  nextAction = 'send_zone_readout';
}

return [
  {
    json: {
      status: 'captured',
      nexus_ready: true,
      received_at: new Date().toISOString(),
      full_name: fullName,
      email,
      phone,
      whatsapp,
      intent,
      source_type: sourceType,
      source_platform: sourcePlatform,
      territory,
      origin_asset: originAsset,
      notes,
      budget,
      horizon,
      language,
      lead_temperature: leadTemperature,
      next_action: nextAction,
      review_required: reviewRequired,
    },
  },
];
```

## Prueba rápida

Ejemplo con `curl`:

```bash
curl -X POST http://localhost:5678/webhook/anclora-inbound-nexus-bridge \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Toni Test",
    "email": "toni@example.com",
    "intent": "buyer",
    "territory": "SW Mallorca",
    "origin_asset": "cta-private-estates-diagnostico",
    "notes": "Quiero hablar esta semana"
  }'
```

## Estado actual

La automatización canónica ya ha sido validada extremo a extremo:

- entra por webhook en `n8n`
- clasifica correctamente `hot / warm / cold / manual_review`
- envía el lead al endpoint público de `Nexus`
- devuelve `nexus_status: success`

## Recomendación práctica

No seguir ampliando complejidad hasta que esta versión quede estabilizada y con mejor trazabilidad del `lead_id`.

La siguiente iteración buena sería:

- crear alerta o cola visible en [[Anclora Command Center]]
- devolver un `lead_id` útil desde `Nexus`
- registrar errores y duplicados

En el estado actual del ecosistema, el backend remoto de `Nexus` ya responde correctamente en:

- `https://anclora-nexus.onrender.com/api/public/cta/lead`

## Próxima acción

Revisar en `Nexus` por qué el endpoint público responde `status: success` pero no devuelve todavía `lead_id`.

## Relacionado

- [[Flujo Implementable - Inbound a Nexus]]
- [[Primeros 3 Flujos de Automatización Anclora]]
- [[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
