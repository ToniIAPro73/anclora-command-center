---
title: CRM Inmobiliario con IA
type: playbook
status: active
tags: [playbook, crm, inmobiliario, ia, automatizacion]
related:
  - "[[Operativa Inmobiliaria con IA - insights NotebookLM]]"
  - "[[Nutrición y Seguimiento Comercial con IA]]"
  - "[[Reportes Automáticos para Inmobiliarias]]"
  - "[[Anclora Nexus]]"
  - "[[Coda]]"
  - "[[Slack]]"
  - "[[Anclora Command Center]]"
---

# CRM Inmobiliario con IA

## Objetivo

Construir un sistema comercial donde la captura, clasificacion, seguimiento y traspaso de leads sea consistente, medible y util para cerrar mas sin perder contexto.

## Cuándo usarlo

- Cuando los leads entran por varios canales y se pierden por lentitud o desorden.
- Cuando el equipo comercial sigue cargando datos a mano.
- Cuando el pipeline existe, pero no sirve para priorizar ni coordinar.

## Arquitectura recomendada

- Entrada omnicanal: formularios, portales, WhatsApp, contenido, referidos.
- Capa de IA: recoge datos, clasifica, resume y dispara acciones.
- Base central: [[Anclora Nexus]] como memoria de pipeline y estado comercial.
- Capa operativa: [[Coda]] para vistas, seguimiento y control.
- Coordinacion: [[Slack]] para alertas, handoff y bloqueos.

## Campos minimos por lead

- nombre
- telefono o canal principal
- origen
- propiedad o tipo de activo
- presupuesto
- urgencia
- temperatura
- objecion principal
- siguiente accion
- responsable

## Flujo

1. El lead entra por un canal real.
2. La IA responde en segundos y hace preguntas de calificacion.
3. El sistema registra automaticamente los datos utiles.
4. Se asigna temperatura: frio, tibio o caliente.
5. Se activa nutricion o handoff segun el caso.
6. El asesor recibe un resumen estructurado cuando el lead ya esta listo para avanzar.
7. El pipeline se actualiza en [[Anclora Nexus]] y se coordina en [[Coda]] y [[Slack]].

## Reglas de operacion

- La IA no sustituye el cierre humano.
- No se permite `data entry` manual como cuello de botella principal.
- Toda etapa debe tener salida clara o siguiente accion.
- Toda objecion repetida debe convertirse en contenido o guion comercial.

## Handoff al asesor

El traspaso ocurre cuando el lead:

- pide llamada
- pide visita
- confirma presupuesto y urgencia
- responde positivamente a una propuesta de siguiente paso

El resumen al asesor debe incluir:

- quien es
- que quiere
- que activo o zona le interesa
- presupuesto y urgencia
- objecion principal
- accion solicitada

## Validacion

- El equipo puede ver el estado real del embudo sin preguntar por WhatsApp.
- Los leads calientes no dependen de memoria humana.
- El tiempo de respuesta baja y la calidad del contexto sube.

## Riesgos

- Automatizar demasiado pronto sin definir proceso.
- Separar prospeccion, CRM y reporting en herramientas desconectadas.
- Medir actividad en lugar de calidad del pipeline.

## Relacionado

- [[Operativa Inmobiliaria con IA - insights NotebookLM]]
- [[Nutrición y Seguimiento Comercial con IA]]
- [[Reportes Automáticos para Inmobiliarias]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
