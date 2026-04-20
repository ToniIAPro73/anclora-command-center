param(
  [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
  [string[]]$Scopes,
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

function Get-JsonFile {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "No existe el archivo JSON requerido: $Path"
  }

  return (Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json)
}

function Resolve-RelativePathFromVault {
  param(
    [string]$VaultRoot,
    [string]$RelativePath
  )

  if ([System.IO.Path]::IsPathRooted($RelativePath)) {
    return $RelativePath
  }

  $normalizedRelativePath = $RelativePath -replace "/", "\"
  return (Join-Path $VaultRoot $normalizedRelativePath)
}

function Get-ContractRegistry {
  param([string]$VaultRoot)

  $registryPath = Join-Path $VaultRoot "docs\governance\contracts-registry.json"
  return (Get-JsonFile -Path $registryPath)
}

function Get-RegistryInventoryConfig {
  param(
    $Registry,
    [string]$Scope
  )

  $inventoryConfig = $null

  if ($Registry.inventories) {
    foreach ($property in $Registry.inventories.PSObject.Properties) {
      if ($property.Name -eq $Scope) {
        $inventoryConfig = $property.Value
        break
      }
    }
  }

  return $inventoryConfig
}

function Get-RegistryInventoryItems {
  param(
    [string]$VaultRoot,
    $Registry,
    [string]$Scope
  )

  $inventoryConfig = Get-RegistryInventoryConfig -Registry $Registry -Scope $Scope
  if (-not $inventoryConfig) {
    Write-Warning "No existe configuración de inventario para el scope '$Scope' en contracts-registry.json"
    return @()
  }

  $inventoryPath = Resolve-RelativePathFromVault -VaultRoot $VaultRoot -RelativePath $inventoryConfig.path
  if (-not (Test-Path -LiteralPath $inventoryPath)) {
    Write-Warning "No existe el inventario '$inventoryPath' para el scope '$Scope'"
    return @()
  }

  $inventory = Get-JsonFile -Path $inventoryPath
  $collectionName = $inventoryConfig.collection

  if (-not $collectionName) {
    Write-Warning "Falta el campo 'collection' para el scope '$Scope' en contracts-registry.json"
    return @()
  }

  $collection = $inventory.$collectionName
  if (-not $collection) {
    Write-Warning "No existe la colección '$collectionName' en el inventario '$inventoryPath'"
    return @()
  }

  return @($collection)
}

function Get-ApplicableContracts {
  param(
    $Item,
    $Registry,
    [string]$Scope
  )

  return @(
    $Registry.contracts |
      Where-Object {
        $_.status -eq "active" -and
        $_.scope -eq $Scope -and
        $Item.id -in @($_.applies_to_repos)
      } |
      Sort-Object id
  )
}

function Get-ScopeTargets {
  param(
    [string]$VaultRoot,
    $Registry,
    [string]$Scope
  )

  $items = Get-RegistryInventoryItems -VaultRoot $VaultRoot -Registry $Registry -Scope $Scope

  switch ($Scope) {
    "anclora_group" {
      return @(
        $items |
          Where-Object {
            $_.status -eq "active" -and
            $_.contracts_role -match "consumer|reference"
          } |
          Sort-Object id
      )
    }
    "independent_products" {
      return @(
        $items |
          Where-Object { $_.status -eq "active" } |
          Sort-Object id
      )
    }
    default {
      return @(
        $items |
          Where-Object { $_.status -eq "active" } |
          Sort-Object id
      )
    }
  }
}

function Resolve-SafeTargetFolder {
  param(
    [string]$BasePath,
    [string]$TargetRelativePath
  )

  if ([string]::IsNullOrWhiteSpace($TargetRelativePath)) {
    $TargetRelativePath = "docs/standards/"
  }

  if ([System.IO.Path]::IsPathRooted($TargetRelativePath)) {
    throw "propagation_target no puede ser absoluto: $TargetRelativePath"
  }

  $normalizedRelativePath = $TargetRelativePath -replace "/", "\"
  $candidatePath = [System.IO.Path]::GetFullPath((Join-Path $BasePath $normalizedRelativePath))
  $baseFullPath = [System.IO.Path]::GetFullPath($BasePath)
  $basePrefix = if ($baseFullPath.EndsWith("\")) { $baseFullPath } else { "$baseFullPath\" }

  if ($candidatePath -ne $baseFullPath -and -not $candidatePath.StartsWith($basePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "propagation_target sale fuera del repo '$BasePath': $TargetRelativePath"
  }

  return $candidatePath
}

function Get-FileHashSafe {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash
}

$registry = Get-ContractRegistry -VaultRoot $VaultRoot
$scopesToAudit = if ($Scopes -and $Scopes.Count -gt 0) {
  @($Scopes | Select-Object -Unique)
} else {
  @($registry.inventories.PSObject.Properties.Name | Select-Object -Unique)
}

$results = @()

foreach ($scope in $scopesToAudit) {
  $targets = Get-ScopeTargets -VaultRoot $VaultRoot -Registry $registry -Scope $scope

  foreach ($target in $targets) {
    $applicableContracts = Get-ApplicableContracts -Item $target -Registry $registry -Scope $scope

    foreach ($contract in $applicableContracts) {
      $sourceFile = Resolve-RelativePathFromVault -VaultRoot $VaultRoot -RelativePath $contract.path
      $sourceHash = Get-FileHashSafe -Path $sourceFile
      $fileName = [System.IO.Path]::GetFileName($contract.path)
      $propagationTargets = @($contract.propagation_targets)

      if ($propagationTargets.Count -eq 0) {
        $propagationTargets = @("docs/standards/")
      }

      foreach ($targetRelativePath in $propagationTargets) {
        $targetFolder = Resolve-SafeTargetFolder -BasePath $target.path_windows -TargetRelativePath $targetRelativePath
        $targetFile = Join-Path $targetFolder $fileName
        $targetHash = Get-FileHashSafe -Path $targetFile

        $status =
          if (-not $sourceHash) { "SOURCE_MISSING" }
          elseif (-not $targetHash) { "MISSING" }
          elseif ($sourceHash -eq $targetHash) { "OK" }
          else { "OUTDATED" }

        $results += [pscustomobject]@{
          Repo = $target.id
          Family = Get-RepoContractBucket -Repo $target
          Tier = $target.tier
          Domain = $target.domain
          Scope = $contract.scope
          ContractId = $contract.id
          Contract = $fileName
          Target = $targetRelativePath
          Status = $status
          SourceHash = $sourceHash
          TargetHash = $targetHash
          DesignSystemLayers = @($contract.design_system_layers) -join ", "
        }
      }
    }
  }
}

if ($AsJson) {
  $results | ConvertTo-Json -Depth 5
  exit 0
}

$summary = $results |
  Group-Object Repo |
  ForEach-Object {
    $group = $_.Group
    [pscustomobject]@{
      Repo = $_.Name
      Family = ($group | Select-Object -First 1).Family
      Contracts = $group.Count
      OK = ($group | Where-Object Status -eq "OK").Count
      OUTDATED = ($group | Where-Object Status -eq "OUTDATED").Count
      MISSING = ($group | Where-Object Status -eq "MISSING").Count
      SOURCE_MISSING = ($group | Where-Object Status -eq "SOURCE_MISSING").Count
    }
  }

Write-Host ""
Write-Host "=== Contract Sync Summary ==="
$summary | Format-Table -AutoSize

$problems = $results | Where-Object { $_.Status -ne "OK" }
if ($problems.Count -gt 0) {
  Write-Host ""
  Write-Host "=== Contract Sync Issues ==="
  $problems | Format-Table Repo, ContractId, Contract, Target, Status -AutoSize
} else {
  Write-Host ""
  Write-Host "Todos los contratos auditados están sincronizados."
}
