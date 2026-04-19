---
tipo: recurso
fuente: interna
estado: activo
fecha: 2026-04-19
tags:
  - anclora
  - governance
  - repos
  - wsl
  - design-system
related:
  - "[[Anclora Group]]"
  - "[[Anclora Command Center]]"
  - "[[Anclora Nexus]]"
  - "[[APPLICATION_FAMILY_MAP]]"
---

# Mapa de repos del ecosistema Anclora

Este mapa resume qué repos forman parte del ecosistema, qué nota principal del vault los documenta y qué relación tienen con la bóveda, los contratos y `anclora-design-system`.

## Regla de autoridad

> [!important] División de responsabilidades
> La bóveda gobierna contratos, decisiones, excepciones y cumplimiento.
> `anclora-design-system` es la fuente ejecutable de verdad para tokens, patrones, assets y componentes reutilizables.
> Las apps consumen ambas capas y no deben reescribir su propia autoridad documental.

## Estado operativo

Los repos del ecosistema ya no se asumen en `C:\Users\antonio.ballesterosa\Desktop\Proyectos`. La base operativa actual vive en WSL bajo `/home/toni/projects/...`.

La única excepción de este inventario base es `anclora-command-center`, porque su código sigue viviendo dentro de esta bóveda en `dashboard/`.

## Cómo leer este mapa

1. Si cambia la estructura del ecosistema, la primera fuente a revisar es `docs/governance/ecosystem-repos.json`.
2. Si necesito contexto humano, la segunda parada es esta nota.
3. Si el cambio afecta tokens, patrones o componentes compartidos, la referencia obligatoria es `anclora-design-system`.
4. Si el cambio afecta contratos, decisiones o excepciones, la referencia obligatoria sigue siendo la bóveda.

## Taxonomía del ecosistema

- `tier`: nivel de producto (`core`, `shared`, `internal`, `premium`, `ultra_premium`)
- `domain`: vertical de negocio (`real_estate`, `fitness_wellness`, `human_capital`, `group_ops`, `cross_domain`, `brand_system`)
- `product_archetype`: tipo de superficie (`app`, `portal`, `workspace`, `landing`, `system`, `command_center`)
- `system_role`: papel sistémico (`source`, `consumer`, `reference`, `orchestration`, `matrix`)
- `ecosystem_clusters`: pertenencia operativa (`real_estate`, `premium_apps`, `brand_governance`, `design_system`, `group_ops`, `internal_ops`, `showcase`)

- `anclora-impulso`: sigue siendo Premium, pero sale del dominio Real Estate y pasa a `fitness_wellness`.
- `anclora-talent`: sigue siendo Premium, pero se clasifica en `human_capital`.
- `anclora-command-center`: se clasifica como `cross_domain` con foco operativo actual en el cluster `real_estate`.

## Repos principales

| Repo | Familia | Tier | Ruta WSL | Nota principal del vault | Rol design system | Rol contratos | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `anclora-group` | `Entidad Matriz` | `core` | `/home/toni/projects/anclora-group` | [[Anclora Group]] | `reference` | `reference` | `active` |
| `anclora-advisor-ai` | `Internal` | `app` | `/home/toni/projects/anclora-advisor-ai` | [[Anclora Advisor AI]] | `consumer` | `consumer` | `active` |
| `anclora-nexus` | `Internal` | `app` | `/home/toni/projects/anclora-nexus` | [[Anclora Nexus]] | `consumer` | `consumer` | `active` |
| `anclora-content-generator-ai` | `Internal` | `app` | `/home/toni/projects/anclora-content-generator-ai` | [[Anclora Content Generator AI]] | `consumer` | `consumer` | `active` |
| `anclora-impulso` | `Premium` | `app` | `/home/toni/projects/anclora-impulso` | [[Anclora Impulso]] | `consumer` | `consumer` | `active` |
| `anclora-data-lab` | `Premium` | `app` | `/home/toni/projects/anclora-data-lab` | [[Anclora Data Lab]] | `consumer` | `consumer` | `active` |
| `anclora-synergi` | `Premium` | `app` | `/home/toni/projects/anclora-synergi` | [[Anclora Synergi]] | `consumer` | `consumer` | `active` |
| `anclora-command-center` | `Premium` | `app` | `/mnt/c/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora/dashboard` | [[Anclora Command Center]] | `consumer, reference` | `consumer, reference` | `active` |
| `anclora-private-estates` | `Ultra Premium` | `app` | `/home/toni/projects/anclora-private-estates` | [[Anclora Private Estates]] | `consumer` | `consumer` | `active` |
| `anclora-portfolio` | `Portfolio / Showcase` | `app` | `/home/toni/projects/anclora-portfolio` | [[Anclora Portfolio - Base técnica reutilizable]] | `consumer` | `consumer` | `active` |
| `anclora-azure-bay-landing` | `Portfolio / Showcase` | `app` | `/home/toni/projects/anclora-azure-bay-landing` | [[Azure Bay - Caso de estudio de landing premium]] | `consumer` | `consumer` | `active` |
| `anclora-playa-viva-uniestate` | `Portfolio / Showcase` | `app` | `/home/toni/projects/anclora-playa-viva-uniestate` | [[Playa Viva - Landing real con HubSpot y dossier personalizado]] | `consumer` | `consumer` | `active` |
| `anclora-design-system` | `system` | `shared` | `/home/toni/projects/anclora-design-system` | [[Anclora Design System]] | `source` | `consumer, reference` | `active` |

## Lectura por capas

### Bóveda

La bóveda no compite con los repos de producto. Define gobernanza, contratos, decisiones, excepciones y trazabilidad.

### `anclora-design-system`

Este repo no se trata como una app más. Es infraestructura compartida y debe vigilarse con más atención cuando cambian tokens, componentes, patrones o assets.

### Apps consumidoras

Las apps del ecosistema consumen contratos y diseño, pero no deben convertirse en la fuente principal de esos activos.

> [!note] `anclora-design-system`
> La nota canónica ya existe en el vault como [[Anclora Design System]] y debe mantenerse alineada con este inventario.

## Cobertura de este inventario

Este inventario base cubre los repos principales solicitados para el ecosistema actual. Si más adelante hace falta incorporar satélites como superficies derivadas o repos auxiliares, la regla es añadirlos al JSON primero y reflejar el cambio aquí después.
