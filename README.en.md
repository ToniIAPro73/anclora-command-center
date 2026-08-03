<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-command-center.png" alt="Anclora Command Center" width="132" />

# Anclora Command Center

### Internal operational dashboard for the Anclora ecosystem

Central control panel that syncs data from the Vault and provides a consolidated view of the Anclora ecosystem's status.

[Español](./README.md) · **English**

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Category](https://img.shields.io/badge/category-Premium-6C63FF)
![Languages](https://img.shields.io/badge/languages-ES%20%7C%20EN-047857)

</div>

---

> [!IMPORTANT]
> Internal Anclora ecosystem repository, hosted inside the Vault (`dashboard/`). Do not publish operational details, credentials, or sensitive logic outside authorized channels.

## What it is

Anclora Command Center is the ecosystem's internal operational dashboard: it syncs data and documentation from the Vault and presents them in a centralized visual panel for tracking project, contract, and governance status.

## Category in the ecosystem

| Field | Value |
|---|---|
| Category | Premium |
| Brand accent | `#6C63FF` |
| Canonical repository | `anclora-command-center` |
| Location | `dashboard/` inside the Anclora Vault |

## Key features

- Automatic data sync from the Vault (`chokidar`, `gray-matter`)
- Visual ecosystem status panel
- Data export/import (ExcelJS)

## Technology stack

| Area | Technology |
|---|---|
| Framework | Vite, React |
| Sync | Chokidar (file watching), gray-matter (frontmatter) |
| Data | ExcelJS |

## Local setup

```bash
npm install
npm run dev
```

## Supported languages

- Español (default)
- English

## Documentation and governance

- Anclora Vault (source of truth): `contracts/` and `docs/governance/`, at the root of this same repository

---

<div align="center">

### Anclora Group

Internal use.

</div>
