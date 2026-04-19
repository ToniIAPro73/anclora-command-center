param(
  [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
  [string[]]$Families,
  [string[]]$Tiers,
  [string[]]$Domains,
  [string[]]$EcosystemClusters,
  [string[]]$IncludeFiles,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

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
        $contractBucket = Get-RepoContractBucket -Repo $_
        if (-not $contractBucket) {
          return
        }

        [pscustomobject]@{
          Name = $_.id
          Path = $_.path_windows
          Tier = $_.tier
          Domain = $_.domain
          ProductArchetype = $_.product_archetype
          SystemRole = $_.system_role
          EcosystemClusters = @($_.ecosystem_clusters)
          ContractBucket = $contractBucket
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
  $family = $repoEntry.ContractBucket
  $targetStandards = Join-Path $repo "docs\standards"

  if ($family -notin @("Internal", "Premium", "UltraPremium", "Portfolio")) {
    continue
  }

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
