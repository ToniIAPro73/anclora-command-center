---
title: Primeros 3 Flujos de Automatización Anclora
type: implementation-plan
estado: activo
scope: automatizacion-comercial
priority: alta
tags: [automatizacion, nexus, content-generator, n8n, captacion, plan]
related:
  - "[[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]"
  - "[[Comparativa de Arquitectura para Automatizaciones Anclora]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Content Generator AI]]"
  - "[[Funnel de Captación Inmobiliaria con IA]]"
  - "[[Mensajes de Captación para LinkedIn y WhatsApp]]"
  - "[[Captación Multicanal - Instagram, Facebook y Cold Email]]"
  - "[[Anclora Command Center]]"
---

# Primeros 3 Flujos de Automatización Anclora

## Objetivo

Definir los tres primeros flujos de automatización que tienen mejor relación entre:

- retorno esperado
- complejidad de implementación
- valor práctico para el sistema comercial actual

La prioridad no es automatizar todo. Es automatizar lo que reduce fricción y mejora captación, seguimiento y reutilización de activos.

## Criterio de selección

Un flujo entra en esta lista si cumple al menos tres condiciones:

- protege oportunidades que hoy se pueden perder
- ahorra trabajo repetitivo
- mejora la calidad del seguimiento
- se apoya en piezas ya existentes del ecosistema
- puede convivir con supervisión humana

## Flujo 1. Inbound -> clasificación -> siguiente acción

## Qué resuelve

Evita que un lead que entra desde CTA, formulario, WhatsApp o canal manual quede sin clasificar o sin siguiente paso claro.

## Sistema implicado

- `Private Estates` como entrada pública
- [[Anclora Nexus]] como sistema de captura y clasificación
- [[Anclora Command Center]] como superficie de seguimiento

## Secuencia ideal

1. entra lead
2. se registra origen
3. se clasifica por intención y temperatura
4. se propone siguiente acción
5. queda visible en cola operativa

## Qué puede automatizarse ya

- normalización del lead
- etiquetado por origen
- asignación de estado inicial
- timestamp de entrada
- alerta de “lead nuevo sin tocar”

## Qué debe seguir siendo humano

- validación comercial del encaje
- primer contacto sensible
- decisión de prioridad fina cuando el contexto es ambiguo

## Dónde encaja n8n

Muy bien como orquestador ligero si quieres recoger entradas desde varios canales y empujarlas a `Nexus` o a un buffer previo.

## Retorno esperado

Muy alto.

Es el flujo con mejor ROI porque protege negocio desde el primer punto de entrada.

### Estado actual

La V1 de este flujo ya está validada y documentada en:

- [[Especificación n8n - Inbound Lead Intake to Nexus]]
- [[Flujo Implementable - Inbound a Nexus]]

El siguiente paso operativo natural es:

- [[Flujo Implementable - Alerta y Seguimiento Comercial]]

## Flujo 2. Señal interna de Nexus -> outreach supervisado

## Qué resuelve

Convierte las señales de prospección interna y los matches relevantes en acciones comerciales reales, sin depender de que todo se haga manualmente desde cero.

## Sistema implicado

- [[Anclora Nexus]] como generador de señales y workbench
- buyer outreach supervisado existente en Nexus
- [[Mensajes de Captación para LinkedIn y WhatsApp]]
- [[Captación Multicanal - Instagram, Facebook y Cold Email]]

## Secuencia ideal

1. `Nexus` detecta match, oportunidad o señal relevante
2. se genera borrador contextualizado
3. se propone canal
4. el operador revisa
5. se envía y se registra el resultado

## Qué puede automatizarse ya

- generación de borradores
- recomendación de canal
- propuesta de siguiente mejor acción
- alertas de buyer/match sin seguimiento

## Qué debe seguir siendo humano

- el envío final
- la personalización final
- la lectura reputacional del contacto

## Dónde encaja n8n

Puede actuar como capa futura de coordinación entre alertas, colas y notificaciones, pero este flujo ya tiene parte de la base dentro de `Nexus`.

## Retorno esperado

Muy alto.

Es probablemente la automatización más cercana a conversión real si el dataset y los matches ya son útiles.

## Flujo 3. Señal o insight -> pieza multicanal -> CTA

## Qué resuelve

Evita que las señales buenas se pierdan o solo se conviertan en una pieza aislada. Permite transformar una lectura de mercado o una objeción en varios activos listos para visibilidad y captación.

## Sistema implicado

- [[Anclora Content Generator AI]]
- [[Estrategia de Autoridad IA Inmobiliaria]]
- [[Lead Magnets Inmobiliarios para SW Mallorca]]
- [[Anclora Command Center]]

## Secuencia ideal

1. se detecta tema o insight
2. `Content Generator` crea varias derivadas
3. se seleccionan las piezas válidas
4. se publica o se programa
5. se conecta a CTA y seguimiento

## Qué puede automatizarse ya

- creación de variantes por canal
- derivación de una pieza larga a versiones cortas
- generación de borrador para LinkedIn, Instagram, newsletter y outreach
- sugerencia de CTA por tipo de pieza

## Qué debe seguir siendo humano

- criterio editorial final
- publicación
- adaptación fina al momento de mercado

## Dónde encaja n8n

Encaja bien más adelante para mover borradores, disparar recordatorios o alimentar un calendario, pero no es obligatorio para activar ya el flujo.

## Retorno esperado

Alto.

No convierte tan directamente como los dos primeros, pero multiplica la capacidad de mantener presencia constante con menos fricción.

## Orden recomendado de implementación

1. inbound clasificado en `Nexus`
2. outreach supervisado desde señales internas
3. reciclaje editorial multicanal desde `Content Generator`

## Por qué este orden

- el primero protege oportunidades
- el segundo acelera seguimiento y contacto
- el tercero amplifica visibilidad y consistencia comercial

## Qué papel debería jugar n8n

## Ahora

Usarlo solo donde simplifique y no donde complique.

Buenos usos tempranos:

- recibir eventos desde formularios o canales
- normalizar payloads
- disparar alertas sencillas
- conectar sistemas que hoy no se hablan entre sí

## Después

Cuando el proceso esté claro, n8n puede crecer hacia:

- orquestación multicanal
- recordatorios automáticos
- triggers editoriales
- reporting unificado

## Regla de implementación

No construir el flujo técnicamente hasta responder estas tres preguntas:

1. ¿Qué evento lo dispara?
2. ¿Qué decisión toma el sistema?
3. ¿Qué resultado visible mejora para el negocio?

## Siguiente paso recomendado

Elegir uno de estos tres flujos y bajar su implementación a nivel de:

- disparador
- datos mínimos
- decisión automática
- checkpoint humano
- métrica de éxito

El criterio para decidir la arquitectura adecuada vive en:

- [[Comparativa de Arquitectura para Automatizaciones Anclora]]

## Relacionado

- [[Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones]]
- [[Comparativa de Arquitectura para Automatizaciones Anclora]]
- [[Anclora Nexus]]
- [[Anclora Content Generator AI]]
- [[Funnel de Captación Inmobiliaria con IA]]
- [[Mensajes de Captación para LinkedIn y WhatsApp]]
- [[Captación Multicanal - Instagram, Facebook y Cold Email]]
- [[Anclora Command Center]]
