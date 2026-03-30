param(
  [string]$VaultRoot = "C:\Users\antonio.ballesterosa\Desktop\Proyectos\Boveda-Anclora",
  [string[]]$OnlyIds,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

$queuePath = Join-Path $VaultRoot "docs\cambios\CONTRACT_CHANGE_QUEUE.md"
$standardsRoot = Join-Path $VaultRoot "docs\standards"
$governanceRoot = Join-Path $VaultRoot "docs\governance"
$changesRoot = Join-Path $VaultRoot "docs\cambios"
$propagateScript = Join-Path $VaultRoot "scripts\propagate-contracts.ps1"

if (-not (Test-Path $queuePath)) {
  throw "No existe la cola de cambios: $queuePath"
}

if (-not (Test-Path $propagateScript)) {
  throw "No existe el script de propagacion: $propagateScript"
}

$knownStandards = @(Get-ChildItem -Path $standardsRoot -File | Select-Object -ExpandProperty Name)
$knownGovernance = @(Get-ChildItem -Path $governanceRoot -File | Select-Object -ExpandProperty Name)
$knownChanges = @(Get-ChildItem -Path $changesRoot -File | Select-Object -ExpandProperty Name)

function Parse-QueueRow {
  param([string]$Line)

  $cells = @($Line.Trim().Split('|') | ForEach-Object { $_.Trim() })
  if ($cells.Count -lt 15) { return $null }
  if ($cells[1] -eq 'ID') { return $null }
  if ($cells[1] -match '^-+$') { return $null }

  [pscustomobject]@{
    Id = $cells[1]
    Date = $cells[2]
    Contracts = $cells[3]
    Conditions = $cells[4]
    Type = $cells[5]
    Scope = $cells[6]
    Change = $cells[7]
    SourceRepo = $cells[8]
    TargetRepos = $cells[9]
    PropagationAction = $cells[10]
    Status = $cells[11]
    AppliedIn = $cells[12]
    Notes = $cells[13]
  }
}

function Get-QueueRows {
  param([string[]]$Lines)

  foreach ($line in $Lines) {
    $row = Parse-QueueRow -Line $line
    if ($null -ne $row) { $row }
  }
}

function Get-ValuesFromCell {
  param([string]$Cell)

  $matches = [regex]::Matches($Cell, '`([^`]+)`')
  if ($matches.Count -gt 0) {
    return @($matches | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
  }

  return @(
    $Cell.Split('+') |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ } |
      Select-Object -Unique
  )
}

function Resolve-Families {
  param([string]$Scope)

  $families = @()
  $normalized = $Scope.ToUpperInvariant()

  if ($normalized -like '*UNIVERSAL*') {
    $families += @('Internal', 'Premium', 'UltraPremium', 'Portfolio')
  }
  if ($normalized -like '*INTERNAL*') { $families += 'Internal' }
  if ($normalized -like '*PREMIUM*') { $families += 'Premium' }
  if ($normalized -like '*ULTRA_PREMIUM*') { $families += 'UltraPremium' }
  if ($normalized -like '*PORTFOLIO*') { $families += 'Portfolio' }

  return @($families | Select-Object -Unique)
}

$rows = @(Get-QueueRows -Lines (Get-Content $queuePath))
$activeRows = $rows | Where-Object { $_.Status -replace '`', '' -in @('PENDING', 'IN_PROGRESS') }

if ($OnlyIds -and $OnlyIds.Count -gt 0) {
  $activeRows = $activeRows | Where-Object { ($_.Id -replace '`', '') -in $OnlyIds }
}

if (-not $activeRows -or $activeRows.Count -eq 0) {
  Write-Host "No hay cambios activos que procesar."
  exit 0
}

foreach ($row in $activeRows) {
  $id = $row.Id -replace '`', ''
  $families = @(Resolve-Families -Scope $row.Scope)
  $contracts = @(Get-ValuesFromCell -Cell $row.Contracts)
  $conditions = @(Get-ValuesFromCell -Cell $row.Conditions)

  $standardsContracts = @($contracts | Where-Object { $_ -in $knownStandards })
  $governanceContracts = @($contracts | Where-Object { $_ -in $knownGovernance })
  $changeContracts = @($contracts | Where-Object { $_ -in $knownChanges })

  Write-Host ""
  Write-Host "=== $id ==="
  Write-Host "Scope: $($row.Scope)"
  Write-Host "Contracts: $($contracts -join ', ')"
  Write-Host "Conditions: $($conditions -join ', ')"
  Write-Host "Families: $($families -join ', ')"

  if ($standardsContracts.Count -gt 0) {
    foreach ($family in $families) {
      $args = @(
        '-ExecutionPolicy', 'Bypass',
        '-File', $propagateScript,
        '-VaultRoot', $VaultRoot,
        '-Families', $family,
        '-IncludeFiles'
      )

      foreach ($contract in $standardsContracts) {
        $args += $contract
      }

      if ($WhatIfOnly) {
        $args += '-WhatIfOnly'
      }

      & powershell @args
    }
  }

  if ($governanceContracts.Count -gt 0 -or $changeContracts.Count -gt 0) {
    Write-Host "Gobernanza detectada. No se propaga fuera de la bóveda."
  }
}
