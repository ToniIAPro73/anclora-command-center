---
title: Reportes Automáticos para Inmobiliarias
type: playbook
estado: activo
tags: [playbook, reportes, inmobiliario, ia, direccion]
related:
  - "[[CRM Inmobiliario con IA]]"
  - "[[Operativa Inmobiliaria con IA - insights NotebookLM]]"
  - "[[Anclora Command Center]]"
  - "[[Anclora Nexus]]"
---

# Reportes Automáticos para Inmobiliarias

## Objetivo

Diseñar reporting automatico util por rol para que operacion, direccion y propietarios tomen decisiones con datos y no con sensacion.

## Cuándo usarlo

- Cuando la informacion comercial existe, pero tarda en consolidarse.
- Cuando los asesores reportan demasiado y venden poco.
- Cuando direccion necesita leer el negocio sin perseguir a cada persona.

## Reporte diario

Para:

- asesores
- coordinadores comerciales

Contenido:

- leads ingresados del dia
- origen de cada lead
- propiedad o zona consultada
- presupuesto y urgencia
- etapa actual
- tareas pendientes

Objetivo:

- asegurar seguimiento
- detectar fugas del dia
- evitar `data entry` repetitivo

## Reporte semanal

Para:

- direccion comercial
- responsables de captacion

Contenido:

- volumen total de consultas
- leads por canal
- rendimiento por asesor
- tasa de agenda
- propiedades o zonas con mas demanda
- cuellos de botella del embudo

Objetivo:

- reasignar leads
- corregir saturacion
- ajustar presupuesto y foco comercial

## Reporte mensual interno

Para:

- direccion
- responsable de operaciones

Contenido:

- pipeline mensual completo
- tasa de cierre
- tiempo medio de respuesta
- coste por lead
- ingresos generados
- nuevas propiedades captadas

Objetivo:

- entender rentabilidad comercial
- decidir inversiones y prioridades

## Reporte mensual para propietarios

Para:

- propietarios de inmuebles

Contenido:

- numero real de consultas
- canales de origen
- nivel de interes detectado
- objeciones frecuentes
- comparativa con activos similares

Objetivo:

- eliminar percepcion de opacidad
- justificar ajustes de precio o estrategia

## Implementacion en Anclora

- [[Inmovilla]] y [[StateFox]] aportan contexto de demanda, activos y zonas
- [[Anclora Nexus]] consolida el estado del pipeline
- [[Anclora Command Center]] resume el pulso ejecutivo
- [[Anclora Cuadro de Mando Real Estate]] ofrece una lectura operativa del dataset inmobiliario para detectar prioridades, bloqueos y dependencias
- [[Coda]] puede servir como superficie de lectura para el equipo
- [[Slack]] distribuye alertas y resúmenes breves

## Reglas

- Cada reporte debe tener un dueño claro.
- No mezclar metricas de ego con metricas de negocio.
- Todo numero debe responder a una decision posible.

## Estado de implementabilidad

### Ya util hoy

- definir plantillas de reportes
- decidir metricas por rol
- preparar lecturas manuales o semimanuales

### No desplegado aun

- reportes automaticos programados
- consolidacion automatica de fuentes
- distribucion automatica por canal interno

### Dependencia probable

- `n8n` para consolidar datos y disparar reportes

## 🧠 Base de research

Para que estos reportes tengan valor real, [[Anclora Data Lab]] debe definir mejor señales y lecturas, mientras [[Operativa Inmobiliaria con IA - insights NotebookLM]] aporta la lógica de reporting por rol.

## Validacion

- El reporte diario cambia el trabajo del dia.
- El semanal ayuda a reasignar foco.
- El mensual permite decisiones de direccion o de propietario.

## Relacionado

- [[CRM Inmobiliario con IA]]
- [[Operativa Inmobiliaria con IA - insights NotebookLM]]
- [[Anclora Nexus]]
- [[Anclora Command Center]]
- [[Anclora Cuadro de Mando Real Estate]]
- [[Anclora Data Lab]]
- [[Arquitectura Implementable de Automatización Anclora]]
