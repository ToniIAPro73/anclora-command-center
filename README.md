<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-command-center.png" alt="Anclora Command Center" width="132" />

# Anclora Command Center

### Interfaz operacional del ecosistema Anclora

Panel operativo que lee, en solo lectura, datos derivados de AOS, Anclora Knowledge y AKG v0.1, y los presenta en vistas de estado del ecosistema.

**Español** · [English](./README.en.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoría](https://img.shields.io/badge/categoría-Premium-6C63FF)
![Idiomas](https://img.shields.io/badge/idiomas-ES%20%7C%20EN%20%7C%20DE-047857)

</div>

---

> [!IMPORTANT]
> Repositorio interno del ecosistema Anclora. No es fuente de verdad de products, repositories, contracts, services ni endpoints — consume esos datos desde Anclora Knowledge/AKG y AOS. No publicar detalles operativos, credenciales ni lógica sensible fuera de canales autorizados.

## Qué es

Anclora Command Center es la interfaz operacional del ecosistema: lee snapshots de solo lectura generados en build/dev time desde `anclora-infrastructure/knowledge` (Knowledge/AKG) y desde el CLI `aos status` (AOS Runtime), y los presenta en 5 vistas — Overview, Products, Repositories, Services, Knowledge.

Reconstruido en `COMMAND_CENTER_REBUILD` (2026-08-17) para eliminar su papel histórico como almacén local de datos sincronizados desde un vault personal externo. Ver `anclora-infrastructure/audit/command-center-rebuild/` para la auditoría completa de la reconstrucción.

## Estado y rol en el ecosistema

| Campo | Valor |
|---|---|
| Current status | `HOLD` |
| Role | Operational UI — interfaz operacional de consumo, no fuente de datos |
| Data sources | AOS (CLI `aos status`) · Anclora Knowledge · AKG v0.1 |
| Source of truth local | **NO**, para: products, repositories, contracts, services, endpoints — consumidos vía `src/adapters/` desde snapshots regenerables (`src/generated/`, gitignored, nunca fuente) |
| AOS adoption | `Adopted With Exceptions` (ver `.anclora/AOS_ADOPTION.md`) |

## Categoría en el ecosistema

| Campo | Valor |
|---|---|
| Categoría | Premium |
| Acento de marca | `#6C63FF` |
| Repositorio canónico | `anclora-command-center` |
| Ubicación | `/home/toni/workspace/anclora/anclora-command-center` (checkout independiente) |

## Arquitectura

```
src/
  adapters/       # unica frontera entre snapshots JSON crudos y los contratos UI
  contracts/      # tipos UI estables (RepositorySummary, ProductSummary, ServiceSummary, ...)
  modules/
    operational/  # vistas: Overview, Products, Repositories, Services, Knowledge
  shell/          # shell de navegacion/tema/idioma (reutilizado del pre-rebuild)
```

Los componentes React nunca leen `src/generated/*.json` directamente ni recorren el schema interno de Knowledge/AKG — siempre pasan por `src/adapters/`. Ver `anclora-infrastructure/audit/command-center-rebuild/04-adapter-architecture.md`.

## Fuentes de datos

| Fuente | Cómo se lee | Escritura |
|---|---|---|
| Anclora Knowledge/AKG | `scripts/sync-knowledge-data.mjs` copia `anclora-infrastructure/knowledge/generated/knowledge-model.json` → `src/generated/knowledge-snapshot.json` en build/dev/test | Nunca — solo lectura |
| AOS Runtime | `scripts/sync-aos-status.mjs` invoca `aos status` (CLI de texto plano, sin API) y lo normaliza a `src/generated/aos-status-snapshot.json` | Nunca — solo lectura, sin `up`/`down`/`restart` |

Ambos snapshots son regenerables y están en `.gitignore` — nunca se versionan como dato canónico local.

## Arranque local

```bash
npm install
npm run dev      # sincroniza Knowledge/AOS y arranca Vite
npm run build    # sincroniza, typecheck y build de producción
npm run test     # sincroniza y ejecuta la suite de adapters (vitest)
npm run lint
```

## Idiomas soportados

- Español (predeterminado)
- English
- Deutsch

## Documentación y gobernanza

- Fuente de verdad canónica: `anclora-vault` (documentación) y `anclora-governance` (constitución/decisiones/estándares) — no este repositorio.
- Registro de scope y metadata: `anclora-vault/00-governance/registry/ecosystem-repos.json`
- Contratos de gobernanza: no se mantienen copias locales — ver `docs/standards/README.md`
- AOS adoption de este repo: `.anclora/AOS_ADOPTION.md`
- Auditoría de la reconstrucción: `anclora-infrastructure/audit/command-center-rebuild/`

---

<div align="center">

### Anclora Group

Uso interno.

</div>
