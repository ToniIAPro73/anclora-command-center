---
title: Contract Registry and Design System Sync Design
date: 2026-04-20
tags: [spec, contracts, governance, design-system, wsl, automation]
related:
  - "[[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]]"
  - "[[INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT]]"
  - "[[Mapa de repos del ecosistema Anclora]]"
---

# Contract Registry and Design System Sync Design

## Objective

Definir una segunda fase de gobernanza contractual para la bóveda que convierta los contratos actuales en un sistema doble:

- legible por humanos en markdown
- legible por scripts mediante un registro estructurado único

El objetivo práctico es que la bóveda pueda:

- saber qué contrato aplica a cada repo del ecosistema
- saber qué capas reales de `anclora-design-system` gobiernan cada contrato
- auditar faltas de sincronización
- propagar contratos a los repos consumidores sin depender de lógica dispersa o rutas codificadas a mano

## Scope of this phase

Esta fase incluye:

1. creación de un registro central `docs/governance/contracts-registry.json`
2. definición del modelo de autoridad entre bóveda, contratos y `anclora-design-system`
3. refactor mínimo de contratos maestros para que expongan metadatos estables y secciones homogéneas
4. adaptación de los scripts:
   - `scripts/audit-contract-sync.ps1`
   - `scripts/propagate-contracts.ps1`
5. preservación explícita de la separación entre:
   - `Anclora Group`
   - `Independent Products`

Esta fase no incluye:

- una reescritura completa de todos los contratos secundarios
- una migración completa de todos los repos consumidores en la misma ronda
- la implementación de un parser markdown complejo
- la conversión de `Independent Products` en consumidor automático del design system de Anclora

## Problem

La bóveda ya contiene contratos útiles, pero hoy conviven varios problemas:

- la semántica contractual está muy distribuida entre notas markdown
- los scripts siguen dependiendo en parte de rutas y reglas implícitas
- no existe una capa estructurada única que relacione:
  - contrato
  - repos consumidores
  - capas del design system
  - targets de propagación
  - dependencias entre contratos
- `anclora-design-system` ya se considera fuente de verdad ejecutable, pero esa relación todavía no está formalizada de forma operativa para scripts

El resultado es que la gobernanza existe conceptualmente, pero la automatización sigue siendo frágil.

## Design principles

- una sola fuente estructurada para automatización
- contratos markdown siguen siendo la referencia humana
- cero parsing ambiguo de prosa para tomar decisiones operativas
- separación clara entre autoridad documental y autoridad ejecutable
- compatibilidad con la nueva localización WSL de los repos
- evolución incremental sobre el sistema actual, no reinvención total

## Authority model

### Vault authority

La bóveda gobierna:

- clasificación del ecosistema
- contratos
- alcance
- excepciones
- dependencias contractuales
- targets de propagación
- criterios de cumplimiento

### Design system authority

`anclora-design-system` gobierna la implementación ejecutable de:

- `taxonomy`
- `tokens`
- `themes`
- `foundations`
- `components`
- `patterns`
- `assets`

### Consumer repo authority

Cada repo consumidor:

- implementa localmente los contratos que le aplican
- puede documentar excepciones locales
- no puede redefinir como fuente de verdad una pieza ya canónica en `anclora-design-system`

## Contract model

Cada contrato seguirá existiendo como documento markdown en `docs/standards/`, pero los contratos maestros de esta fase deberán converger hacia una estructura estable:

1. objetivo
2. autoridad
3. piezas canónicas del design system
4. invariantes
5. excepciones
6. repos a los que aplica
7. criterio de cumplimiento
8. sincronización con repos consumidores

No se busca que el markdown sea la capa que los scripts interpreten semánticamente. Esa función recaerá en el registro central.

## Central registry

Se creará `docs/governance/contracts-registry.json` como catálogo único para automatización.

Cada entrada representará un contrato canónico del ecosistema o un contrato paralelo de otro universo, por ejemplo `Independent Products`.

### Required fields

Cada entrada deberá incluir, como mínimo:

- `id`
- `title`
- `path`
- `status`
- `contract_type`
- `scope`
- `source_of_truth`
- `design_system_layers`
- `applies_to_repos`
- `propagation_targets`
- `depends_on`
- `supersedes`
- `independent_from`
- `last_reviewed_at`

### Semantic meaning

- `source_of_truth`
  - indica si la autoridad primaria es `vault`, `design_system`, o una combinación documentada
- `design_system_layers`
  - lista explícita de capas consumidas de `anclora-design-system`
- `applies_to_repos`
  - lista de ids de repo del inventario que deben cumplir ese contrato
- `propagation_targets`
  - rutas relativas destino dentro de repos consumidores, por ejemplo `docs/standards/`
- `depends_on`
  - contratos que deben leerse antes o junto a este
- `supersedes`
  - contratos antiguos o reemplazados, si existen
- `independent_from`
  - universos o familias a los que explícitamente no debe contaminar

## Initial contract set

La primera versión del registro debe cubrir, como mínimo:

- `ANCLORA_ECOSYSTEM_CONTRACT_GROUPS`
- `ANCLORA_INTERNAL_APP_CONTRACT`
- `ANCLORA_PREMIUM_APP_CONTRACT`
- `ANCLORA_ULTRA_PREMIUM_APP_CONTRACT`
- `ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT`
- `ANCLORA_BRANDING_MASTER_CONTRACT`
- `UI_MOTION_CONTRACT`
- `MODAL_CONTRACT`
- `LOCALIZATION_CONTRACT`
- `INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT`

## Relationship with ecosystem inventory

`contracts-registry.json` no debe duplicar toda la taxonomía de repos. Debe apoyarse en:

- `docs/governance/ecosystem-repos.json`
- `docs/governance/independent-products.json`

La relación correcta es:

- el inventario clasifica repos y productos
- el registro contractual define qué contratos aplican y cómo se sincronizan

## Separation of universes

`Independent Products` debe mantenerse como universo paralelo.

Esto implica:

- no hereda automáticamente contratos de `Anclora Group`
- no hereda automáticamente branding premium
- no aparece mezclado en reglas de propagación de contratos Anclora
- sí puede figurar en `contracts-registry.json`, pero marcado como contrato paralelo e independiente

La finalidad es que el sistema de automatización conozca su existencia sin contaminar las reglas del ecosistema premium.

## Script behavior

### `audit-contract-sync.ps1`

Debe pasar a leer primero:

1. `docs/governance/contracts-registry.json`
2. `docs/governance/ecosystem-repos.json`
3. `docs/governance/independent-products.json` cuando aplique

Debe poder responder:

- qué contratos faltan en cada repo
- qué contratos están potencialmente desactualizados
- qué repos dependen de un contrato modificado
- qué cambios exigen revisión de design system además de revisión contractual

### `propagate-contracts.ps1`

Debe usar el registro central para:

- identificar contratos fuente
- resolver repos aplicables
- copiar solo contratos obligatorios
- ignorar repos fuera de alcance
- funcionar con rutas WSL inventariadas en la bóveda

La propagación debe seguir siendo conservadora:

- sin sobreescribir silenciosamente excepciones locales no auditadas
- sin mezclar contratos de `Independent Products` con contratos Anclora

## Expected contract refactors in this phase

No hace falta reescribir todo el catálogo contractual. En esta fase basta con consolidar los contratos que gobiernan más superficie:

- `ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- `ANCLORA_PREMIUM_APP_CONTRACT.md`
- `ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`
- `ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`
- `INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`

El refactor consiste en homogeneizar encabezados, autoridad, referencia al design system y sincronización, no en cambiar su intención semántica de fondo.

## Success criteria

La fase se considera correcta si:

1. existe `docs/governance/contracts-registry.json` con cobertura útil del sistema actual
2. los contratos maestros relevantes exponen estructura homogénea y relación explícita con `anclora-design-system`
3. `audit-contract-sync.ps1` puede detectar faltas y dependencias a partir del registro central
4. `propagate-contracts.ps1` puede resolver targets desde el registro sin lógica manual dispersa
5. `Independent Products` sigue separado del universo contractual Anclora
6. la nueva localización WSL no bloquea el flujo de auditoría y propagación

## Risks

- duplicar autoridad entre inventario y registro contractual
- intentar modelar demasiada semántica desde el principio
- romper scripts por asumir campos no presentes en todos los repos
- convertir esta fase en una migración total en vez de una estabilización incremental

## Mitigations

- mantener el inventario de repos y el registro contractual como capas distintas
- introducir sólo campos operativamente necesarios
- soportar defaults razonables para repos sin cobertura completa
- limitar el refactor documental a los contratos de mayor impacto

## Out of scope follow-ups

Quedan para fases posteriores:

- validadores automáticos más finos por tipo de contrato
- sincronización bidireccional con el repo `anclora-design-system`
- promoción automática de piezas locales hacia el design system
- contratos o design system específicos para `Independent Products`
