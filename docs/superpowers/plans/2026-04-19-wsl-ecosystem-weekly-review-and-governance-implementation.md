# WSL Ecosystem Weekly Review And Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Windows-path weekly review flow with a WSL-aware ecosystem inventory and a useful weekly brief that connects repositories, vault governance, contracts, and the design system.

**Architecture:** Add a machine-readable repo inventory in the vault, a human-facing ecosystem map note, and a small PowerShell pipeline that scans WSL repos and renders a weekly summary into the Friday daily note. Then migrate the first contract-governance scripts to consume the same inventory instead of hardcoded `Desktop\Proyectos` paths.

**Tech Stack:** PowerShell 5+/7, Git CLI, Windows Task Scheduler, Obsidian Markdown, JSON

---

### Task 1: Create The Canonical Ecosystem Inventory

**Files:**
- Create: `docs/governance/ecosystem-repos.json`
- Create: `resources/Mapa de repos del ecosistema Anclora.md`
- Test: manual JSON parse with PowerShell

- [ ] **Step 1: Write the inventory file with the initial repo dataset**

```json
{
  "version": 1,
  "generated_for": "Anclora ecosystem governance",
  "repos": [
    {
      "id": "anclora-design-system",
      "name": "Anclora Design System",
      "path_wsl": "/home/toni/projects/anclora-design-system",
      "path_windows": "\\\\wsl$\\Ubuntu\\home\\toni\\projects\\anclora-design-system",
      "family": "system",
      "tier": "shared",
      "obsidian_note": "resources/Anclora Design System.md",
      "design_system_role": "source",
      "contracts_role": "consumer-and-reference",
      "status": "active",
      "high_impact_paths": {
        "design_system": [
          "packages/tokens/",
          "packages/react/",
          "colors_and_type.css",
          "assets/",
          "ui_kits/"
        ],
        "contracts": [
          "docs/contracts/",
          "docs/governance/"
        ],
        "docs": [
          "README.md",
          "docs/",
          "preview/"
        ]
      }
    },
    {
      "id": "anclora-nexus",
      "name": "Anclora Nexus",
      "path_wsl": "/home/toni/projects/anclora-nexus",
      "path_windows": "\\\\wsl$\\Ubuntu\\home\\toni\\projects\\anclora-nexus",
      "family": "Internal",
      "tier": "app",
      "obsidian_note": "proyectos/anclora-nexus.md",
      "design_system_role": "consumer",
      "contracts_role": "consumer",
      "status": "active",
      "high_impact_paths": {
        "design_system": [
          "src/components/ui/",
          "src/design-system/",
          "src/theme/",
          "src/styles/"
        ],
        "contracts": [
          "src/i18n/",
          "src/modals/",
          "src/shell/",
          "docs/standards/"
        ],
        "docs": [
          "README.md",
          "docs/"
        ]
      }
    }
  ]
}
```

- [ ] **Step 2: Extend the JSON with every current ecosystem repo**

```text
Include at least:
- anclora-group
- anclora-advisor-ai
- anclora-nexus
- anclora-content-generator-ai
- anclora-impulso
- anclora-data-lab
- anclora-synergi
- anclora-command-center (vault dashboard path if still local)
- anclora-private-estates
- anclora-portfolio
- anclora-azure-bay-landing
- anclora-playa-viva-uniestate
- anclora-design-system
```

- [ ] **Step 3: Create the human-facing map note**

```md
---
tipo: recurso
fuente: interna
creado: 2026-04-19
---

# Mapa de repos del ecosistema Anclora

Resumen del ecosistema de repos, su relación con la bóveda y su relación con contratos y design system.

## Reglas del sistema

- La bóveda gobierna contratos, decisiones, excepciones y cumplimiento.
- `anclora-design-system` gobierna tokens, patrones, assets y componentes reutilizables.
- Las apps consumen ambas capas según corresponda.

## Repos principales

| Repo | Rol | Family | Nota principal | Design system | Contratos |
|---|---|---|---|---|---|
| `anclora-design-system` | fuente ejecutable compartida | system | [[Anclora Design System]] | source | consumer-and-reference |
| `anclora-nexus` | app operativa interna | Internal | [[anclora-nexus]] | consumer | consumer |
```

- [ ] **Step 4: Run a parse check on the JSON**

Run: `powershell -NoProfile -Command "Get-Content -Raw 'docs/governance/ecosystem-repos.json' | ConvertFrom-Json | Out-Null; 'OK'"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add docs/governance/ecosystem-repos.json resources/"Mapa de repos del ecosistema Anclora.md"
git commit -m "feat: add ecosystem repo inventory"
```

### Task 2: Add Inventory Access Helpers And WSL Repo Scanning

**Files:**
- Create: `scripts/scan-ecosystem-repos.ps1`
- Modify: `scripts/README.md`
- Test: `scripts/scan-ecosystem-repos.ps1`

- [ ] **Step 1: Write the failing smoke check**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\scan-ecosystem-repos.ps1 -AsJson
```

Expected: FAIL because the script does not exist yet.

- [ ] **Step 2: Create the scanner with inventory loading and WSL path checks**

```powershell
param(
  [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
  [int]$RecentDays = 7,
  [switch]$AsJson
)

$inventoryPath = Join-Path $VaultRoot "docs\governance\ecosystem-repos.json"
$inventory = Get-Content -Raw $inventoryPath | ConvertFrom-Json

function Test-RepoPath {
  param([string]$WindowsPath)
  return Test-Path -LiteralPath $WindowsPath
}

function Get-GitSummary {
  param([string]$RepoPath)

  $branch = git -C $RepoPath rev-parse --abbrev-ref HEAD
  $commit = git -C $RepoPath log -1 --pretty=format:"%h|%ad|%an|%s" --date=short
  $dirty = [bool](git -C $RepoPath status --porcelain)

  [pscustomobject]@{
    branch = $branch.Trim()
    commit = $commit.Trim()
    dirty = $dirty
  }
}
```

- [ ] **Step 3: Add change classification helpers**

```powershell
function Get-Classification {
  param(
    [object]$Repo,
    [string[]]$ChangedFiles
  )

  $signals = New-Object System.Collections.Generic.List[string]

  foreach ($file in $ChangedFiles) {
    if ($file -eq "README.md" -or $file.StartsWith("docs/")) { $signals.Add("DOC_SYNC") }
    if ($Repo.high_impact_paths.design_system | Where-Object { $file.StartsWith($_) }) { $signals.Add("DESIGN_SYSTEM_SYNC") }
    if ($Repo.high_impact_paths.contracts | Where-Object { $file.StartsWith($_) }) { $signals.Add("CONTRACT_SYNC") }
  }

  if ($signals.Count -eq 0) { return @("APP_ONLY") }

  return $signals | Select-Object -Unique
}
```

- [ ] **Step 4: Run the scanner and verify the shape**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\scan-ecosystem-repos.ps1 -AsJson`
Expected: JSON array or object containing repo id, access status, branch, last commit, dirty status, and classification.

- [ ] **Step 5: Document the new scanner in `scripts/README.md`**

```md
## `scan-ecosystem-repos.ps1`

Lee `docs/governance/ecosystem-repos.json`, valida accesos a rutas WSL y devuelve un resumen operativo por repo.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\scan-ecosystem-repos.ps1 -AsJson
```
```

- [ ] **Step 6: Commit**

```bash
git add scripts/scan-ecosystem-repos.ps1 scripts/README.md
git commit -m "feat: add WSL ecosystem repo scanner"
```

### Task 3: Generate A Weekly Markdown Summary From Scanner Results

**Files:**
- Create: `scripts/build-weekly-review-summary.ps1`
- Test: `scripts/build-weekly-review-summary.ps1`

- [ ] **Step 1: Write the failing smoke check**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-weekly-review-summary.ps1
```

Expected: FAIL because the script does not exist yet.

- [ ] **Step 2: Implement summary rendering**

```powershell
param(
  [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot)
)

$scanJson = powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "scan-ecosystem-repos.ps1") -AsJson
$scan = $scanJson | ConvertFrom-Json

$verified = @($scan.repos | Where-Object { $_.accessible })
$inaccessible = @($scan.repos | Where-Object { -not $_.accessible })
$recent = @($scan.repos | Where-Object { $_.recent_activity })
$alerts = @($scan.repos | Where-Object { $_.classification -contains "DOC_SYNC" -or $_.classification -contains "DESIGN_SYSTEM_SYNC" -or $_.classification -contains "CONTRACT_SYNC" })

$lines = @()
$lines += "## 🐙 Estado Semanal de Repositorios"
$lines += ""
$lines += "- Repositorios verificados: " + (($verified.id -join ", ") ?? "ninguno")
$lines += "- Repositorios inaccesibles: " + (($inaccessible.id -join ", ") ?? "ninguno")
$lines += "- Repos con actividad reciente: " + (($recent.id -join ", ") ?? "ninguno")
$lines += "- Alertas de sincronización: " + (($alerts.id -join ", ") ?? "ninguna")
$lines -join "`r`n"
```

- [ ] **Step 3: Add a machine-readable result block summary**

```powershell
$result = [pscustomobject]@{
  audited_repos = $scan.repos.Count
  inaccessible_repos = $inaccessible.Count
  alerts = $alerts.Count
  next_action = if ($alerts.Count -gt 0) { "Revisar alertas marcadas en la nota diaria." } else { "Sin alertas críticas." }
}
```

- [ ] **Step 4: Run the summary builder**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\build-weekly-review-summary.ps1`
Expected: markdown output containing `## 🐙 Estado Semanal de Repositorios` and non-empty summary lines.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-weekly-review-summary.ps1
git commit -m "feat: add weekly review summary builder"
```

### Task 4: Refactor The Weekly Review Entry Point To Use The New Pipeline

**Files:**
- Modify: `scripts/start-weekly-review.ps1`
- Modify: `playbooks/Revisión Semanal Completa de la Bóveda y Repositorios.md`
- Modify: `scripts/README.md`
- Test: `scripts/start-weekly-review.ps1`

- [ ] **Step 1: Write the failing expectation**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-weekly-review.ps1 -Date 2026-04-19
Get-Content -Raw .\daily-notes\2026-04-19.md
```

Expected: current output still shows placeholder-only repo blocks or a stale automatic result section.

- [ ] **Step 2: Replace placeholder append logic with injected generated content**

```powershell
$summaryMarkdown = powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build-weekly-review-summary.ps1')

$resultBlock = @(
  '## 🤖 Resultado de tarea automática',
  '',
  "- Última ejecución automática: $runTimestamp",
  "- Estado: revisión semanal preparada con escaneo WSL",
  "- Repos auditados: $($scanResult.audited_repos)",
  "- Alertas detectadas: $($scanResult.alerts)",
  "- Siguiente acción sugerida: $($scanResult.next_action)"
) -join "`r`n"
```

- [ ] **Step 3: Preserve daily note creation but fix encoding explicitly**

```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($dailyPath, ($updatedContent.TrimEnd() + "`r`n"), $utf8NoBom)
```

- [ ] **Step 4: Update the playbook to match the new flow**

```md
### Fase 1. Preparación

1. Ejecuta `.\scripts\start-weekly-review.ps1`.
2. Revisa el brief generado en la nota diaria.
3. Valida alertas `DOC_SYNC`, `DESIGN_SYSTEM_SYNC`, `CONTRACT_SYNC` o `INVESTIGATE`.

### Fase 3. Repositorios

1. El inventario canónico vive en `docs/governance/ecosystem-repos.json`.
2. Los repos del ecosistema se auditan desde WSL.
3. `anclora-design-system` se trata como infraestructura de diseño compartida.
```

- [ ] **Step 5: Run end-to-end verification**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\start-weekly-review.ps1 -Date 2026-04-19`
Expected:
- daily note exists
- repo section contains real repo names or access alerts
- automatic result block contains audit counts
- `logs/weekly-review.log` gains one new line

- [ ] **Step 6: Commit**

```bash
git add scripts/start-weekly-review.ps1 playbooks/"Revisión Semanal Completa de la Bóveda y Repositorios.md" scripts/README.md daily-notes/2026-04-19.md logs/weekly-review.log
git commit -m "feat: make weekly review WSL-aware"
```

### Task 5: Migrate Contract Sync Scripts To The Central Inventory

**Files:**
- Modify: `scripts/audit-contract-sync.ps1`
- Modify: `scripts/propagate-contracts.ps1`
- Test: both scripts in no-op or report mode

- [ ] **Step 1: Write the failing expectation**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\audit-contract-sync.ps1 -AsJson`
Expected: current script still relies on hardcoded `C:\Users\antonio.ballesterosa\Desktop\Proyectos\...` repo map.

- [ ] **Step 2: Replace hardcoded repo maps with inventory filtering**

```powershell
$inventoryPath = Join-Path $VaultRoot "docs\governance\ecosystem-repos.json"
$inventory = Get-Content -Raw $inventoryPath | ConvertFrom-Json

$repoMap = @(
  $inventory.repos |
    Where-Object { $_.contracts_role -match 'consumer' -and $_.status -eq 'active' } |
    ForEach-Object {
      @{
        Name = $_.id
        Path = $_.path_windows
        Family = $_.family
      }
    }
)
```

- [ ] **Step 3: Add family guards for non-app repos**

```powershell
if ($family -notin @('Internal', 'Premium', 'UltraPremium', 'Portfolio')) {
  continue
}
```

- [ ] **Step 4: Verify audit script output**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\audit-contract-sync.ps1`
Expected: summary table renders without referencing missing Windows desktop repos.

- [ ] **Step 5: Verify propagation script in dry-run mode**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\propagate-contracts.ps1 -WhatIfOnly`
Expected: `[WhatIf]` lines target repos from `ecosystem-repos.json`.

- [ ] **Step 6: Commit**

```bash
git add scripts/audit-contract-sync.ps1 scripts/propagate-contracts.ps1
git commit -m "refactor: drive contract sync from ecosystem inventory"
```

### Task 6: Final Verification And Cleanup

**Files:**
- Verify: `docs/governance/ecosystem-repos.json`
- Verify: `scripts/*.ps1`
- Verify: weekly note output and docs

- [ ] **Step 1: Run the inventory parse check**

Run: `powershell -NoProfile -Command "Get-Content -Raw 'docs/governance/ecosystem-repos.json' | ConvertFrom-Json | Out-Null; 'OK'"`
Expected: `OK`

- [ ] **Step 2: Run the repo scanner**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\scan-ecosystem-repos.ps1 -AsJson`
Expected: valid JSON with accessible/inaccessible repo statuses.

- [ ] **Step 3: Run the weekly summary builder**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\build-weekly-review-summary.ps1`
Expected: markdown summary with real content.

- [ ] **Step 4: Run the weekly review entry point**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\start-weekly-review.ps1 -Date 2026-04-19`
Expected: daily note updated, log appended, result block populated.

- [ ] **Step 5: Run contract audit and dry-run propagation**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\audit-contract-sync.ps1`
Expected: summary table.

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\propagate-contracts.ps1 -WhatIfOnly`
Expected: dry-run copy targets based on the inventory.

- [ ] **Step 6: Commit**

```bash
git add docs/governance/ecosystem-repos.json resources/"Mapa de repos del ecosistema Anclora.md" scripts/*.ps1 scripts/README.md playbooks/"Revisión Semanal Completa de la Bóveda y Repositorios.md"
git commit -m "chore: finalize WSL weekly review governance flow"
```
