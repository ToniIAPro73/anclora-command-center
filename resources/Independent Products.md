---
tipo: recurso
fuente: interna
estado: activo
fecha: 2026-04-20
tags:
  - independent-products
  - portfolio
  - governance
related:
  - "[[Mapa de repos del ecosistema Anclora]]"
  - "[[INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT]]"
---

# Independent Products

`Independent Products` es un universo paralelo dentro de la bóveda para productos públicos, ligeros y monetizados fuera de `Anclora Group`.

## Regla de separación

- `Anclora Group` mantiene su posicionamiento premium y su sistema de marca propio.
- `Independent Products` no forma parte del ecosistema de marca de Anclora.
- Estos productos pueden reutilizar criterio interno de producto, pero no deben heredar branding, iconografía ni contratos visuales de Anclora por defecto.

## Fuente de verdad

- inventario canónico: [[docs/governance/independent-products.json]] como archivo fuente en el repo.
- contrato base: [[INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT]] (`docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`).
- navegación relacionada: [[Mapa de repos del ecosistema Anclora]] para ubicar este universo dentro del mapa operativo.

## Primer producto registrado

### `anclora-calculadora-fiscal-183`

- nota canónica: [[anclora-calculadora-fiscal-183]]
- `domain`: `fiscal_finance`
- `business_model`: `ads`
- `product_archetype`: `calculator`
- `auth_model`: `public_no_auth`
- `distribution_model`: `seo`
- `status`: `active`
- `design_system_role`: `custom`

Nota:
- el prefijo `anclora-` en este primer registro se conserva como identificador técnico del repo, no como compromiso de marca pública dentro de `Anclora Group`.

## Criterio operativo

Este universo está pensado para:

- micro-SaaS sencillas
- calculators
- public tools
- productos SEO
- lead-gen tools
- apps monetizadas con Ads, afiliación o captación

## Regla de crecimiento

Si aparecen más productos de esta familia:

1. se añaden primero a `independent-products.json`
2. se documentan después aquí
3. si comparten reglas de UX/UI, se amplía `INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
