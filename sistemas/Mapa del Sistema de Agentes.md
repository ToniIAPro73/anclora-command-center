# Mapa del Sistema de Agentes

Esta nota explica cómo se organiza la capa de agentes, skills y compatibilidad del repositorio para que el segundo cerebro pueda trabajarse desde Obsidian con distintos agentes sin perder coherencia.

## Visión general

El sistema tiene cuatro piezas principales:

- [[AGENTS]]
- [[CLAUDE]]
- [[scripts/README]]
- [[El Arquitecto del Segundo Cerebro Autónomo]]

## Documento canónico

La guía principal del sistema es [[AGENTS]].

Ahí viven:

- las reglas de estructura de la bóveda
- los criterios editoriales
- la política de uso de skills
- la clasificación entre `research`, `playbooks`, `sistemas` y `resources`

## Compatibilidad con Claude

[[CLAUDE]] se mantiene como archivo puente para herramientas o agentes que esperan ese nombre.

No es la fuente principal de reglas; su función es redirigir hacia [[AGENTS]] y mantener compatibilidad con flujos anteriores.

## Skills y fuente de verdad

La fuente canónica de skills del repositorio es `.codex/skills/`.

Esa carpeta contiene dos capas:

- skills de workflow, como captura, creación de notas y jardinería de la bóveda
- skills técnicas de soporte, como markdown de Obsidian, CLI, canvas, bases y extracción web

La carpeta `.claude/skills/` existe como capa de compatibilidad derivada.

## Sincronización

La sincronización entre `.codex/skills/` y `.claude/skills/` se documenta en [[scripts/README]].

El script operativo está en `scripts/sync-skills.ps1`.

## Cómo pensar esta arquitectura

Este sistema no sustituye el propósito original del segundo cerebro; lo amplía.

- Obsidian sigue siendo la base del conocimiento.
- [[AGENTS]] define cómo debe comportarse un agente dentro del sistema.
- [[CLAUDE]] permite seguir siendo compatible con Claude Code.
- Las skills canónicas en `.codex/skills/` permiten que otros agentes trabajen con la misma lógica.

## Relacionado

- [[AGENTS]]
- [[CLAUDE]]
- [[scripts/README]]
- [[Rutina Diaria del Segundo Cerebro]]
- [[Revisión Semanal del Segundo Cerebro]]
- [[Consolidación Mensual del Segundo Cerebro]]
- [[Sistema CPR_ Gestión Eficiente de Contexto en Claude Code]]
- [[El Arquitecto del Segundo Cerebro Autónomo]]
