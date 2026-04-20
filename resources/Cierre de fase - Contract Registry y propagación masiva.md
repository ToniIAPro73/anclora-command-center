---
tipo: recurso
creado: 2026-04-20
tags: [contracts, governance, design-system, ecosystem, wsl]
related:
  - "[[Mapa de repos del ecosistema Anclora]]"
  - "[[Anclora Design System]]"
  - "[[Independent Products]]"
  - "[[Revisión Semanal Completa de la Bóveda y Repositorios]]"
---

# Cierre de fase - Contract Registry y propagación masiva

Esta nota cierra la fase en la que la bóveda pasó de contratos markdown sueltos a un sistema doble: contratos legibles por humanos y un registro central legible por scripts.

El resultado operativo es que el ecosistema ya puede auditar y propagar contratos desde una única fuente estructurada, con soporte para `Anclora Group` e `Independent Products`.

## Resultado alcanzado

- Se creó `docs/governance/contracts-registry.json` como fuente estructurada única para automatización contractual.
- Se normalizaron los contratos maestros en `docs/standards/` para exponer autoridad, repos aplicables y sincronización con repos consumidores.
- `scripts/audit-contract-sync.ps1` ya resuelve contratos desde el registro central y los inventarios.
- `scripts/propagate-contracts.ps1` ya propaga contratos desde el registro central, valida `propagation_targets` y soporta múltiples scopes.
- `Independent Products` quedó separado del universo contractual Anclora, pero ya participa en el flujo automático con su propio contrato base.

## Fuentes de verdad

- Bóveda:
  - clasificación del ecosistema
  - contratos
  - excepciones
  - targets de propagación
- [[Anclora Design System]]:
  - `taxonomy`
  - `tokens`
  - `themes`
  - `foundations`
  - `components`
  - `patterns`
  - `assets`

## Artefactos canónicos

- Registro central: `docs/governance/contracts-registry.json`
- Inventario Anclora: `docs/governance/ecosystem-repos.json`
- Inventario paralelo: `docs/governance/independent-products.json`
- Contratos maestros: `docs/standards/`
- Scripts operativos:
  - `scripts/audit-contract-sync.ps1`
  - `scripts/propagate-contracts.ps1`

## Estado final del ecosistema

Después de la propagación masiva ejecutada el `2026-04-20`, la auditoría contractual quedó en `OK` para todos los repos accesibles del ecosistema:

- `anclora-advisor-ai`
- `anclora-azure-bay-landing`
- `anclora-calculadora-fiscal-183`
- `anclora-command-center`
- `anclora-content-generator-ai`
- `anclora-data-lab`
- `anclora-group`
- `anclora-impulso`
- `anclora-nexus`
- `anclora-playa-viva-uniestate`
- `anclora-portfolio`
- `anclora-private-estates`
- `anclora-synergi`
- `anclora-talent`

Estado de auditoría:
- `RemainingIssues`: ninguno

## Decisiones relevantes

- `contracts-registry.json` se adoptó como catálogo central en vez de un manifiesto JSON por contrato.
- `anclora-group` entra en el flujo solo cuando el propio registro central le asigna contratos de gobernanza o branding.
- `anclora-design-system` se trata como referencia contractual y fuente ejecutable, no como consumidor normal de propagación.
- `Independent Products` no hereda automáticamente contratos premium ni branding Anclora.

## Implicaciones prácticas

- Cuando cambie un contrato maestro, la primera comprobación operativa debe hacerse con `scripts/audit-contract-sync.ps1`.
- La propagación contractual ya no debe resolverse con listas manuales por repo, sino desde `scripts/propagate-contracts.ps1`.
- Los cambios visuales con impacto contractual deben contrastarse contra [[Anclora Design System]] antes de abrir excepciones locales.
- La [[Revisión Semanal Completa de la Bóveda y Repositorios]] ya puede apoyarse en este marco para detectar desalineaciones reales.

## Relacionado

- [[Mapa de repos del ecosistema Anclora]]
- [[Anclora Design System]]
- [[Independent Products]]
- [[Revisión Semanal Completa de la Bóveda y Repositorios]]
