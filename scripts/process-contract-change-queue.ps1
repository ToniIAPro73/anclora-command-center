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
  if ($cells.Count -lt 18) { return $null }
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
    Decision = $cells[12]
    ApprovedBy = $cells[13]
    ApprovedAt = $cells[14]
    ActionPlan = $cells[15]
    AppliedIn = $cells[16]
    Notes = $cells[17]
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

$rows = @(Get-QueueRows -Lines (Get-Content $queuePath -Encoding UTF8))
$actionableRows = $rows | Where-Object { $_.Status -replace '`', '' -in @('APPROVED', 'IN_PROGRESS', 'VERIFYING') }
$analysisRows = $rows | Where-Object { $_.Status -replace '`', '' -in @('DETECTED', 'ANALYSIS_REQUIRED', 'PLAN_READY') }

if ($OnlyIds -and $OnlyIds.Count -gt 0) {
  $actionableRows = $actionableRows | Where-Object { ($_.Id -replace '`', '') -in $OnlyIds }
  $analysisRows = $analysisRows | Where-Object { ($_.Id -replace '`', '') -in $OnlyIds }
}

if (-not $actionableRows -or $actionableRows.Count -eq 0) {
  if ($analysisRows -and $analysisRows.Count -gt 0) {
    Write-Host "No hay cambios aprobados para ejecutar."
    Write-Host "Cambios pendientes de analisis o decision:"
    $analysisRows | Format-Table Id, Status, Decision, Contracts, Scope -AutoSize
    exit 0
  }

  Write-Host "No hay cambios activos que procesar."
  exit 0
}

foreach ($row in $actionableRows) {
  $id = $row.Id -replace '`', ''
  $decision = $row.Decision -replace '`', ''

  if ($decision -and $decision -notin @('APPROVED', '')) {
    Write-Host ""
    Write-Host "=== $id ==="
    Write-Host "Decision: $decision"
    Write-Host "Saltado. El cambio no esta aprobado para ejecutar."
    continue
  }

  $families = @(Resolve-Families -Scope $row.Scope)
  $contracts = @(Get-ValuesFromCell -Cell $row.Contracts)
  $conditions = @(Get-ValuesFromCell -Cell $row.Conditions)

  $standardsContracts = @($contracts | Where-Object { $_ -in $knownStandards })
  $governanceContracts = @($contracts | Where-Object { $_ -in $knownGovernance })
  $changeContracts = @($contracts | Where-Object { $_ -in $knownChanges })

  Write-Host ""
  Write-Host "=== $id ==="
  Write-Host "Scope: $($row.Scope)"
  Write-Host "Status: $($row.Status)"
  Write-Host "Decision: $($row.Decision)"
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
