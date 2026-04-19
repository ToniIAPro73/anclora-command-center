param(
  [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
  [string[]]$Families,
  [string[]]$IncludeFiles,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

function Get-ContractFamily {
  param([string]$Family)

  switch ($Family) {
    "internal" { return "Internal" }
    "premium" { return "Premium" }
    "ultra_premium" { return "UltraPremium" }
    "portfolio_showcase" { return "Portfolio" }
    default { return $null }
  }
}

function Get-ContractRepoMap {
  param([string]$VaultRoot)

  $inventoryPath = Join-Path $VaultRoot "docs\governance\ecosystem-repos.json"
  $inventory = Get-Content -Raw -LiteralPath $inventoryPath | ConvertFrom-Json

  return @(
    $inventory.repos |
      Where-Object {
        $_.status -eq "active" -and
        $_.contracts_role -match "consumer"
      } |
      ForEach-Object {
        $normalizedFamily = Get-ContractFamily -Family $_.family
        if (-not $normalizedFamily) {
          return
        }

        [pscustomobject]@{
          Name = $_.id
          Path = $_.path_windows
          Family = $normalizedFamily
        }
      }
  )
}

$sourceStandards = Join-Path $VaultRoot "docs\standards"
$universalFiles = @(
  "ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md",
  "UI_MOTION_CONTRACT.md",
  "MODAL_CONTRACT.md",
  "LOCALIZATION_CONTRACT.md"
)

$familyFiles = @{
  Internal = @("ANCLORA_INTERNAL_APP_CONTRACT.md")
  Premium = @("ANCLORA_PREMIUM_APP_CONTRACT.md")
  UltraPremium = @("ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md")
  Portfolio = @("ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT.md")
}

$repoMap = Get-ContractRepoMap -VaultRoot $VaultRoot

if (-not (Test-Path -LiteralPath $sourceStandards)) {
  throw "No existe la ruta de contratos maestra: $sourceStandards"
}

$allKnownFiles = Get-ChildItem -LiteralPath $sourceStandards -File | Select-Object -ExpandProperty Name
$selectedFamilies = if ($Families -and $Families.Count -gt 0) { @($Families) } else { @("Internal", "Premium", "UltraPremium", "Portfolio") }
$selectedFiles = if ($IncludeFiles -and $IncludeFiles.Count -gt 0) { @($IncludeFiles | Select-Object -Unique) } else { $null }

foreach ($repoEntry in $repoMap) {
  $repo = $repoEntry.Path
  $family = $repoEntry.Family
  $targetStandards = Join-Path $repo "docs\standards"

  if ($family -notin @("Internal", "Premium", "UltraPremium", "Portfolio")) {
    continue
  }

  if ($family -notin $selectedFamilies) {
    continue
  }

  if (-not (Test-Path -LiteralPath $repo)) {
    Write-Warning "Repositorio no encontrado: $repo"
    continue
  }

  if (-not (Test-Path -LiteralPath $targetStandards)) {
    if ($WhatIfOnly) {
      Write-Host "[WhatIf] Crearía carpeta: $targetStandards"
    } else {
      New-Item -ItemType Directory -Path $targetStandards -Force | Out-Null
    }
  }

  $filesToCopy = @($universalFiles + $familyFiles[$family] | Select-Object -Unique)

  if ($selectedFiles) {
    $filesToCopy = @($filesToCopy | Where-Object { $_ -in $selectedFiles } | Select-Object -Unique)
  }

  foreach ($fileName in $filesToCopy) {
    if ($fileName -notin $allKnownFiles) {
      Write-Warning "Contrato no encontrado en origen: $fileName"
      continue
    }

    $sourceFile = Join-Path $sourceStandards $fileName
    $destination = Join-Path $targetStandards $fileName

    if ($WhatIfOnly) {
      Write-Host "[WhatIf] Copiaría $sourceFile -> $destination"
    } else {
      Copy-Item -LiteralPath $sourceFile -Destination $destination -Force
      Write-Host "Copiado $fileName -> $targetStandards"
    }
  }
}
