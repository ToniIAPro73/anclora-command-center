---
title: Anclora Group - Standards, Governance and Source Priority
tipo: recurso
creado: 2026-04-02
tags: [resource, anclora, governance, standards]
---

# Anclora Group - Standards, Governance and Source Priority

## Papel de Boveda-Anclora

`Boveda-Anclora` no es un repositorio auxiliar. Es la fuente de verdad documental del ecosistema para:

- arquitectura de integración
- principios de operación del segundo cerebro
- mapas del sistema de agentes
- notas canónicas de productos
- playbooks
- especificaciones
- contratos de familia de aplicaciones

## Familias de aplicaciones

Según `docs/governance/APPLICATION_FAMILY_MAP.md`, las familias activas son:

### Internal

- `anclora-group`
- `anclora-nexus`
- `anclora-content-generator-ai`

Contrato de familia:

- `ANCLORA_INTERNAL_APP_CONTRACT.md`

### Premium

- `anclora-command-center`
- `anclora-data-lab`
- `anclora-synergi`

Contrato de familia:

- `ANCLORA_PREMIUM_APP_CONTRACT.md`

### Ultra Premium

- `anclora-private-estates`

Contrato de familia:

- `ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`

### Portfolio / Showcase

- `anclora-portfolio`
- `anclora-azure-bay-landing`
- `anclora-playa-viva-uniestate`

Contrato de familia:

- `ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT.md`

## Contratos universales

Todas las apps se leen bajo tres contratos transversales:

- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`

## Cómo debe razonar ChatGPT con esta gobernanza

Cuando una pregunta sea sobre producto, UX, implementación o coherencia entre apps:

1. identificar primero la app correcta
2. ubicar su familia contractual
3. aplicar contratos universales y de familia
4. solo después bajar a detalle técnico o visual

## Prioridad de fuentes dentro del proyecto

Cuando dos documentos parezcan solaparse, usar este orden:

1. documentos consolidados creados para el proyecto ChatGPT
2. notas canónicas de `resources/`, `sistemas/`, `playbooks/`, `proyectos/` y `research/` dentro de `Boveda-Anclora`
3. documentos de gobierno bajo `docs/governance/` y `docs/standards/`
4. READMEs de repositorios
5. inferencias explícitas y acotadas

## Hechos frente a inferencias

ChatGPT debe:

- tratar como hecho aquello que esté afirmado por README o nota canónica
- tratar como inferencia aquello que solo se deduzca por nombre, estructura o dependencias
- marcar como hueco de información aquello que no tenga soporte suficiente

## Exclusiones del proyecto

Aunque formen parte del universo Anclora en sentido amplio, estos repos no deben contaminar el contexto base del proyecto:

- `anclora-talent`
- `anclora-agent-skills`
- `anclora-awesome-skills`
- `anclora-impulso`
- `anclora-advisor-ai`

Solo deben entrar si el usuario los menciona explícitamente.

## Recomendación práctica de carga en ChatGPT

Si el proyecto admite pocas fuentes, priorizar estas cuatro:

1. `00-anclora-group-project-system-prompt.md`
2. `01-anclora-group-ecosystem-overview.md`
3. `02-anclora-group-application-catalog.md`
4. `03-anclora-group-architecture-workflows-and-dashboards.md`

Si caben más fuentes, añadir también este documento como capa de gobierno y lectura correcta del sistema.
