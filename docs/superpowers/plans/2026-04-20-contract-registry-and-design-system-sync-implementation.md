# Contract Registry and Design System Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introducir un registro central de contratos, alinear los contratos maestros con `anclora-design-system` y adaptar los scripts de auditoría y propagación para que operen desde ese registro.

**Architecture:** La bóveda mantiene los contratos markdown como referencia humana en `docs/standards/`, mientras `docs/governance/contracts-registry.json` actúa como fuente estructurada para scripts. Los scripts de sincronización dejan de inferir reglas desde buckets rígidos y pasan a resolver contratos aplicables a partir del inventario de repos y del registro central. La separación entre `Anclora Group` e `Independent Products` se conserva explícitamente en el modelo.

**Tech Stack:** Markdown, JSON, PowerShell 7, Git, inventarios de gobernanza existentes en `docs/governance/`

---

## File structure

### New files

- `docs/governance/contracts-registry.json`
- `docs/superpowers/plans/2026-04-20-contract-registry-and-design-system-sync-implementation.md`

### Modified files

- `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- `docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md`
- `docs/standards/ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`
- `docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `docs/standards/UI_MOTION_CONTRACT.md`
- `docs/standards/MODAL_CONTRACT.md`
- `docs/standards/LOCALIZATION_CONTRACT.md`
- `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
- `scripts/audit-contract-sync.ps1`
- `scripts/propagate-contracts.ps1`

### Validation commands used across tasks

- `Get-Content -Raw docs\governance\contracts-registry.json | ConvertFrom-Json | Out-Null`
- `pwsh -NoProfile -File scripts\audit-contract-sync.ps1 -AsJson`
- `pwsh -NoProfile -File scripts\propagate-contracts.ps1 -WhatIfOnly`
- `git diff --check`

## Task 1: Create the central contract registry

**Files:**
- Create: `docs/governance/contracts-registry.json`
- Test: `docs/governance/contracts-registry.json`

- [ ] **Step 1: Write the initial registry content**

Create `docs/governance/contracts-registry.json` with a first operational schema covering Anclora contracts and the independent products contract.

```json
{
  "version": 1,
  "generated_for": "contract-registry-v1",
  "generated_for_id": "contract-registry-v1",
  "generated_for_label": "Contract Registry",
  "contracts": [
    {
      "id": "ANCLORA_ECOSYSTEM_CONTRACT_GROUPS",
      "title": "Anclora Ecosystem Contract Groups",
      "path": "docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md",
      "status": "active",
      "contract_type": "ecosystem_governance",
      "scope": "anclora_group",
      "source_of_truth": ["vault", "design_system"],
      "design_system_layers": ["taxonomy", "tokens", "themes", "foundations", "components", "patterns", "assets"],
      "applies_to_repos": [
        "anclora-advisor-ai",
        "anclora-nexus",
        "anclora-content-generator-ai",
        "anclora-impulso",
        "anclora-command-center",
        "anclora-synergi",
        "anclora-data-lab",
        "anclora-talent",
        "anclora-private-estates",
        "anclora-private-estates-landing",
        "anclora-portfolio",
        "anclora-azure-bay-landing",
        "anclora-playa-viva-uniestate"
      ],
      "propagation_targets": ["docs/standards/"],
      "depends_on": [],
      "supersedes": [],
      "independent_from": ["independent_products"],
      "last_reviewed_at": "2026-04-20"
    },
    {
      "id": "ANCLORA_PREMIUM_APP_CONTRACT",
      "title": "Anclora Premium App Contract",
      "path": "docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md",
      "status": "active",
      "contract_type": "group_contract",
      "scope": "anclora_group",
      "source_of_truth": ["vault", "design_system"],
      "design_system_layers": ["tokens", "themes", "foundations", "components", "patterns"],
      "applies_to_repos": [
        "anclora-impulso",
        "anclora-command-center",
        "anclora-synergi",
        "anclora-data-lab",
        "anclora-talent"
      ],
      "propagation_targets": ["docs/standards/"],
      "depends_on": [
        "ANCLORA_ECOSYSTEM_CONTRACT_GROUPS",
        "UI_MOTION_CONTRACT",
        "MODAL_CONTRACT",
        "LOCALIZATION_CONTRACT"
      ],
      "supersedes": [],
      "independent_from": ["independent_products"],
      "last_reviewed_at": "2026-04-20"
    },
    {
      "id": "INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT",
      "title": "Independent Public Utility App Contract",
      "path": "docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md",
      "status": "active",
      "contract_type": "parallel_contract",
      "scope": "independent_products",
      "source_of_truth": ["vault"],
      "design_system_layers": [],
      "applies_to_repos": ["anclora-calculadora-fiscal-183"],
      "propagation_targets": ["docs/standards/"],
      "depends_on": [],
      "supersedes": [],
      "independent_from": ["anclora_group"],
      "last_reviewed_at": "2026-04-20"
    }
  ]
}
```

- [ ] **Step 2: Validate that the JSON is syntactically valid**

Run:

```powershell
Get-Content -Raw docs\governance\contracts-registry.json | ConvertFrom-Json | Out-Null
```

Expected: command exits with no output and no error.

- [ ] **Step 3: Sanity-check required coverage**

Run:

```powershell
$registry = Get-Content -Raw docs\governance\contracts-registry.json | ConvertFrom-Json
$registry.contracts.id
```

Expected output includes:

```text
ANCLORA_ECOSYSTEM_CONTRACT_GROUPS
ANCLORA_INTERNAL_APP_CONTRACT
ANCLORA_PREMIUM_APP_CONTRACT
ANCLORA_ULTRA_PREMIUM_APP_CONTRACT
ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT
ANCLORA_BRANDING_MASTER_CONTRACT
UI_MOTION_CONTRACT
MODAL_CONTRACT
LOCALIZATION_CONTRACT
INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT
```

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/governance/contracts-registry.json
git commit -m "docs: add central contract registry"
```

## Task 2: Normalize the contract masters around authority and sync

**Files:**
- Modify: `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- Modify: `docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md`
- Modify: `docs/standards/ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`
- Modify: `docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md`
- Modify: `docs/standards/UI_MOTION_CONTRACT.md`
- Modify: `docs/standards/MODAL_CONTRACT.md`
- Modify: `docs/standards/LOCALIZATION_CONTRACT.md`
- Modify: `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
- Test: these same files

- [ ] **Step 1: Add a stable governance block to the ecosystem contract**

Update `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md` so it explicitly includes:

```md
## Autoridad

- Registro operativo: `docs/governance/contracts-registry.json`
- Inventario de repos Anclora: `docs/governance/ecosystem-repos.json`
- Fuente ejecutable de UI: `anclora-design-system`

## Sincronización con repos consumidores

- Contrato fuente en la bóveda: `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- Target normal de propagación: `docs/standards/`
- La auditoría y la propagación se resuelven desde `docs/governance/contracts-registry.json`
- Este contrato no aplica a `Independent Products` salvo mención explícita
```

- [ ] **Step 2: Add the same structural sections to group and transversal contracts**

For each of these files:

- `docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md`
- `docs/standards/ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`
- `docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `docs/standards/UI_MOTION_CONTRACT.md`
- `docs/standards/MODAL_CONTRACT.md`
- `docs/standards/LOCALIZATION_CONTRACT.md`
- `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`

add or normalize these sections:

```md
## Autoridad

- Registro operativo: `docs/governance/contracts-registry.json`
- Inventario aplicable: `docs/governance/ecosystem-repos.json` o `docs/governance/independent-products.json`
- Fuente ejecutable relacionada: `anclora-design-system` si aplica

## Repos a los que aplica

- lista explícita de repos o familia gobernada

## Sincronización con repos consumidores

- Contrato fuente en la bóveda
- Target normal de propagación: `docs/standards/`
- Dependencia de auditoría y propagación desde `contracts-registry.json`
```

- [ ] **Step 3: Preserve semantics while making structure consistent**

Run:

```powershell
rg -n "## Autoridad|## Repos a los que aplica|## Sincronización con repos consumidores" docs\standards
```

Expected: all target contracts appear in the results at least once.

- [ ] **Step 4: Review that independent products remains isolated**

Run:

```powershell
Get-Content docs\standards\INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md -TotalCount 220
```

Expected: the contract states that it does not automatically inherit Anclora premium branding or Anclora group contracts.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md docs/standards/ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md docs/standards/UI_MOTION_CONTRACT.md docs/standards/MODAL_CONTRACT.md docs/standards/LOCALIZATION_CONTRACT.md docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md
git commit -m "docs: align contract masters with registry"
```

## Task 3: Refactor `audit-contract-sync.ps1` to read the registry

**Files:**
- Modify: `scripts/audit-contract-sync.ps1`
- Test: `scripts/audit-contract-sync.ps1`

- [ ] **Step 1: Replace bucket-only resolution with registry-backed loading**

Introduce helpers similar to:

```powershell
function Get-ContractRegistry {
  param([string]$VaultRoot)

  $registryPath = Join-Path $VaultRoot "docs\governance\contracts-registry.json"
  if (-not (Test-Path -LiteralPath $registryPath)) {
    throw "No existe el registro contractual: $registryPath"
  }

  return (Get-Content -Raw -LiteralPath $registryPath | ConvertFrom-Json)
}

function Get-ApplicableContracts {
  param(
    $Repo,
    $Registry
  )

  return @(
    $Registry.contracts |
      Where-Object {
        $_.status -eq "active" -and
        $Repo.id -in @($_.applies_to_repos)
      }
  )
}
```

- [ ] **Step 2: Build audit records from registry entries instead of hardcoded family files**

Use the applicable contracts to generate audit rows like:

```powershell
[pscustomobject]@{
  Repo = $repo.id
  Scope = $contract.scope
  ContractId = $contract.id
  Contract = [System.IO.Path]::GetFileName($contract.path)
  Status = $status
  SourceHash = $sourceHash
  TargetHash = $targetHash
  DesignSystemLayers = @($contract.design_system_layers) -join ", "
}
```

- [ ] **Step 3: Keep JSON output stable and human output readable**

Run:

```powershell
pwsh -NoProfile -File scripts\audit-contract-sync.ps1 -AsJson
```

Expected: valid JSON array or object containing `Repo`, `ContractId`, `Contract`, and `Status`.

- [ ] **Step 4: Validate the script on current inventory**

Run:

```powershell
$json = pwsh -NoProfile -File scripts\audit-contract-sync.ps1 -AsJson | ConvertFrom-Json
$json | Select-Object -First 5
```

Expected: command completes without path-resolution errors and returns rows for active consumer repos.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/audit-contract-sync.ps1
git commit -m "feat: drive contract audit from registry"
```

## Task 4: Refactor `propagate-contracts.ps1` to read the registry

**Files:**
- Modify: `scripts/propagate-contracts.ps1`
- Test: `scripts/propagate-contracts.ps1`

- [ ] **Step 1: Load registry and resolve applicable contracts per repo**

Add shared registry-loading logic equivalent to:

```powershell
function Get-ContractRegistry {
  param([string]$VaultRoot)
  $registryPath = Join-Path $VaultRoot "docs\governance\contracts-registry.json"
  return (Get-Content -Raw -LiteralPath $registryPath | ConvertFrom-Json)
}
```

Then filter contracts by repo id, scope, families, tiers, domains or ecosystem clusters only after registry resolution.

- [ ] **Step 2: Resolve source files and propagation targets from each contract**

Base the copy loop on registry data:

```powershell
foreach ($contract in $applicableContracts) {
  $sourceFile = Join-Path $VaultRoot $contract.path

  foreach ($targetRelativePath in @($contract.propagation_targets)) {
    $targetFolder = Join-Path $repo $targetRelativePath
    $destination = Join-Path $targetFolder ([System.IO.Path]::GetFileName($contract.path))
  }
}
```

- [ ] **Step 3: Preserve conservative behavior**

Ensure the script still:

- supports `-WhatIfOnly`
- creates target folders when needed
- skips contracts outside selected filters
- never mixes `independent_products` contracts into Anclora repos unless explicitly targeted

- [ ] **Step 4: Validate dry-run output**

Run:

```powershell
pwsh -NoProfile -File scripts\propagate-contracts.ps1 -WhatIfOnly
```

Expected: dry-run lines describe copy operations using registry-based source contracts. No failures due to WSL paths already registered in the inventory.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/propagate-contracts.ps1
git commit -m "feat: drive contract propagation from registry"
```

## Task 5: Full verification and documentation integrity

**Files:**
- Test: `docs/governance/contracts-registry.json`
- Test: `docs/standards/*.md`
- Test: `scripts/audit-contract-sync.ps1`
- Test: `scripts/propagate-contracts.ps1`

- [ ] **Step 1: Validate registry JSON one last time**

Run:

```powershell
Get-Content -Raw docs\governance\contracts-registry.json | ConvertFrom-Json | Out-Null
```

Expected: no output, no error.

- [ ] **Step 2: Validate contract structure consistency**

Run:

```powershell
rg -n "## Autoridad|## Sincronización con repos consumidores" docs\standards\ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md docs\standards\ANCLORA_PREMIUM_APP_CONTRACT.md docs\standards\ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md docs\standards\ANCLORA_BRANDING_MASTER_CONTRACT.md docs\standards\UI_MOTION_CONTRACT.md docs\standards\MODAL_CONTRACT.md docs\standards\LOCALIZATION_CONTRACT.md docs\standards\INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md
```

Expected: every listed file reports both sections.

- [ ] **Step 3: Run the audit script**

Run:

```powershell
pwsh -NoProfile -File scripts\audit-contract-sync.ps1
```

Expected: summary table prints successfully. Any reported missing or outdated contracts are data findings, not script failures.

- [ ] **Step 4: Run the propagation script as a dry run**

Run:

```powershell
pwsh -NoProfile -File scripts\propagate-contracts.ps1 -WhatIfOnly
```

Expected: dry-run copy plan prints successfully.

- [ ] **Step 5: Run git whitespace validation**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/governance/contracts-registry.json docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md docs/standards/ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md docs/standards/UI_MOTION_CONTRACT.md docs/standards/MODAL_CONTRACT.md docs/standards/LOCALIZATION_CONTRACT.md docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md scripts/audit-contract-sync.ps1 scripts/propagate-contracts.ps1
git commit -m "feat: align contract sync with central registry"
```
