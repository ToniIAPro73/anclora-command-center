# AOS Adoption Declaration

Declaración de adopción AOS para `anclora-command-center`.

## Metadatos

- Repository Name: anclora-command-center
- Repository Owner: AOS Chief Architect
- Adoption Status: Adopted With Exceptions
- AOS Version: v0.2.0
- Adoption Date: 2026-08-17
- Last Reviewed: 2026-08-17
- Governance Level: GL-1

## Propósito del repositorio

`anclora-command-center` es el dashboard operativo interno del ecosistema Anclora: un shell Vite + React 19 + TypeScript que hoy sincroniza datos y documentación generados desde un vault personal externo (fuera de este workspace) y los presenta en un panel visual centralizado.

Estado actual: `HOLD` (portfolio_status). Role fit del ecosistema: `REBUILD_RECOMMENDED` (ver `anclora-infrastructure/audit/ecosystem-scope-reconciliation/03_COMMAND_CENTER_ROLE_FIT.md`). El repo fue saneado de PII (`VAULT_PII_REVIEW`, `COMMAND_CENTER_PII_REMEDIATION`): `REAL_PII_IN_HEAD=0`, `REAL_PII_IN_HISTORY=0`.

## Excepción principal de esta adopción

Este repositorio **no está todavía runtime-managed por AOS**: no existe una entrada de servicio en `anclora-infrastructure/aos-runtime/manifest.yaml` para Command Center, y no se añade automáticamente una en esta declaración — el repo no tiene hoy un runtime operativo integrado con AOS. Esta declaración reconoce a Command Center como **repo reconocido por el ecosistema AOS** (en scope de `anclora-infrastructure/knowledge`, con checkout local verificado), pendiente de `COMMAND_CENTER_REBUILD` para pasar a gestión de runtime real.

## Arquitectura objetivo (target, no implementada aún)

Tras `COMMAND_CENTER_REBUILD`, Command Center debe operar como interfaz operacional de consumo sobre:

- **AOS**: runtime y manifest de servicios reales del ecosistema.
- **Anclora Knowledge**: pipeline de construcción del dataset normalizado (`anclora-infrastructure/knowledge`).
- **AKG v0.1**: grafo de conocimiento consultable (`anclora_knowledge.query`).

Esta relación es de **target arquitectónico**, no de consumo actual verificado — no se registran relaciones `USES` en el AKG hacia AOS/Knowledge/AKG hasta que exista integración real (ver gap semántico documentado en `anclora-infrastructure/audit/ecosystem-core-onboarding/01_COMMAND_CENTER_ONBOARDING.md`, sección de relaciones).

## Fuentes AOS referenciadas

- Constitution: [`../../anclora-governance/constitution/README.md`](../../anclora-governance/constitution/README.md)
- MASTER_DECISIONS: [`../../anclora-governance/knowledge/MASTER_DECISIONS.md`](../../anclora-governance/knowledge/MASTER_DECISIONS.md)
- CURRENT_STATE: [`../../anclora-governance/knowledge/CURRENT_STATE.md`](../../anclora-governance/knowledge/CURRENT_STATE.md)
- SOURCE_OF_TRUTH_REGISTRY: [`../../anclora-governance/knowledge/SOURCE_OF_TRUTH_REGISTRY.md`](../../anclora-governance/knowledge/SOURCE_OF_TRUTH_REGISTRY.md)
- Standards: [`../../anclora-governance/standards/README.md`](../../anclora-governance/standards/README.md)

Autoridad delegada relevante:

- Registro canónico de repositorios: [`../../anclora-vault/00-governance/registry/ecosystem-repos.json`](../../anclora-vault/00-governance/registry/ecosystem-repos.json)
- Knowledge/AKG pipeline: [`../../anclora-infrastructure/knowledge/`](../../anclora-infrastructure/knowledge/)

## Fuentes oficiales locales

| Tipo de conocimiento | Ruta local | Owner | Relación con AOS |
| --- | --- | --- | --- |
| Identidad del producto | [`../README.md`](../README.md) | AOS Chief Architect | Fuente local subordinada a AOS; actualizada en esta adopción para reflejar HOLD/REBUILD. |
| Implementación actual (shell Vite/React) | [`../src/`](../src/) | AOS Chief Architect | Fuente técnica local, parcialmente reutilizable en el rebuild (ver `COMMAND_CENTER_REBUILD_READINESS`). |
| Dataset generado local (legacy) | [`../src/generated/`](../src/generated/) | AOS Chief Architect | **No es fuente de verdad** de products/repos/contracts/services/endpoints — dataset legacy a eliminar en `COMMAND_CENTER_REBUILD` en favor de Anclora Knowledge/AKG. |
| Package metadata | [`../package.json`](../package.json) | AOS Chief Architect | Fuente técnica local para scripts, dependencias y versión. |

## Política de decisiones locales

Una decisión local debe elevarse a AOS cuando:

- afecta a más de un repositorio;
- redefine una fuente oficial (p. ej. si Command Center intentara volver a ser fuente de products/repos);
- depende de Anclora Knowledge/AKG como fuente central.

## Excepciones y desviaciones

| ID | Regla afectada | Razón | Owner | Status | Creada | Trigger de revisión | Resolución |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EX-CC-001 | No hay servicio AOS runtime-managed para este repo en `manifest.yaml`. | El repo está en `HOLD` pendiente de `COMMAND_CENTER_REBUILD`; no existe hoy un runtime operativo que registrar. | AOS Chief Architect | OPEN | 2026-08-17 | Se resuelve cuando `COMMAND_CENTER_REBUILD` entregue un runtime real y se registre en `manifest.yaml`. | — |
| EX-CC-002 | `src/generated/` contiene datasets locales de products/repos/contracts/services/endpoints que duplican fuentes canónicas (Vault, AOS, Knowledge). | Arquitectura legacy previa a esta adopción. | AOS Chief Architect | OPEN | 2026-08-17 | Se resuelve eliminando `src/generated/` como fuente local durante `COMMAND_CENTER_REBUILD` en favor de un cliente Knowledge/AKG. | — |

## Política de upgrade AOS

`anclora-command-center` revisará nuevas versiones de AOS cuando:

- AOS publique una nueva release;
- se inicie `COMMAND_CENTER_REBUILD`;
- se registre un servicio runtime real en `manifest.yaml`;
- cambien Constitución, decisiones o registro de fuentes oficiales aplicables.

## Historial de adopción

| Fecha | AOS Version | Cambio | Owner |
| --- | --- | --- | --- |
| 2026-08-17 | v0.2.0 | Declaración inicial de adopción con excepciones, tras `VAULT_PII_REVIEW`/`COMMAND_CENTER_PII_REMEDIATION` y como parte de `ECOSYSTEM_CORE_ONBOARDING`. Estado HOLD, target REBUILD documentados. | AOS Chief Architect |

## Documentos relacionados

- [`../README.md`](../README.md)
- [`../../anclora-infrastructure/audit/ecosystem-core-onboarding/01_COMMAND_CENTER_ONBOARDING.md`](../../anclora-infrastructure/audit/ecosystem-core-onboarding/01_COMMAND_CENTER_ONBOARDING.md)
- [`../../anclora-infrastructure/audit/ecosystem-core-onboarding/03_COMMAND_CENTER_REBUILD_READINESS.md`](../../anclora-infrastructure/audit/ecosystem-core-onboarding/03_COMMAND_CENTER_REBUILD_READINESS.md)
