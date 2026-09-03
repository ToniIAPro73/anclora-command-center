<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-command-center.png" alt="Anclora Command Center" width="132" />

# Anclora Command Center

### Operational interface for the Anclora ecosystem

Operational panel that reads, read-only, data derived from AOS, Anclora Knowledge and AKG v0.1, and presents it in ecosystem status views.

[Español](./README.md) · **English**

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Category](https://img.shields.io/badge/category-Premium-6C63FF)
![Languages](https://img.shields.io/badge/languages-ES%20%7C%20EN%20%7C%20DE-047857)

</div>

---

> [!IMPORTANT]
> Internal Anclora ecosystem repository. It is not a source of truth for products, repositories, contracts, services, or endpoints — it consumes that data from Anclora Knowledge/AKG and AOS. Do not publish operational details, credentials, or sensitive logic outside authorized channels.

## What it is

Anclora Command Center is the ecosystem's operational interface: it reads read-only snapshots generated at build/dev time from `anclora-infrastructure/knowledge` (Knowledge/AKG) and from the `aos status` CLI (AOS Runtime), and presents them in 5 views — Overview, Products, Repositories, Services, Knowledge.

Rebuilt in `COMMAND_CENTER_REBUILD` (2026-08-17) to remove its historical role as a local data store synced from an external personal vault. See `anclora-infrastructure/audit/command-center-rebuild/` for the full rebuild audit.

## Status and role in the ecosystem

| Field | Value |
|---|---|
| Current status | `HOLD` |
| Role | Operational UI — operational consumption interface, not a data source |
| Data sources | AOS (`aos status` CLI) · Anclora Knowledge · AKG v0.1 |
| Local source of truth | **NO**, for: products, repositories, contracts, services, endpoints — consumed via `src/adapters/` from regenerable snapshots (`src/generated/`, gitignored, never a source) |
| AOS adoption | `Adopted With Exceptions` (see `.anclora/AOS_ADOPTION.md`) |

## Category in the ecosystem

| Field | Value |
|---|---|
| Category | Premium |
| Brand accent | `#6C63FF` |
| Canonical repository | `anclora-command-center` |
| Location | `workspace/anclora/anclora-command-center` (independent checkout) |

## Architecture

```
src/
  adapters/       # single boundary between raw JSON snapshots and UI contracts
  contracts/      # stable UI types (RepositorySummary, ProductSummary, ServiceSummary, ...)
  modules/
    operational/  # views: Overview, Products, Repositories, Services, Knowledge
  shell/          # navigation/theme/language shell (reused from pre-rebuild)
```

React components never read `src/generated/*.json` directly nor traverse the internal Knowledge/AKG schema — they always go through `src/adapters/`. See `anclora-infrastructure/audit/command-center-rebuild/04-adapter-architecture.md`.

## Data sources

| Source | How it's read | Writes |
|---|---|---|
| Anclora Knowledge/AKG | `scripts/sync-knowledge-data.mjs` copies `anclora-infrastructure/knowledge/generated/knowledge-model.json` → `src/generated/knowledge-snapshot.json` at build/dev/test time | Never — read-only |
| AOS Runtime | `scripts/sync-aos-status.mjs` invokes `aos status` (plain-text CLI, no API) and normalizes it to `src/generated/aos-status-snapshot.json` | Never — read-only, no `up`/`down`/`restart` |

Both snapshots are regenerable and gitignored — never versioned as local canonical data.

## Canonical runtime: VPS + AOS

The only supported operational runtime is:

**https://command-center.dev.anclora.com/**

It runs as the AOS `command-center` service on the VPS. `server/server.mjs`
serves `dist/` and exposes live `/health`, `/api/status`, `/api/knowledge`, and
`/api/repositories/runtime` endpoints. Vercel is retired and is not a deploy,
runtime, fallback, or acceptance target. The owner will delete the
`anclora-command-center` Vercel project manually. The project has now been
deleted.

## Local setup

```bash
npm install
npm run dev      # syncs Knowledge/AOS and starts Vite
npm run build    # syncs, typechecks, and produces a production build
npm run test     # syncs and runs the adapter test suite (vitest)
npm run lint
```

## Supported languages

- Español (default)
- English
- Deutsch

## Documentation and governance

- Canonical source of truth: `anclora-vault` (documentation) and `anclora-governance` (constitution/decisions/standards) — not this repository.
- Scope and metadata registry: `anclora-vault/00-governance/registry/ecosystem-repos.json`
- Governance contracts: no local copies are kept — see `docs/standards/README.md`
- This repo's AOS adoption: `.anclora/AOS_ADOPTION.md`
- Rebuild audit: `anclora-infrastructure/audit/command-center-rebuild/`

---

<div align="center">

### Anclora Group

Internal use.

</div>
