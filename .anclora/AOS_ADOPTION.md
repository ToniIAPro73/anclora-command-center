# AOS Adoption Declaration

Declaración de adopción AOS para `anclora-command-center`.

## Metadatos

- Repository Name: anclora-command-center
- Repository Owner: AOS Chief Architect
- Adoption Status: Adopted With Exceptions
- AOS Version: v0.2.0
- Adoption Date: 2026-08-17
- Last Reviewed: 2026-09-03 (security remediation)
- Governance Level: GL-1

## Propósito del repositorio

`anclora-command-center` es la interfaz operacional del ecosistema Anclora: un shell Vite + React 19 + TypeScript que lee, en solo lectura, snapshots generados en build/dev time desde `anclora-infrastructure/knowledge` (Knowledge/AKG) y desde el CLI `aos status` (AOS Runtime), y los presenta en 5 vistas operacionales (Overview, Products, Repositories, Services, Knowledge). Ya **no** depende de ningún vault personal externo.

Estado actual: `HOLD` (portfolio_status; el rol pasa de "dataset local" a "interfaz operacional", pero el repo sigue sin runtime real gestionado por AOS — ver EX-CC-001). El repo fue saneado de PII (`VAULT_PII_REVIEW`, `COMMAND_CENTER_PII_REMEDIATION`): `REAL_PII_IN_HEAD=0`, `REAL_PII_IN_HISTORY=0`, reconfirmado tras `COMMAND_CENTER_REBUILD` (0 secretos, 0 PII en el código y datos añadidos).

## Excepción principal de esta adopción

El checkout local de `anclora-infrastructure` sí contiene una entrada
`command-center` en `aos-runtime/manifest.yaml` con bind loopback, puerto 3024
y health `/health` (verificado en el commit externo `40b6f1d`). La existencia de
esa declaración no prueba por sí sola el estado del VPS desplegado. Este repo
consume AOS/Knowledge en el backend VPS-native y conserva snapshots regenerables
solo para compatibilidad local/Vercel; no es fuente de verdad de esos sistemas.

## Arquitectura implementada y límites

Command Center opera como interfaz operacional de consumo sobre:

- **AOS**: runtime y manifest de servicios reales del ecosistema.
- **Anclora Knowledge**: pipeline de construcción del dataset normalizado (`anclora-infrastructure/knowledge`).
- **AKG v0.1**: grafo de conocimiento consultable (`anclora_knowledge.query`).

En VPS-native el backend ejecuta `aos status --json` y lee el artefacto
Knowledge por ruta configurada. La UI no escribe en esas fuentes. El acoplamiento
de filesystem sigue siendo un límite arquitectónico pendiente de un contrato
versionado/API y no se declara resuelto desde este repo.

## Estado tras COMMAND_CENTER_REBUILD (2026-08-17)

Implementado en esta fase: `src/adapters/knowledgeAdapter.ts` y `src/adapters/aosAdapter.ts` leen snapshots de solo lectura (`src/generated/knowledge-snapshot.json`, `src/generated/aos-status-snapshot.json`), regenerados en cada `npm run build`/`npm run dev`/`npm run test` por `scripts/sync-knowledge-data.mjs` y `scripts/sync-aos-status.mjs` — nunca escriben en Knowledge/AOS. Este consumo real sigue sin modelarse como relación `USES` en el AKG porque el mecanismo actual es una copia de filesystem local, no una integración productiva (API/servicio) — ver gap en `anclora-infrastructure/audit/command-center-rebuild/03-data-sources.md`.

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
| Implementación actual (shell Vite/React + adapters) | [`../src/`](../src/) | AOS Chief Architect | Fuente técnica local. Shell (`shell/`) reutilizado del pre-rebuild; `adapters/`, `contracts/`, `modules/operational/` nuevos de esta fase. |
| Snapshots regenerables (no versionados, `.gitignore`) | [`../src/generated/`](../src/generated/) | AOS Chief Architect | **No es fuente de verdad**: copia de solo lectura de Knowledge/AKG y `aos status`, regenerada en cada build/dev/test — nunca commiteada. |
| Package metadata | [`../package.json`](../package.json) | AOS Chief Architect | Fuente técnica local para scripts, dependencias y versión. `chokidar`/`exceljs`/`gray-matter` eliminados (dependían del vault externo). |

## Política de decisiones locales

Una decisión local debe elevarse a AOS cuando:

- afecta a más de un repositorio;
- redefine una fuente oficial (p. ej. si Command Center intentara volver a ser fuente de products/repos);
- depende de Anclora Knowledge/AKG como fuente central.

## Excepciones y desviaciones

| ID | Regla afectada | Razón | Owner | Status | Creada | Trigger de revisión | Resolución |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EX-CC-001 | El estado desplegado del servicio AOS no puede probarse solo desde este checkout. | El contrato local sí contiene `command-center`; falta evidencia del estado efectivo del VPS. | AOS Chief Architect | PENDIENTE | 2026-08-17 | Se revisa con evidencia del host, systemd/AOS y health operativo. | — |
| EX-CC-002 | `src/generated/` contenía datasets locales de products/repos/contracts/services/endpoints que duplicaban fuentes canónicas (Vault, AOS, Knowledge). | Arquitectura legacy previa a esta adopción. | AOS Chief Architect | **RESOLVED** | 2026-08-17 | — | Resuelta 2026-08-17 (`COMMAND_CENTER_REBUILD`): `src/generated/vault-data.json`, `src/generated/dataset.json` y los scripts que los generaban (`sync-vault-data.mjs`, `watch-notes-and-sync.mjs`, `sync-real-estate-dataset.mjs`, `generate-workbook-from-notes.mjs`) eliminados. `src/generated/` ahora solo contiene snapshots de solo lectura regenerables, gitignored. |
| EX-CC-003 | AOS Runtime v2 era un CLI de texto plano sin API HTTP ni salida `--json`. | Limitación histórica de AOS Runtime, no decisión de Command Center. | AOS Chief Architect | CORREGIDO | 2026-08-17 | Trigger eliminado por `AOS_OPERATIONAL_INTERFACE`: AOS Runtime expone `aos status --json` y el schema versionado. | Verificado otra vez el 2026-09-03 contra `aos-runtime/schema/status.schema.json`. |

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
| 2026-08-17 | v0.2.0 | `COMMAND_CENTER_REBUILD`: EX-CC-002 resuelta (datasets legacy eliminados); adapters de solo lectura hacia Knowledge/AKG y AOS implementados; nueva excepción EX-CC-003 registrada (AOS CLI sin salida machine-readable estable). Adoption Status se mantiene `Adopted With Exceptions` — no se declara `Fully Adopted` (EX-CC-001 y EX-CC-003 siguen abiertas). | AOS Chief Architect |
| 2026-09-03 | v0.2.0 | Remediación local: backend loopback con escrituras fail-closed y Bearer S2S; `/api/audit` protegido; SPA mantiene SOLO LECTURA al no existir sesión segura UI→backend. Se verificó el contrato local de `manifest.yaml`; el estado efectivo del VPS y la activación Caddy siguen pendientes. | AOS Chief Architect |

## Documentos relacionados

- [`../README.md`](../README.md)
- [`../../anclora-infrastructure/audit/ecosystem-core-onboarding/01_COMMAND_CENTER_ONBOARDING.md`](../../anclora-infrastructure/audit/ecosystem-core-onboarding/01_COMMAND_CENTER_ONBOARDING.md)
- [`../../anclora-infrastructure/audit/ecosystem-core-onboarding/03_COMMAND_CENTER_REBUILD_READINESS.md`](../../anclora-infrastructure/audit/ecosystem-core-onboarding/03_COMMAND_CENTER_REBUILD_READINESS.md)
