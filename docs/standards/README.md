# Contratos de gobernanza — referencia, no copia

Este directorio contenía 12 copias locales de contratos de gobernanza (branding, ecosistema, cookies, localización, modal, motion, premium app) que fueron eliminadas durante `COMMAND_CENTER_REBUILD` (2026-08-17).

Command Center **no mantiene copias de contratos como fuente**. Los contratos canónicos viven en:

- `anclora-vault/00-governance/contracts/core/` — contratos core (branding, ecosistema, premium app, etc.)
- `anclora-vault/00-governance/contracts/logic/` — contratos de lógica (cookies, localización)
- `anclora-vault/00-governance/contracts/components/` — contratos de componente (modal, motion)
- `anclora-vault/00-governance/registry/contracts-registry.json` — registro canónico machine-readable, ya incluye a `anclora-command-center` en `applies_to_repos` para `ANCLORA_ECOSYSTEM_CONTRACT_GROUPS` y `ANCLORA_REPOSITORY_VISIBILITY_CONTRACT`.

Verificación de gobernanza real (no copiada) disponible en Anclora Knowledge/AKG: `repo:ToniIAPro73/anclora-command-center GOVERNED_BY contract:*` — ver `anclora-infrastructure/knowledge`.
