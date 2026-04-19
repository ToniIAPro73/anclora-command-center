param(
  [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
  [switch]$AsJson
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

function Get-FileHashSafe {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash
}

$sourceStandards = Join-Path $VaultRoot "docs\standards"

if (-not (Test-Path -LiteralPath $sourceStandards)) {
  throw "No existe la ruta de contratos maestra: $sourceStandards"
}

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
$results = @()

foreach ($repo in $repoMap) {
  if ($repo.ContractBucket -notin @("Internal", "Premium", "UltraPremium", "Portfolio")) {
    continue
  }

  $targetStandards = Join-Path $repo.Path "docs\standards"
  $expectedFiles = @($universalFiles + $familyFiles[$repo.ContractBucket] | Select-Object -Unique)

  foreach ($fileName in $expectedFiles) {
    $sourceFile = Join-Path $sourceStandards $fileName
    $targetFile = Join-Path $targetStandards $fileName
    $sourceHash = Get-FileHashSafe -Path $sourceFile
    $targetHash = Get-FileHashSafe -Path $targetFile

    $status =
      if (-not $targetHash) { "MISSING" }
      elseif ($sourceHash -eq $targetHash) { "OK" }
      else { "OUTDATED" }

    $results += [pscustomobject]@{
      Repo = $repo.Name
      Family = $repo.ContractBucket
      Contract = $fileName
      Status = $status
      SourceHash = $sourceHash
      TargetHash = $targetHash
    }
  }
}

if ($AsJson) {
  $results | ConvertTo-Json -Depth 4
  exit 0
}

$summary = $results |
  Group-Object Repo |
  ForEach-Object {
    $group = $_.Group
    [pscustomobject]@{
      Repo = $_.Name
      Family = ($group | Select-Object -First 1).Family
      OK = ($group | Where-Object Status -eq "OK").Count
      OUTDATED = ($group | Where-Object Status -eq "OUTDATED").Count
      MISSING = ($group | Where-Object Status -eq "MISSING").Count
    }
  }

Write-Host ""
Write-Host "=== Contract Sync Summary ==="
$summary | Format-Table -AutoSize

$problems = $results | Where-Object { $_.Status -ne "OK" }
if ($problems.Count -gt 0) {
  Write-Host ""
  Write-Host "=== Contract Sync Issues ==="
  $problems | Format-Table Repo, Family, Contract, Status -AutoSize
} else {
  Write-Host ""
  Write-Host "Todos los contratos auditados están sincronizados."
}
