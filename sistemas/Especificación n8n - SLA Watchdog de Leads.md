---
title: Especificación n8n - SLA Watchdog de Leads
type: implementation-spec
estado: activo
scope: n8n-lead-sla-watchdog
priority: alta
tags: [n8n, nexus, leads, sla, watchdog, supabase, email]
related:
  - "[[Flujo Implementable - Alerta y Seguimiento Comercial]]"
  - "[[Especificación n8n - Inbound Lead Intake to Nexus]]"
  - "[[Especificación n8n - Alerta por Email para Leads]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Command Center]]"
---

# Especificación n8n - SLA Watchdog de Leads

## Resumen

Esta nota define la V1 del workflow que detecta leads sin atender dentro de SLA y envía un email-resumen operativo.

El flujo revisa:

- leads `hot` vencidos a 24 horas
- leads `warm` vencidos a 48 horas

## Decisión técnica

La V1 no se apoya en un endpoint público de `Nexus` para listar leads, porque hoy no existe uno simple y estable para este caso.

Por eso el workflow consulta directamente la tabla `leads` en Supabase mediante REST.

## Qué entiende la V1 por SLA vencido

## Hot vencido

Se considera `hot` vencido si:

- `status = new`
- `ai_priority >= 4`
- `created_at < ahora - 24h`

## Warm vencido

Se considera `warm` vencido si:

- `status = new`
- `ai_priority = 3`
- `created_at < ahora - 48h`

## Qué asume esta versión

Asume que:

- cuando un lead ha sido realmente tocado, deja de estar en `status = new`
- `ai_priority` refleja bien el nivel comercial inicial

Si más adelante `Nexus` introduce estados o campos de seguimiento mejores, este watchdog debería adaptarse a ellos.

## Nombre recomendado del workflow

`Anclora - Lead SLA Watchdog`

## Diseño del flujo

`schedule -> build query context -> fetch hot breaches -> fetch warm breaches -> merge -> compose digest -> send email`

## Nodo 1. Hourly SLA Check

Tipo:

- `n8n-nodes-base.scheduleTrigger`

Configuración propuesta:

- cron cada hora, minuto 5

## Nodo 2. Build SLA Query Context

Tipo:

- `n8n-nodes-base.code`

Responsabilidades:

- calcular `hot_cutoff`
- calcular `warm_cutoff`
- dejar listos:
  - `org_id`
  - `supabase_url`
  - `recipient_email`
  - `sender_email`

## Nodo 3. Fetch Hot SLA Breaches

Tipo:

- `n8n-nodes-base.httpRequest`

Consulta:

- tabla `leads`
- `status = new`
- `ai_priority >= 4`
- `created_at < hot_cutoff`

## Nodo 4. Fetch Warm SLA Breaches

Tipo:

- `n8n-nodes-base.httpRequest`

Consulta:

- tabla `leads`
- `status = new`
- `ai_priority = 3`
- `created_at < warm_cutoff`

## Nodo 5. Merge SLA Results

Tipo:

- `n8n-nodes-base.merge`

Responsabilidades:

- esperar a que las ramas `hot` y `warm` estén listas
- evitar dobles envíos del email
- garantizar que el resumen final se compone una sola vez por ejecución

Configuración validada:

- `Mode = Combine`
- `Combine By = Position`
- `Output Type = Keep Everything`
- `Output Data From = Both Inputs Merged Together`

## Nodo 6. Compose SLA Digest

Tipo:

- `n8n-nodes-base.code`

Responsabilidades:

- combinar resultados de `hot` y `warm`
- no devolver items si no hay incidencias
- construir asunto
- construir versión `text`
- construir versión `html`
- incluir hora visible de generación en el asunto y en el cuerpo
- tolerar el caso de una rama vacía sin romper el flujo

## Nodo 7. Send SLA Alert Email

Tipo:

- `n8n-nodes-base.emailSend`

Responsabilidades:

- enviar resumen de SLA vencido
- reutilizar SMTP ya validado con Hostinger

## Campos que tendrás que cambiar

Este workflow queda muy completo, pero todavía necesita un valor real sensible:

1. `YOUR_SUPABASE_SERVICE_ROLE_KEY`

Esos cambios viven en:

- nodo `Build SLA Query Context`
- nodos `Fetch Hot SLA Breaches` y `Fetch Warm SLA Breaches`

En la versión canónica ya quedan fijados:

1. `org_id = 9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf`
2. `supabase_url = https://jtlnmypcrgmzxeuiffup.supabase.co`

La `SUPABASE_SERVICE_ROLE_KEY` debe seguir pegándose manualmente en `n8n` y no se guarda en la bóveda.

## Por qué uso Service Role Key

Porque el watchdog necesita consultar la tabla `leads` sin depender de una sesión de usuario interactiva.

La forma más estable de hacerlo en `n8n` es:

- `apikey = SERVICE_ROLE_KEY`
- `Authorization = Bearer SERVICE_ROLE_KEY`

Importante:

- la `SUPABASE_SERVICE_ROLE_KEY` debe pertenecer al mismo proyecto que `supabase_url`
- no mezclar credenciales de otros proyectos Supabase

## Configuración recomendada del email

Reutilizar la misma credencial SMTP que ya validaste:

- Hostinger SMTP
- `antonio@anclora.com`

## Frecuencia recomendada

Para V1:

- cada hora

Más adelante, si genera ruido:

- cada 2 horas
- o solo en horario laboral

## Resultado esperado

Si no hay incidencias:

- no se envía nada

Si hay incidencias:

- se envía un correo con:
  - número de `hot` vencidos
  - número de `warm` vencidos
  - detalle mínimo por lead
  - hora de generación visible en asunto y cuerpo

## Validación realizada

La versión canónica quedó validada end-to-end con:

- lectura real de leads en Supabase
- sincronización correcta de ramas `hot` y `warm` mediante `Merge`
- envío de un único email por ejecución
- asunto con timestamp para evitar agrupación confusa en Gmail

## Siguiente iteración recomendada

Después de validar esta V1, lo siguiente útil sería:

- crear tarea automática en `Nexus`
- o reflejar estos mismos casos en [[Anclora Command Center]]

## Relacionado

- [[Flujo Implementable - Alerta y Seguimiento Comercial]]
- [[Especificación n8n - Inbound Lead Intake to Nexus]]
- [[Especificación n8n - Alerta por Email para Leads]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
