---
title: Flujo Implementable - Inbound a Nexus
type: implementation-plan
status: activo
scope: inbound-leads
priority: alta
tags: [automatizacion, nexus, inbound, leads, n8n, implementacion]
related:
  - "[[Primeros 3 Flujos de Automatización Anclora]]"
  - "[[Comparativa de Arquitectura para Automatizaciones Anclora]]"
  - "[[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]"
  - "[[Anclora Nexus]]"
  - "[[Funnel de Captación Inmobiliaria con IA]]"
  - "[[Mensajes de Captación para LinkedIn y WhatsApp]]"
  - "[[Anclora Command Center]]"
---

# Flujo Implementable - Inbound a Nexus

## Objetivo

Definir de forma operativa cómo debe funcionar el flujo `inbound -> clasificación -> siguiente acción` para que cualquier lead que entre en el ecosistema quede registrado, ordenado y accionable dentro de [[Anclora Nexus]].

## Resultado esperado

Cada lead inbound debe terminar con:

- origen claro
- datos mínimos normalizados
- clasificación inicial útil
- siguiente acción sugerida
- visibilidad en cola operativa

## Alcance del flujo

Este flujo cubre entradas desde:

- CTA de `Anclora Private Estates`
- formularios web
- WhatsApp iniciado desde campaña o contenido
- email inbound
- carga manual desde conversación o networking

No cubre todavía:

- secuencias automáticas de nurturing
- envío autónomo de mensajes
- scoring predictivo avanzado

## Disparadores

## Trigger 1. CTA web

Cuando un usuario completa un formulario o CTA conectado a `Private Estates`.

## Trigger 2. Conversación iniciada por WhatsApp

Cuando entra un lead por WhatsApp y el operador lo decide registrar en sistema.

## Trigger 3. Lead manual

Cuando Toni o un colaborador detecta una oportunidad en llamada, evento, networking o conversación directa.

## Trigger 4. Email inbound

Cuando alguien responde a un outreach o llega por correo con intención comercial real.

## Datos mínimos obligatorios

Para crear un registro útil, el sistema debería exigir al menos:

- `source_type`
- `source_platform`
- nombre o identificador del lead
- al menos un canal de contacto:
  - email
  - teléfono
  - WhatsApp
- intención inicial estimada
- territorio o zona si ya se conoce

## Datos recomendables

- presupuesto orientativo
- tipología de interés
- horizonte temporal
- idioma preferido
- notas de contexto
- pieza o CTA de origen

## Mapeo mínimo recomendado

### Source type

Usar las categorías ya alineadas con `Nexus` cuando sea posible:

- `web_inbound`
- `manual`
- `crm_reactivation`
- `partner_referral`
- `paid_lead`

### Source platform

Mapeo inicial recomendado:

- CTA de `Private Estates` -> `web`
- LinkedIn -> `manual` o `other` si entra manualmente
- Instagram/Facebook -> `meta`
- WhatsApp directo -> `whatsapp`
- email -> `email`

## Lógica de clasificación inicial

## Paso 1. Identificar origen

Preguntas:

- ¿Entró desde web, outreach o carga manual?
- ¿Se conoce la campaña, CTA o pieza exacta?

## Paso 2. Detectar tipo de lead

Clasificación mínima:

- comprador
- vendedor
- partner
- ambiguo / por aclarar

Si el dato no está claro, el sistema no debe inventarlo. Debe dejarlo como pendiente de cualificación.

## Paso 3. Asignar temperatura inicial

Regla simple recomendada:

- `hot`: pide llamada, visita, shortlist o tiene intención inmediata
- `warm`: muestra interés claro pero todavía necesita claridad
- `cold`: solo descarga, curiosidad o contacto débil

## Paso 4. Proponer siguiente acción

Reglas iniciales:

- `hot` -> contacto humano en menos de 24h
- `warm` -> mensaje útil o llamada breve
- `cold` -> recurso o nurture ligero

## Siguiente acción sugerida

El sistema debe devolver una recomendación simple y visible.

Ejemplos:

- `priority_call_24h`
- `send_zone_readout`
- `request_missing_contact_data`
- `send_lead_magnet`
- `manual_review_required`

## Checkpoint humano

Este flujo debe ser semiautomático, no totalmente autónomo.

## Qué valida el humano

- que el lead no sea spam
- que el tipo de lead sea correcto
- que la temperatura propuesta tiene sentido
- que la siguiente acción no sea agresiva o absurda

## Qué no debería decidirse automáticamente todavía

- cierre de oportunidad
- secuencia compleja de outreach
- asignación final de valor comercial alto

## Métricas de éxito

Las métricas mínimas para validar el flujo son:

- tiempo medio desde entrada a clasificación
- porcentaje de leads con siguiente acción asignada
- porcentaje de leads sin contacto pasadas 24h/48h
- ratio de leads incompletos
- ratio de leads que pasan a conversación real

## Arquitectura recomendada

## Opción A. Implementación directa en Nexus

Tiene sentido si:

- el endpoint público de CTA ya está funcionando
- `Nexus` puede persistir y clasificar sin capas intermedias
- quieres mantener una sola fuente de verdad

Ventaja:

- menos piezas

Riesgo:

- más acoplamiento si luego quieres conectar múltiples canales externos

## Opción B. n8n como orquestador ligero

Tiene sentido si:

- van a entrar leads desde varios sitios distintos
- necesitas transformar payloads
- quieres alertas o bifurcaciones simples

Rol correcto de n8n aquí:

- recibir evento
- normalizar
- enrutar
- llamar a `Nexus`
- disparar alerta o log

No debería:

- sustituir la lógica comercial principal
- convertirse en la fuente de verdad del lead

La decisión entre esta opción y la implementación directa en `Nexus` se resume en:

- [[Comparativa de Arquitectura para Automatizaciones Anclora]]

## Secuencia técnica propuesta

1. evento inbound recibido
2. validación mínima de payload
3. normalización de campos
4. alta en `Nexus`
5. clasificación inicial
6. recomendación de siguiente acción
7. creación de alerta si falta contacto o si el lead es caliente

## Payload mínimo recomendado

```json
{
  "full_name": "Nombre Apellido",
  "email": "lead@example.com",
  "phone": "+34...",
  "source_type": "web_inbound",
  "source_platform": "web",
  "intent": "buyer",
  "territory": "SW Mallorca",
  "origin_asset": "cta-private-estates-diagnostico",
  "notes": "Busca vivienda para uso propio, duda entre zonas"
}
```

## Primera versión recomendada

Para la V1 de este flujo, bastaría con:

- captura inbound desde CTA
- normalización
- creación del lead o buyer en `Nexus`
- temperatura inicial simple
- recomendación de siguiente paso
- alerta visible en cola

## Riesgos a vigilar

- duplicados por leads que entran por más de un canal
- clasificación demasiado optimista
- sobreautomatización del primer contacto
- falta de campos para que el seguimiento sea útil

## Recomendación práctica

La primera implementación debe ser fea pero fiable.

Más vale un flujo que:

- capture bien
- clasifique con reglas simples
- y obligue a revisar lo importante

que una automatización más sofisticada que genere ruido o errores.

## Próxima acción

Elegir si la V1 se implementa:

- directamente dentro de `Nexus`
- o con `n8n` como capa de entrada y normalización

Y después definir:

- endpoint
- payload final
- tabla de mapeo de fuentes
- lógica exacta de temperatura

## Relacionado

- [[Primeros 3 Flujos de Automatización Anclora]]
- [[Comparativa de Arquitectura para Automatizaciones Anclora]]
- [[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]
- [[Anclora Nexus]]
- [[Funnel de Captación Inmobiliaria con IA]]
- [[Mensajes de Captación para LinkedIn y WhatsApp]]
- [[Anclora Command Center]]
