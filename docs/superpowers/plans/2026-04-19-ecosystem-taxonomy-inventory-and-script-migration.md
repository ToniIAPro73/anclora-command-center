# Ecosystem Taxonomy Inventory and Script Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the new ecosystem taxonomy into the vault inventory, keep backward compatibility with legacy `family` consumers, and migrate the contract audit/propagation scripts to use the new metadata safely.

**Architecture:** This slice updates the canonical repo inventory first, then adapts the PowerShell selection logic to resolve repositories from `tier`, `domain`, and `ecosystem_clusters` while still tolerating legacy `family`. The plan does not yet redesign the contract files themselves; it only prepares the metadata and script layer so later contract work can target the right repositories.

**Tech Stack:** Obsidian markdown, JSON inventory metadata, PowerShell scripts, Git

---

## Scope split

This plan intentionally covers only the first implementation slice:

- inventory taxonomy
- compatibility migration in scripts
- low-risk documentation updates

Follow-on work should be planned separately for:

- contract map redesign
- `CHG-0003` reformulation into surface/state contracts
- `anclora-design-system` structure and component alignment

## File structure

### Canonical metadata

- Modify: `docs/governance/ecosystem-repos.json`
  - Add the new axes: `domain`, `product_archetype`, `system_role`, `ecosystem_clusters`
  - Preserve `family` temporarily as a legacy compatibility field
  - Add `anclora-talent` if the repo is already part of the managed ecosystem inventory; otherwise leave an explicit TODO note in docs instead of guessing

### Human-facing documentation

- Modify: `resources/Mapa de repos del ecosistema Anclora.md`
  - Explain the new taxonomy
  - Show the important reclassifications: `anclora-impulso`, `anclora-talent`, `anclora-command-center`

- Modify: `scripts/README.md`
  - Document the new repository selection model for governance scripts

### Script migration

- Modify: `scripts/audit-contract-sync.ps1`
  - Replace `family`-only resolution with a compatibility layer that prefers new taxonomy fields

- Modify: `scripts/propagate-contracts.ps1`
  - Same compatibility layer
  - Preserve current behavior for existing callers using `-Families`

### Verification

- Reuse: `scripts/start-weekly-review.ps1`
- Reuse: `scripts/scan-ecosystem-repos.ps1`
- Reuse: `scripts/audit-contract-sync.ps1`
- Reuse: `scripts/propagate-contracts.ps1`

## Task 1: Update the Inventory Schema

**Files:**
- Modify: `docs/governance/ecosystem-repos.json`
- Test: `docs/governance/ecosystem-repos.json`

- [ ] **Step 1: Write the failing schema check in PowerShell**

```powershell
$inventory = Get-Content -Raw -LiteralPath ".\docs\governance\ecosystem-repos.json" | ConvertFrom-Json

$required = @("tier", "domain", "product_archetype", "system_role", "ecosystem_clusters")
$missing = @()

foreach ($repo in $inventory.repos) {
  foreach ($field in $required) {
    if (-not $repo.PSObject.Properties.Name.Contains($field)) {
      $missing += "$($repo.id):$field"
    }
  }
}

if ($missing.Count -gt 0) {
  throw ("Missing taxonomy fields: " + ($missing -join ", "))
}

"OK"
```

- [ ] **Step 2: Run the schema check to verify it fails**

Run:

```powershell
powershell -NoProfile -Command "$inventory = Get-Content -Raw -LiteralPath '.\docs\governance\ecosystem-repos.json' | ConvertFrom-Json; $required = @('tier','domain','product_archetype','system_role','ecosystem_clusters'); $missing = @(); foreach ($repo in $inventory.repos) { foreach ($field in $required) { if (-not $repo.PSObject.Properties.Name.Contains($field)) { $missing += ""$($repo.id):$field"" } } }; if ($missing.Count -gt 0) { throw ('Missing taxonomy fields: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: FAIL with missing fields for every repo because only `tier` exists today.

- [ ] **Step 3: Edit the inventory and add the new taxonomy fields**

Add these fields to each repo entry while keeping `family`:

```json
{
  "id": "anclora-command-center",
  "name": "Anclora Command Center",
  "family": "premium",
  "family_label": "Premium",
  "tier": "premium",
  "domain": "cross_domain",
  "product_archetype": "command_center",
  "system_role": "orchestration",
  "ecosystem_clusters": ["real_estate", "premium_apps"],
  "design_system_role": "consumer",
  "contracts_role": "consumer"
}
```

Use these exact target values from the approved spec:

- `anclora-group`
  - `tier = core`
  - `domain = group_ops`
  - `product_archetype = system`
  - `system_role = matrix`
  - `ecosystem_clusters = ['brand_governance', 'group_ops']`
- `anclora-design-system`
  - `tier = shared`
  - `domain = brand_system`
  - `product_archetype = system`
  - `system_role = source`
  - `ecosystem_clusters = ['brand_governance', 'design_system']`
- `anclora-command-center`
  - `tier = premium`
  - `domain = cross_domain`
  - `product_archetype = command_center`
  - `system_role = orchestration`
  - `ecosystem_clusters = ['real_estate', 'premium_apps']`
- `anclora-private-estates`
  - `tier = ultra_premium`
  - `domain = real_estate`
  - `product_archetype = portal`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate']`
- `anclora-data-lab`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = workspace`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'premium_apps']`
- `anclora-synergi`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = portal`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'premium_apps']`
- `anclora-nexus`
  - `tier = internal`
  - `domain = real_estate`
  - `product_archetype = workspace`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'internal_ops']`
- `anclora-content-generator-ai`
  - `tier = internal`
  - `domain = real_estate`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'internal_ops']`
- `anclora-portfolio`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = landing`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'showcase']`
- `anclora-azure-bay-landing`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = landing`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'showcase']`
- `anclora-playa-viva-uniestate`
  - `tier = premium`
  - `domain = real_estate`
  - `product_archetype = landing`
  - `system_role = consumer`
  - `ecosystem_clusters = ['real_estate', 'showcase']`
- `anclora-impulso`
  - `tier = premium`
  - `domain = fitness_wellness`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['premium_apps']`
- `anclora-talent`
  - `tier = premium`
  - `domain = human_capital`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['premium_apps']`
- `anclora-advisor-ai`
  - `tier = internal`
  - `domain = cross_domain`
  - `product_archetype = app`
  - `system_role = consumer`
  - `ecosystem_clusters = ['internal_ops']`

- [ ] **Step 4: Run JSON validation and schema check**

Run:

```powershell
powershell -NoProfile -Command "Get-Content -Raw '.\docs\governance\ecosystem-repos.json' | ConvertFrom-Json | Out-Null; 'JSON OK'"
```

Expected: `JSON OK`

Run:

```powershell
powershell -NoProfile -Command "$inventory = Get-Content -Raw -LiteralPath '.\docs\governance\ecosystem-repos.json' | ConvertFrom-Json; $required = @('tier','domain','product_archetype','system_role','ecosystem_clusters'); $missing = @(); foreach ($repo in $inventory.repos) { foreach ($field in $required) { if (-not $repo.PSObject.Properties.Name.Contains($field)) { $missing += ""$($repo.id):$field"" } } }; if ($missing.Count -gt 0) { throw ('Missing taxonomy fields: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add docs/governance/ecosystem-repos.json
git commit -m "docs: add multi-axis taxonomy to ecosystem inventory"
```

## Task 2: Document the New Taxonomy for Humans

**Files:**
- Modify: `resources/Mapa de repos del ecosistema Anclora.md`
- Modify: `scripts/README.md`
- Test: `resources/Mapa de repos del ecosistema Anclora.md`

- [ ] **Step 1: Write the failing content check**

```powershell
$map = Get-Content -Raw -LiteralPath ".\resources\Mapa de repos del ecosistema Anclora.md"
$patterns = @(
  "tier",
  "domain",
  "product_archetype",
  "system_role",
  "ecosystem_clusters",
  "anclora-impulso",
  "fitness_wellness",
  "anclora-command-center",
  "cross_domain"
)

$missing = $patterns | Where-Object { $map -notmatch [regex]::Escape($_) }
if ($missing.Count -gt 0) {
  throw ("Missing documentation markers: " + ($missing -join ", "))
}

"OK"
```

- [ ] **Step 2: Run the content check to verify it fails**

Run:

```powershell
powershell -NoProfile -Command "$map = Get-Content -Raw -LiteralPath '.\resources\Mapa de repos del ecosistema Anclora.md'; $patterns = @('tier','domain','product_archetype','system_role','ecosystem_clusters','anclora-impulso','fitness_wellness','anclora-command-center','cross_domain'); $missing = $patterns | Where-Object { $map -notmatch [regex]::Escape($_) }; if ($missing.Count -gt 0) { throw ('Missing documentation markers: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: FAIL because the note still documents the old model.

- [ ] **Step 3: Update the map note and scripts README**

Add a taxonomy section to the map note like this:

```markdown
## Taxonomía del ecosistema

- `tier`: nivel de producto (`core`, `shared`, `internal`, `premium`, `ultra_premium`)
- `domain`: vertical de negocio (`real_estate`, `fitness_wellness`, `human_capital`, `group_ops`, `cross_domain`, `brand_system`)
- `product_archetype`: tipo de superficie (`app`, `portal`, `workspace`, `landing`, `system`, `command_center`)
- `system_role`: papel sistémico (`source`, `consumer`, `reference`, `orchestration`, `matrix`)
- `ecosystem_clusters`: pertenencia operativa (`real_estate`, `premium_apps`, `brand_governance`, `design_system`, `group_ops`, `internal_ops`, `showcase`)
```

Add explicit reclassification notes:

```markdown
- `anclora-impulso`: sigue siendo Premium, pero sale del dominio Real Estate y pasa a `fitness_wellness`.
- `anclora-talent`: sigue siendo Premium, pero se clasifica en `human_capital`.
- `anclora-command-center`: se clasifica como `cross_domain` con foco operativo actual en el cluster `real_estate`.
```

Add this note to `scripts/README.md` under the contract-governance scripts section:

```markdown
Los scripts de gobierno contractual deben preferir la nueva taxonomía del inventario (`tier`, `domain`, `product_archetype`, `system_role`, `ecosystem_clusters`) y usar `family` solo como compatibilidad transitoria.
```

- [ ] **Step 4: Run the content check again**

Run:

```powershell
powershell -NoProfile -Command "$map = Get-Content -Raw -LiteralPath '.\resources\Mapa de repos del ecosistema Anclora.md'; $patterns = @('tier','domain','product_archetype','system_role','ecosystem_clusters','anclora-impulso','fitness_wellness','anclora-command-center','cross_domain'); $missing = $patterns | Where-Object { $map -notmatch [regex]::Escape($_) }; if ($missing.Count -gt 0) { throw ('Missing documentation markers: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add "resources/Mapa de repos del ecosistema Anclora.md" scripts/README.md
git commit -m "docs: explain ecosystem taxonomy axes"
```

## Task 3: Migrate Contract Repo Resolution to the New Taxonomy

**Files:**
- Modify: `scripts/audit-contract-sync.ps1`
- Modify: `scripts/propagate-contracts.ps1`
- Test: `scripts/audit-contract-sync.ps1`
- Test: `scripts/propagate-contracts.ps1`

- [ ] **Step 1: Write a failing compatibility test command for repo selection**

Use this inline PowerShell probe to prove the current model still depends only on `family`:

```powershell
$inventory = Get-Content -Raw -LiteralPath ".\docs\governance\ecosystem-repos.json" | ConvertFrom-Json
$premiumNonRealEstate = @(
  $inventory.repos |
    Where-Object {
      $_.tier -eq "premium" -and
      $_.domain -ne "real_estate"
    } |
    Select-Object -ExpandProperty id
)

$premiumNonRealEstate -join ", "
```

The migrated scripts must be able to reason about this set without relying on `family`.

- [ ] **Step 2: Run the current audit as baseline**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\audit-contract-sync.ps1
```

Expected: PASS with the current summary, but still driven by `family`.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\scripts\propagate-contracts.ps1' -Families @('Premium') -IncludeFiles @('ANCLORA_PREMIUM_APP_CONTRACT.md') -WhatIfOnly"
```

Expected: current output includes all Premium-family repos, including repos that may later need narrower targeting by `domain` or `ecosystem_clusters`.

- [ ] **Step 3: Add taxonomy-aware resolver functions to both scripts**

In both `scripts/audit-contract-sync.ps1` and `scripts/propagate-contracts.ps1`, replace the old `Get-ContractFamily` / `family`-only filtering model with:

```powershell
function Get-LegacyContractFamily {
  param([string]$Family)

  switch ($Family) {
    "internal" { return "Internal" }
    "premium" { return "Premium" }
    "ultra_premium" { return "UltraPremium" }
    "portfolio_showcase" { return "Portfolio" }
    default { return $null }
  }
}

function Get-RepoContractBucket {
  param($Repo)

  if ($Repo.tier -eq "internal") { return "Internal" }
  if ($Repo.tier -eq "premium" -and $Repo.product_archetype -eq "landing") { return "Portfolio" }
  if ($Repo.tier -eq "premium") { return "Premium" }
  if ($Repo.tier -eq "ultra_premium") { return "UltraPremium" }

  return (Get-LegacyContractFamily -Family $Repo.family)
}
```

Then build repo maps from the new inventory shape:

```powershell
[pscustomobject]@{
  Name = $_.id
  Path = $_.path_windows
  Tier = $_.tier
  Domain = $_.domain
  ProductArchetype = $_.product_archetype
  SystemRole = $_.system_role
  EcosystemClusters = @($_.ecosystem_clusters)
  ContractBucket = Get-RepoContractBucket -Repo $_
}
```

- [ ] **Step 4: Extend `propagate-contracts.ps1` with optional selectors without breaking existing callers**

Add new parameters:

```powershell
[string[]]$Tiers,
[string[]]$Domains,
[string[]]$EcosystemClusters,
```

Apply filtering in this order:

```powershell
if ($selectedFamilies -and $selectedFamilies.Count -gt 0) {
  if ($repoEntry.ContractBucket -notin $selectedFamilies) { continue }
}

if ($Tiers -and $Tiers.Count -gt 0) {
  if ($repoEntry.Tier -notin $Tiers) { continue }
}

if ($Domains -and $Domains.Count -gt 0) {
  if ($repoEntry.Domain -notin $Domains) { continue }
}

if ($EcosystemClusters -and $EcosystemClusters.Count -gt 0) {
  if (-not (@($repoEntry.EcosystemClusters) | Where-Object { $_ -in $EcosystemClusters })) { continue }
}
```

This keeps `-Families` working while enabling targeted propagation such as:

```powershell
-Tiers @('premium') -Domains @('real_estate')
```

or:

```powershell
-EcosystemClusters @('real_estate')
```

- [ ] **Step 5: Run focused verification commands**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\audit-contract-sync.ps1
```

Expected: PASS with the same current synchronization summary as before the refactor.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\scripts\propagate-contracts.ps1' -Families @('Premium') -IncludeFiles @('ANCLORA_PREMIUM_APP_CONTRACT.md') -WhatIfOnly"
```

Expected: PASS and still list Premium contract targets.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\scripts\propagate-contracts.ps1' -Tiers @('premium') -Domains @('real_estate') -IncludeFiles @('ANCLORA_PREMIUM_APP_CONTRACT.md') -WhatIfOnly"
```

Expected: PASS and exclude `anclora-impulso` plus any future non-Real-Estate premium repo.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\scripts\propagate-contracts.ps1' -Domains @('fitness_wellness') -IncludeFiles @('ANCLORA_PREMIUM_APP_CONTRACT.md') -WhatIfOnly"
```

Expected: PASS and target only `anclora-impulso` from the current approved taxonomy.

- [ ] **Step 6: Run ecosystem smoke verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\scan-ecosystem-repos.ps1 -AsJson > $null
```

Expected: no crash

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-weekly-review.ps1 -Date 2026-04-19
```

Expected: PASS, weekly review note still updates, and no taxonomy change breaks the weekly pipeline.

- [ ] **Step 7: Commit**

```bash
git add scripts/audit-contract-sync.ps1 scripts/propagate-contracts.ps1 scripts/README.md
git commit -m "feat: add taxonomy-aware contract repo selection"
```

## Task 4: Final Review and Handoff

**Files:**
- Verify: `docs/governance/ecosystem-repos.json`
- Verify: `resources/Mapa de repos del ecosistema Anclora.md`
- Verify: `scripts/audit-contract-sync.ps1`
- Verify: `scripts/propagate-contracts.ps1`

- [ ] **Step 1: Run final diff review**

Run:

```powershell
git diff -- docs/governance/ecosystem-repos.json "resources/Mapa de repos del ecosistema Anclora.md" scripts/audit-contract-sync.ps1 scripts/propagate-contracts.ps1 scripts/README.md
```

Expected: only taxonomy, documentation, and repo-selection logic changes

- [ ] **Step 2: Run final status check**

Run:

```powershell
git status --short
```

Expected: clean working tree or only unrelated pre-existing changes outside this plan

- [ ] **Step 3: Write implementation notes for the next plan**

Add this note to the final implementation summary or handoff comment:

```text
Next plan should redesign the contract map itself: split contracts by tier, domain, archetype, and transversal concerns; then align visual contracts with anclora-design-system primitives and tokens.
```

- [ ] **Step 4: Commit any final touch-ups**

```bash
git add .
git commit -m "chore: finalize taxonomy inventory migration"
```
