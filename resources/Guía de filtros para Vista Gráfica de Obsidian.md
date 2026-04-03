---
title: Guía de filtros para Vista Gráfica de Obsidian
type: resource
estado: activo
tags: [resource, obsidian, graph, filtros]
related:
  - "[[MOC de Negocio]]"
  - "[[Mapa del Sistema de Agentes]]"
  - "[[Anclora Command Center]]"
---

# Guía de filtros para Vista Gráfica de Obsidian

Esta nota reúne consultas listas para copiar en la vista gráfica de Obsidian. El objetivo es separar conocimiento operativo de documentación técnica auxiliar para que el grafo sea más legible.

## Vista operativa por defecto

Usa esta consulta para trabajar la bóveda como segundo cerebro y no como mezcla de docs técnicas y assets de proyectos:

```text
(path:daily-notes OR path:ideas OR path:inbox OR path:personas OR path:playbooks OR path:proyectos OR path:research OR path:resources OR path:sistemas) -path:docs -path:dashboard -path:scripts -file:README -file:readme -file:LICENSE -file:license -file:CHANGELOG -file:CONTRIBUTING -file:SECURITY
```

## Vista de diagnóstico de huérfanas

Usa esta consulta cuando quieras revisar notas aisladas dentro de la capa de conocimiento:

```text
(path:daily-notes OR path:ideas OR path:inbox OR path:personas OR path:playbooks OR path:proyectos OR path:research OR path:resources OR path:sistemas) -path:docs -path:dashboard -path:scripts
```

Sugerencia de visualización:

- activar `Show orphans`
- mantener `Hide unresolved`
- dejar `Show tags` desactivado

## Vista del sistema de agentes

Usa esta consulta cuando quieras leer solo la arquitectura de la bóveda y sus reglas:

```text
path:sistemas OR file:AGENTS OR file:CLAUDE OR path:.codex OR path:.claude
```

## Vista comercial inmobiliaria

Usa esta consulta para concentrarte en el eje real estate, captación y operación comercial:

```text
path:playbooks OR path:proyectos OR path:research OR path:resources
```

Sugerencia:

- empieza desde [[MOC Real Estate Comercial]]
- cruza luego con [[Anclora Command Center]] y [[MOC Stack Operativo Anclora]]

## Lectura correcta del grafo

- Más enlaces no significa automáticamente mejor sistema.
- La mejora real viene de enlaces semánticos entre notas canónicas.
- Los hubs útiles son [[MOC de Negocio]], [[MOC Real Estate Comercial]], [[MOC Stack Operativo Anclora]], [[MOC Toni - Marca Personal y Autoridad]], [[Anclora Group]] y [[Anclora Command Center]].

## Relacionado

- [[MOC de Negocio]]
- [[MOC Real Estate Comercial]]
- [[MOC Stack Operativo Anclora]]
- [[MOC Toni - Marca Personal y Autoridad]]
- [[Mapa del Sistema de Agentes]]
- [[Anclora Command Center]]
