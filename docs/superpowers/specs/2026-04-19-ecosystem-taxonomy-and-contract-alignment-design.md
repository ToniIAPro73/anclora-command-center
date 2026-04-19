---
title: Ecosystem Taxonomy and Contract Alignment Design
date: 2026-04-19
tags: [spec, ecosystem, taxonomy, contracts, design-system, governance]
status: draft
related:
  - "[[resources/Anclora Design System]]"
  - "[[resources/Mapa de repos del ecosistema Anclora]]"
  - "[[docs/governance/ecosystem-repos.json]]"
---

# Ecosystem Taxonomy and Contract Alignment Design

## Contexto

El inventario actual del ecosistema mezcla en `family` varias dimensiones distintas:

- nivel de producto (`premium`, `ultra_premium`)
- dominio de negocio (`real_estate`)
- tipo de superficie (`portfolio_showcase`)
- rol sistémico (`system`, `matrix`)

Esto ya genera incoherencias prácticas:

- `anclora-impulso` es Premium, pero no pertenece al grupo Real Estate
- `anclora-talent` debe seguir siendo Premium, pero pertenece al dominio `human_capital`
- `anclora-command-center` participa en el cluster Real Estate, pero su naturaleza es transversal
- los contratos actuales se propagan por `family`, aunque muchos cambios deberían depender de `tier`, `domain` o `ecosystem_clusters`

Además, el sistema contractual debe alinearse con `anclora-design-system` para que la capa de gobernanza no diverja de la capa ejecutable de implementación.

## Objetivo

Separar de forma explícita la taxonomía del ecosistema y preparar una base estable para:

- reclasificar correctamente cada repo
- propagar contratos por criterio real y no por agrupaciones ambiguas
- alinear contratos y design system sin duplicar la fuente de verdad
- permitir que `anclora-design-system` sea canon de implementación y los contratos canon de cumplimiento

## Principios

1. Un eje taxonómico no debe mezclar negocio, nivel de experiencia y rol sistémico.
2. El design system define el `cómo se construye`.
3. Los contratos definen el `qué se debe cumplir`.
4. Si una norma puede expresarse como token, primitive o componente reutilizable, debe vivir primero en `anclora-design-system`.
5. Si una norma es una obligación de uso, restricción o criterio de aceptación entre repos, debe vivir en contratos.
6. Los contratos deben referenciar artefactos concretos del design system y no redefinir implementación visual ya resuelta allí.

## Nueva taxonomía propuesta

Cada repo del ecosistema debe clasificarse con estos ejes:

### 1. `tier`

Define el nivel de producto y exigencia de experiencia.

Valores iniciales:

- `core`
- `shared`
- `internal`
- `premium`
- `ultra_premium`

### 2. `domain`

Define el dominio o vertical de negocio principal.

Valores iniciales:

- `real_estate`
- `fitness_wellness`
- `human_capital`
- `group_ops`
- `cross_domain`
- `brand_system`

### 3. `product_archetype`

Define el tipo de superficie o producto.

Valores iniciales:

- `app`
- `portal`
- `workspace`
- `landing`
- `system`
- `command_center`

### 4. `system_role`

Define el papel sistémico dentro del ecosistema.

Valores iniciales:

- `source`
- `consumer`
- `reference`
- `orchestration`
- `matrix`

### 5. `ecosystem_clusters`

Lista opcional de pertenencia operativa a cadenas o subecosistemas.

Valores iniciales recomendados:

- `real_estate`
- `premium_apps`
- `brand_governance`
- `design_system`
- `group_ops`
- `internal_ops`
- `showcase`

## Clasificación propuesta repo por repo

### Núcleo y sistema

- `anclora-group`
  - `tier = core`
  - `domain = group_ops`
  - `product_archetype = system`
  - `system_role = matrix`
  - `ecosystem_clusters = ['brand_governance', 'group_ops']`

- `anclora-design-system`
  - `tier = shared`
  - `domain = brand_system`
  - `product_archetype = system`
  - `system_role = source`
  - `ecosystem_clusters = ['brand_governance', 'design_system']`

### Superficies transversales

- `anclora-command-center`
  - `tier = premium`
  - `domain = cross_domain`
  - `product_archetype = command_center`
  - `system_role = orchestration`
  - `ecosystem_clusters = ['real_estate', 'premium_apps']`

### Real Estate

- `anclora-private-estates`
  - `tier = ultra_premium`
  - `domain = real_estate`
  - `product_archetype = portal`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate']`

- `anclora-data-lab`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = workspace`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'premium_apps']`

- `anclora-synergi`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = portal`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'premium_apps']`

- `anclora-nexus`
  - `tier = internal`
  - `domain = real_estate`
  - `product_archetype = workspace`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'internal_ops']`

- `anclora-content-generator-ai`
  - `tier = internal`
  - `domain = real_estate`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'internal_ops']`

- `anclora-portfolio`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = landing`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'showcase']`

- `anclora-azure-bay-landing`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = landing`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'showcase']`

- `anclora-playa-viva-uniestate`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = landing`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'showcase']`

### Premium fuera de Real Estate

- `anclora-impulso`
  - `tier = premium`
  - `domain = fitness_wellness`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['premium_apps']`

- `anclora-talent`
  - `tier = premium`
  - `domain = human_capital`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['premium_apps']`

### Otras apps internas

- `anclora-advisor-ai`
  - `tier = internal`
  - `domain = cross_domain`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['internal_ops']`

## Relación entre contratos y design system

La jerarquía objetivo es:

### `anclora-design-system`

Fuente de verdad de implementación:

- tokens
- primitives
- componentes reutilizables
- variantes
- motion base
- ejemplos de uso

### Contratos

Fuente de verdad de cumplimiento:

- obligaciones
- restricciones
- criterios de aceptación
- reglas de adopción por tier, domain o cluster

### Regla de sincronización

Todo contrato visual o de interacción debe:

1. referenciar artefactos concretos del design system
2. evitar redefinir estilos ya implementados en el design system
3. describir qué roles, estados y criterios deben cumplirse
4. delegar el detalle de implementación a tokens, primitives y componentes del design system

## Rediseño del mapa contractual

La capa contractual debe separarse en cuatro familias:

### 1. Contratos por tier

- `INTERNAL_APP_CONTRACT.md`
- `PREMIUM_APP_CONTRACT.md`
- `ULTRA_PREMIUM_APP_CONTRACT.md`

### 2. Contratos por dominio

- `REAL_ESTATE_DOMAIN_CONTRACT.md`
- `HUMAN_CAPITAL_DOMAIN_CONTRACT.md`
- futuros dominios según necesidad

### 3. Contratos por superficie o archetype

- `LANDING_SURFACES_CONTRACT.md`
- `WORKSPACE_SURFACES_CONTRACT.md`
- `PORTAL_SURFACES_CONTRACT.md`
- `COMMAND_CENTER_SURFACES_CONTRACT.md`

### 4. Contratos transversales

- `UI_MOTION_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`
- `BRAND_TOKEN_USAGE_CONTRACT.md`
- `INTERACTION_STATES_CONTRACT.md`
- `ACCESSIBILITY_UI_CONTRACT.md`

## Tratamiento de CHG-0003

`CHG-0003` no debe resolverse como una unificación cromática de cards premium.

La reformulación correcta es:

- crear un contrato de superficies premium o de estados interactivos
- definir roles de card y estados obligatorios
- dejar el color como capa semántica local apoyada en tokens y variantes del design system

Esto evita romper productos Premium con semánticas diferentes:

- `anclora-impulso` no pertenece a Real Estate
- `anclora-data-lab`, `anclora-synergi` y `anclora-command-center` tienen lenguaje premium, pero no comparten la misma lógica cromática

## Migración propuesta

### Fase 1. Inventario

Actualizar `docs/governance/ecosystem-repos.json` para introducir:

- `tier`
- `domain`
- `product_archetype`
- `system_role`
- `ecosystem_clusters`

Mantener `family` solo como campo legado temporal mientras se adapta la lógica de scripts.

### Fase 2. Scripts

Adaptar:

- `scripts/audit-contract-sync.ps1`
- `scripts/propagate-contracts.ps1`

para que puedan seleccionar repos por:

- `tier`
- `domain`
- `ecosystem_clusters`

y no dependan únicamente de `family`.

### Fase 3. Contratos

Separar el mapa contractual actual en contratos por:

- tier
- domain
- archetype
- transversal

### Fase 4. Design system

Mapear cada contrato visual nuevo con:

- tokens
- primitives
- componentes
- variantes

en `anclora-design-system`.

## Riesgos

- mantener `family` como eje principal perpetuaría la ambigüedad actual
- mover todo de golpe sin compatibilidad rompería scripts de propagación y auditoría
- intentar unificar color premium a través de todos los productos generaría incoherencias visuales y funcionales

## Resultado esperado

Al terminar esta migración:

- `anclora-impulso` y `anclora-talent` seguirán siendo Premium sin quedar mal absorbidas por Real Estate
- `anclora-command-center` quedará clasificado como transversal con foco operativo actual en Real Estate
- los contratos podrán propagarse por criterio real
- `anclora-design-system` y la capa contractual dejarán de competir entre sí
- los cambios visuales futuros podrán gobernarse por roles y estados, no por colores arbitrarios
